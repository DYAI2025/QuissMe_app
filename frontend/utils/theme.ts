export const COLORS = {
  night: {
    bg: '#0F1B2D',
    surface: '#1A2740',
    card: 'rgba(255,255,255,0.07)',
    border: 'rgba(255,255,255,0.12)',
    accent: '#7351B7',
    text: '#FFFFFF',
    textSub: '#8B9AB5',
    star: '#E2E8F0',
  },
  warm: {
    bg: '#1C1232',
    surface: '#2D1B4E',
    gold: '#D4A338',
    peach: '#E8854B',
    text: '#FFF5E1',
    textSub: '#FFD6BA',
  },
  glass: {
    bg: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.15)',
    highlight: 'rgba(255,255,255,0.25)',
  },
  resonance: {
    flow: { primary: '#9F7AEA', secondary: '#667EEA', glow: '#C4B5FD' },
    spark: { primary: '#F59E0B', secondary: '#EF6C00', glow: '#FDE68A' },
    talk: { primary: '#5EAAA8', secondary: '#8B7D9B', glow: '#A7C4BC' },
  },
  sector: {
    passion: '#E8457A',
    stability: '#2DD4BF',
    future: '#A78BFA',
  },
  tendency: {
    high: '#F59E0B',
    medium: '#34D399',
    building: '#818CF8',
  },
};

export const SPACING = { xs: 4, s: 8, m: 16, l: 24, xl: 32, xxl: 48 };
export const RADIUS = { card: 24, button: 9999, input: 16, node: 28 };

export const CLUSTER_INFO: Record<string, { de: string; icon: string; sector: string }> = {
  words: { de: 'Lob & Anerkennung', icon: '\u{1F4AC}', sector: 'passion' },
  time: { de: 'Zweisamkeit', icon: '\u{1F570}', sector: 'stability' },
  gifts: { de: 'Geschenke', icon: '\u{1F381}', sector: 'future' },
  service: { de: 'Hilfsbereitschaft', icon: '\u{1F91D}', sector: 'stability' },
  touch: { de: 'Körperliche Nähe', icon: '\u{1F497}', sector: 'passion' },
};

export const STATE_VISUALS: Record<string, { color: string; label: string; badge: string }> = {
  available: { color: 'rgba(255,255,255,0.15)', label: 'Verfügbar', badge: '' },
  activated_by_me: { color: '#7351B7', label: 'Von dir gestartet', badge: '\u{1F331}' },
  activated_by_partner: { color: '#5B8DEF', label: 'Partner:in hat gestartet', badge: '\u{1F331}' },
  completed_by_me_waiting: { color: '#F59E0B', label: 'Warte auf Partner:in', badge: '\u{23F3}' },
  completed_by_partner_waiting: { color: '#EF6C00', label: 'Dein Teil fehlt noch', badge: '\u{270F}' },
  ready_to_reveal: { color: '#D4A338', label: 'Bereit zum Aufdecken!', badge: '\u2728' },
  revealed: { color: '#34D399', label: 'Abgeschlossen', badge: '\u2705' },
};

export const TENDENCY_LABELS: Record<string, { de: string; icon: string }> = {
  high: { de: 'stark ausgeprägt', icon: '\u{1F525}' },
  medium: { de: 'im Einklang', icon: '\u{1F343}' },
  building: { de: 'im Aufbau', icon: '\u{1F331}' },
};
