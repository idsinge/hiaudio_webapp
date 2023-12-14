import { ENDPOINT } from '../../../../common/js/config'
import { looksLikeMail } from '../../../../common/js/utils'
import {updateSettings} from '../settings'

let CURRENT_CONTRIBUTORS = []
let NEW_CONTRIBUTORS = []
let TOREMOVE_CONTRIBUTORS = []

export const ROLES = {1:'Owner', 2:'Admin', 3:'Member', 4:'Guest'}

export const getCurrentContributors = () => {
    return CURRENT_CONTRIBUTORS
}

export const clearUIContributors = () => {
    document.getElementById('contributorinput').value = ''
    const ul = document.getElementById('listOfContributors')
    ul.innerHTML = ''  
}

export const clearAuxContribArrays = () => {
    NEW_CONTRIBUTORS = []
    TOREMOVE_CONTRIBUTORS = []
}

export const setUIContributors = (contributors) => {
   
    const ul = document.getElementById('listOfContributors')

    if (contributors.length) {
        CURRENT_CONTRIBUTORS = contributors
        contributors.flatMap((elem) => addContributorToUI(ul, elem))
    } else {        
        document.getElementById('contributorinput').value = ''
        ul.innerHTML = ''
    }
}

export const addContributorButtonHandler = (compositionId) => {

    const button = document.getElementById('addContribButton')
    const input = document.getElementById('contributorinput')
    const ul = document.getElementById('listOfContributors')

    button.addEventListener('click', function () {
        const roleInput = document.getElementById('inputGroupSelectRole')
        const role = roleInput.value
        document.getElementById('contributorinput').classList.remove('is-invalid')     
        document.getElementById('validationemailresult').innerText = ''        
        if (input.value && looksLikeMail(input.value)) {           
            addContributorToList(ul, input.value.trim(), compositionId, role)
        } else {
            document.getElementById('contributorinput').classList.add('is-invalid')     
            document.getElementById('validationemailresult').innerText = 'Sorry, invalid email address format.'
        }
    })
}

const addContributorToUI = (ul, contrib) => {    
    const role = ROLES[contrib.role]
    const li = document.createElement('li')
    li.className = 'list-group-item'
    li.id = contrib.user_uid
    li.textContent = contrib.email + ' (' + role + ')'    
    const deleteSwitch = `&nbsp;<div class='custom-control custom-switch custom-control-inline float-right'>
    <input type='checkbox' class='custom-control-input is-invalid' id='removeContSwitch${contrib.user_uid}'>
    <label class='custom-control-label is-invalid' for='removeContSwitch${contrib.user_uid}'>Remove</label>
  </div>`
    li.innerHTML += deleteSwitch
    ul.appendChild(li)
    removeContributorSwitchHandler(contrib)
}

const addContributorToList = async (ul, contrib, compositionId, role) => {
    const roleInput = document.getElementById('inputGroupSelectRole').value    
    if(parseInt(roleInput) !== 0){
        
        const newcontrib = { email:contrib, user_uid: contrib, composition_id: compositionId, role: parseInt(role) }        
        const indexContribDuplicateInCurrent = CURRENT_CONTRIBUTORS.findIndex(x => x.email === contrib)
        const indexContribDuplicateInNew = NEW_CONTRIBUTORS.findIndex(x => x.email === contrib)
        const indexToRemove = TOREMOVE_CONTRIBUTORS.indexOf(contrib)
        if(indexToRemove > -1){
            TOREMOVE_CONTRIBUTORS.splice(indexToRemove,1)
        }
        let canAdd = false

        if((indexContribDuplicateInNew < 0) && (indexContribDuplicateInCurrent < 0)){
            canAdd = true
        } else {
            canAdd = checkDuplicateBeforeAdding(newcontrib, indexContribDuplicateInNew, indexContribDuplicateInCurrent, ul)    
        }        
        
        if(canAdd){
            // #TODO: replace with API call to new endpoint to validate contributor
            const response = await fetch(ENDPOINT + '/checkuser/' + contrib)                       
            if(response?.ok || (response?.status === 404)){
                if(response?.status === 200){
                    const respJson = await response.json()
                    newcontrib.user_uid = respJson.user_uid
                }                                                        
                NEW_CONTRIBUTORS.push(newcontrib)            
                addContributorToUI(ul, newcontrib)
                if(response?.status === 404){
                    alert('An invitation via email will be sent to: '+ contrib + ', after clicking on the button Confirm')
                }
            } else {
                alert(`User can't be added`)
            }
        } else {
            alert('Duplicate user')
        }       
    }   
}

const checkDuplicateBeforeAdding = (newcontrib, atIndexNew, atIndexCurrent, ul) => {
    
    let canAdd = false
    const uid = CURRENT_CONTRIBUTORS[atIndexCurrent]?.user_uid || NEW_CONTRIBUTORS[atIndexNew]?.user_uid
    const contribListElem = document.getElementById(uid)    
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

export const saveNewContributors = async () => {
    if(NEW_CONTRIBUTORS.length > 0){
        let copy_new_contribs = [...NEW_CONTRIBUTORS]
        for (let i=0; i < NEW_CONTRIBUTORS.length; i++){                    
            const newcontrib = NEW_CONTRIBUTORS[i]
            const resultAddContrib = await updateSettings('POST', '/addcontributorbyemail', newcontrib)                    
            if(resultAddContrib?.ok){                
                NEW_CONTRIBUTORS[i].id = resultAddContrib.contribid                
                if(newcontrib.email === newcontrib.user_uid){
                    NEW_CONTRIBUTORS[i].user_uid = resultAddContrib.uuid
                    document.getElementById(newcontrib.email).id = resultAddContrib.uuid                    
                }                
                copy_new_contribs[i] = null                       
            }                       
        }
        const noEmptyNewValues = copy_new_contribs.filter((value) => value != null)                
        CURRENT_CONTRIBUTORS = CURRENT_CONTRIBUTORS.concat(NEW_CONTRIBUTORS)
        document.getElementById('contributorinput').value = ''
        NEW_CONTRIBUTORS = noEmptyNewValues                                       
    }   
}

export const saveRemoveContributors = async (compId) => {
    if(TOREMOVE_CONTRIBUTORS.length > 0){
        let copy_toremove_contribs = [...TOREMOVE_CONTRIBUTORS]
        for (let j=0; j < TOREMOVE_CONTRIBUTORS.length; j++){ 
            const indexContribInCurrent = CURRENT_CONTRIBUTORS.findIndex(x => x.email === TOREMOVE_CONTRIBUTORS[j])                              
            const contribToRemId = CURRENT_CONTRIBUTORS[indexContribInCurrent].user_uid 
            const contribToRem = {contrib_uuid:contribToRemId, comp_uuid:compId}
            const resultRemoveContrib = await updateSettings('DELETE', '/deletecontributor', contribToRem)                    
            if(resultRemoveContrib?.ok){                        
                copy_toremove_contribs[j] = null
                CURRENT_CONTRIBUTORS.splice(indexContribInCurrent,1)
                document.getElementById(contribToRemId).remove()
            } else {
                document.getElementById('removeContSwitch'+contribToRemId).checked = false
            }                   
        }
        const noEmptyValuesRm = copy_toremove_contribs.filter((value) => value != null)
        TOREMOVE_CONTRIBUTORS = noEmptyValuesRm                
    }         
}

const removeContributorSwitchHandler = (contrib) => {
    
    document.getElementById('removeContSwitch'+contrib.user_uid).addEventListener('change', function(event) {        
        const chk = event.target        
        if (chk.tagName === 'INPUT' && chk.type === 'checkbox') {        
            if(chk.checked){                
                if (confirm(`Do you want remove the contributor: ${contrib.email}?`) == true) {                    
                    const indexContribInNew = NEW_CONTRIBUTORS.findIndex(x => x.email === contrib.email)                                     
                    if(indexContribInNew > -1){                        
                        NEW_CONTRIBUTORS.splice(indexContribInNew,1)
                        const indexContribInCurrent = CURRENT_CONTRIBUTORS.findIndex(x => x.email === contrib.email)
                        if(indexContribInCurrent === -1){                            
                            document.getElementById(contrib.user_uid).remove()
                        } else {
                            TOREMOVE_CONTRIBUTORS.push(contrib.email)
                        }
                    } else {                        
                        TOREMOVE_CONTRIBUTORS.push(contrib.email)
                    }                 
                } else {                   
                    event.target.checked = false
                }
            }
        }
    })
}
