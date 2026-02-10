from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import httpx
import uuid
import random
import string
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
BAFE_API_URL = os.environ.get('BAFE_API_URL', '')

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ─── Pydantic Models ───

class UserCreate(BaseModel):
    name: str
    birth_date: str  # YYYY-MM-DD
    birth_time: str  # HH:MM
    birth_location: str
    birth_lat: Optional[float] = None
    birth_lng: Optional[float] = None

class UserResponse(BaseModel):
    id: str
    name: str
    birth_date: str
    birth_time: str
    birth_location: str
    astro_data: Optional[Dict[str, Any]] = None
    invite_code: Optional[str] = None
    couple_id: Optional[str] = None
    created_at: str

class InviteJoinRequest(BaseModel):
    invite_code: str
    name: str
    birth_date: str
    birth_time: str
    birth_location: str
    birth_lat: Optional[float] = None
    birth_lng: Optional[float] = None

class QuizAnswerSubmit(BaseModel):
    user_id: str
    couple_id: str
    quiz_id: str
    answers: List[Dict[str, str]]  # [{question_id, option_id}]

class CoupleStatusResponse(BaseModel):
    couple_id: str
    user_a_ready: bool
    user_b_ready: bool
    both_ready: bool
    interpretation: Optional[str] = None
    match_score: Optional[float] = None


# ─── Helper Functions ───

def generate_invite_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


def serialize_doc(doc):
    """Remove MongoDB _id and ensure serializable."""
    if doc and '_id' in doc:
        del doc['_id']
    return doc


async def call_bafe_api(birth_date: str, birth_time: str):
    """Call BAFE astrology API."""
    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            response = await http_client.post(
                BAFE_API_URL,
                json={"birthDate": birth_date, "birthTime": birth_time}
            )
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"BAFE API returned {response.status_code}: {response.text}")
                return None
    except Exception as e:
        logger.error(f"BAFE API error: {e}")
        return None


async def generate_couple_interpretation(astro_a: dict, astro_b: dict):
    """Use Gemini to generate positive couple interpretation."""
    try:
        sign_a = astro_a.get('summary', {}).get('sternzeichen', 'Unbekannt')
        sign_b = astro_b.get('summary', {}).get('sternzeichen', 'Unbekannt')
        chinese_a = astro_a.get('summary', {}).get('chinesischesZeichen', '')
        chinese_b = astro_b.get('summary', {}).get('chinesischesZeichen', '')

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"quissme-{uuid.uuid4()}",
            system_message="Du bist ein warmer, positiver Beziehungsberater im QuissMe-Stil. Dein Ton ist spielerisch, ermutigend und niemals klinisch. Schreibe auf Deutsch. Keine Diagnosen, keine Schuldzuweisungen. Alles positiv reframen."
        ).with_model("gemini", "gemini-3-flash-preview")

        prompt = f"""Erstelle eine kurze, positive astrologische Deutung für ein Paar:

Person A: Sternzeichen {sign_a}, Chinesisch: {chinese_a}
Person B: Sternzeichen {sign_b}, Chinesisch: {chinese_b}

Schreibe genau 3 kurze Absätze (je 1-2 Sätze):
1. Eine warme Begrüßung zur Verbindung der beiden Zeichen
2. Eine besondere Stärke dieses Paares
3. Ein kleiner, positiver Impuls für die gemeinsame Reise

Halte es leicht, spielerisch und ermutigend. Kein klinischer Ton. Max 150 Wörter insgesamt."""

        msg = UserMessage(text=prompt)
        response = await chat.send_message(msg)
        return response
    except Exception as e:
        logger.error(f"Gemini interpretation error: {e}")
        return f"Eure Sterne erzählen eine besondere Geschichte zusammen. Die Verbindung zwischen euren Zeichen birgt wunderbare Möglichkeiten – für Nähe, Wachstum und gemeinsame Abenteuer. Lasst euch überraschen, was ihr zusammen entdecken werdet!"


# ─── API Routes ───

@api_router.get("/")
async def root():
    return {"message": "QuissMe API", "version": "1.0"}


@api_router.post("/users/register")
async def register_user(user: UserCreate):
    user_id = str(uuid.uuid4())
    invite_code = generate_invite_code()

    astro_data = await call_bafe_api(user.birth_date, user.birth_time)

    if not astro_data:
        # Fallback astro data based on birth date
        month = int(user.birth_date.split('-')[1])
        day = int(user.birth_date.split('-')[2])
        zodiac_signs = [
            (1, 20, "Steinbock"), (2, 19, "Wassermann"), (3, 20, "Fische"),
            (4, 20, "Widder"), (5, 21, "Stier"), (6, 21, "Zwillinge"),
            (7, 22, "Krebs"), (8, 23, "Löwe"), (9, 23, "Jungfrau"),
            (10, 23, "Waage"), (11, 22, "Skorpion"), (12, 21, "Schütze")
        ]
        sign = "Steinbock"
        for m, d, s in zodiac_signs:
            if month == m and day <= d:
                sign = s
                break
            elif month == m - 1 and day > d:
                sign = s
                break
        # Better fallback
        for i, (m, d, s) in enumerate(zodiac_signs):
            if (month == m and day <= d) or (month == m and i == 0):
                sign = s
                break
        # Simple zodiac calculation
        zodiac_dates = [
            (1, 20, "Steinbock", "Capricorn"), (2, 19, "Wassermann", "Aquarius"),
            (3, 20, "Fische", "Pisces"), (4, 20, "Widder", "Aries"),
            (5, 21, "Stier", "Taurus"), (6, 21, "Zwillinge", "Gemini"),
            (7, 22, "Krebs", "Cancer"), (8, 23, "Löwe", "Leo"),
            (9, 23, "Jungfrau", "Virgo"), (10, 23, "Waage", "Libra"),
            (11, 22, "Skorpion", "Scorpio"), (12, 21, "Schütze", "Sagittarius")
        ]
        sign_de = "Steinbock"
        sign_en = "Capricorn"
        for i in range(len(zodiac_dates)):
            m, d, s_de, s_en = zodiac_dates[i]
            next_m, next_d = zodiac_dates[(i+1) % 12][0], zodiac_dates[(i+1) % 12][1]
            if month == m and day > d:
                sign_de = zodiac_dates[(i+1) % 12][2]
                sign_en = zodiac_dates[(i+1) % 12][3]
                break
            elif month == m and day <= d:
                sign_de = s_de
                sign_en = s_en
                break

        astro_data = {
            "western": {"sunSign": sign_de, "moonSign": "Unbekannt", "sunSignEnglish": sign_en},
            "eastern": {"yearAnimal": "Unbekannt", "yearElement": "Unbekannt"},
            "summary": {"sternzeichen": sign_de, "chinesischesZeichen": "Unbekannt", "tagesmeister": "Unbekannt"},
            "fallback": True
        }

    user_doc = {
        "id": user_id,
        "name": user.name,
        "birth_date": user.birth_date,
        "birth_time": user.birth_time,
        "birth_location": user.birth_location,
        "birth_lat": user.birth_lat,
        "birth_lng": user.birth_lng,
        "astro_data": astro_data,
        "invite_code": invite_code,
        "couple_id": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    await db.users.insert_one(user_doc)

    return serialize_doc({**user_doc})


@api_router.get("/users/{user_id}")
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@api_router.post("/invite/join")
async def join_invite(req: InviteJoinRequest):
    """Person B joins with invite code."""
    inviter = await db.users.find_one({"invite_code": req.invite_code}, {"_id": 0})
    if not inviter:
        raise HTTPException(status_code=404, detail="Ungültiger Einladungscode")

    if inviter.get("couple_id"):
        raise HTTPException(status_code=400, detail="Dieser Code wurde bereits verwendet")

    # Create Person B
    user_b_id = str(uuid.uuid4())
    astro_data = await call_bafe_api(req.birth_date, req.birth_time)

    if not astro_data:
        month = int(req.birth_date.split('-')[1])
        day = int(req.birth_date.split('-')[2])
        zodiac_dates = [
            (1, 20, "Steinbock", "Capricorn"), (2, 19, "Wassermann", "Aquarius"),
            (3, 20, "Fische", "Pisces"), (4, 20, "Widder", "Aries"),
            (5, 21, "Stier", "Taurus"), (6, 21, "Zwillinge", "Gemini"),
            (7, 22, "Krebs", "Cancer"), (8, 23, "Löwe", "Leo"),
            (9, 23, "Jungfrau", "Virgo"), (10, 23, "Waage", "Libra"),
            (11, 22, "Skorpion", "Scorpio"), (12, 21, "Schütze", "Sagittarius")
        ]
        sign_de = "Steinbock"
        sign_en = "Capricorn"
        for i in range(len(zodiac_dates)):
            m, d, s_de, s_en = zodiac_dates[i]
            if month == m and day > d:
                sign_de = zodiac_dates[(i+1) % 12][2]
                sign_en = zodiac_dates[(i+1) % 12][3]
                break
            elif month == m and day <= d:
                sign_de = s_de
                sign_en = s_en
                break
        astro_data = {
            "western": {"sunSign": sign_de, "moonSign": "Unbekannt", "sunSignEnglish": sign_en},
            "eastern": {"yearAnimal": "Unbekannt", "yearElement": "Unbekannt"},
            "summary": {"sternzeichen": sign_de, "chinesischesZeichen": "Unbekannt", "tagesmeister": "Unbekannt"},
            "fallback": True
        }

    # Create couple
    couple_id = str(uuid.uuid4())
    match_score = round(random.uniform(72, 95), 1)

    user_b_doc = {
        "id": user_b_id,
        "name": req.name,
        "birth_date": req.birth_date,
        "birth_time": req.birth_time,
        "birth_location": req.birth_location,
        "birth_lat": req.birth_lat,
        "birth_lng": req.birth_lng,
        "astro_data": astro_data,
        "invite_code": None,
        "couple_id": couple_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_b_doc)

    # Generate interpretation
    interpretation = await generate_couple_interpretation(
        inviter.get("astro_data", {}), astro_data
    )

    couple_doc = {
        "id": couple_id,
        "user_a_id": inviter["id"],
        "user_b_id": user_b_id,
        "interpretation": interpretation,
        "match_score": match_score,
        "user_a_ready": True,
        "user_b_ready": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.couples.insert_one(couple_doc)

    # Update inviter with couple_id
    await db.users.update_one({"id": inviter["id"]}, {"$set": {"couple_id": couple_id}})

    return {
        "user": serialize_doc({**user_b_doc}),
        "couple_id": couple_id,
        "match_score": match_score,
        "partner_name": inviter["name"]
    }


@api_router.get("/couple/{couple_id}")
async def get_couple(couple_id: str):
    couple = await db.couples.find_one({"id": couple_id}, {"_id": 0})
    if not couple:
        raise HTTPException(status_code=404, detail="Couple not found")

    user_a = await db.users.find_one({"id": couple["user_a_id"]}, {"_id": 0})
    user_b = await db.users.find_one({"id": couple["user_b_id"]}, {"_id": 0})

    return {
        **couple,
        "user_a": user_a,
        "user_b": user_b
    }


@api_router.get("/couple/{couple_id}/status")
async def get_couple_status(couple_id: str):
    couple = await db.couples.find_one({"id": couple_id}, {"_id": 0})
    if not couple:
        raise HTTPException(status_code=404, detail="Couple not found")
    return couple


@api_router.get("/quizzes")
async def get_quizzes():
    """Return available quiz list."""
    quizzes = await db.quizzes.find({}, {"_id": 0, "questions": 0}).to_list(100)
    if not quizzes:
        await seed_quiz_data()
        quizzes = await db.quizzes.find({}, {"_id": 0, "questions": 0}).to_list(100)
    return quizzes


@api_router.get("/quizzes/{quiz_id}")
async def get_quiz(quiz_id: str):
    """Return full quiz with questions."""
    quiz = await db.quizzes.find_one({"id": quiz_id}, {"_id": 0})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz


@api_router.post("/quiz/submit")
async def submit_quiz(submission: QuizAnswerSubmit):
    """Submit quiz answers and calculate scores."""
    quiz = await db.quizzes.find_one({"id": submission.quiz_id}, {"_id": 0})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = quiz.get("questions", [])
    answers_map = {a["question_id"]: a["option_id"] for a in submission.answers}

    cluster_sums = {"words": 0, "time": 0, "gifts": 0, "service": 0, "touch": 0}
    type_sums = {}

    for q in questions:
        q_id = q["id"]
        selected_opt_id = answers_map.get(q_id)
        if not selected_opt_id:
            continue
        for opt in q.get("options", []):
            if opt["id"] == selected_opt_id:
                cs = opt.get("cluster_scores", {})
                for k, v in cs.items():
                    cluster_sums[k] = cluster_sums.get(k, 0) + v
                ts = opt.get("type_scores", {})
                for k, v in ts.items():
                    type_sums[k] = type_sums.get(k, 0) + v
                break

    primary_cluster = max(cluster_sums, key=cluster_sums.get)
    primary_type = max(type_sums, key=type_sums.get) if type_sums else None

    # Normalize to 0-100
    max_cluster_val = max(cluster_sums.values()) if max(cluster_sums.values()) > 0 else 1
    normalized_clusters = {k: round((v / max_cluster_val) * 100) for k, v in cluster_sums.items()}

    # Get zone tokens
    zone_tokens = quiz.get("zone_tokens", {})

    result_id = str(uuid.uuid4())
    result_doc = {
        "id": result_id,
        "user_id": submission.user_id,
        "couple_id": submission.couple_id,
        "quiz_id": submission.quiz_id,
        "answers": submission.answers,
        "cluster_scores": cluster_sums,
        "normalized_clusters": normalized_clusters,
        "type_scores": type_sums,
        "primary_cluster": primary_cluster,
        "primary_type": primary_type,
        "zone_tokens": zone_tokens,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.quiz_results.insert_one(result_doc)

    return serialize_doc({**result_doc})


@api_router.get("/quiz/results/{couple_id}")
async def get_couple_quiz_results(couple_id: str):
    results = await db.quiz_results.find({"couple_id": couple_id}, {"_id": 0}).to_list(100)
    return results


# ─── Quiz Data Seeding ───

async def seed_quiz_data():
    """Seed quiz data from JSON files."""
    count = await db.quizzes.count_documents({})
    if count > 0:
        return

    logger.info("Seeding quiz data...")

    # Load love languages cluster
    ll_path = ROOT_DIR / "love_languages_cluster.json"
    if ll_path.exists():
        with open(ll_path, 'r') as f:
            ll_data = json.load(f)

        meta = ll_data.get("meta_cluster", {})
        quizzes_data = ll_data.get("quizzes", [])

        for quiz in quizzes_data:
            quiz_doc = {
                "id": quiz["id"],
                "meta_cluster_id": meta.get("id"),
                "hidden_cluster": quiz.get("hidden_cluster"),
                "facet_label": quiz.get("facet_label", {}),
                "tone": quiz.get("tone"),
                "type_model": quiz.get("type_model", {}),
                "questions": quiz.get("questions", []),
                "zone_tokens": quiz.get("zone_tokens", {}),
                "category": "love_languages",
                "public_name": meta.get("public_name", {}),
                "teaser": meta.get("teaser", {}),
                "question_count": len(quiz.get("questions", []))
            }
            await db.quizzes.insert_one(quiz_doc)

    # Load couples quizzes
    cq_path = ROOT_DIR / "quizzme_couples_15_quizzes.json"
    if cq_path.exists():
        with open(cq_path, 'r') as f:
            cq_data = json.load(f)

        if isinstance(cq_data, dict) and "quizzes" in cq_data:
            for quiz in cq_data["quizzes"]:
                quiz_doc = {
                    "id": quiz.get("id", str(uuid.uuid4())),
                    "hidden_cluster": quiz.get("hidden_cluster", ""),
                    "facet_label": quiz.get("facet_label", {}),
                    "tone": quiz.get("tone", ""),
                    "type_model": quiz.get("type_model", {}),
                    "questions": quiz.get("questions", []),
                    "zone_tokens": quiz.get("zone_tokens", {}),
                    "category": "couples",
                    "question_count": len(quiz.get("questions", []))
                }
                await db.quizzes.insert_one(quiz_doc)

    logger.info("Quiz data seeded successfully")


@app.on_event("startup")
async def startup_event():
    await seed_quiz_data()


# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
