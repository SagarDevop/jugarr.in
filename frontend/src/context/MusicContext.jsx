import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { initPlayer, getPlayer, destroyPlayer } from '../services/youtubePlayer';

/* ─────────────────────────────────────────
   Playlist metadata (matches YouTube order)
   Used for display only — audio from YT.
───────────────────────────────────────── */
export const PLAYLIST_META = [
  { emoji: '🌹', title: 'ऐ मेरे वतन के लोगों',  artist: 'Lata Mangeshkar'  },
  { emoji: '🙏', title: 'माँ तुझे सलाम',          artist: 'A.R. Rahman'       },
  { emoji: '🌺', title: 'वन्दे मातरम्',            artist: 'A.R. Rahman'       },
  { emoji: '⚔️', title: 'कर चले हम फिदा',         artist: 'Hemant Kumar'      },
  { emoji: '🌾', title: 'मेरे देश की धरती',       artist: 'Mahendra Kapoor'   },
  { emoji: '💌', title: 'संदेसे आते हैं',          artist: 'Sonu Nigam'        },
  { emoji: '🕊️', title: 'ऐ वतन',                   artist: 'Arijit Singh'      },
];

/* ─────────────────────────────────────────
   LocalStorage persistence
───────────────────────────────────────── */
const LS_KEY = 'ab_yt_state_v1';

function loadSaved() {
  try {
    const d = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    return {
      trackIndex: typeof d.trackIndex === 'number' ? d.trackIndex : 0,
      volume:     typeof d.volume     === 'number' ? d.volume     : 80,
    };
  } catch {
    return { trackIndex: 0, volume: 80 };
  }
}

function save(trackIndex, volume) {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ trackIndex, volume })); } catch {}
}

/* ─────────────────────────────────────────
   YT Player states
───────────────────────────────────────── */
const YT_UNSTARTED  = -1;
const YT_ENDED      = 0;
const YT_PLAYING    = 1;
const YT_PAUSED     = 2;
const YT_BUFFERING  = 3;
const YT_CUED       = 5;

/* ─────────────────────────────────────────
   Context
───────────────────────────────────────── */
const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const saved = loadSaved();

  const [playerReady,  setPlayerReady ] = useState(false);
  const [isPlaying,    setIsPlaying   ] = useState(false);
  const [trackIndex,   setTrackIndex  ] = useState(saved.trackIndex);
  const [ytTitle,      setYtTitle     ] = useState('');     // title from YT API
  const [currentTime,  setCurrentTime ] = useState(0);
  const [duration,     setDuration    ] = useState(0);
  const [volume,       setVolume      ] = useState(saved.volume);
  const [unlocked,     setUnlocked    ] = useState(false);
  const [buffering,    setBuffering   ] = useState(false);
  const [playerError,  setPlayerError ] = useState(null);

  const tickRef      = useRef(null);
  const unlockedRef  = useRef(false);
  const readyRef     = useRef(false);

  /* Sync YT title into state */
  const updateTitle = useCallback(() => {
    try {
      const data = getPlayer()?.getVideoData?.() || {};
      if (data.title) setYtTitle(data.title);
    } catch {}
  }, []);

  /* Progress tick — poll every 350ms while playing */
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
        // Keep track index in sync
        const idx = p.getPlaylistIndex?.() ?? -1;
        if (idx >= 0 && idx !== trackIndex) {
          setTrackIndex(idx);
          save(idx, volume);
        }
        updateTitle();
      } catch {}
    }, 350);
  }, [trackIndex, volume, updateTitle]);

  const stopTick = useCallback(() => clearInterval(tickRef.current), []);

  /* Init YouTube player */
  useEffect(() => {
    initPlayer({
      onReady: (player) => {
        readyRef.current = true;
        setPlayerReady(true);
        if (player && typeof player.setVolume === 'function') {
          player.setVolume(volume);
        }

        // Restore previous track position (cue without autoplay)
        const idx = saved.trackIndex;
        if (idx > 0 && player) {
          try {
            if (typeof player.playVideoAt === 'function') player.playVideoAt(idx);
            if (typeof player.pauseVideo === 'function') player.pauseVideo();
          } catch {}
        }
        updateTitle();
      },

      onStateChange: (e) => {
        const state = e.data;
        if (state === YT_PLAYING) {
          setIsPlaying(true);
          setBuffering(false);
          setPlayerError(null);
          startTick();
          updateTitle();
          // Sync index
          try {
            const idx = e.target.getPlaylistIndex?.() ?? 0;
            setTrackIndex(idx);
            save(idx, volume);
          } catch {}
        } else if (state === YT_PAUSED) {
          setIsPlaying(false);
          stopTick();
        } else if (state === YT_BUFFERING) {
          setBuffering(true);
        } else if (state === YT_ENDED) {
          setIsPlaying(false);
          stopTick();
          // Auto-advance
          try { e.target.nextVideo(); } catch {}
        } else if (state === YT_UNSTARTED || state === YT_CUED) {
          setIsPlaying(false);
          setBuffering(false);
        }
      },

      onError: (e) => {
        setPlayerError('Track unavailable');
        setIsPlaying(false);
        stopTick();
        // Skip to next after 1.2s
        setTimeout(() => { try { getPlayer()?.nextVideo(); } catch {} }, 1200);
      },
    });

    return () => {
      stopTick();
      destroyPlayer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Persist volume changes */
  useEffect(() => {
    save(trackIndex, volume);
  }, [volume, trackIndex]);

  /* ── Unlock on first user gesture */
  const unlock = useCallback(() => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;
    setUnlocked(true);
  }, []);

  /* ── Controls */
  const play = useCallback(() => {
    unlock();
    try { getPlayer()?.playVideo(); } catch {}
  }, [unlock]);

  const pause = useCallback(() => {
    try { getPlayer()?.pauseVideo(); } catch {}
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause(); else play();
  }, [isPlaying, play, pause]);

  const next = useCallback(() => {
    unlock();
    try { getPlayer()?.nextVideo(); } catch {}
    setTimeout(updateTitle, 600);
  }, [unlock, updateTitle]);

  const prev = useCallback(() => {
    unlock();
    try { getPlayer()?.previousVideo(); } catch {}
    setTimeout(updateTitle, 600);
  }, [unlock, updateTitle]);

  const seekTo = useCallback((ratio) => {
    const d = duration || 1;
    try { getPlayer()?.seekTo(ratio * d, true); } catch {}
  }, [duration]);

  const changeVolume = useCallback((vol) => {
    setVolume(vol);
    try { getPlayer()?.setVolume(vol); } catch {}
  }, []);

  /* Derived display metadata */
  const clampedIdx = Math.max(0, Math.min(trackIndex, PLAYLIST_META.length - 1));
  const meta       = PLAYLIST_META[clampedIdx];
  const progress   = duration > 0 ? (currentTime / duration) * 100 : 0;

  const value = {
    /* state */
    playerReady, isPlaying, buffering,
    trackIndex: clampedIdx,
    ytTitle, meta,
    currentTime, duration, progress,
    volume, unlocked, playerError,
    /* controls */
    play, pause, togglePlay, next, prev,
    seekTo, changeVolume, unlock,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
}

/* ─────────────────────────────────────────
   Hook
───────────────────────────────────────── */
export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used inside <MusicProvider>');
  return ctx;
}
