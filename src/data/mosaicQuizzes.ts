// QuissMe Mosaic Cluster Quizzes v1
// 15 Quizzes across Passion, Stability, Future

export type Zone = 'flow' | 'spark' | 'talk';

export interface QuizZoneTokens {
  zone: Zone;
  insightStrength: string;
  insightGrowth: string;
  microStep: string;
}

export interface Quiz {
  id: string;
  hiddenCluster: 'passion' | 'stability' | 'future';
  facetLabelDe: string;
  facetLabelEn: string;
  axis: 'nähe' | 'flow' | 'reibung';
  toneDefault: 'playful' | 'premium_poetic' | 'warm_minimal';
  narratorId: 'ember' | 'stone' | 'oracle';
  imageGenPrompt: string;
  zoneTokens: {
    flow: QuizZoneTokens;
    spark: QuizZoneTokens;
    talk: QuizZoneTokens;
  };
}

export const MOSAIC_QUIZZES: Quiz[] = [
  // PASSION CLUSTER (Ember)
  {
    id: 'passion_01_initiative',
    hiddenCluster: 'passion',
    facetLabelDe: 'Initiative',
    facetLabelEn: 'Initiation',
    axis: 'nähe',
    toneDefault: 'playful',
    narratorId: 'ember',
    imageGenPrompt: 'Cozy cinematic evening scene, two people sitting close on a sofa, warm lamp light, subtle intimacy, romantic mood, --ar 16:9',
    zoneTokens: {
      flow: { zone: 'flow', insightStrength: 'Ihr findet Nähe schnell.', insightGrowth: 'Manchmal abwechseln, wer den Start gibt.', microStep: '„Heute ich – morgen du?"' },
      spark: { zone: 'spark', insightStrength: 'Euer Kontrast macht den Funken lebendig.', insightGrowth: 'Beide Sprachen gleichwertig halten.', microStep: 'Rollen tauschen – nur zum Spaß.' },
      talk: { zone: 'talk', insightStrength: 'Hier lohnt sich eine gemeinsame Start-Sprache.', insightGrowth: 'Ein Mini-Check-in macht den ersten Schritt leichter.', microStep: '„Impuls oder Einladung – was wäre gerade gut?"' }
    }
  },
  {
    id: 'passion_02_expression',
    hiddenCluster: 'passion',
    facetLabelDe: 'Begehren zeigen',
    facetLabelEn: 'Desire Expression',
    axis: 'nähe',
    toneDefault: 'playful',
    narratorId: 'ember',
    imageGenPrompt: 'Elegant party scene, warm ambient lighting, subtle flirting, tasteful romantic tension, --ar 16:9',
    zoneTokens: {
      flow: { zone: 'flow', insightStrength: 'Eure Signale kommen an.', insightGrowth: 'Manchmal Raum lassen für leise Magie.', microStep: '„Wie meinst du das gerade?"' },
      spark: { zone: 'spark', insightStrength: 'Ihr erzeugt Anziehung durch gesunden Kontrast.', insightGrowth: 'Vorfreude feiern, ohne zu drängen.', microStep: 'Ein Codewort für „später"."' },
      talk: { zone: 'talk', insightStrength: 'Hier hilft ein kurzes Übersetzen eurer Zeichen.', insightGrowth: 'Ein Satz Klarheit macht es schnell leichter.', microStep: '„So meinte ich das gerade…"' }
    }
  },
  {
    id: 'passion_03_intensity',
    hiddenCluster: 'passion',
    facetLabelDe: 'Intensität-Rhythmus',
    facetLabelEn: 'Intensity Rhythm',
    axis: 'flow',
    toneDefault: 'premium_poetic',
    narratorId: 'ember',
    imageGenPrompt: 'Montage-like: couple silhouette under city lights + cozy morning coffee ritual, soft film grain, --ar 16:9',
    zoneTokens: {
      flow: { zone: 'flow', insightStrength: 'Ihr habt einen Rhythmus, der euch trägt.', insightGrowth: 'Bewusst Landepausen einbauen.', microStep: '„Peak oder Kamin heute?""' },
      spark: { zone: 'spark', insightStrength: 'Unterschied mit Halt: spannend, ohne zu stressen.', insightGrowth: 'Beide Tempos gleich würdigen.', microStep: 'Eine „neue Sache" pro Woche.' },
      talk: { zone: 'talk', insightStrength: 'Hier hilft ein gemeinsamer Takt.', insightGrowth: 'Ein kurzes Aushandeln macht es leichter.', microStep: '2-Minuten-Check-in – ohne Lösungen.' }
    }
  },
  {
    id: 'passion_04_response',
    hiddenCluster: 'passion',
    facetLabelDe: 'Energie-Response',
    facetLabelEn: 'Energy Response',
    axis: 'flow',
    toneDefault: 'playful',
    narratorId: 'ember',
    imageGenPrompt: 'Dynamic cinematic scene: two people laughing in a kitchen at night, playful sparks, warm tones, --ar 16:9',
    zoneTokens: {
      flow: { zone: 'flow', insightStrength: 'Eure Energie findet sich oft natürlich.', insightGrowth: 'Kurz bremsen, damit es weich bleibt.', microStep: '„Skala 1–10 – wie viel Tempo?""' },
      spark: { zone: 'spark', insightStrength: 'Ihr macht aus Impuls ein gemeinsames Crescendo.', insightGrowth: 'Rollen wechseln, damit es spielerisch bleibt.', microStep: 'Erst Gefühl, dann Bitte.' },
      talk: { zone: 'talk', insightStrength: 'Hier lohnt sich ein kleiner Cooldown-Moment.', insightGrowth: 'Ein Satz Timing kann viel entspannen.', microStep: '„Wollen wir kurz landen, dann weiter?""' }
    }
  },
  {
    id: 'passion_05_reception',
    hiddenCluster: 'passion',
    facetLabelDe: 'Empfänglichkeit',
    facetLabelEn: 'Receptivity',
    axis: 'nähe',
    toneDefault: 'premium_poetic',
    narratorId: 'ember',
    imageGenPrompt: 'Soft candlelit evening scene, cozy bedroom doorway with warm light, romantic but tasteful, --ar 16:9',
    zoneTokens: {
      flow: { zone: 'flow', insightStrength: 'Ihr erkennt Offenheit auch ohne viele Worte.', insightGrowth: 'Klar benennen, was gut wäre.', microStep: '„Was würde sich jetzt schön anfühlen?""' },
      spark: { zone: 'spark', insightStrength: 'Ihr kombiniert Atmosphäre und Impuls elegant.', insightGrowth: 'Spontanität und Ritual mischen.', microStep: 'Abwechselnd „Planer" sein.' },
      talk: { zone: 'talk', insightStrength: 'Hier hilft ein gemeinsames Signal-System.', insightGrowth: 'Ein Satz Übersetzung macht es schnell leichter.', microStep: 'Ein Emoji als „Ich bin offen"."' }
    }
  },
  // STABILITY CLUSTER (Stone)
  {
    id: 'stability_01_anchor',
    hiddenCluster: 'stability',
    facetLabelDe: 'Anker',
    facetLabelEn: 'Anchor',
    axis: 'flow',
    toneDefault: 'warm_minimal',
    narratorId: 'stone',
    imageGenPrompt: 'Storm outside a window, warm interior light, two people wrapped in a blanket with tea, calm atmosphere, --ar 16:9',
    zoneTokens: {
      flow: { zone: 'flow', insightStrength: 'Ihr gebt euch Halt, ohne viel Drama.', insightGrowth: 'Auch Bewegung zulassen, ganz klein.', microStep: '„Was würde jetzt beruhigen?""' },
      spark: { zone: 'spark', insightStrength: 'Kopf und Herz greifen bei euch gut ineinander.', insightGrowth: 'Beide Beiträge bewusst aussprechen.', microStep: '„Danke für deinen Part daran.""' },
      talk: { zone: 'talk', insightStrength: 'Hier hilft eine gemeinsame Sprache für Stress.', insightGrowth: 'Ein kurzer Abgleich macht es leichter.', microStep: '2 Minuten Check-in – ohne Fixen.' }
    }
  },
  {
    id: 'stability_02_architect',
    hiddenCluster: 'stability',
    facetLabelDe: 'Alltags-Organisation',
    facetLabelEn: 'Daily Operations',
    axis: 'flow',
    toneDefault: 'playful',
    narratorId: 'stone',
    imageGenPrompt: 'Bright kitchen table with calendar, sticky notes, groceries, two people smiling while planning, --ar 16:9',
    zoneTokens: {
      flow: { zone: 'flow', insightStrength: 'Euer Alltag läuft oft wie aus einem Guss.', insightGrowth: 'Pausen einplanen, ohne zu optimieren.', microStep: '„Was ist diese Woche wirklich wichtig?""' },
      spark: { zone: 'spark', insightStrength: 'Ihr ergänzt euch: Plan trifft Wärme und Umsetzung.', insightGrowth: 'Rollen gelegentlich tauschen.', microStep: '„Heute mach ich – du lenkst.""' },
      talk: { zone: 'talk', insightStrength: 'Hier lohnt sich Übersetzen zwischen Struktur und Spontanität.', insightGrowth: 'Ein Mini-Plan kann Freiheit erhöhen.', microStep: '„Welche zwei Basics halten wir fest?""' }
    }
  },
  {
    id: 'stability_03_routine',
    hiddenCluster: 'stability',
    facetLabelDe: 'Rituale',
    facetLabelEn: 'Rituals',
    axis: 'flow',
    toneDefault: 'premium_poetic',
    narratorId: 'stone',
    imageGenPrompt: 'Morning ritual scene: coffee cups, soft sunlight, gentle kiss goodbye at the door, cozy and warm, --ar 16:9',
    zoneTokens: {
      flow: { zone: 'flow', insightStrength: 'Eure Rituale tragen euch spürbar im Alltag.', insightGrowth: 'Platz lassen für spontane Mini-Magie.', microStep: 'Ein „Anker-Ritual" pro Tag.' },
      spark: { zone: 'spark', insightStrength: 'Tradition und Innovation machen euch lebendig.', insightGrowth: 'Klassiker behalten, Neues testen.', microStep: 'Jeden Monat ein neues Ritual erfinden.' },
      talk: { zone: 'talk', insightStrength: 'Hier hilft eine gemeinsame Erwartung an Rhythmus.', insightGrowth: 'Ein kurzer Abgleich macht es leichter.', microStep: '„Welche zwei Rituale sind uns wirklich wichtig?""' }
    }
  },
  {
    id: 'stability_04_conflict',
    hiddenCluster: 'stability',
    facetLabelDe: 'Reibung & Reparatur',
    facetLabelEn: 'Friction & Repair',
    axis: 'reibung',
    toneDefault: 'warm_minimal',
    narratorId: 'stone',
    imageGenPrompt: 'After an argument: two people sitting at a table with tea, soft evening light, tension easing into understanding, --ar 16:9',
    zoneTokens: {
      flow: { zone: 'flow', insightStrength: 'Ihr findet oft zurück, ohne lange Schleifen.', insightGrowth: 'Tempo abgleichen, damit es weich bleibt.', microStep: 'Erst Gefühl, dann Bitte.' },
      spark: { zone: 'spark', insightStrength: 'Eure Unterschiede bringen Lösungen mit Wärme zusammen.', insightGrowth: 'Rollen wechseln – zuhören statt führen.', microStep: '„Was würdest du dir wünschen?""' },
      talk: { zone: 'talk', insightStrength: 'Hier lohnt sich eine gemeinsame Konflikt-Sprache.', insightGrowth: 'Ein „Übersetzen" macht es schnell leichter.', microStep: '2 Minuten Check-in – nur Verständnis.' }
    }
  },
  {
    id: 'stability_05_decisions',
    hiddenCluster: 'stability',
    facetLabelDe: 'Entscheidungsstil',
    facetLabelEn: 'Decision Style',
    axis: 'flow',
    toneDefault: 'playful',
    narratorId: 'stone',
    imageGenPrompt: 'Couple reviewing options on a laptop with notes, cozy desk lamp, calm teamwork vibe, --ar 16:9',
    zoneTokens: {
      flow: { zone: 'flow', insightStrength: 'Ihr trefft Entscheidungen meist auf derselben Wellenlänge.', insightGrowth: 'Deadlines setzen, damit es leicht bleibt.', microStep: '„Welche Option fühlt sich am stimmigsten?""' },
      spark: { zone: 'spark', insightStrength: 'Kopf und Bauch ergänzen sich bei euch stark.', insightGrowth: 'Beide Methoden gleich würdigen.', microStep: 'Erst Daten, dann Bauch – oder umgekehrt.' },
      talk: { zone: 'talk', insightStrength: 'Hier hilft ein kurzer Modus-Wechsel im Gespräch.', insightGrowth: 'Ein Satz Klarheit macht es schneller leicht.', microStep: '„Reden wir gerade Fakten oder Gefühl?""' }
    }
  },
  // FUTURE CLUSTER (Oracle)
  {
    id: 'future_01_vision',
    hiddenCluster: 'future',
    facetLabelDe: 'Vision',
    facetLabelEn: 'Vision',
    axis: 'flow',
    toneDefault: 'premium_poetic',
    narratorId: 'oracle',
    imageGenPrompt: 'Night sky rooftop scene, city lights, two people imagining the future with a notebook, dreamy yet grounded, --ar 16:9',
    zoneTokens: {
      flow: { zone: 'flow', insightStrength: 'Ihr schaut ähnlich nach vorn – das gibt Richtung.', insightGrowth: 'Kleine Schritte benennen, ganz konkret.', microStep: '„Was wäre ein erster Schritt?""' },
      spark: { zone: 'spark', insightStrength: 'Traum und Umsetzung greifen bei euch gut zusammen.', insightGrowth: 'Vision kurz malen, dann planen.', microStep: '10 Minuten träumen, 2 Minuten planen.' },
      talk: { zone: 'talk', insightStrength: 'Hier hilft Übersetzen zwischen Jetzt und Später.', insightGrowth: 'Ein gemeinsamer Zeithorizont macht es leichter.', microStep: '„Was ist heute – was ist später?""' }
    }
  },
  {
    id: 'future_02_building',
    hiddenCluster: 'future',
    facetLabelDe: 'Umsetzung',
    facetLabelEn: 'Execution',
    axis: 'flow',
    toneDefault: 'playful',
    narratorId: 'oracle',
    imageGenPrompt: 'Energetic planning-to-action scene: whiteboard, tools, two people high-fiving after starting a project, --ar 16:9',
    zoneTokens: {
      flow: { zone: 'flow', insightStrength: 'Ihr startet Projekte oft mit ähnlichem Tempo.', insightGrowth: 'Kurz koordinieren, dann loslegen.', microStep: '„Was ist der kleinste Start?""' },
      spark: { zone: 'spark', insightStrength: 'Sprint und System machen euch zusammen stark.', insightGrowth: 'Rollen flexibel halten.', microStep: '„Du planst, ich starte – dann switch.""' },
      talk: { zone: 'talk', insightStrength: 'Hier lohnt sich ein gemeinsames Start-Signal.', insightGrowth: 'Ein Zeitpunkt hilft, ohne Druck zu machen.', microStep: '„Wollen wir um 18:00 den ersten Schritt machen?""' }
    }
  },
  {
    id: 'future_03_ambition',
    hiddenCluster: 'future',
    facetLabelDe: 'Zielhöhe',
    facetLabelEn: 'Ambition',
    axis: 'flow',
    toneDefault: 'premium_poetic',
    narratorId: 'oracle',
    imageGenPrompt: 'Symbolic scene: staircase leading into a sunrise, two silhouettes climbing together, hopeful atmosphere, --ar 16:9',
    zoneTokens: {
      flow: { zone: 'flow', insightStrength: 'Ihr setzt Ziele in ähnlicher Größe – das vereint.', insightGrowth: 'Etappen feiern, nicht nur Gipfel.', microStep: '„Was wäre ein schöner Zwischenstopp?""' },
      spark: { zone: 'spark', insightStrength: 'Euer Mix aus Traum und Bodenhaftung ist stark.', insightGrowth: 'Groß denken, klein starten.', microStep: '„Ein mutiger Traum, ein kleiner Schritt.""' },
      talk: { zone: 'talk', insightStrength: 'Hier hilft Übersetzen zwischen Antrieb und Ruhe.', insightGrowth: 'Ein gemeinsames „Warum" macht es leichter.', microStep: '„Wofür lohnt sich das – wirklich?""' }
    }
  },
  {
    id: 'future_04_security',
    hiddenCluster: 'future',
    facetLabelDe: 'Sicherheitsbedarf',
    facetLabelEn: 'Security Needs',
    axis: 'reibung',
    toneDefault: 'warm_minimal',
    narratorId: 'oracle',
    imageGenPrompt: 'Balanced life scene: piggy bank and travel map, warm light, choosing between safety and adventure, --ar 16:9',
    zoneTokens: {
      flow: { zone: 'flow', insightStrength: 'Ihr habt ein ähnliches Maß an Sicherheit im Blick.', insightGrowth: 'Freiheit bewusst einplanen, ganz klein.', microStep: '„Was gibt uns Ruhe – was gibt uns Leben?""' },
      spark: { zone: 'spark', insightStrength: 'Basis und Abenteuer können bei euch koexistieren.', insightGrowth: 'Ein Sicherheitsnetz, ein Abenteuer.', microStep: '„80% Basis, 20% Spielraum"."' },
      talk: { zone: 'talk', insightStrength: 'Hier hilft ein gemeinsames Sicherheits-Wörterbuch.', insightGrowth: 'Ein Abgleich der Komfortzonen macht es leichter.', microStep: '„Welche Zahl wäre heute okay?""' }
    }
  },
  {
    id: 'future_05_growth',
    hiddenCluster: 'future',
    facetLabelDe: 'Wachstumsstil',
    facetLabelEn: 'Growth Style',
    axis: 'nähe',
    toneDefault: 'premium_poetic',
    narratorId: 'oracle',
    imageGenPrompt: 'Symbolic growth scene: small plant sprouting from a book, two hands watering it together, warm sunlight, --ar 16:9',
    zoneTokens: {
      flow: { zone: 'flow', insightStrength: 'Ihr wachst auf eine Art, die euch verbindet.', insightGrowth: 'Raum lassen für eigene Wege.', microStep: '„Was nimmst du mit – was teile ich?""' },
      spark: { zone: 'spark', insightStrength: 'Ihr bereichert euch durch unterschiedliche Lernwege.', insightGrowth: 'Gemeinsam lernen, dann integrieren.', microStep: 'Ein gemeinsamer Abend „Erkenntnisse teilen"."' },
      talk: { zone: 'talk', insightStrength: 'Hier hilft Übersetzen zwischen Team und Ich-Zeit.', insightGrowth: 'Ein kleines Ritual macht es leichter.', microStep: '„Wann ist Teamzeit – wann ist Solozeit?""' }
    }
  }
];

// Helper functions
export const getQuizzesByCluster = (cluster: 'passion' | 'stability' | 'future') => 
  MOSAIC_QUIZZES.filter(q => q.hiddenCluster === cluster);

export const getQuizById = (id: string) => 
  MOSAIC_QUIZZES.find(q => q.id === id);

export const CLUSTER_INFO = {
  passion: { nameDe: 'Leidenschaft', nameEn: 'Passion', narrator: 'ember' },
  stability: { nameDe: 'Stabilität', nameEn: 'Stability', narrator: 'stone' },
  future: { nameDe: 'Zukunft', nameEn: 'Future', narrator: 'oracle' }
};
