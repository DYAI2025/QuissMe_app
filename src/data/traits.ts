// QuissMe Trait System v1
// 10 RPG-Bars for DuoDynamic Visualization

export type TraitLevel = 'high' | 'medium' | 'building';

export interface Trait {
  key: string;
  nameDe: string;
  nameEn: string;
  taglineDe: string;
  taglineEn: string;
  copy: {
    [K in TraitLevel]: {
      de: string;
      en: string;
    };
  };
  mainTags: string[];
}

export const DUO_TRAITS: Trait[] = [
  {
    key: 'closeness',
    nameDe: 'Nähe',
    nameEn: 'Closeness',
    taglineDe: 'Wie sicher und nah ihr euch emotional fühlt.',
    taglineEn: 'How emotionally safe and close you feel together.',
    copy: {
      high: { de: 'Nähe entsteht bei euch leicht – ihr fühlt euch schnell verbunden.', en: 'Closeness comes naturally—connection feels easy for you.' },
      medium: { de: 'Nähe ist da – manchmal hilft ein kleiner Moment bewusst dafür.', en: 'Closeness is there—sometimes a small intentional moment helps.' },
      building: { de: 'Nähe wächst bei euch über kleine Zeichen: ruhig, Schritt für Schritt.', en: 'Closeness grows through small signals—steady, step by step.' }
    },
    mainTags: ['attachment', 'trust', 'empathy']
  },
  {
    key: 'alignment',
    nameDe: 'Flow',
    nameEn: 'Alignment',
    taglineDe: 'Wie gut Alltag, Werte und Richtung zusammenpassen.',
    taglineEn: 'How well your everyday life, values, and direction line up.',
    copy: {
      high: { de: 'Ihr zieht oft in dieselbe Richtung – das gibt euch Ruhe.', en: 'You often move in the same direction—this gives you ease.' },
      medium: { de: 'Ihr habt viel gemeinsam – manchmal braucht es kurz Abstimmung.', en: 'You share a lot—sometimes a quick alignment moment helps.' },
      building: { de: 'Euer gemeinsamer Kurs wird klarer, je öfter ihr euch kurz einigt.', en: 'Your shared direction becomes clearer with small check-ins.' }
    },
    mainTags: ['values', 'goals', 'planning']
  },
  {
    key: 'tension',
    nameDe: 'Reibung',
    nameEn: 'Tension',
    taglineDe: 'Spannung als Energie – neutral, entscheidend ist euer Umgang damit.',
    taglineEn: 'Tension as energy—neutral by itself; what matters is how you handle it.',
    copy: {
      high: { de: 'Bei euch ist viel Energie – ihr könnt sie gut halten, ohne dass sie kippt.', en: "There's lots of energy—and you tend to hold it well without it tipping." },
      medium: { de: 'Manchmal knistert es – oft reicht ein kurzes „Übersetzen".', en: "There's some spark—often a small 'translation moment' is enough." },
      building: { de: 'Eure Spannung will verstanden werden – kleine Pausen machen es leichter.', en: 'Tension wants understanding—tiny pauses can make it lighter.' }
    },
    mainTags: ['triggers', 'conflict_repair', 'boundaries']
  },
  {
    key: 'repair',
    nameDe: 'Reparaturkraft',
    nameEn: 'Repair Strength',
    taglineDe: 'Wie schnell ihr nach Spannung wieder weich werdet.',
    taglineEn: 'How quickly you return to warmth after tension.',
    copy: {
      high: { de: 'Ihr findet schnell zurück – Reset statt Drama.', en: 'You find your way back quickly—reset over drama.' },
      medium: { de: 'Ihr kommt meistens wieder zusammen – manchmal braucht es einen klaren Startpunkt.', en: 'You usually reconnect—sometimes a clear restart point helps.' },
      building: { de: 'Euer Reset wird besser, wenn ihr ihn klein und früh macht.', en: 'Your reset gets easier when you do it small and early.' }
    },
    mainTags: ['conflict_repair', 'empathy', 'triggers']
  },
  {
    key: 'clarity',
    nameDe: 'Klarheit',
    nameEn: 'Clarity',
    taglineDe: 'Wie gut ihr Bedeutungen übersetzt: weniger Annahmen, mehr Verstehen.',
    taglineEn: 'How well you translate meaning: fewer assumptions, more understanding.',
    copy: {
      high: { de: 'Ihr versteht euch oft ohne Umwege – Missverständnisse lösen sich schnell.', en: 'You understand each other with little friction—misreads clear fast.' },
      medium: { de: 'Meistens klappt es – manchmal hilft ein Satz mehr Nachfrage.', en: 'It mostly works—sometimes one extra question helps.' },
      building: { de: 'Klarheit wächst bei euch, wenn ihr kurz prüft: „Meinst du das so?"', en: "Clarity grows when you quickly check: 'Did you mean it that way?'" }
    },
    mainTags: ['communication', 'needs']
  },
  {
    key: 'appreciation',
    nameDe: 'Wertschätzung',
    nameEn: 'Appreciation',
    taglineDe: 'Wie sichtbar Dank, Anerkennung und liebevolles Wahrnehmen wird.',
    taglineEn: 'How visible gratitude and warm noticing are between you.',
    copy: {
      high: { de: 'Ihr seht euch – Anerkennung kommt bei euch wirklich an.', en: 'You really see each other—appreciation lands.' },
      medium: { de: 'Wertschätzung ist da – manchmal darf sie noch konkreter werden.', en: 'Appreciation is present—sometimes it can be more specific.' },
      building: { de: 'Schon ein kleines, echtes Danke kann bei euch viel bewegen.', en: 'A small, genuine thank-you can shift a lot for you.' }
    },
    mainTags: ['appreciation', 'attachment']
  },
  {
    key: 'ritual',
    nameDe: 'Ritual',
    nameEn: 'Ritual',
    taglineDe: 'Wie gut kleine Gewohnheiten euch tragen.',
    taglineEn: 'How well small habits support you.',
    copy: {
      high: { de: 'Eure kleinen Rituale geben euch Halt – ohne dass es schwer wirkt.', en: 'Your small rituals support you—without feeling heavy.' },
      medium: { de: 'Ritual tut euch gut – es darf nur leichter und regelmäßiger werden.', en: 'Ritual helps—you just benefit from making it lighter and steadier.' },
      building: { de: 'Ein Mini-Ritual reicht schon: kurz, echt, wiederholbar.', en: 'A tiny ritual is enough: short, real, repeatable.' }
    },
    mainTags: ['rituals', 'planning']
  },
  {
    key: 'play',
    nameDe: 'Spiel',
    nameEn: 'Play',
    taglineDe: 'Leichtigkeit als Verbindung, nicht als Ablenkung.',
    taglineEn: 'Lightness as connection, not avoidance.',
    copy: {
      high: { de: 'Humor verbindet euch schnell – ihr findet Leichtigkeit zusammen.', en: 'Humor connects you fast—you find lightness together.' },
      medium: { de: 'Ihr habt Spiel – manchmal braucht es nur einen kleinen Startfunken.', en: 'Play is there—sometimes you just need a small spark.' },
      building: { de: 'Leichtigkeit wächst, wenn ihr sie kurz einladet – ohne großen Plan.', en: 'Lightness grows when you invite it briefly—no big plan needed.' }
    },
    mainTags: ['playfulness', 'novelty']
  },
  {
    key: 'boundaries',
    nameDe: 'Freiraum',
    nameEn: 'Boundaries',
    taglineDe: 'Nähe und Raum dosieren – Grenzen als Einladung, nicht Distanz.',
    taglineEn: 'Balancing closeness and space—boundaries as invitation, not distance.',
    copy: {
      high: { de: 'Ihr gebt euch Raum, ohne euch zu verlieren – das wirkt reif.', en: 'You give each other space without losing connection—mature and steady.' },
      medium: { de: 'Meistens passt es – manchmal hilft ein klarer Satz statt Deutung.', en: 'It mostly works—sometimes a clear sentence beats guessing.' },
      building: { de: 'Grenzen werden leichter, wenn ihr sie warm formuliert: „Ich brauche…"', en: "Boundaries get easier when they're warm: 'I need…''" }
    },
    mainTags: ['boundaries', 'needs']
  },
  {
    key: 'fairness',
    nameDe: 'Team-Fairness',
    nameEn: 'Team Fairness',
    taglineDe: 'Wie fair sich Lasten und Entscheidungen anfühlen.',
    taglineEn: 'How fair responsibilities and decisions feel.',
    copy: {
      high: { de: 'Ihr fühlt euch als Team – Lasten verteilen sich stimmig.', en: 'You feel like a team—responsibilities land in a balanced way.' },
      medium: { de: 'Ihr seid oft fair – manchmal lohnt ein kurzer Abgleich.', en: "You're often fair—sometimes a quick recalibration helps." },
      building: { de: 'Fairness wächst, wenn ihr es als „wir" besprecht, nicht als Schuldfrage.', en: 'Fairness grows when it is framed as "we", not blame.' }
    },
    mainTags: ['fairness', 'goals', 'planning']
  }
];

// Helper functions
export const getTraitByKey = (key: string) => 
  DUO_TRAITS.find(t => t.key === key);

// Buff types
export interface Buff {
  id: string;
  nameDe: string;
  nameEn: string;
  descriptionDe: string;
  descriptionEn: string;
  durationDays: number;
  affectedTraits: string[];
}

export const CLUSTER_BUFFS: Buff[] = [
  {
    id: 'passion',
    nameDe: 'Leidenschafts-Boost',
    nameEn: 'Passion Boost',
    descriptionDe: 'Eure Verbindung lodert hell.',
    descriptionEn: 'Your connection burns bright.',
    durationDays: 7,
    affectedTraits: ['closeness', 'play', 'appreciation']
  },
  {
    id: 'stability',
    nameDe: 'Fels in der Brandung',
    nameEn: 'Rock Solid',
    descriptionDe: 'Euch kann wenig erschüttern.',
    descriptionEn: 'Very little shakes you.',
    durationDays: 7,
    affectedTraits: ['repair', 'ritual', 'boundaries']
  },
  {
    id: 'future',
    nameDe: 'Future-Forward',
    nameEn: 'Future Forward',
    descriptionDe: 'Ihr blickt gemeinsam nach vorn.',
    descriptionEn: 'You look forward together.',
    durationDays: 7,
    affectedTraits: ['alignment', 'fairness', 'clarity']
  }
];
