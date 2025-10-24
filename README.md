## About

Hi-Audio online platform is a collaborative web application for musicians and researchers in the MIR (Music Information Retrieval) domain, with a view to build a public database of music recordings from a wide variety of styles and different cultures. It allows:

- Creating musical compositions and collections with different levels of privacy.
- Uploading and recording audio tracks from the browser.
- Annotating audio tracks with relevant MIR information.
- Inviting collaborators to participate using different roles.

![screenshot](doc/screenshot.png)

This repo contains information relative to the client side or front-end, for the server side (backend API) check the following repo:

https://github.com/idsinge/hiaudio_backend

## How to run it locally:

Requirement: Node.js v14 or above

Install Node.js: https://nodejs.org/en/download

Recommentation: in case you have problems with Node versions use [NVM](https://github.com/nvm-sh/nvm). NVM may be required to develop features for `waveform-playlist`. See `Note 4`.

**IMPORTANT: currently this project needs from the backend to be running in parallel. See Note 3.**

First clone and run backend repo. More info at: 

https://github.com/idsinge/hiaudio_backend/wiki/Working-with-the-frontend-and-backend-at-the-same-time-for-development



1. **Inside backend folder repo clone hiaudio webapp**:

`git clone https://github.com/idsinge/hiaudio_webapp.git`

2. `cd hiaudio_webapp` (Rename folder to `webapp`)
3. `npm i`
4. `npm run dev`
5. Open `https://localhost:7007/`. See `Note 1` to use port `8000`. For HTTP see `Notes 2`.
6. To build a new version for backend repo, run the command `npm run build` and the sources will be placed at `../public` folder.


#### NOTES:
1. For a different endpoint change `MODE=DEV` at `config.js`. By default port for development is `7007` when the backend is running, otherwise the application can be open from `https://localhost:8000/` for pure frontend development when access to either API or DB is not required.
2. For http remove the `--https` param in `package.json`: `... --port 8000 --https"`
3. Webapp local dev version does not work isolated, it means without server instance. It can be used to point prod server and check info available there, but for full authenticated API methods the backend is required.
4. To work with `waveform-playlist` repo for development check the following documentation:

https://github.com/idsinge/hiaudio_webapp/wiki/Running-waveform%E2%80%90playlist-for-development

## More info:

- ISMIR 2024: https://ismir2024program.ismir.net/lbd_448.html

- Hi-Audio Project: https://hi-audio.imt.fr/2025/03/07/bridging-music-and-research/

- How to: https://hiaudio.fr/static/howto.html


## Acknowledgements:
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/naomiaro"><img src="https://avatars2.githubusercontent.com/u/35253?v=4" width="100px;" alt=""/><br /><sub><b>Naomi Aro</b></sub></a><br /><a href="https://github.com/naomiaro/waveform-playlist" title="Code">waveform-playlist</a></td> 
  </tr>
</table>
<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
