import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';

/* ─────────────────────────────────────────
   Playlist Metadata & Audio Sources
───────────────────────────────────────── */
export const PLAYLIST_META = [
  {
    emoji: '🌹',
    title: 'ऐ मेरे वतन के लोगों',
    artist: 'Lata Mangeshkar',
    src: 'https://archive.org/download/mere-watanke-logo-hmv/mere%20watanke%20logo%20hmv.mp3',
  },
  {
    emoji: '🙏',
    title: 'माँ तुझे सलाम (वन्दे मातरम्)',
    artist: 'A.R. Rahman',
    src: 'https://archive.org/download/a-r-rehman-vocal-and-instrumental/a%20r%20rehman%20-%20vocal%204%20minutes%201998.mp3',
  },
  {
    emoji: '🌺',
    title: 'वन्दे मातरम् (Symphony & Choir)',
    artist: 'A.R. Rahman',
    src: 'https://archive.org/download/a-r-rehman-vocal-and-instrumental/a%20r%20rehman%20-%20vocal%20and%20instrumental%20-%207%20minutes%201998.mp3',
  },
  {
    emoji: '⚔️',
    title: 'वन्दे मातरम् (आनंदमठ)',
    artist: 'Lata Mangeshkar',
    src: 'https://archive.org/download/a-r-rehman-vocal-and-instrumental/lata%20mangeshkar%20-%203%20minutes%20film%20anandmath%201952.mp3',
  },
  {
    emoji: '🇮🇳',
    title: 'वन्दे मातरम् (संसद राष्ट्रगान)',
    artist: 'Pandit Bhimsen Joshi',
    src: 'https://archive.org/download/a-r-rehman-vocal-and-instrumental/bhimsen%20joshi%20-%20parliament%20august%201997.mp3',
  },
  {
    emoji: '🔥',
    title: 'खूब लड़ी मर्दानी वह तो झाँसी वाली रानी थी',
    artist: 'समूहगान (AIR Archives)',
    src: 'https://archive.org/download/a_20220813/A2%20%E2%80%93%20%E0%A4%B8%E0%A4%AE%E0%A5%82%E0%A4%B9%E0%A4%97%E0%A4%BE%E0%A4%A8%E2%80%8B%20-%20Khoob%20Ladi%20Mardani%20%3D%20%E0%A4%96%E0%A5%82%E0%A4%AC%20%E0%A4%B2%E0%A4%A1%E0%A5%80%20%E0%A4%AE%E0%A4%B0%E0%A4%A6%E0%A4%BE%E0%A4%A8%E0%A5%80%20%28Hindi%29.mp3',
  },
  {
    emoji: '🌾',
    title: 'चंदन है इस देश की माटी',
    artist: 'समूहगान (AIR Archives)',
    src: 'https://archive.org/download/a_20220813/A3%20%E2%80%93%20%E0%A4%B8%E0%A4%AE%E0%A5%82%E0%A4%B9%E0%A4%97%E0%A4%BE%E0%A4%A8%E2%80%8B%20-%20Chandan%20Hai%20Mati%20%3D%20%E0%A4%9A%E0%A4%82%E0%A4%A6%E0%A4%A8%20%E0%A4%B9%E0%A5%88%20%E0%A4%AE%E0%A4%BE%E0%A4%9F%E0%A5%80%20%28Hindi%29.mp3',
  },
];

/* ─────────────────────────────────────────
   LocalStorage Persistence
───────────────────────────────────────── */
const LS_KEY = 'ab_audio_state_v2';

function loadSaved() {
  try {
    const d = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    return {
      trackIndex: typeof d.trackIndex === 'number' && d.trackIndex >= 0 && d.trackIndex < PLAYLIST_META.length ? d.trackIndex : 0,
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

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const saved = loadSaved();

  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(saved.trackIndex);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(saved.volume);
  const [unlocked, setUnlocked] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [playerError, setPlayerError] = useState(null);

  const audioRef = useRef(null);
  const trackIndexRef = useRef(trackIndex);
  const unlockedRef = useRef(false);

  trackIndexRef.current = trackIndex;

  /* Update Media Session API for mobile lock screen & notification controls */
  const updateMediaSession = useCallback((track, currentAudio) => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: 'Azaad Bharat 🇮🇳 | Jugarr',
        artwork: [
          { src: '/bharat.webp', sizes: '512x512', type: 'image/webp' },
          { src: '/icon.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon.png', sizes: '96x96', type: 'image/png' },
        ],
      });

      if (currentAudio && !isNaN(currentAudio.duration) && currentAudio.duration > 0) {
        navigator.mediaSession.setPositionState({
          duration: currentAudio.duration,
          playbackRate: currentAudio.playbackRate || 1,
          position: currentAudio.currentTime || 0,
        });
      }
    } catch (err) {
      console.warn('MediaSession update error:', err);
    }
  }, []);

  /* Load track into HTML5 Audio */
  const loadTrack = useCallback((index, shouldPlay = false) => {
    const clampedIndex = Math.max(0, Math.min(index, PLAYLIST_META.length - 1));
    const track = PLAYLIST_META[clampedIndex];
    const audio = audioRef.current;
    if (!audio) return;

    setTrackIndex(clampedIndex);
    trackIndexRef.current = clampedIndex;
    save(clampedIndex, volume);
    setCurrentTime(0);
    setPlayerError(null);

    audio.src = track.src;
    audio.load();
    updateMediaSession(track, audio);

    if (shouldPlay) {
      setBuffering(true);
      audio.play().then(() => {
        setIsPlaying(true);
        setBuffering(false);
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
      }).catch((err) => {
        console.warn('Playback error:', err);
        setBuffering(false);
      });
    }
  }, [volume, updateMediaSession]);

  /* Next track */
  const next = useCallback(() => {
    const nextIdx = (trackIndexRef.current + 1) % PLAYLIST_META.length;
    loadTrack(nextIdx, true);
  }, [loadTrack]);

  /* Previous track */
  const prev = useCallback(() => {
    const prevIdx = (trackIndexRef.current - 1 + PLAYLIST_META.length) % PLAYLIST_META.length;
    loadTrack(prevIdx, true);
  }, [loadTrack]);

  /* Play */
  const play = useCallback(() => {
    unlockedRef.current = true;
    setUnlocked(true);
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.src || audio.src === '' || audio.src === window.location.href) {
      loadTrack(trackIndexRef.current, true);
      return;
    }

    setBuffering(true);
    audio.play().then(() => {
      setIsPlaying(true);
      setBuffering(false);
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    }).catch((err) => {
      console.warn('Audio play failed:', err);
      setBuffering(false);
    });
  }, [loadTrack]);

  /* Pause */
  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
  }, []);

  /* Toggle play */
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  /* Seek to ratio (0 to 1) */
  const seekTo = useCallback((ratio) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const target = ratio * audio.duration;
    audio.currentTime = target;
    setCurrentTime(target);
  }, []);

  /* Volume (0 to 100) */
  const changeVolume = useCallback((vol) => {
    const clamped = Math.max(0, Math.min(100, vol));
    setVolume(clamped);
    save(trackIndexRef.current, clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped / 100;
    }
  }, []);

  /* Unlock on user interaction */
  const unlock = useCallback(() => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;
    setUnlocked(true);
  }, []);

  /* Initialize Audio Singleton and Event Listeners */
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = volume / 100;
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (typeof window !== 'undefined' && 'mediaSession' in navigator && audio.duration) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate || 1,
            position: audio.currentTime,
          });
        } catch {}
      }
    };

    const onLoadedMetadata = () => {
      if (!isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
      setPlayerReady(true);
    };

    const onDurationChange = () => {
      if (!isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const onPlay = () => {
      setIsPlaying(true);
      setBuffering(false);
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    };

    const onPause = () => {
      setIsPlaying(false);
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
    };

    const onWaiting = () => {
      setBuffering(true);
    };

    const onCanPlay = () => {
      setBuffering(false);
    };

    const onEnded = () => {
      setIsPlaying(false);
      const nextIdx = (trackIndexRef.current + 1) % PLAYLIST_META.length;
      loadTrack(nextIdx, true);
    };

    const onError = (e) => {
      console.warn('HTML5 Audio error event:', e);
      setBuffering(false);
      setPlayerError('Stream connecting...');
      // Automatically skip to next available track after brief pause
      setTimeout(() => {
        const nextIdx = (trackIndexRef.current + 1) % PLAYLIST_META.length;
        loadTrack(nextIdx, true);
      }, 1500);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('playing', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    // Initial load without autoplay
    loadTrack(saved.trackIndex, false);
    setPlayerReady(true);

    /* Setup Media Session action handlers */
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', () => play());
        navigator.mediaSession.setActionHandler('pause', () => pause());
        navigator.mediaSession.setActionHandler('previoustrack', () => prev());
        navigator.mediaSession.setActionHandler('nexttrack', () => next());
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== null && details.seekTime !== undefined && audioRef.current) {
            audioRef.current.currentTime = details.seekTime;
            setCurrentTime(details.seekTime);
          }
        });
        navigator.mediaSession.setActionHandler('stop', () => {
          pause();
          if (audioRef.current) audioRef.current.currentTime = 0;
        });
      } catch (err) {
        console.warn('MediaSession handler error:', err);
      }
    }

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('playing', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const meta = PLAYLIST_META[trackIndex] || PLAYLIST_META[0];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const value = {
    playerReady,
    isPlaying,
    buffering,
    trackIndex,
    ytTitle: meta.title,
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
