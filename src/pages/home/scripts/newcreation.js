
import { ENDPOINT } from '../../../common/js/config'
import DynamicModal from '../../../common/js/modaldialog'
import {uriCompositionPage} from './home'
import {getCollections, getCollectionsError, createListCollections } from '../../../common/js/collectionshandler.js'
import './editcollections'

const createNewButton  = document.getElementById('createNewButton')
const createNewButtonAtHome  = document.getElementById('createNewButtonAtHome')

const clickNewButtonHandler = () => {
  document.getElementById('newtitle').value = ''
  document.getElementById('newdescription').value = ''
  const saveCompositionButton = document.getElementById('newcreation')
  saveEventListener(saveCompositionButton)
  getCollections().then( result => {
      if(result){
          getCompCollSuccess(result)
      } else {
          getCollectionsError()
      }
  })
}

createNewButton?.addEventListener('click', clickNewButtonHandler, false)
createNewButtonAtHome?.addEventListener('click', clickNewButtonHandler, false)

const getCompCollSuccess = (list) => {
  document.getElementById('listCollContainer').replaceChildren()                                   
  createListCollections(list, 'listCollContainer')
}

const saveEventListener = (saveCompositionButton) =>{
  saveCompositionButton?.addEventListener('click', saveEventListenerHandler)
}

const saveEventListenerHandler = (e) => {
  const newCreation = document.getElementById('typeOfNewCreation').value
  let apiMethod = '/newcomposition'
  if(newCreation === 'coll'){
    apiMethod = '/newcollection'
  }
  let newtitle = document.getElementById('newtitle').value
  const privacyLevel = document.querySelector('input[name="newMusicPrivacyRadios"]:checked').value
  if (!newtitle) {
    alert('Introduce a valid title, please')
    return
  }

  const newdescription = document.getElementById('newdescription').value  
  const collectInput = document.getElementById('inputGroupSelectCollect')
  let parentCollection = collectInput?.value || null
  if(parentCollection === '0'){
      parentCollection = null
  }

  let body = JSON.stringify({
    title: newtitle,
    privacy_level: privacyLevel,
    parent_uuid: parentCollection,
    description: newdescription
  })

  let errorIs = null

  fetch(ENDPOINT + apiMethod, {
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
      if (data) {
        verifyResponse(data)
      } else {
        throw new Error(data)
      }
    }).catch((error) => {
      errorIs = error
    })
}

const verifyResponse = (response)=> {
  $('#newMusicModal').modal('hide')  
  if(response.composition){
    window.location.href = uriCompositionPage + response.composition.uuid  
  } else if(response.ok) {
    DynamicModal.dynamicModalDialog(
      `Collection created successfully!`,
      null,
      '',
      'Close',
      'New Collection',
      'bg-success'
    )
  } else {
    DynamicModal.dynamicModalDialog(
      `An error happened, item not created`,
      null,
      '',
      'Close',
      'Error at Creation',
      'bg-danger'
    )
  }
}