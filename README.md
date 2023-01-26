## How to run it locally:
1. git clone https://gitlab.telecom-paris.fr/idsinge/hiaudio/beatbytebot_webapp.git
2. cd beatbytebot_webapp
3. npm i
4. Rename "src/js/config_template.js" to "src/js/config.js". See Note 1.
5. Do the following asjustment: https://github.com/gilpanal/beatbytebot_webapp/wiki/Solved-Issues
6. npm run dev
7. Open 127.0.0.1/index.html. For HTTPS see Note 2.

#### NOTES:
1. In case you are also running the API project locally (). Verify `MODE=DEV` at `config.js`
DEVPORT is `7007` by default or the number choosen for the API in case you use a different port.
2. For https include the following param in `package.json`: `... --port 80 --https"`

## More info:

Wiki: https://gitlab.telecom-paris.fr/idsinge/hiaudio/musicplatform_mgmt/-/wikis/SOURCE-CODE/Links-and-other-info
Project Dev Board: https://gitlab.telecom-paris.fr/idsinge/hiaudio/musicplatform_mgmt/-/boards

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
