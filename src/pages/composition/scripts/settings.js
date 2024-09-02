import { ENDPOINT } from '../../../common/js/config'
import  DynamicModal from '../../../common/js/modaldialog'
import { startLoader, cancelLoader } from '../../../common/js/utils'
import {openSettingsButtonHandler, saveParentCollection} from './settings/setcollection'
import {setUITitle, getCurrentTitle, saveTitle} from './settings/settitle'
import {setUIDescription, getCurrentDescription, saveDescription} from './settings/setdescription'
import {setOpenToContrib, getOpenToContrib, saveOpenToContrib} from './settings/setopentocontrib'
import {getPrivacyLevel, setUIPrivacy, savePrivacyLevel, privateRadioButtonHandler} from './settings/setprivacy'
import {setUIContributors,
    clearUIContributors,
    clearAuxContribArrays, 
    getCurrentContributors, 
    addContributorButtonHandler, 
    saveNewContributors, 
    saveRemoveContributors,
    updateContributorsAtCompPage
} from './settings/setcontributors'

export const enableCompositionSettings = (tracksInfo) => {
    setUIContributors(tracksInfo.contributors)
    addContributorButtonHandler(tracksInfo.uuid)
    setUITitle(tracksInfo.title)
    setUIDescription(tracksInfo.description)
    setUIPrivacy(tracksInfo.privacy)
    setOpenToContrib(tracksInfo.opentocontrib)
    saveButtonHandler(tracksInfo.uuid)
    cancelButtonHandler(tracksInfo)
    createSettingsButton()
    privateRadioButtonHandler()
    openSettingsButtonHandler(tracksInfo?.collection_id)    
}

const createSettingsButton = () => {
    cancelLoader('settingsloader')
    const ulElem = document.getElementById('useroptions')
    const liElem = document.createElement('li')
    liElem.innerHTML = `<li class="nav-item">
    <a class="nav-link" href="#" id="openSettingsButton" data-toggle="modal" data-target="#settingsModal">Composition Info</a>
  </li>
   `
   ulElem.appendChild(liElem)
}

export const updateSettings = async (method, api, data) => {

    let body = JSON.stringify(data)    
    let response = null
    const request = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: body
    }
    try {
        const sendRqst = await fetch(ENDPOINT + api, request)
        const respToJson = await sendRqst.json()
        if (respToJson) {
            response = respToJson
        }
    } catch (error) {
        DynamicModal.dynamicModalDialog(
            error, 
            null, 
            '',
            'Close',
            'Error',
            'bg-danger'
        )
    }
    return response
}

const clickCancelButtonHandler = (compInfo) => {     
    setUITitle(getCurrentTitle()||compInfo.title) 
    setUIDescription(getCurrentDescription()||compInfo.description)        
    setUIPrivacy(getPrivacyLevel() || compInfo.privacy)         
    setOpenToContrib(getOpenToContrib() || compInfo.opentocontrib)
    clearUIContributors()     
    setUIContributors(getCurrentContributors().length ? getCurrentContributors() : compInfo.contributors)        
    clearAuxContribArrays()
    document.getElementById('deleteComposition').checked = false  
}

const cancelButtonHandler = (compInfo) => {
    const cancelSettingsButton = document.getElementById('cancelsettingsbutton')
    cancelSettingsButton?.addEventListener('click', () => { clickCancelButtonHandler(compInfo)})       
}

const saveButtonHandler = async (compId) => {
    const confirmSettingsButton = document.getElementById('updatecompositionbutton')
    confirmSettingsButton?.addEventListener('click', async (e) => {
        startLoader('settingsloader', 'Updating Settings...')
        const deleteComp = document.getElementById('deleteComposition').checked
        if (deleteComp === true) {
            await deleteComposition(compId)
            cancelLoader('settingsloader')
        } else {
            await saveTitle(compId)
            await saveDescription(compId)
            await savePrivacyLevel(compId)
            await saveOpenToContrib(compId)
            await saveNewContributors()     
            await saveRemoveContributors(compId)
            await saveParentCollection(compId)
            updateContributorsAtCompPage()
            $('#settingsModal').modal('hide')
            cancelLoader('settingsloader')
        }
    })
}

const deleteComposition = async (compId) => {
    DynamicModal.dynamicModalDialog(
        'Delete ' + getCurrentTitle() + '?',
        'btn-delete-composition',
        'OK',
        'Cancel',
        'Delete Composition',
        'bg-danger'
    )
    document.getElementById('btn-delete-composition').onclick = async () => {
        const resultDeleteComp = await updateSettings('DELETE', '/deletecomposition/'+compId, null)        
        if (resultDeleteComp.ok) {
            window.location.href = window.location.origin
        }
        DynamicModal.closeDynamicModal()
    }
}