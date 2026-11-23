export interface TrapetonTrack {
  id: string;
  title: string;
  artist: string;
  author: string;
  album: string;
  year: string;
  bpm: number;
  key: string;
  duration: string;
  durationMs: number;
  genre: string;
  category: 'Trapeton' | 'Club Banger' | 'Dark Rap' | 'Melodic';
  tag: string;
  description: string;
  vibe: string;
  audioUrl: string;
  audioStyle: 'trapeton_dark' | 'trapeton_miami' | 'trapeton_club' | 'trapeton_melodic';
  coverGradient: string;
  accentColor: string;
  copyright: string;
  rightsReserved: string;
}

export const ALBUM_METADATA = {
  title: "DJSyncbeats Vol. 1",
  subtitle: "TRAPETON MASTER VOL. 1",
  artist: "DJSyncbeats",
  producer: "DJSyncbeats (Estiven Garcia)",
  composer: "Estiven Garcia / DJSyncbeats",
  year: "2026",
  genre: "Trapeton (Rap Americano + Reggaeton Urbano)",
  tracksCount: 4,
  durationTotal: "12:28",
  releaseDate: "2026",
  publisher: "Sync Beats Records & Production",
  copyrightNotice: "© 2026 DJSyncbeats (Estiven Garcia). Todos os direitos reservados sobre as composições, arranjos, beats e masters.",
  legalDisclaimer: "Todas as músicas do álbum 'TRAPETON MASTER VOL. 1' são de autoria e propriedade intelectual exclusiva de DJSyncbeats (Estiven Garcia). Proibida a reprodução, cópia ou distribuição comercial não autorizada.",
  references: [
    { artist: "Kendrick Lamar", tracks: "Not Like Us / TV Off", aspect: "808s pesados, cadência rápida e presença marcante" },
    { artist: "Travis Scott", tracks: "FE!N", aspect: "Synths obscuros, distorção sub e graves que fazem o alto-falante tremer" },
    { artist: "Bad Bunny & Feid", tracks: "Perro Negro", aspect: "Dembow clássico de reggaeton fundido com produção futurista" },
    { artist: "Karol G & Young Miko", tracks: "Classy 101", aspect: "Linha de baixo contínua, plucks brilhantes e flow urbano" }
  ]
};

export const albumTrapeton2026: TrapetonTrack[] = [
  {
    id: "track-01",
    title: "FUEGO & 808S (INTRO)",
    artist: "DJSyncbeats",
    author: "DJSyncbeats (Estiven Garcia)",
    album: "TRAPETON MASTER VOL. 1",
    year: "2026",
    bpm: 90,
    key: "Dó menor (Cm)",
    duration: "2:45",
    durationMs: 165000,
    genre: "DARK TRAPETON",
    category: "Dark Rap",
    tag: "INÍCIO DA SESSÃO",
    description: "Sintetizadores obscuros estilo Travis Scott fundidos com o peso de um dembow acelerado e sub-808s marcantes.",
    vibe: "Transição suave de um sintetizador pesado de Trap direto para um dembow acelerado.",
    audioUrl: "/audio/fuego-808s.mp3",
    audioStyle: "trapeton_dark",
    coverGradient: "from-amber-600 via-red-950 to-black",
    accentColor: "#EF4444",
    copyright: "© 2026 DJSyncbeats (Estiven Garcia)",
    rightsReserved: "Todos os direitos reservados sobre a música e fonograma."
  },
  {
    id: "track-02",
    title: "NOCHE EN MIAMI",
    artist: "DJSyncbeats",
    author: "DJSyncbeats (Estiven Garcia)",
    album: "TRAPETON MASTER VOL. 1",
    year: "2026",
    bpm: 96,
    key: "Lá menor (Am)",
    duration: "3:15",
    durationMs: 195000,
    genre: "COMMERCIAL TRAPETON",
    category: "Trapeton",
    tag: "SINGLE PRINCIPAL",
    description: "Melodia marcante de sintetizador/pluck no refrão, aliada ao flow rápido do Rap Americano e percussão latina.",
    vibe: "Melodia marcante de teclado/pluck no refrão, com versos velozes e graves profundos estilo Kendrick Lamar.",
    audioUrl: "/audio/noche-en-miami.mp3",
    audioStyle: "trapeton_miami",
    coverGradient: "from-cyan-500 via-blue-950 to-black",
    accentColor: "#00F2FE",
    copyright: "© 2026 DJSyncbeats (Estiven Garcia)",
    rightsReserved: "Todos os direitos reservados sobre a música e fonograma."
  },
  {
    id: "track-03",
    title: "SIN FRENO",
    artist: "DJSyncbeats",
    author: "DJSyncbeats (Estiven Garcia)",
    album: "TRAPETON MASTER VOL. 1",
    year: "2026",
    bpm: 100,
    key: "Fá menor (Fm)",
    duration: "2:58",
    durationMs: 178000,
    genre: "CLUB BANGER",
    category: "Club Banger",
    tag: "PERREO HEAVY",
    description: "Agressividade do Trap com ritmo contagiante de Reggaeton para abanar as pistas de dança.",
    vibe: "Foco em caixas bem estaladas no contra-tempo e graves sub-808 contínuos, feito para pista de dança.",
    audioUrl: "/audio/sin-freno.mp3",
    audioStyle: "trapeton_club",
    coverGradient: "from-fuchsia-600 via-purple-950 to-black",
    accentColor: "#D946EF",
    copyright: "© 2026 DJSyncbeats (Estiven Garcia)",
    rightsReserved: "Todos os direitos reservados sobre a música e fonograma."
  },
  {
    id: "track-04",
    title: "SOMBRA & LUZ",
    artist: "DJSyncbeats",
    author: "DJSyncbeats (Estiven Garcia)",
    album: "TRAPETON MASTER VOL. 1",
    year: "2026",
    bpm: 92,
    key: "Sol menor (Gm)",
    duration: "3:30",
    durationMs: 210000,
    genre: "MELODIC CHILL RAP",
    category: "Melodic",
    tag: "MID-TEMPO VIBE",
    description: "Pianos sutis, vocais recortados e uma atmosfera noturna que une R&B com o balanço urbano.",
    vibe: "Pianos sutis, vocais picotados (vocal chops) e atmosfera noturna, unindo a cadência do R&B com o balanço urbano.",
    audioUrl: "/audio/sombra-e-luz.mp3",
    audioStyle: "trapeton_melodic",
    coverGradient: "from-emerald-600 via-teal-950 to-black",
    accentColor: "#10B981",
    copyright: "© 2026 DJSyncbeats (Estiven Garcia)",
    rightsReserved: "Todos os direitos reservados sobre a música e fonograma."
  }
];
