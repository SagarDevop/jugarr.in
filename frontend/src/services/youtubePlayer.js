/**
 * YouTubePlayerService — Singleton
 * Manages the hidden YT IFrame API player instance.
 * Call init() once; all other modules call getPlayer().
 */

const PLAYLIST_ID = 'PLCmF-m8tEVcU';
const CONTAINER_ID = 'yt-ab-player-root';

let _apiReady = false;
let _apiLoading = false;
let _player = null;
const _readyQueue = [];

// ── Load the YT IFrame API script once
function _loadAPI() {
  if (_apiReady || _apiLoading) return;
  _apiLoading = true;

  window._ytAbCallback = () => {
    _apiReady = true;
    _apiLoading = false;
    _readyQueue.forEach((fn) => fn());
    _readyQueue.length = 0;
  };

  const existing = document.getElementById('yt-iframe-api-script');
  if (existing) return;

  const s = document.createElement('script');
  s.id = 'yt-iframe-api-script';
  s.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(s);

  // YT calls window.onYouTubeIframeAPIReady
  window.onYouTubeIframeAPIReady = window._ytAbCallback;
}

// ── Ensure off-screen container div exists
function _ensureContainer() {
  if (document.getElementById(CONTAINER_ID)) return;
  const wrap = document.createElement('div');
  wrap.id = CONTAINER_ID;
  Object.assign(wrap.style, {
    position: 'fixed',
    top: '-9999px',
    left: '-9999px',
    width: '1px',
    height: '1px',
    opacity: '0',
    pointerEvents: 'none',
    zIndex: '-9999',
    overflow: 'hidden',
  });
  document.body.appendChild(wrap);
}

// ── Public: initialise (call once from MusicContext)
export function initPlayer({ onReady, onStateChange, onError }) {
  _loadAPI();
  _ensureContainer();

  const doCreate = () => {
    // Guard: never create twice
    if (_player) { onReady?.(_player); return; }

    _player = new window.YT.Player(CONTAINER_ID, {
      width: '1',
      height: '1',
      playerVars: {
        listType:       'playlist',
        list:            PLAYLIST_ID,
        autoplay:        0,
        controls:        0,
        disablekb:       1,
        enablejsapi:     1,
        fs:              0,
        iv_load_policy:  3,
        modestbranding:  1,
        playsinline:     1,   // critical for iOS
        rel:             0,
        origin:          window.location.origin,
      },
      events: {
        onReady:       (e) => onReady?.(e.target),
        onStateChange: (e) => onStateChange?.(e),
        onError:       (e) => onError?.(e),
      },
    });
  };

  if (_apiReady) doCreate();
  else _readyQueue.push(doCreate);
}

export const getPlayer  = ()  => _player;
export const isApiReady = ()  => _apiReady;

export function destroyPlayer() {
  try { _player?.destroy(); } catch (_) {}
  _player = null;
  document.getElementById(CONTAINER_ID)?.remove();
}
