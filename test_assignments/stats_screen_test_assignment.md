# QuissMe Stats-Screen — Testauftrag & Testbericht

## 1. Testauftrag (Scope & Goals)

### Ziel
Verifiziere die vollständige Funktionalität des QuissMe Stats-Screen Features:
- Backend: Stats-API Endpoints + EWMA-Update-Pipeline
- Frontend: Stats-Tab mit Balkendiagrammen + Debug-Toggle
- Integration: Stats-Update nach Quiz-Completion

### Umfang

| Feature-ID | Feature | Priorität |
|------------|---------|-----------|
| F1-STAT-API | GET /api/stats/{couple_id} Endpoint | HIGH |
| F2-STAT-LIB | GET /api/stats/library/info Endpoint | LOW |
| F3-EWMA | EWMA Stats-Update nach Quiz-Reveal | HIGH |
| F4-UI-BARS | Animierte Balkendiagramme im Stats-Tab | HIGH |
| F5-UI-FAMILY | Gruppierung nach Family (Nähe/Einklang/Resilienz) | MEDIUM |
| F6-DEBUG | Debug-Toggle (5x Tap) für Prozentwerte | MEDIUM |
| F7-REFRESH | Pull-to-Refresh für Stats | MEDIUM |

---

## 2. Testumgebung

```yaml
build: QuissMe Expo Dev Build (localhost:3000)
backend: FastAPI @ localhost:8001
database: MongoDB (local)
platforms:
  - Web Preview (localhost:3000)
  - Expo Go (optional)
devices:
  - iPhone 12/13/14 Viewport (390x844)
  - Android Galaxy S21 Viewport (360x800)
accounts:
  partnerA: TestUser (dynamisch erstellt)
  partnerB: Partner (via invite_code)
evidence_available:
  api_traces: YES (curl)
  db_snapshots: YES (MongoDB queries)
  screenshots: YES (Playwright)
  logs: YES (backend logs)
```

---

## 3. Testdaten

### Seed State
```json
{
  "couple_state": "fresh_couple",
  "weekly_activations": 0,
  "active_quizzes": 0,
  "initial_stats_value": 50
}
```

### Stat Library Reference (17 Core Stats)
| Family | Stats |
|--------|-------|
| closeness (5) | tenderness, attunement, initiation, playfulness, appreciation |
| alignment (5) | rituals, teamwork, decision_flow, daily_design, balance |
| tension (7) | repair_skill, boundaries, pace_harmony, soft_under_stress, growth_mode, spaciousness, fluidity |

---

## 4. Testfälle

### TC-01: Stats API — Initiale Stats für neues Paar
```gherkin
Given: Ein neues Paar wurde gerade erstellt (couple_id vorhanden)
When: GET /api/stats/{couple_id} aufgerufen wird
Then: 
  - Response enthält genau 17 Stats
  - Alle value_0_100 Werte sind 50
  - Alle tendency Werte sind "medium"
  - Jeder Stat hat: stat_key, name_de, bar_color, tendency_text
```
**Severity:** S1 Critical  
**Evidence:** API Response JSON

---

### TC-02: Stats API — Family-Gruppierung
```gherkin
Given: Stats für ein Paar geladen
When: Response.families analysiert wird
Then:
  - closeness: 5 Stats
  - alignment: 5 Stats
  - tension: 7 Stats
  - Summe: 17 Core Stats
```
**Severity:** S2 Major  
**Evidence:** API Response JSON

---

### TC-03: Stats API — Sortierung nach display_order
```gherkin
Given: Stats geladen
When: stats[] Array iteriert wird
Then: display_order ist aufsteigend (1, 2, 3, ..., 17)
```
**Severity:** S3 Minor  
**Evidence:** API Response JSON

---

### TC-04: Library Info Endpoint
```gherkin
When: GET /api/stats/library/info aufgerufen wird
Then:
  - schema_version: "quissme.stat_library.v1_1"
  - core_stats_count: 17
  - stats[]: Liste mit allen stat_keys und name_de
```
**Severity:** S4 Trivial  
**Evidence:** API Response JSON

---

### TC-05: EWMA Update — Stats ändern sich nach Quiz
```gherkin
Given: Neues Paar mit initialen Stats (alle 50)
And: Quiz aktiviert
When: Beide Partner das Quiz abschließen (submit)
Then:
  - Stats werden via EWMA aktualisiert
  - Mindestens ein Stat hat value_0_100 ≠ 50
  - History enthält vorherigen Wert
```
**Severity:** S1 Critical  
**Evidence:** DB Snapshot vor/nach, API Response

---

### TC-06: EWMA Formel Korrektheit
```gherkin
Given: stat_old = 50, alpha = 0.15
And: pair_signal = 0.65*similarity + 0.35*complementarity
When: target = 100 * pair_signal
Then: stat_new = (1 - 0.15) * 50 + 0.15 * target
```
**Severity:** S2 Major  
**Evidence:** Berechnungsvergleich

---

### TC-07: Frontend — Stats Tab in Navigation
```gherkin
Given: User ist eingeloggt und auf Dashboard
When: Tab-Bar betrachtet wird
Then: 
  - "Stats" Tab ist sichtbar (📊 Icon)
  - Position: zwischen "Entdecken" und "Garten"
```
**Severity:** S2 Major  
**Evidence:** Screenshot

---

### TC-08: Frontend — Balkendiagramme anzeigen
```gherkin
Given: User navigiert zum Stats-Tab
When: Screen geladen ist
Then:
  - 17 Balken werden angezeigt
  - Jeder Balken hat: Name, farbiger Balken, Tendenz-Icon, Tendenz-Text
  - Balkenlänge entspricht value_0_100 (50 = halbe Breite)
```
**Severity:** S1 Critical  
**Evidence:** Screenshot

---

### TC-09: Frontend — Keine Zahlen im Default-Modus
```gherkin
Given: Stats-Tab geöffnet
When: Normaler Anzeigemodus
Then: 
  - Keine Prozentzahlen sichtbar
  - Nur Balkenlänge + Tendenz-Text ("oft stimmig – mit Raum für Feinschliff")
```
**Severity:** S2 Major  
**Evidence:** Screenshot

---

### TC-10: Frontend — Debug-Toggle aktivieren
```gherkin
Given: Stats-Tab geöffnet
When: Nutzer tippt 5x schnell auf "Duo-Stats" Titel
Then:
  - Debug-Badge erscheint ("🔧 Debug-Modus aktiv")
  - Prozentwerte werden bei jedem Balken angezeigt (z.B. "50%")
```
**Severity:** S3 Minor  
**Evidence:** Screenshot vorher/nachher

---

### TC-11: Frontend — Family-Gruppierung UI
```gherkin
Given: Stats-Tab geöffnet
When: Screen scrollt
Then:
  - 3 Family-Sektionen: "Nähe", "Einklang", "Resilienz"
  - Jede Sektion hat farbige Randlinie (closeness: pink, alignment: teal, tension: purple)
  - Jede Sektion zeigt Anzahl Stats ("5 Stats" / "7 Stats")
```
**Severity:** S2 Major  
**Evidence:** Screenshot

---

### TC-12: Frontend — Pull-to-Refresh
```gherkin
Given: Stats-Tab geöffnet
When: Nutzer zieht Screen nach unten (Pull-Gesture)
Then:
  - Refresh-Indicator erscheint
  - Stats werden neu aus DB geladen
  - Aktuelle Werte werden angezeigt
```
**Severity:** S3 Minor  
**Evidence:** Video/GIF

---

### TC-13: Frontend — Tendency Text aus copy_templates
```gherkin
Given: Stat mit tendency = "medium"
When: Stats-Tab geladen
Then: Tendenz-Text zeigt "{name_de}: oft stimmig – mit Raum für Feinschliff."
```
**Severity:** S2 Major  
**Evidence:** Screenshot + API Response Vergleich

---

### TC-14: Frontend — Balkenfarben pro Stat
```gherkin
Given: Stats geladen
When: Balken betrachtet werden
Then:
  - Jeder Stat hat deterministische Farbe (bar_color aus Library)
  - Farben sind stabil über Sessions
  - Beispiel: tenderness = #F472B6 (pink), rituals = #2DD4BF (teal)
```
**Severity:** S3 Minor  
**Evidence:** Screenshot

---

### TC-15: Error Handling — Kein Paar verbunden
```gherkin
Given: User ist nicht Teil eines Paares (couple_id = null)
When: Stats-Tab geöffnet wird
Then:
  - Fehlermeldung: "Noch kein Paar verbunden"
  - Retry-Button verfügbar
```
**Severity:** S2 Major  
**Evidence:** Screenshot

---

## 5. Testergebnisse (Template)

| TC-ID | Feature | Status | Evidenz | Kommentar |
|-------|---------|--------|---------|-----------|
| TC-01 | Stats API Initial | ⬜ NOT EXECUTED | | |
| TC-02 | Family Gruppierung | ⬜ NOT EXECUTED | | |
| TC-03 | Sortierung | ⬜ NOT EXECUTED | | |
| TC-04 | Library Info | ⬜ NOT EXECUTED | | |
| TC-05 | EWMA Update | ⬜ NOT EXECUTED | | |
| TC-06 | EWMA Formel | ⬜ NOT EXECUTED | | |
| TC-07 | Tab Navigation | ⬜ NOT EXECUTED | | |
| TC-08 | Balkendiagramme | ⬜ NOT EXECUTED | | |
| TC-09 | Keine Zahlen Default | ⬜ NOT EXECUTED | | |
| TC-10 | Debug Toggle | ⬜ NOT EXECUTED | | |
| TC-11 | Family UI | ⬜ NOT EXECUTED | | |
| TC-12 | Pull-to-Refresh | ⬜ NOT EXECUTED | | |
| TC-13 | Tendency Text | ⬜ NOT EXECUTED | | |
| TC-14 | Balkenfarben | ⬜ NOT EXECUTED | | |
| TC-15 | Error Handling | ⬜ NOT EXECUTED | | |

**Legende:** ✅ PASS | ❌ FAIL | ⬜ NOT EXECUTED

---

## 6. Defect-Liste (Template)

| Defect-ID | Severity | Titel | Repro Steps | Expected | Actual | TC-Ref | Status |
|-----------|----------|-------|-------------|----------|--------|--------|--------|
| DEF-001 | S? | | | | | | OPEN |

---

## 7. Risiken & Empfehlungen

### Release Readiness
- [ ] Alle HIGH-Priority Testfälle bestanden
- [ ] Keine S0/S1 Defects offen
- [ ] Backend API stabil
- [ ] Frontend auf Mobile getestet

### Empfehlungen
1. Frontend-Testing auf echtem Mobile-Gerät (Expo Go) vor Release
2. Quiz-UI Integration (Stat-Tags Anzeige) als nächstes Feature
3. Flavor-Stats (12 weitere) nach MVP-Validation hinzufügen

---

## 8. Anhang

### API Endpoints
- `GET /api/stats/{couple_id}` — Alle Stats mit Metadaten
- `GET /api/stats/library/info` — Library Debug Info

### Dateien
- `backend/stat_library.json` — Stat-Library mit 17 Core Stats
- `backend/server.py` — API Endpoints + EWMA Logic
- `frontend/app/(tabs)/stats.tsx` — Stats-Tab Komponente
- `frontend/app/(tabs)/_layout.tsx` — Tab Navigation
- `frontend/utils/api.ts` — API Client

### Testdaten-Generierung
```bash
# User erstellen
curl -X POST "http://localhost:8001/api/users/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"TestUser","birth_date":"1990-05-15","birth_time":"14:30","birth_location":"Berlin"}'

# Partner joinen (mit invite_code aus Response)
curl -X POST "http://localhost:8001/api/invite/join" \
  -H "Content-Type: application/json" \
  -d '{"invite_code":"{{INVITE_CODE}}","name":"Partner","birth_date":"1992-08-20","birth_time":"10:00","birth_location":"Munich"}'

# Stats abrufen
curl "http://localhost:8001/api/stats/{{COUPLE_ID}}"
```
