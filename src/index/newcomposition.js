
import { ENDPOINT } from '../js/config'

let errorIs = null

const newProjectButton = document.getElementById('newcomposition')
newProjectButton?.addEventListener('click', (e) => {
  let newtitle = document.getElementById('newtitle').value
  const privacyLevel = document.querySelector('input[name="newMusicPrivacyRadios"]:checked').value
  if (!newtitle) {
    alert('Introduce a valid title, please')
    return
  }
  let body = JSON.stringify({
    title: newtitle,
    privacy_level: privacyLevel
  })


  fetch(ENDPOINT + '/newcomposition', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: body
  })
    .then((r) => {
      if (!r.ok) {
        errorIs = r.statusText
      }
      return r.json()
    })
    .then(data => {
      if (data.composition) {
        window.location.href = uriCompositionPage + data.composition.uuid
      } else {
        throw new Error(data)
      }
    }).catch((error) => {
      errorIs = error
    })

})