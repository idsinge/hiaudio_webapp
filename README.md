## How to run it locally:

1. `git clone https://gitlab.telecom-paris.fr/idsinge/hiaudio/beatbytebot_webapp.git`
2. `cd beatbytebot_webapp`
3. `npm i`
4. Rename `src/js/config_template.js` to `src/js/config.js`. See `Note 1`.
5. Do the following asjustment: https://github.com/gilpanal/beatbytebot_webapp/wiki/Solved-Issues. See Note 5.
6. In `package.json`, at `"scripts/dev"` entry remove `--out-dir ../public --public-url .` for local test in a separate instance.
7. `npm run dev`
8. Open `https://localhost:80/index.html` and apply rule at `Note 4`. For HTTP see `Notes 2 and 3`.


#### NOTES:
1. In case you are also running the API project locally: verify `MODE=DEV` at `config.js`
`DEVPORT` is `7007` by default or the number choosen for the API in case you use a different port.
2. For http remove the `--https` param in `package.json`: `... --port 80 --https"`
3. Webapp local dev version is not working for API methods like `newsong` or `fileUpload` as it relies on session cookie which is not shared among domains (**localhost:7007** vs **localhost:80**)
4. `chrome://flags/#allow-insecure-localhost`
5. For `waveform-playlist` changes go to `node_modules/waveform-playlist/build/waveform-playlist.umd.js`. 

## More info:

- Wiki: https://gitlab.telecom-paris.fr/idsinge/hiaudio/musicplatform_mgmt/-/wikis/SOURCE-CODE/Links-and-other-info

- Project Dev Board: https://gitlab.telecom-paris.fr/idsinge/hiaudio/musicplatform_mgmt/-/boards

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
