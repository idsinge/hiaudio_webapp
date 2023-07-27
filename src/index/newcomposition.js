
import { ENDPOINT } from '../js/config'
import {uriCompositionPage} from './index.js'
import {getCollections, getCollectionsError, createListCollections } from './newcollection.js'
import './editcollections'

const createNewCompButton  = document.getElementById('createNewCompButton')

const clickNewCompButtonHandler = () => {
  document.getElementById('newcomptitle').value = ''
  const saveCompositionButton = document.getElementById('newcomposition')
  saveEventListener(saveCompositionButton)
  getCollections().then( result => {
      if(result){
          getCompCollSuccess(result)
      } else {
          getCollectionsError()
      }
  })
}

createNewCompButton?.addEventListener('click', clickNewCompButtonHandler, false)

const getCompCollSuccess = (list) => {
  document.getElementById('listCollContainerNewComp').replaceChildren()                                   
  createListCollections(list, 'listCollContainerNewComp')
}

const saveEventListener = (saveCompositionButton) =>{
  saveCompositionButton?.addEventListener('click', saveEventListenerHandler)
}

const saveEventListenerHandler = (e) => {
  let newcomptitle = document.getElementById('newcomptitle').value
  const privacyLevel = document.querySelector('input[name="newMusicPrivacyRadios"]:checked').value
  if (!newcomptitle) {
    alert('Introduce a valid title, please')
    return
  }

  const collectInput = document.getElementById('inputGroupSelectCollect')
  let parentCollection = collectInput?.value || null
  if(parentCollection === '0'){
      parentCollection = null
  }

  let body = JSON.stringify({
    title: newcomptitle,
    privacy_level: privacyLevel,
    parent_uuid: parentCollection
  })

  let errorIs = null

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
}