import { ENDPOINT } from '../../../common/js/config'
import  DynamicModal from '../../../common/js/modaldialog'
import { startLoader, cancelLoader, UserRole } from '../../../common/js/utils'
import {openSettingsButtonHandler, saveParentCollection} from './settings/setcollection'
import {setUITitle, getCurrentTitle, saveTitle} from './settings/settitle'
import {setUIDescription, getCurrentDescription, saveDescription} from './settings/setdescription'
import {setOpenToContrib, getOpenToContrib, saveOpenToContrib} from './settings/setopentocontrib'
import {setCompAsTemplate, getCompAsTemplate, saveCompAsTemplate} from './settings/setastemplate'
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
    if(tracksInfo.user_isadmin && !tracksInfo.cloned_from){
        document.getElementById('form-group-marktemplate').hidden = false
    }
    setUIContributors(tracksInfo.contributors)
    addContributorButtonHandler(tracksInfo.uuid, tracksInfo.user_id)
    setUITitle(tracksInfo.title)
    setUIDescription(tracksInfo.description)
    setUIPrivacy(tracksInfo.privacy)
    setOpenToContrib(tracksInfo.opentocontrib)
    setCompAsTemplate(tracksInfo.is_template)
    saveButtonHandler(tracksInfo)
    cancelButtonHandler(tracksInfo)
    createSettingsButton()
    privateRadioButtonHandler()
    if(!tracksInfo.cloned_from && tracksInfo.owner){
        openSettingsButtonHandler(tracksInfo?.collection_id)
    } else {
        document.getElementById('listCollContainerNewColl').innerHTML = tracksInfo.parent_collection ? `<h5><span class="badge badge-secondary">${tracksInfo.parent_collection}</span></h5>` : ''
    }
    if(!tracksInfo.owner){
        const selectableRoles = document.getElementById('inputGroupSelectRole')
        selectableRoles.remove(UserRole.owner)
    } else {
        document.getElementById('deleteCompositionFormGroup').hidden = false
    }
    document.querySelector(`${'#inputGroupSelectRole [value="'+UserRole.member+'"]'}`).selected = true
    
    window.addEventListener('click', function (event) {
        const modal = document.getElementById('settingsModal')
        if (event.target === modal) {
            clickCancelButtonHandler(tracksInfo)
        }
    })
}

const createSettingsButton = () => {
    cancelLoader()
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
    setCompAsTemplate(getCompAsTemplate() || compInfo.is_template)
    clearUIContributors()     
    setUIContributors(getCurrentContributors().length ? getCurrentContributors() : compInfo.contributors)        
    clearAuxContribArrays()
    document.getElementById('deleteComposition').checked = false  
}

const cancelButtonHandler = (compInfo) => {
    const cancelSettingsButton = document.getElementById('cancelsettingsbutton')
    const closeSettingsModalButton = document.getElementById('closesettingsmodalbutton')
    cancelSettingsButton.onclick = () => {
        clickCancelButtonHandler(compInfo)
    }
    closeSettingsModalButton.onclick = () => {
        clickCancelButtonHandler(compInfo)
    }
}

const saveButtonHandler = async (compinfo) => {
    const compId = compinfo.uuid
    const confirmSettingsButton = document.getElementById('updatecompositionbutton')
    confirmSettingsButton.onclick = async (e) => {
        startLoader('Updating Settings...')
        const deleteComp = document.getElementById('deleteComposition').checked
        if (deleteComp === true) {
            await deleteComposition(compId)
            cancelLoader()
        } else {
            await saveTitle(compId)
            await saveDescription(compId)
            await savePrivacyLevel(compId)
            await saveOpenToContrib(compId)
            await saveCompAsTemplate(compinfo)
            await saveNewContributors()     
            await saveRemoveContributors(compId)
            await saveParentCollection(compId)
            updateContributorsAtCompPage()
            $('#settingsModal').modal('hide')
            cancelLoader()
        }
    }
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