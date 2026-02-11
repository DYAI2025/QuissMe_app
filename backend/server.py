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
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
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

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Constants ───
QUIZ_STATES = {
    "available": "available",
    "activated_by_me": "activated_by_me",
    "activated_by_partner": "activated_by_partner",
    "completed_by_me_waiting": "completed_by_me_waiting",
    "completed_by_partner_waiting": "completed_by_partner_waiting",
    "ready_to_reveal": "ready_to_reveal",
    "revealed": "revealed",
}

RESONANCE_ZONES = ["flow", "spark", "talk"]

ZONE_PALETTES = {
    "flow": {"hue": "lilac-violet-blue", "saturation": "medium", "highlight": "moonlit-silver", "facet_sharpness": "low", "glow": "subtle"},
    "spark": {"hue": "amber-orange-gold", "saturation": "high", "highlight": "warm-gold", "facet_sharpness": "high", "glow": "subtle"},
    "talk": {"hue": "mauve-teal-stone", "saturation": "low", "highlight": "cool-sage", "facet_sharpness": "medium", "glow": "none"},
}

SECTOR_TINTS = {
    "passion": {"base": "#E8457A", "name": "Rose-Magenta"},
    "stability": {"base": "#2DD4BF", "name": "Teal-Grün"},
    "future": {"base": "#A78BFA", "name": "Gold-Violett"},
}

CLUSTER_TO_SECTOR = {
    "words": "passion", "touch": "passion",
    "time": "stability", "service": "stability",
    "gifts": "future",
    # Reibung/Reparatur cluster
    "stability": "stability",
    # Couples quizzes
    "passion": "passion",
    "future": "future",
}

TENDENCY_LABELS = {
    "high": {"de": "stark ausgeprägt", "icon": "flame"},
    "medium": {"de": "im Einklang", "icon": "leaf"},
    "building": {"de": "im Aufbau", "icon": "sprout"},
}

FLOW_SENTENCES = [
    "Hier seid ihr auf derselben Wellenlänge.",
    "Das trägt euch im Alltag.",
    "Das funktioniert oft ohne große Erklärung.",
]
SPARK_SENTENCES = [
    "Das ist euer Sweet Spot: unterschiedlich genug, um spannend zu bleiben.",
    "Hier entsteht Anziehung durch Kontrast.",
    "Ein Unterschied, der euch lebendig macht.",
]
TALK_SENTENCES = [
    "Hier lohnt sich eine gemeinsame Sprache.",
    "Kein Problem — eher ein Feld, wo Abstimmung viel bewirken kann.",
    "Wenn ihr hier kurz übersetzt, wird's schnell leichter.",
]

BUFF_LIBRARY = [
    {"id": "repair_gentle", "name": "Sanfter Anker", "line1": "Manchmal ist es okay, kurz zu pausieren.", "line2": "Atmet einmal gemeinsam durch – ohne Worte."},
    {"id": "clarity_mirror", "name": "Klarheitsspiegel", "line1": "Ihr seht einander ein bisschen deutlicher.", "line2": "Fragt heute: Was hast du heute gefühlt, aber nicht gesagt?"},
    {"id": "ritual_spark", "name": "Ritualfunke", "line1": "Kleine Rituale halten euch verbunden.", "line2": "Startet den Morgen mit einer kurzen Berührung."},
    {"id": "trust_bloom", "name": "Vertrauensblüte", "line1": "Vertrauen wächst in kleinen Momenten.", "line2": "Teilt heute eine Erinnerung, die euch zum Lächeln bringt."},
    {"id": "play_wave", "name": "Spielwelle", "line1": "Leichtigkeit ist eine Superkraft.", "line2": "Tut heute etwas Albernes zusammen – nur für euch."},
]

REWARD_ITEMS = {
    "plants": [
        {"id": "crystal_lily", "name": "Kristalllilie", "type": "plant"},
        {"id": "prism_rose", "name": "Prismenrose", "type": "plant"},
        {"id": "facet_fern", "name": "Facettenfarn", "type": "plant"},
    ],
    "land": [
        {"id": "moss_tile", "name": "Moosstein", "type": "land"},
        {"id": "water_shard", "name": "Wassersplitter", "type": "land"},
        {"id": "earth_chunk", "name": "Erdstück", "type": "land"},
    ],
    "deco": [
        {"id": "glow_lantern", "name": "Leuchtlaterne", "type": "deco"},
        {"id": "star_stone", "name": "Sternstein", "type": "deco"},
        {"id": "crystal_shard", "name": "Kristallsplitter", "type": "deco"},
    ],
}


# ─── Pydantic Models ───

class UserCreate(BaseModel):
    name: str
    birth_date: str
    birth_time: str
    birth_location: str

class InviteJoinRequest(BaseModel):
    invite_code: str
    name: str
    birth_date: str
    birth_time: str
    birth_location: str

class QuizActivateRequest(BaseModel):
    user_id: str
    couple_id: str
    quiz_id: str

class QuizAnswerSubmit(BaseModel):
    user_id: str
    couple_id: str
    quiz_id: str
    cycle_id: str
    answers: List[Dict[str, str]]

class RewardChoiceRequest(BaseModel):
    cycle_id: str
    user_id: str
    chosen_item_id: str

class GardenPlaceRequest(BaseModel):
    couple_id: str
    user_id: str
    item_id: str
    position_x: float
    position_y: float


# ─── Helpers ───

def generate_invite_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def serialize_doc(doc):
    if doc and '_id' in doc:
        del doc['_id']
    return doc

def get_zodiac(birth_date: str):
    month = int(birth_date.split('-')[1])
    day = int(birth_date.split('-')[2])
    signs = [
        (1,20,"Steinbock"),(2,19,"Wassermann"),(3,20,"Fische"),(4,20,"Widder"),
        (5,21,"Stier"),(6,21,"Zwillinge"),(7,22,"Krebs"),(8,23,"Löwe"),
        (9,23,"Jungfrau"),(10,23,"Waage"),(11,22,"Skorpion"),(12,21,"Schütze"),
    ]
    sign = "Steinbock"
    for i, (m, d, s) in enumerate(signs):
        if (month == m and day <= d) or (month == m - 1 and day > signs[i-1][1] if i > 0 else False):
            sign = s
            break
    if month == 12 and day > 21:
        sign = "Steinbock"
    return sign

def determine_zone(cluster_scores: dict) -> str:
    vals = list(cluster_scores.values())
    if not vals:
        return "flow"
    max_v = max(vals)
    min_v = min(vals)
    spread = max_v - min_v if max_v > 0 else 0
    avg = sum(vals) / len(vals) if vals else 0
    if spread < avg * 0.3:
        return "flow"
    elif spread > avg * 0.6:
        return "talk"
    else:
        return "spark"

def scores_to_tendencies(normalized: dict) -> dict:
    result = {}
    for k, v in normalized.items():
        if v >= 70:
            result[k] = "high"
        elif v >= 40:
            result[k] = "medium"
        else:
            result[k] = "building"
    return result

def get_zone_sentence(zone: str) -> str:
    if zone == "flow":
        return random.choice(FLOW_SENTENCES)
    elif zone == "spark":
        return random.choice(SPARK_SENTENCES)
    return random.choice(TALK_SENTENCES)

async def generate_insight_text(zone: str, cluster: str, tendencies: dict):
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"quissme-drop-{uuid.uuid4()}",
            system_message="Du bist der QuissMe Insight-Generator. Schreibe warm, positiv, spielerisch auf Deutsch. Keine Diagnosen, kein Urteil, keine Schuld. Alles ist Resonanz, nicht Bewertung. Halte es kurz (3-4 Sätze)."
        ).with_model("gemini", "gemini-3-flash-preview")
        zone_word = {"flow": "im Flow", "spark": "voller Funken", "talk": "im Austausch"}[zone]
        prompt = f"Erstelle einen kurzen Insight Drop für ein Paar. Ihre Resonanz im Bereich '{cluster}' ist '{zone_word}'. Schreibe genau 3 Sätze: 1) Eine warme Beobachtung 2) Eine Stärke 3) Ein kleiner Impuls. Keine Prozente, keine Wertung. Max 60 Wörter."
        msg = UserMessage(text=prompt)
        response = await chat.send_message(msg)
        return response
    except Exception as e:
        logger.error(f"Insight generation error: {e}")
        return f"Eure Verbindung zeigt sich hier auf besondere Weise. {get_zone_sentence(zone)} Lasst euch überraschen, was ihr zusammen entdecken werdet."


# ─── API Routes ───

@api_router.get("/")
async def root():
    return {"message": "QuissMe API", "version": "2.0"}


@api_router.post("/users/register")
async def register_user(user: UserCreate):
    user_id = str(uuid.uuid4())
    invite_code = generate_invite_code()
    sign = get_zodiac(user.birth_date)

    astro_data = {
        "western": {"sunSign": sign},
        "summary": {"sternzeichen": sign},
    }

    # Try BAFE API
    try:
        async with httpx.AsyncClient(timeout=10.0) as http_client:
            resp = await http_client.post(BAFE_API_URL, json={"birthDate": user.birth_date, "birthTime": user.birth_time})
            if resp.status_code == 200:
                astro_data = resp.json()
    except Exception:
        pass

    user_doc = {
        "id": user_id,
        "name": user.name,
        "birth_date": user.birth_date,
        "birth_time": user.birth_time,
        "birth_location": user.birth_location,
        "astro_data": astro_data,
        "invite_code": invite_code,
        "couple_id": None,
        "weekly_activations": 0,
        "week_start": datetime.now(timezone.utc).isoformat(),
        "garden_items": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
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
    inviter = await db.users.find_one({"invite_code": req.invite_code}, {"_id": 0})
    if not inviter:
        raise HTTPException(status_code=404, detail="Ungültiger Einladungscode")
    if inviter.get("couple_id"):
        raise HTTPException(status_code=400, detail="Code bereits verwendet")

    user_b_id = str(uuid.uuid4())
    sign_b = get_zodiac(req.birth_date)
    astro_b = {"western": {"sunSign": sign_b}, "summary": {"sternzeichen": sign_b}}

    couple_id = str(uuid.uuid4())
    sign_a = inviter.get("astro_data", {}).get("summary", {}).get("sternzeichen", "Unbekannt")

    # Generate interpretation via Gemini
    interpretation = ""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"quissme-match-{uuid.uuid4()}",
            system_message="Du bist QuissMe. Schreibe warm, positiv, spielerisch auf Deutsch. Keine Diagnose, keine Schuld."
        ).with_model("gemini", "gemini-3-flash-preview")
        msg = UserMessage(text=f"Kurze positive Deutung für {sign_a} und {sign_b} als Paar. 3 Sätze: Begrüßung, Stärke, Impuls. Max 80 Wörter.")
        interpretation = await chat.send_message(msg)
    except Exception:
        interpretation = f"Die Verbindung zwischen {sign_a} und {sign_b} birgt wunderbare Möglichkeiten."

    user_b_doc = {
        "id": user_b_id, "name": req.name, "birth_date": req.birth_date,
        "birth_time": req.birth_time, "birth_location": req.birth_location,
        "astro_data": astro_b, "invite_code": None, "couple_id": couple_id,
        "weekly_activations": 0, "week_start": datetime.now(timezone.utc).isoformat(),
        "garden_items": [], "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user_b_doc)

    couple_doc = {
        "id": couple_id, "user_a_id": inviter["id"], "user_b_id": user_b_id,
        "interpretation": interpretation,
        "garden": {"items": [], "level": 1},
        "completed_clusters": [],
        "buffs": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.couples.insert_one(couple_doc)
    await db.users.update_one({"id": inviter["id"]}, {"$set": {"couple_id": couple_id}})

    return {"user": serialize_doc({**user_b_doc}), "couple_id": couple_id, "partner_name": inviter["name"]}


@api_router.get("/couple/{couple_id}")
async def get_couple(couple_id: str):
    couple = await db.couples.find_one({"id": couple_id}, {"_id": 0})
    if not couple:
        raise HTTPException(status_code=404, detail="Couple not found")
    user_a = await db.users.find_one({"id": couple["user_a_id"]}, {"_id": 0})
    user_b = await db.users.find_one({"id": couple["user_b_id"]}, {"_id": 0})
    return {**couple, "user_a": user_a, "user_b": user_b}


# ─── Quiz System with State Machine ───

@api_router.get("/quizzes")
async def get_quizzes():
    quizzes = await db.quizzes.find({}, {"_id": 0, "questions": 0}).to_list(100)
    if not quizzes:
        await seed_quiz_data()
        quizzes = await db.quizzes.find({}, {"_id": 0, "questions": 0}).to_list(100)
    return quizzes


@api_router.get("/quizzes/{quiz_id}")
async def get_quiz(quiz_id: str):
    quiz = await db.quizzes.find_one({"id": quiz_id}, {"_id": 0})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz


@api_router.get("/quiz/wheel/{couple_id}/{user_id}")
async def get_quiz_wheel(couple_id: str, user_id: str):
    """Get all quizzes with their current state for this user/couple."""
    quizzes = await db.quizzes.find({}, {"_id": 0, "questions": 0}).to_list(100)
    cycles = await db.cluster_cycles.find({"couple_id": couple_id}, {"_id": 0}).to_list(100)

    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    weekly_activations = user.get("weekly_activations", 0) if user else 0

    # Reset weekly counter if new week
    if user:
        week_start = user.get("week_start", "")
        if week_start:
            ws = datetime.fromisoformat(week_start)
            if (datetime.now(timezone.utc) - ws).days >= 7:
                weekly_activations = 0
                await db.users.update_one({"id": user_id}, {"$set": {"weekly_activations": 0, "week_start": datetime.now(timezone.utc).isoformat()}})

    active_count = len([c for c in cycles if c["state"] not in ["revealed", "available"]])
    can_activate = weekly_activations < 3 and active_count < 3

    wheel_nodes = []
    for q in quizzes:
        cycle = next((c for c in cycles if c["quiz_id"] == q["id"] and c["state"] != "revealed"), None)
        revealed_cycles = [c for c in cycles if c["quiz_id"] == q["id"] and c["state"] == "revealed"]

        if cycle:
            state = cycle["state"]
            # Adjust perspective for current user
            if state == "activated" and cycle.get("activated_by") == user_id:
                state = "activated_by_me"
            elif state == "activated" and cycle.get("activated_by") != user_id:
                state = "activated_by_partner"
            elif state == "one_completed":
                if cycle.get("completed_by") and user_id in cycle.get("completed_by", []):
                    state = "completed_by_me_waiting"
                else:
                    state = "completed_by_partner_waiting"
        else:
            state = "available"

        sector = CLUSTER_TO_SECTOR.get(q.get("hidden_cluster", ""), "passion")
        wheel_nodes.append({
            "quiz_id": q["id"],
            "cluster": q.get("hidden_cluster", ""),
            "facet_label": q.get("facet_label", {}),
            "sector": sector,
            "sector_tint": SECTOR_TINTS.get(sector, {}),
            "state": state,
            "cycle_id": cycle["id"] if cycle else None,
            "question_count": q.get("question_count", 10),
            "times_completed": len(revealed_cycles),
        })

    return {
        "nodes": wheel_nodes,
        "weekly_activations": weekly_activations,
        "active_count": active_count,
        "can_activate": can_activate,
        "seeds_remaining": 3 - weekly_activations,
        "slots_remaining": 3 - active_count,
    }


@api_router.post("/quiz/activate")
async def activate_quiz(req: QuizActivateRequest):
    """Activate a quiz (create a ClusterCycle)."""
    user = await db.users.find_one({"id": req.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check weekly limit
    weekly_act = user.get("weekly_activations", 0)
    week_start = user.get("week_start", "")
    if week_start:
        ws = datetime.fromisoformat(week_start)
        if (datetime.now(timezone.utc) - ws).days >= 7:
            weekly_act = 0
            await db.users.update_one({"id": req.user_id}, {"$set": {"weekly_activations": 0, "week_start": datetime.now(timezone.utc).isoformat()}})

    if weekly_act >= 3:
        raise HTTPException(status_code=429, detail="Wöchentliches Limit erreicht (3 Samen pro Woche)")

    # Check active slots
    active = await db.cluster_cycles.count_documents({"couple_id": req.couple_id, "state": {"$nin": ["revealed"]}})
    if active >= 3:
        raise HTTPException(status_code=429, detail="Zu viele aktive Quizze (max 3 gleichzeitig)")

    # Check no existing active cycle for this quiz
    existing = await db.cluster_cycles.find_one({"couple_id": req.couple_id, "quiz_id": req.quiz_id, "state": {"$nin": ["revealed"]}})
    if existing:
        raise HTTPException(status_code=400, detail="Dieses Quiz ist bereits aktiv")

    cycle_id = str(uuid.uuid4())
    cycle_doc = {
        "id": cycle_id,
        "couple_id": req.couple_id,
        "quiz_id": req.quiz_id,
        "state": "activated",
        "activated_by": req.user_id,
        "completed_by": [],
        "answers_a": None,
        "answers_b": None,
        "result": None,
        "zone": None,
        "buff": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.cluster_cycles.insert_one(cycle_doc)
    await db.users.update_one({"id": req.user_id}, {"$inc": {"weekly_activations": 1}})

    return serialize_doc({**cycle_doc})


@api_router.post("/quiz/submit")
async def submit_quiz(sub: QuizAnswerSubmit):
    """Submit answers for a ClusterCycle."""
    cycle = await db.cluster_cycles.find_one({"id": sub.cycle_id}, {"_id": 0})
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")

    quiz = await db.quizzes.find_one({"id": sub.quiz_id}, {"_id": 0})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # Calculate individual scores
    questions = quiz.get("questions", [])
    answers_map = {a["question_id"]: a["option_id"] for a in sub.answers}
    cluster_sums = {}
    for q in questions:
        sel = answers_map.get(q["id"])
        if not sel:
            continue
        for opt in q.get("options", []):
            if opt["id"] == sel:
                for k, v in opt.get("cluster_scores", {}).items():
                    cluster_sums[k] = cluster_sums.get(k, 0) + v
                break

    # Store answers
    couple = await db.couples.find_one({"id": sub.couple_id}, {"_id": 0})
    is_user_a = couple and couple.get("user_a_id") == sub.user_id
    answer_field = "answers_a" if is_user_a else "answers_b"
    completed_by = cycle.get("completed_by", [])

    if sub.user_id in completed_by:
        raise HTTPException(status_code=400, detail="Du hast dieses Quiz bereits abgeschlossen")

    completed_by.append(sub.user_id)
    both_done = len(completed_by) >= 2

    update = {
        f"{answer_field}": {"answers": sub.answers, "cluster_sums": cluster_sums},
        "completed_by": completed_by,
    }

    if both_done:
        # Both completed → calculate combined result
        other_field = "answers_b" if is_user_a else "answers_a"
        other_answers = cycle.get(other_field, {})
        other_sums = other_answers.get("cluster_sums", {}) if other_answers else {}

        # Combine scores
        combined = {}
        all_keys = set(list(cluster_sums.keys()) + list(other_sums.keys()))
        for k in all_keys:
            combined[k] = cluster_sums.get(k, 0) + other_sums.get(k, 0)

        max_val = max(combined.values()) if combined else 1
        normalized = {k: round((v / max_val) * 100) if max_val > 0 else 0 for k, v in combined.items()}
        tendencies = scores_to_tendencies(normalized)
        primary_cluster = max(combined, key=combined.get) if combined else ""
        zone = determine_zone(combined)

        # Generate insight
        insight_text = await generate_insight_text(zone, primary_cluster, tendencies)

        # Assign buff
        buff = random.choice(BUFF_LIBRARY)

        update["state"] = "ready_to_reveal"
        update["result"] = {
            "combined_scores": combined,
            "tendencies": tendencies,
            "primary_cluster": primary_cluster,
            "zone": zone,
            "zone_palette": ZONE_PALETTES[zone],
            "zone_sentence": get_zone_sentence(zone),
            "insight_text": insight_text,
            "sector": CLUSTER_TO_SECTOR.get(primary_cluster, "passion"),
            "sector_tint": SECTOR_TINTS.get(CLUSTER_TO_SECTOR.get(primary_cluster, "passion"), {}),
        }
        update["zone"] = zone
        update["buff"] = buff
    else:
        update["state"] = "one_completed"

    await db.cluster_cycles.update_one({"id": sub.cycle_id}, {"$set": update})
    updated = await db.cluster_cycles.find_one({"id": sub.cycle_id}, {"_id": 0})
    return serialize_doc(updated)


@api_router.post("/quiz/reveal/{cycle_id}")
async def reveal_quiz(cycle_id: str):
    """Reveal the insight drop + buff + reward choices."""
    cycle = await db.cluster_cycles.find_one({"id": cycle_id}, {"_id": 0})
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")
    if cycle["state"] != "ready_to_reveal":
        raise HTTPException(status_code=400, detail="Noch nicht bereit zum Aufdecken")

    zone = cycle.get("zone", "flow")
    cluster = cycle.get("result", {}).get("primary_cluster", "")
    sector = CLUSTER_TO_SECTOR.get(cluster, "passion")

    # Generate 3 reward choices based on zone resonance
    reward_choices = [
        {**random.choice(REWARD_ITEMS["plants"]), "zone": zone, "sector": sector, "category": "plant"},
        {**random.choice(REWARD_ITEMS["land"]), "zone": zone, "sector": sector, "category": "land"},
        {**random.choice(REWARD_ITEMS["deco"]), "zone": zone, "sector": sector, "category": "deco"},
    ]

    await db.cluster_cycles.update_one({"id": cycle_id}, {"$set": {"state": "revealed", "reward_choices": reward_choices}})
    updated = await db.cluster_cycles.find_one({"id": cycle_id}, {"_id": 0})
    return serialize_doc(updated)


@api_router.post("/garden/place")
async def place_garden_item(req: GardenPlaceRequest):
    """Place a reward item into the shared garden."""
    item_doc = {
        "id": str(uuid.uuid4()),
        "item_id": req.item_id,
        "placed_by": req.user_id,
        "position_x": req.position_x,
        "position_y": req.position_y,
        "placed_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.couples.update_one(
        {"id": req.couple_id},
        {"$push": {"garden.items": item_doc}}
    )
    couple = await db.couples.find_one({"id": req.couple_id}, {"_id": 0})
    return {"garden": couple.get("garden", {})}


@api_router.get("/garden/{couple_id}")
async def get_garden(couple_id: str):
    couple = await db.couples.find_one({"id": couple_id}, {"_id": 0})
    if not couple:
        raise HTTPException(status_code=404, detail="Couple not found")
    return {"garden": couple.get("garden", {"items": [], "level": 1})}


@api_router.get("/cycles/{couple_id}")
async def get_couple_cycles(couple_id: str):
    cycles = await db.cluster_cycles.find({"couple_id": couple_id}, {"_id": 0}).to_list(100)
    return cycles


@api_router.get("/cycle/{cycle_id}")
async def get_cycle(cycle_id: str):
    cycle = await db.cluster_cycles.find_one({"id": cycle_id}, {"_id": 0})
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")
    return serialize_doc(cycle)


@api_router.get("/quiz/result/{result_id}")
async def get_quiz_result(result_id: str):
    # Check quiz_results collection first (legacy)
    result = await db.quiz_results.find_one({"id": result_id}, {"_id": 0})
    if result:
        return result
    # Check cluster_cycles
    cycle = await db.cluster_cycles.find_one({"id": result_id}, {"_id": 0})
    if cycle:
        return serialize_doc(cycle)
    raise HTTPException(status_code=404, detail="Result not found")


# ─── Quiz Data Seeding ───

async def seed_quiz_data():
    count = await db.quizzes.count_documents({})
    if count > 0:
        return
    logger.info("Seeding quiz data...")
    ll_path = ROOT_DIR / "love_languages_cluster.json"
    if ll_path.exists():
        with open(ll_path, 'r') as f:
            ll_data = json.load(f)
        for quiz in ll_data.get("quizzes", []):
            quiz_doc = {
                "id": quiz["id"],
                "hidden_cluster": quiz.get("hidden_cluster"),
                "facet_label": quiz.get("facet_label", {}),
                "tone": quiz.get("tone"),
                "type_model": quiz.get("type_model", {}),
                "questions": quiz.get("questions", []),
                "zone_tokens": quiz.get("zone_tokens", {}),
                "category": "love_languages",
                "public_name": ll_data.get("meta_cluster", {}).get("public_name", {}),
                "teaser": ll_data.get("meta_cluster", {}).get("teaser", {}),
                "question_count": len(quiz.get("questions", [])),
            }
            await db.quizzes.insert_one(quiz_doc)
    logger.info("Quiz data seeded")


@app.on_event("startup")
async def startup_event():
    await seed_quiz_data()

app.include_router(api_router)
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
