export interface LibraryTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  year?: number;
  duration: number; // in milliseconds
  genre: string;
  bpm?: number;
  key?: string;
  coverGradient: string;
  accentColor: string;
  description: string;
  badge?: string;
  vibe: '80s Classic' | 'Electro Pop' | 'Synthwave' | 'Lo-Fi Chill' | 'Deep House' | 'Cyberpunk' | 'Podcast';
  audioStyle: 'billy_idol' | 'synthwave' | 'lofi' | 'deephouse' | 'cyberpunk' | 'pop';
}

export const MUSIC_LIBRARY: LibraryTrack[] = [
  {
    id: 'track-billy-idol-1',
    title: 'Eyes Without a Face',
    artist: 'Billy Idol',
    album: 'Rebel Yell',
    year: 1984,
    duration: 298000, // 4:58
    genre: 'Synth Pop / New Wave Anos 80',
    bpm: 86,
    key: 'E Major',
    coverGradient: 'from-blue-600 via-indigo-900 to-black',
    accentColor: '#00F2FE',
    description: 'O clássico atemporal com guitarras chorus etéreas, sintetizadores aveludados e baixo oitentista marcante.',
    badge: 'DESTAQUE DOS ANOS 80',
    vibe: '80s Classic',
    audioStyle: 'billy_idol'
  },
  {
    id: 'track-sweet-dreams',
    title: 'Sweet Dreams (Are Made of This)',
    artist: 'Eurythmics',
    album: 'Sweet Dreams',
    year: 1983,
    duration: 216000, // 3:36
    genre: 'Synthpop / New Wave',
    bpm: 125,
    key: 'C Minor',
    coverGradient: 'from-cyan-700 via-slate-900 to-black',
    accentColor: '#00F2FE',
    description: 'Riff icônico de sintetizador analógico e batidas pulsantes que definiram a era de ouro do synthpop britânico.',
    badge: 'CLÁSSICO SYNTH',
    vibe: '80s Classic',
    audioStyle: 'synthwave'
  },
  {
    id: 'track-m83-midnight',
    title: 'Midnight City',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    year: 2011,
    duration: 243000, // 4:03
    genre: 'Indie Electronic / Dream Pop',
    bpm: 105,
    key: 'B Minor',
    coverGradient: 'from-fuchsia-600 via-indigo-950 to-black',
    accentColor: '#D946EF',
    description: 'Arpeggios nostálgicos de sintetizador, camadas épicas e solo de saxofone no clímax eletrônico.',
    badge: 'INDIE HINO',
    vibe: 'Electro Pop',
    audioStyle: 'synthwave'
  },
  {
    id: 'track-blinding-lights',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    year: 2019,
    duration: 200000, // 3:20
    genre: 'Synthwave / Retro Pop',
    bpm: 171,
    key: 'F Minor',
    coverGradient: 'from-red-600 via-rose-950 to-black',
    accentColor: '#F43F5E',
    description: 'Batida acelerada de bateria eletrônica 80s com sintetizadores futuristas e vocais energéticos.',
    badge: 'POP RETRÔ',
    vibe: 'Synthwave',
    audioStyle: 'synthwave'
  },
  {
    id: 'track-lofi-night',
    title: 'Rainy Night in Shibuya',
    artist: 'Lofi Coffee & Rain',
    album: 'Midnight Tokyo Chill',
    year: 2024,
    duration: 165000, // 2:45
    genre: 'Lo-Fi Hip Hop / Chillhop',
    bpm: 78,
    key: 'Ab Major',
    coverGradient: 'from-amber-700 via-stone-900 to-black',
    accentColor: '#F59E0B',
    description: 'Acordes de piano elétrico Rhodes com ruído de vinil suave, batida jazzy preguiçosa e ambiência de chuva.',
    badge: 'CHILL & FOCUS',
    vibe: 'Lo-Fi Chill',
    audioStyle: 'lofi'
  },
  {
    id: 'track-neon-pulse',
    title: 'Neon Nights & Sub-Bass',
    artist: 'DJ Pulse X',
    album: 'Cyber Club Sessions',
    year: 2025,
    duration: 270000, // 4:30
    genre: 'Cyberpunk Electro / Bass House',
    bpm: 128,
    key: 'G Minor',
    coverGradient: 'from-cyan-500 via-blue-950 to-black',
    accentColor: '#00F2FE',
    description: 'Grave sub-bass devastador, sintetizadores distorcidos e batida reta para pistas de dança futuristas.',
    badge: 'CLUB BANGER',
    vibe: 'Cyberpunk',
    audioStyle: 'cyberpunk'
  },
  {
    id: 'track-ibiza-sunset',
    title: 'Vibe Tropical & Sunsets',
    artist: 'Sync Beats Collective',
    album: 'Balearic Sunset Vol. 3',
    year: 2024,
    duration: 210000, // 3:30
    genre: 'Deep House / Melodic House',
    bpm: 122,
    key: 'D Minor',
    coverGradient: 'from-teal-600 via-emerald-950 to-black',
    accentColor: '#10B981',
    description: 'Linhas de baixo quentes, plucks melódicos e percussões orgânicas perfeitas para festas ao entardecer.',
    badge: 'SUNSET VIBE',
    vibe: 'Deep House',
    audioStyle: 'deephouse'
  },
  {
    id: 'track-future-audio-pod',
    title: 'Ep. 42: O Futuro do Áudio Sincronizado',
    artist: 'Tech Talk Studio & Sync Beats',
    album: 'Sync Conversations',
    year: 2026,
    duration: 320000, // 5:20
    genre: 'Podcast / Spatial Audio',
    bpm: 90,
    key: 'C Major',
    coverGradient: 'from-purple-800 via-indigo-950 to-black',
    accentColor: '#8B5CF6',
    description: 'Discussão imersiva com trilha sonora adaptativa sobre latência zero, Web Audio API e streaming social.',
    badge: 'TALK & TECH',
    vibe: 'Podcast',
    audioStyle: 'lofi'
  }
];
