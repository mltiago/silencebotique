# Hero film

## Decision

The hero film **stays on Vimeo background mode** — no self-hosted `<video>` swap.
Playback at 720p to save bandwidth.

## Embed

```html
<iframe
  src="https://player.vimeo.com/video/1235961242?background=1&autoplay=1&muted=1&loop=1&dnt=1&badge=0&byline=0&title=0&portrait=0"
  title="Praia de Algodões, Bahia — slow water over sand at golden hour"
  frameborder="0"
  allow="autoplay; fullscreen; picture-in-picture"
  referrerpolicy="strict-origin-when-cross-origin"
></iframe>
```

`background=1` is Vimeo's native hero mode: autoplay, loop, muted, no controls,
no title — no `player.js` needed. `dnt=1` is do-not-track.

CSS scales the iframe to fill the frame at any aspect ratio without letterboxing
(`.hero-video-frame iframe` in `styles.css`).

## Source

Manage video: https://vimeo.com/manage/videos/1235961242

## Banda (720p)

Para servir 720p e economizar banda, o arquivo de origem no Vimeo deve estar a
**720p** (é ele que define a resolução máxima; o player faz adaptive bitrate
para baixo, nunca para cima). O background mode não aceita parâmetro de
qualidade via URL — não há `&quality=` válido. Forçar qualidade exata exigiria
`player.js`, o que o skill 5e descarta (zero player.js).