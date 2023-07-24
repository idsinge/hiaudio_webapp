import { ENDPOINT } from '../../js/config'
import {openSettingsButtonHandler, saveParentCollection} from './setcollection'
import {setUITitle, getCurrentTitle, saveTitle} from './settitle'
import {setOpenToContrib, getOpenToContrib, saveOpenToContrib} from './setopentocontrib'
import {getPrivacyLevel, setUIPrivacy, savePrivacyLevel, privateRadioButtonHandler} from './setprivacy'

let CURRENT_CONTRIBUTORS = []
let NEW_CONTRIBUTORS = []
let TOREMOVE_CONTRIBUTORS = []

export const ROLES = {1:'Owner', 2:'Admin', 3:'Member', 4:'Guest'}

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

const setUIContributors = (contributors) => {
   
    const ul = document.getElementById('listOfContributors')

    if (contributors.length) {
        CURRENT_CONTRIBUTORS = contributors
        contributors.flatMap((elem) => addContributorToUI(ul, elem))
    } else {        
        document.getElementById('contributorinput').value = ''
        ul.innerHTML = ''
    }
}

const removeContributorSwitchHandler = (contribId) => {
    
    document.getElementById('removeContSwitch'+contribId).addEventListener('change', function(event) {        
        const chk = event.target        
        if (chk.tagName === 'INPUT' && chk.type === 'checkbox') {        
            if(chk.checked){                
                if (confirm(`Do you want remove the contributor with ID ${contribId}?`) == true) {                    
                    const indexContribInNew = NEW_CONTRIBUTORS.findIndex(x => x.user_uid === contribId)                    
                    if(indexContribInNew > -1){                        
                        NEW_CONTRIBUTORS.splice(indexContribInNew,1)
                        document.getElementById(contribId).remove()
                    } else {                        
                        TOREMOVE_CONTRIBUTORS.push(contribId)
                    }                 
                } else {                   
                    event.target.checked = false
                }
            }
        }
    })
}

const addContributorButtonHandler = (compositionId) => {

    const button = document.getElementById('addContribButton')
    const input = document.getElementById('contributorinput')
    const ul = document.getElementById('listOfContributors')

    button.addEventListener('click', function () {
        const roleInput = document.getElementById('inputGroupSelectRole')
        const role = roleInput.value
        if (input.value) {
            addContributorToList(ul, input.value, compositionId, role)
        }
    })
}

const addContributorToUI = (ul, contrib) => {    
    const role = ROLES[contrib.role]
    const li = document.createElement('li')
    li.className = 'list-group-item'
    li.id = contrib.user_uid
    li.textContent = contrib.user_uid + ' (' + role + ')'    
    const deleteSwitch = `&nbsp;<div class='custom-control custom-switch custom-control-inline float-right'>
    <input type='checkbox' class='custom-control-input is-invalid' id='removeContSwitch${contrib.user_uid}'>
    <label class='custom-control-label is-invalid' for='removeContSwitch${contrib.user_uid}'>Remove</label>
  </div>`
    li.innerHTML += deleteSwitch
    ul.appendChild(li)
    removeContributorSwitchHandler(contrib.user_uid)
}

const addContributorToList = async (ul, contrib, compositionId, role) => {
    const roleInput = document.getElementById('inputGroupSelectRole').value    
    if(parseInt(roleInput) !== 0){
        
        const newcontrib = { user_uid: contrib, composition_id: compositionId, role: parseInt(role) }        
        const indexContribDuplicateInCurrent = CURRENT_CONTRIBUTORS.findIndex(x => x.user_uid === contrib)
        const indexContribDuplicateInNew = NEW_CONTRIBUTORS.findIndex(x => x.user_uid === contrib)

        let canAdd = false

        if((indexContribDuplicateInNew < 0) && (indexContribDuplicateInCurrent < 0)){
            canAdd = true
        } else {
            canAdd = checkDuplicateBeforeAdding(newcontrib, indexContribDuplicateInNew, indexContribDuplicateInCurrent, ul)    
        }        
        
        if(canAdd){
            // #TODO: replace with API call to new endpoint to validate contributor
            const response = await fetch(ENDPOINT + '/checkuser/' + contrib)             
            if(response?.ok){                             
                NEW_CONTRIBUTORS.push(newcontrib)            
                addContributorToUI(ul, newcontrib)        
            } else {
                alert(`User can't be added`)
            }
        }        
    }   
}

const checkDuplicateBeforeAdding = (newcontrib, atIndexNew, atIndexCurrent, ul) =>{
    
    let canAdd = false
    const contribListElem = document.getElementById(newcontrib.user_uid)
    
    if(contribListElem){
    
        if(atIndexCurrent >= 0 && atIndexNew < 0){
            
            if(CURRENT_CONTRIBUTORS[atIndexCurrent].role !== newcontrib.role){
                canAdd = true
                contribListElem.remove()  
            }
        } 
        if(atIndexNew >= 0 && atIndexCurrent < 0){
            
            if(NEW_CONTRIBUTORS[atIndexNew].role !== newcontrib.role){
                canAdd = true
                NEW_CONTRIBUTORS.splice(atIndexNew,1)
                contribListElem.remove()  
            } 
        }
        if(atIndexNew >= 0 && atIndexCurrent >= 0){
                     
           if(CURRENT_CONTRIBUTORS[atIndexCurrent].role === newcontrib.role){
                NEW_CONTRIBUTORS.splice(atIndexNew,1)
                contribListElem.remove()                
                addContributorToUI(ul, newcontrib)
           } 
           if(NEW_CONTRIBUTORS.length && (NEW_CONTRIBUTORS[atIndexNew].role !== newcontrib.role)){
                canAdd = true
                NEW_CONTRIBUTORS.splice(atIndexNew,1)
                contribListElem.remove() 
           }
        }              
    }
    return canAdd
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
        document.getElementById('contributorinput').value = ''
        const ul = document.getElementById('listOfContributors')
        ul.innerHTML = ''        
        setUIContributors(CURRENT_CONTRIBUTORS.length ? CURRENT_CONTRIBUTORS : compInfo.contributors)        
        NEW_CONTRIBUTORS = []
        TOREMOVE_CONTRIBUTORS = []
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

const saveNewContributors = async () => {
    if(NEW_CONTRIBUTORS.length > 0){
        let copy_new_contribs = [...NEW_CONTRIBUTORS]
        for (let i=0; i < NEW_CONTRIBUTORS.length; i++){                    
            const newcontrib = NEW_CONTRIBUTORS[i]
            const resultAddContrib = await updateSettings('POST', '/addcontributorbyid', newcontrib)                    
            if(resultAddContrib?.ok){                        
                NEW_CONTRIBUTORS[i].id = resultAddContrib.contribid
                copy_new_contribs[i] = null                       
            }                       
        }
        const noEmptyNewValues = copy_new_contribs.filter((value) => value != null)                
        CURRENT_CONTRIBUTORS = CURRENT_CONTRIBUTORS.concat(NEW_CONTRIBUTORS)
        document.getElementById('contributorinput').value = ''
        NEW_CONTRIBUTORS = noEmptyNewValues                                       
    }   
}

const saveRemoveContributors = async (compId) => {
    if(TOREMOVE_CONTRIBUTORS.length > 0){
        let copy_toremove_contribs = [...TOREMOVE_CONTRIBUTORS]
        for (let j=0; j < TOREMOVE_CONTRIBUTORS.length; j++){ 
            const indexContribInCurrent = CURRENT_CONTRIBUTORS.findIndex(x => x.user_uid === TOREMOVE_CONTRIBUTORS[j])                    
            const contribToRemId = CURRENT_CONTRIBUTORS[indexContribInCurrent].user_uid 
            const contribToRem = {contrib_uuid:contribToRemId, comp_uuid:compId}
            const resultRemoveContrib = await updateSettings('DELETE', '/deletecontributor', contribToRem)                    
            if(resultRemoveContrib?.ok){                        
                copy_toremove_contribs[j] = null
                CURRENT_CONTRIBUTORS.splice(indexContribInCurrent,1)
                document.getElementById(TOREMOVE_CONTRIBUTORS[j]).remove()
            } else {
                document.getElementById('removeContSwitch'+TOREMOVE_CONTRIBUTORS[j]).checked = false
            }                   
        }
        const noEmptyValuesRm = copy_toremove_contribs.filter((value) => value != null)
        TOREMOVE_CONTRIBUTORS = noEmptyValuesRm                
    }         
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