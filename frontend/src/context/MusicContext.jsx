import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { initPlayer, getPlayer, destroyPlayer, PLAYLIST_ID } from '../services/youtubePlayer';

/* ─────────────────────────────────────────
   LocalStorage persistence
───────────────────────────────────────── */
const LS_KEY = 'ab_yt_playlist_state_v2';

function loadSaved() {
  try {
    const d = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    return {
      trackIndex: typeof d.trackIndex === 'number' && d.trackIndex >= 0 ? d.trackIndex : 0,
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

const YT_UNSTARTED = -1;
const YT_ENDED     = 0;
const YT_PLAYING   = 1;
const YT_PAUSED    = 2;
const YT_BUFFERING = 3;
const YT_CUED      = 5;

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const saved = loadSaved();

  const [playerReady,  setPlayerReady ] = useState(false);
  const [isPlaying,    setIsPlaying   ] = useState(false);
  const [trackIndex,   setTrackIndex  ] = useState(saved.trackIndex);
  const [totalTracks,  setTotalTracks ] = useState(23);
  const [playlist,     setPlaylist    ] = useState([]);
  const [videoId,      setVideoId     ] = useState('');
  const [ytTitle,      setYtTitle     ] = useState('');
  const [artist,       setArtist      ] = useState('');
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

  /* Sync Video Data & Playlist info from YouTube Player */
  const syncPlayerInfo = useCallback(() => {
    const player = getPlayer();
    if (!player) return;

    try {
      // 1. Sync Video Metadata (Title, Artist, Video ID)
      const data = player.getVideoData?.() || {};
      if (data.title && data.title !== ytTitle) {
        setYtTitle(data.title);
      }
      if (data.author && data.author !== artist) {
        setArtist(data.author);
      }
      if (data.video_id && data.video_id !== videoId) {
        setVideoId(data.video_id);
      }

      // 2. Sync Playlist and Track Index
      const pl = player.getPlaylist?.() || [];
      if (Array.isArray(pl) && pl.length > 0) {
        setPlaylist(pl);
        setTotalTracks(pl.length);
      }

      const idx = player.getPlaylistIndex?.() ?? -1;
      if (idx >= 0 && idx !== trackIndexRef.current) {
        setTrackIndex(idx);
        save(idx, volume);
      }

      // 3. Update Media Session API for mobile lock screen / notifications
      if (typeof window !== 'undefined' && 'mediaSession' in navigator && data.title) {
        try {
          const vId = data.video_id;
          const thumbUrl = vId ? `https://img.youtube.com/vi/${vId}/hqdefault.jpg` : '/bharat.webp';
          navigator.mediaSession.metadata = new MediaMetadata({
            title: data.title,
            artist: data.author || 'Azaad Bharat Playlist',
            album: 'Azaad Bharat 🇮🇳',
            artwork: [
              { src: thumbUrl, sizes: '512x512', type: 'image/jpeg' },
              { src: '/bharat.webp', sizes: '512x512', type: 'image/webp' },
              { src: '/icon.png', sizes: '192x192', type: 'image/png' },
            ],
          });
        } catch {}
      }
    } catch (err) {
      console.warn('Sync error from YouTube Player:', err);
    }
  }, [volume, ytTitle, artist, videoId]);

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

        const idx = p.getPlaylistIndex?.() ?? -1;
        if (idx >= 0 && idx !== trackIndexRef.current) {
          setTrackIndex(idx);
          save(idx, volume);
        }
        syncPlayerInfo();
      } catch {}
    }, 400);
  }, [volume, syncPlayerInfo]);

  const stopTick = useCallback(() => clearInterval(tickRef.current), []);

  /* ── User interaction unlock */
  const unlock = useCallback(() => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;
    setUnlocked(true);
  }, []);

  /* ── Controls */
  const play = useCallback(() => {
    unlock();
    try {
      const p = getPlayer();
      if (p) {
        p.playVideo();
        setIsPlaying(true);
      }
    } catch {}
  }, [unlock]);

  const pause = useCallback(() => {
    try {
      const p = getPlayer();
      if (p) {
        p.pauseVideo();
        setIsPlaying(false);
      }
    } catch {}
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause(); else play();
  }, [isPlaying, play, pause]);

  const next = useCallback(() => {
    unlock();
    try {
      const p = getPlayer();
      if (p) {
        p.nextVideo();
        setIsPlaying(true);
      }
    } catch {}
    setTimeout(syncPlayerInfo, 600);
  }, [unlock, syncPlayerInfo]);

  const prev = useCallback(() => {
    unlock();
    try {
      const p = getPlayer();
      if (p) {
        p.previousVideo();
        setIsPlaying(true);
      }
    } catch {}
    setTimeout(syncPlayerInfo, 600);
  }, [unlock, syncPlayerInfo]);

  const playAt = useCallback((index) => {
    unlock();
    try {
      const p = getPlayer();
      if (p) {
        p.playVideoAt(index);
        setIsPlaying(true);
      }
    } catch {}
    setTimeout(syncPlayerInfo, 600);
  }, [unlock, syncPlayerInfo]);

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

  /* Init YouTube Playlist Player */
  useEffect(() => {
    initPlayer({
      onReady: (player) => {
        setPlayerReady(true);
        if (player && typeof player.setVolume === 'function') {
          player.setVolume(volume);
        }

        // Restore previous track position
        const idx = saved.trackIndex;
        if (idx > 0 && player && typeof player.playVideoAt === 'function') {
          try {
            player.playVideoAt(idx);
            if (typeof player.pauseVideo === 'function') player.pauseVideo();
          } catch {}
        }

        setTimeout(syncPlayerInfo, 600);
      },

      onStateChange: (e) => {
        const state = e.data;
        if (state === YT_PLAYING) {
          setIsPlaying(true);
          setBuffering(false);
          setPlayerError(null);
          startTick();
          syncPlayerInfo();
          if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
          }
        } else if (state === YT_PAUSED) {
          setIsPlaying(false);
          stopTick();
          if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused';
          }
        } else if (state === YT_BUFFERING) {
          setBuffering(true);
        } else if (state === YT_ENDED) {
          setIsPlaying(false);
          stopTick();
          // Auto-play next track in the playlist
          try {
            e.target.nextVideo();
          } catch {}
        } else if (state === YT_UNSTARTED || state === YT_CUED) {
          setIsPlaying(false);
          setBuffering(false);
          syncPlayerInfo();
        }
      },

      onError: (err) => {
        console.warn('YouTube Player error code:', err?.data);
        setPlayerError('Skipping unavailable track...');
        setIsPlaying(false);
        stopTick();
        // Skip to next available track in playlist
        setTimeout(() => {
          try {
            getPlayer()?.nextVideo();
          } catch {}
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

  /* Save volume updates */
  useEffect(() => {
    save(trackIndex, volume);
  }, [volume, trackIndex]);

  // Derived display values
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const currentPosition = totalTracks > 0 ? `${trackIndex + 1}/${totalTracks}` : `${trackIndex + 1}`;
  const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '/bharat.webp';

  const meta = {
    title: ytTitle || 'Azaad Bharat',
    artist: artist || 'YouTube Playlist',
    thumbnail,
    position: currentPosition,
    totalTracks,
    trackIndex,
    playlistId: PLAYLIST_ID,
  };

  const value = {
    playerReady,
    isPlaying,
    buffering,
    trackIndex,
    totalTracks,
    playlist,
    videoId,
    ytTitle,
    artist,
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
    playAt,
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
