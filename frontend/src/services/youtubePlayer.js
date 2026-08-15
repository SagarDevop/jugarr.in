/**
 * YouTubePlayerService — Singleton
 * Supports custom curated video list and playlist playback.
 */

const CONTAINER_ID = 'yt-ab-player-root';

let _apiReady = false;
let _apiLoading = false;
let _player = null;
const _readyQueue = [];

// ── Load the YT IFrame API script once
function _loadAPI() {
  if (typeof window === 'undefined') return;
  if (_apiReady || _apiLoading) return;
  _apiLoading = true;

  window._ytAbCallback = () => {
    _apiReady = true;
    _apiLoading = false;
    _readyQueue.forEach((fn) => fn());
    _readyQueue.length = 0;
  };

  const existing = document.getElementById('yt-iframe-api-script');
  if (existing) {
    if (window.YT && window.YT.Player) {
      window._ytAbCallback();
    }
    return;
  }

  const s = document.createElement('script');
  s.id = 'yt-iframe-api-script';
  s.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(s);

  window.onYouTubeIframeAPIReady = window._ytAbCallback;
}

// ── Ensure container div exists
function _ensureContainer() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(CONTAINER_ID)) return;
  const wrap = document.createElement('div');
  wrap.id = CONTAINER_ID;
  Object.assign(wrap.style, {
    position: 'fixed',
    top: '-9999px',
    left: '-9999px',
    width: '200px',
    height: '200px',
    opacity: '0.001',
    pointerEvents: 'none',
    zIndex: '-9999',
    overflow: 'hidden',
  });
  document.body.appendChild(wrap);
}

// ── Public: initialise YouTube player with initial video ID or playlist
export function initPlayer({ videoId, playlist, onReady, onStateChange, onError }) {
  _loadAPI();
  _ensureContainer();

  const doCreate = () => {
    if (_player) {
      if (onReady) onReady(_player);
      return;
    }

    try {
      const playerVars = {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1, // Critical for iOS & Android
        rel: 0,
        origin: window.location.origin,
      };

      if (Array.isArray(playlist) && playlist.length > 0) {
        playerVars.playlist = playlist.join(',');
      }

      _player = new window.YT.Player(CONTAINER_ID, {
        width: '200',
        height: '200',
        videoId: videoId || (playlist && playlist[0]),
        playerVars,
        events: {
          onReady: (e) => onReady?.(e.target),
          onStateChange: (e) => onStateChange?.(e),
          onError: (e) => onError?.(e),
        },
      });
    } catch (err) {
      console.error('Failed to create YT.Player instance:', err);
    }
  };

  if (_apiReady && window.YT && window.YT.Player) {
    doCreate();
  } else {
    _readyQueue.push(doCreate);
  }
}

export const getPlayer = () => _player;
export const isApiReady = () => _apiReady;

export function destroyPlayer() {
  try {
    _player?.destroy();
  } catch (_) {}
  _player = null;
  const el = document.getElementById(CONTAINER_ID);
  if (el) el.remove();
}
