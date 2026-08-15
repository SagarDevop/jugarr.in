import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { initPlayer, getPlayer, destroyPlayer } from '../services/youtubePlayer';

/* ─────────────────────────────────────────────────────────────
   Azaad Bharat Playlist (Exact Order as Requested - 23 Songs)
───────────────────────────────────────────────────────────── */
export const PLAYLIST_SONGS = [
  {
    id: 1,
    title: 'जन गण मन (Jana Gana Mana)',
    artist: 'रवीन्द्रनाथ टैगोर (National Anthem of India)',
    videoId: 'gT8v878Jt_0',
    emoji: '🇮🇳',
  },
  {
    id: 2,
    title: 'वन्दे मातरम् (Vande Mataram)',
    artist: 'A.R. Rahman (Revival Album)',
    videoId: 'vGhzp4f6TdQ',
    emoji: '🙏',
  },
  {
    id: 3,
    title: 'माँ तुझे सलाम (Maa Tujhe Salaam)',
    artist: 'A.R. Rahman',
    videoId: 'J_O74_P7p94',
    emoji: '🌺',
  },
  {
    id: 4,
    title: 'ऐ मेरे वतन के लोगों (Ae Mere Watan Ke Logon)',
    artist: 'Lata Mangeshkar, C. Ramchandra, Kavi Pradeep',
    videoId: '0t6sC4XW-hY',
    emoji: '🌹',
  },
  {
    id: 5,
    title: 'तेरी मिट्टी (Teri Mitti)',
    artist: 'B Praak, Manoj Muntashir, Arko (Kesari)',
    videoId: 'wHAy20h5s8U',
    emoji: '🌾',
  },
  {
    id: 6,
    title: 'ऐ वतन (Ae Watan)',
    artist: 'Arijit Singh, Sunidhi Chauhan (Raazi)',
    videoId: 'l_a6_yS91aA',
    emoji: '🕊️',
  },
  {
    id: 7,
    title: 'लहरा दो (Lehra Do)',
    artist: 'Arijit Singh, Pritam (83)',
    videoId: '1uU-S4l1l1c',
    emoji: '🚩',
  },
  {
    id: 8,
    title: 'कंधों से मिलते हैं कंधे (Kandhon Se Milte Hain Kandhe)',
    artist: 'Shankar-Ehsaan-Loy, Sonu Nigam, Hariharan (Lakshya)',
    videoId: 'Wp4r9G5Q5lQ',
    emoji: '⚔️',
  },
  {
    id: 9,
    title: 'योद्धा / ये आन तिरंगा है (Yodha / Yeh Aan Tirangaa Hai)',
    artist: 'Mohammed Aziz, Laxmikant-Pyarelal (Tirangaa)',
    videoId: '8qL2p_9yG8k',
    emoji: '🛡️',
  },
  {
    id: 10,
    title: 'मेरा रंग दे बसंती चोला (Mera Rang De Basanti Chola)',
    artist: 'Sonu Nigam, Manmohan Waris (The Legend of Bhagat Singh)',
    videoId: '8QyqZ9l4z0s',
    emoji: '🔥',
  },
  {
    id: 11,
    title: 'संदेसे आते हैं / वतनवालों (Sandese Aate Hain / Watanwalon)',
    artist: 'Sonu Nigam, Roop Kumar Rathod, Anu Malik (Border)',
    videoId: 'Kk3q0hG8J8g',
    emoji: '💌',
  },
  {
    id: 12,
    title: 'मेरा मुल्क मेरा देश (Mera Mulk Mera Desh)',
    artist: 'Kumar Sanu, Aditya Narayan (Diljale)',
    videoId: '6gqE5qG_Yf4',
    emoji: '✨',
  },
  {
    id: 13,
    title: 'देस रंगीला (Des Rangila)',
    artist: 'Mahalaxmi Iyer, Jatin-Lalit (Fanaa)',
    videoId: '0vF8Z_r_9yU',
    emoji: '🎨',
  },
  {
    id: 14,
    title: 'हिंदुस्तानी / सुनो गौर से दुनिया वालों (Hindustani)',
    artist: 'Shankar Mahadevan, Udit Narayan (Street Dancer 3D / Dus)',
    videoId: 'dGq1h7L3p3E',
    emoji: '⚡',
  },
  {
    id: 15,
    title: 'भारत का रहने वाला हूँ (Bharat Ka Rehne Wala Hoon)',
    artist: 'Mahendra Kapoor, Kalyanji-Anandji (Purab Aur Paschim)',
    videoId: '4vKq7r_8p6I',
    emoji: '🌍',
  },
  {
    id: 16,
    title: 'ये देश है वीर जवानों का (Yeh Desh Hai Veer Jawanon Ka)',
    artist: 'Mohammed Rafi, Balbir (Naya Daur)',
    videoId: '3G8p9q_L1yU',
    emoji: '💪',
  },
  {
    id: 17,
    title: 'ऐ वतन तेरे लिए / हर करम अपना करेंगे (Ae Watan Tere Liye)',
    artist: 'Kavita Krishnamurthy, Mohammed Aziz (Karma)',
    videoId: '5Yp_9qL8J1k',
    emoji: '🎯',
  },
  {
    id: 18,
    title: 'मेरी जान तिरंगा है (Meri Jaan Tiranga Hai)',
    artist: 'Mohammed Aziz, Hariharan (Tirangaa)',
    videoId: '8yG1qP8L2z4',
    emoji: '🌟',
  },
  {
    id: 19,
    title: 'हमने सुना था एक है भारत (Humne Suna Tha Ek Hai Bharat)',
    artist: 'Sudha Malhotra, Mohammed Rafi (Didi)',
    videoId: '7qL2p_9yG8k',
    emoji: '🤝',
  },
  {
    id: 20,
    title: 'आओ बच्चों तुम्हें दिखाएँ (Aao Bachchon Tumhe Dikhayein)',
    artist: 'Kavi Pradeep, Hemant Kumar (Jagriti)',
    videoId: '6pL9yG8q2Jk',
    emoji: '🚂',
  },
  {
    id: 21,
    title: 'आई लव माय इंडिया (I Love My India)',
    artist: 'Kavita Krishnamurthy, Hariharan (Pardes)',
    videoId: '9pL8q_2yG1k',
    emoji: '💖',
  },
  {
    id: 22,
    title: 'जलवा जलवा (Jalwa Jalwa)',
    artist: 'Sukhwinder Singh, Udit Narayan (Hindustan Ki Kasam)',
    videoId: '2yG1k9pL8q_',
    emoji: '🥁',
  },
  {
    id: 23,
    title: 'मेरा जूता है जापानी (Mera Joota Hai Japani)',
    artist: 'Mukesh, Shankar-Jaikishan (Shree 420)',
    videoId: '1k9pL8q_2yG',
    emoji: '🎩',
  },
];

/* ─────────────────────────────────────────
   LocalStorage Persistence
───────────────────────────────────────── */
const LS_KEY = 'ab_curated_playlist_v1';

function loadSaved() {
  try {
    const d = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    return {
      trackIndex: typeof d.trackIndex === 'number' && d.trackIndex >= 0 && d.trackIndex < PLAYLIST_SONGS.length ? d.trackIndex : 0,
      volume: typeof d.volume === 'number' ? d.volume : 80,
    };
  } catch {
    return { trackIndex: 0, volume: 80 };
  }
}

function save(trackIndex, volume) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ trackIndex, volume }));
  } catch {}
}

const YT_ENDED   = 0;
const YT_PLAYING = 1;
const YT_PAUSED  = 2;

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const saved = loadSaved();

  const [playerReady,  setPlayerReady ] = useState(false);
  const [isPlaying,    setIsPlaying   ] = useState(false);
  const [trackIndex,   setTrackIndex  ] = useState(saved.trackIndex);
  const [currentTime,  setCurrentTime ] = useState(0);
  const [duration,     setDuration    ] = useState(0);
  const [volume,       setVolume      ] = useState(saved.volume);
  const [unlocked,     setUnlocked    ] = useState(false);
  const [buffering,    setBuffering   ] = useState(false);
  const [playerError,  setPlayerError ] = useState(null);

  const tickRef       = useRef(null);
  const unlockedRef   = useRef(false);
  const trackIndexRef = useRef(trackIndex);
  trackIndexRef.current = trackIndex;

  const currentSong = PLAYLIST_SONGS[trackIndex] || PLAYLIST_SONGS[0];
  const videoIds = PLAYLIST_SONGS.map((s) => s.videoId);

  /* Sync Media Session API */
  const updateMediaSession = useCallback((song) => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      const thumbUrl = song.videoId ? `https://img.youtube.com/vi/${song.videoId}/hqdefault.jpg` : '/bharat.webp';
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: 'Azaad Bharat 🇮🇳 | Jugarr',
        artwork: [
          { src: thumbUrl, sizes: '512x512', type: 'image/jpeg' },
          { src: '/bharat.webp', sizes: '512x512', type: 'image/webp' },
          { src: '/icon.png', sizes: '192x192', type: 'image/png' },
        ],
      });
    } catch {}
  }, []);

  /* Progress tick timer */
  const startTick = useCallback(() => {
    clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      const p = getPlayer();
      if (!p) return;
      try {
        const t = p.getCurrentTime?.() ?? 0;
        const d = p.getDuration?.()    ?? 0;
        setCurrentTime(t);
        if (d > 0) setDuration(d);
      } catch {}
    }, 400);
  }, []);

  const stopTick = useCallback(() => clearInterval(tickRef.current), []);

  /* Unlock on user interaction */
  const unlock = useCallback(() => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;
    setUnlocked(true);
  }, []);

  /* Play song at index */
  const playTrack = useCallback((index, shouldPlay = true) => {
    const clamped = Math.max(0, Math.min(index, PLAYLIST_SONGS.length - 1));
    setTrackIndex(clamped);
    trackIndexRef.current = clamped;
    save(clamped, volume);
    setCurrentTime(0);
    setPlayerError(null);

    const song = PLAYLIST_SONGS[clamped];
    updateMediaSession(song);

    const player = getPlayer();
    if (player && typeof player.loadVideoById === 'function') {
      try {
        if (shouldPlay) {
          player.loadVideoById(song.videoId);
          setIsPlaying(true);
        } else {
          player.cueVideoById(song.videoId);
        }
      } catch (err) {
        console.warn('Track play error:', err);
      }
    }
  }, [volume, updateMediaSession]);

  /* Controls */
  const play = useCallback(() => {
    unlock();
    const player = getPlayer();
    if (!player) return;
    try {
      player.playVideo();
      setIsPlaying(true);
    } catch {}
  }, [unlock]);

  const pause = useCallback(() => {
    const player = getPlayer();
    if (!player) return;
    try {
      player.pauseVideo();
      setIsPlaying(false);
    } catch {}
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause(); else play();
  }, [isPlaying, play, pause]);

  const next = useCallback(() => {
    unlock();
    const nextIdx = (trackIndexRef.current + 1) % PLAYLIST_SONGS.length;
    playTrack(nextIdx, true);
  }, [unlock, playTrack]);

  const prev = useCallback(() => {
    unlock();
    const prevIdx = (trackIndexRef.current - 1 + PLAYLIST_SONGS.length) % PLAYLIST_SONGS.length;
    playTrack(prevIdx, true);
  }, [unlock, playTrack]);

  const seekTo = useCallback((ratio) => {
    const d = duration || 1;
    try {
      getPlayer()?.seekTo?.(ratio * d, true);
    } catch {}
  }, [duration]);

  const changeVolume = useCallback((vol) => {
    const clamped = Math.max(0, Math.min(100, vol));
    setVolume(clamped);
    save(trackIndexRef.current, clamped);
    try {
      getPlayer()?.setVolume?.(clamped);
    } catch {}
  }, []);

  /* Initialise YouTube Player */
  useEffect(() => {
    initPlayer({
      videoId: currentSong.videoId,
      playlist: videoIds,
      onReady: (player) => {
        setPlayerReady(true);
        if (player && typeof player.setVolume === 'function') {
          player.setVolume(volume);
        }
        updateMediaSession(currentSong);
      },

      onStateChange: (e) => {
        const state = e.data;
        if (state === YT_PLAYING) {
          setIsPlaying(true);
          setBuffering(false);
          setPlayerError(null);
          startTick();
          if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
          }
        } else if (state === YT_PAUSED) {
          setIsPlaying(false);
          stopTick();
          if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused';
          }
        } else if (state === 3) { // Buffering
          setBuffering(true);
        } else if (state === YT_ENDED) {
          setIsPlaying(false);
          stopTick();
          // Auto-play next track in 23-song playlist
          const nextIdx = (trackIndexRef.current + 1) % PLAYLIST_SONGS.length;
          playTrack(nextIdx, true);
        }
      },

      onError: () => {
        setPlayerError('Skipping unavailable track...');
        setIsPlaying(false);
        stopTick();
        setTimeout(() => {
          const nextIdx = (trackIndexRef.current + 1) % PLAYLIST_SONGS.length;
          playTrack(nextIdx, true);
        }, 1200);
      },
    });

    // Attach MediaSession Action Handlers
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', () => play());
        navigator.mediaSession.setActionHandler('pause', () => pause());
        navigator.mediaSession.setActionHandler('previoustrack', () => prev());
        navigator.mediaSession.setActionHandler('nexttrack', () => next());
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== null && details.seekTime !== undefined) {
            try {
              getPlayer()?.seekTo?.(details.seekTime, true);
            } catch {}
          }
        });
      } catch {}
    }

    return () => {
      stopTick();
      destroyPlayer();
    };
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const currentPosition = `${trackIndex + 1}/${PLAYLIST_SONGS.length}`;
  const thumbnail = currentSong.videoId ? `https://img.youtube.com/vi/${currentSong.videoId}/hqdefault.jpg` : '/bharat.webp';

  const meta = {
    title: currentSong.title,
    artist: currentSong.artist,
    thumbnail,
    position: currentPosition,
    totalTracks: PLAYLIST_SONGS.length,
    trackIndex,
  };

  const value = {
    playerReady,
    isPlaying,
    buffering,
    trackIndex,
    totalTracks: PLAYLIST_SONGS.length,
    playlist: PLAYLIST_SONGS,
    currentSong,
    ytTitle: currentSong.title,
    artist: currentSong.artist,
    thumbnail,
    meta,
    currentTime,
    duration,
    progress,
    volume,
    unlocked,
    playerError,
    play,
    pause,
    togglePlay,
    next,
    prev,
    playTrack,
    seekTo,
    changeVolume,
    unlock,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used inside <MusicProvider>');
  return ctx;
}
