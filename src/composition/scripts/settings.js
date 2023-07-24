import { ENDPOINT } from '../../js/config'
import {openSettingsButtonHandler, saveParentCollection} from './setcollection'
import {setUITitle, getCurrentTitle, saveTitle} from './settitle'
import {setOpenToContrib, getOpenToContrib, saveOpenToContrib} from './setopentocontrib'
import {getPrivacyLevel, setUIPrivacy, savePrivacyLevel, privateRadioButtonHandler} from './setprivacy'
import {setUIContributors,
    clearUIContributors,
    clearAuxContribArrays, 
    getCurrentContributors, 
    addContributorButtonHandler, 
    saveNewContributors, 
    saveRemoveContributors
} from './setcontributors'

export const enableCompositionSettings = (tracksInfo) => {
    setUIContributors(tracksInfo.contributors)
    addContributorButtonHandler(tracksInfo.uuid)
    setUITitle(tracksInfo.title)
    setUIPrivacy(tracksInfo.privacy)
    setOpenToContrib(tracksInfo.opentocontrib)
    saveButtonHandler(tracksInfo.uuid)
    cancelButtonHandler(tracksInfo)
    createSettingsButton()
    privateRadioButtonHandler()
    openSettingsButtonHandler(tracksInfo?.collection_id)    
}

const createSettingsButton = () => {
    document.getElementById('useroptions').innerHTML = `<li class="nav-item">
    <a class="nav-link" href="#" id="openSettingsButton" data-toggle="modal" data-target="#settingsModal">Settings</a>
  </li>
   `
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
        alert(error)
    }
    return response
}

const cancelButtonHandler = async (compInfo) => {
    const cancelSettingsButton = document.getElementById('cancelsettingsbutton')
    cancelSettingsButton?.addEventListener('click', async (e) => {  
        setUITitle(getCurrentTitle()||compInfo.title)        
        setUIPrivacy(getPrivacyLevel() || compInfo.privacy)         
        setOpenToContrib(getOpenToContrib() || compInfo.opentocontrib)
        clearUIContributors()     
        setUIContributors(getCurrentContributors().length ? getCurrentContributors() : compInfo.contributors)        
        clearAuxContribArrays()
        document.getElementById('deleteComposition').checked = false  
    })       
}

const saveButtonHandler = async (compId) => {
    const confirmSettingsButton = document.getElementById('updatecompositionbutton')
    confirmSettingsButton?.addEventListener('click', async (e) => {
        const deleteComp = document.getElementById('deleteComposition').checked
        if (deleteComp === true) {
            await deleteComposition(compId)
        } else {
            await saveTitle(compId)
            await savePrivacyLevel(compId)
            await saveOpenToContrib(compId)
            await saveNewContributors()     
            await saveRemoveContributors(compId)
            await saveParentCollection(compId)
            $('#settingsModal').modal('hide')
        }
    })
}

const deleteComposition = async (compId) => {
    const dialog = confirm('Delete ' + getCurrentTitle() + '?')
    if (dialog) {
        const resultDeleteComp = await updateSettings('DELETE', '/deletecomposition/'+compId, null)        
        if (resultDeleteComp.ok) {
            window.location.href = window.location.origin
        }
    }
}