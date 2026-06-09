import { H as Hls } from './video-player-dru42stk.js';

window.SiteHls = Hls;
document.dispatchEvent(new Event('site-hls-ready'));
