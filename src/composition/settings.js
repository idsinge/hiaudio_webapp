import { ENDPOINT } from '../js/config'

let CURRENT_TITLE = null
let CURRENT_PRIVACY = null
let CURRENT_OPENTOCONTRIB = null
let CURRENT_CONTRIBUTORS = null
let NEW_CONTRIBUTORS = []

const ROLES = {1:'Owner', 2:'Admin', 3:'Member', 4:'Guest'}

export const enableCompositionSettings = (tracksInfo) => {
    setUIContributors(tracksInfo.contributors, tracksInfo.id)
    setUITitle(tracksInfo.title)
    setUIPrivacy(tracksInfo.privacy)
    setOpenToContrib(tracksInfo.opentocontrib)
    saveButtonHandler(tracksInfo.id)
    document.getElementById('useroptions').innerHTML = `<li class="nav-item">
    <a class="nav-link" href="#" data-toggle="modal" data-target="#settingsModal">Settings</a>
  </li>
   `
    privateRadioButtonHandler()
}

const changeOpenToContrib = (newstate) => {
    const opentocontribcheckbox = document.getElementById('opentocontribution')    
    if(newstate === 0){
        opentocontribcheckbox.checked = false
        opentocontribcheckbox.disabled = true
    } else {
        opentocontribcheckbox.disabled = false
    }
}


const privateRadioButtonHandler = () => {

    const radioButtons = document.getElementsByName('settingsPrivacyRadios')
   
    for (let radiobutton of radioButtons) {

        radiobutton.addEventListener('change', function () {
            if (this.checked) {
                if(parseInt(this.value) === 3) {
                    changeOpenToContrib(0)
                } else {
                    changeOpenToContrib(1)
                }                
            } 
        })
    }
}
const setUIPrivacy = (privacyLevel) => {
    CURRENT_PRIVACY = privacyLevel
    const radiobtn = document.getElementById('settingsPrivacyRadios' + privacyLevel)
    radiobtn.checked = true
    if(privacyLevel === 3){
        changeOpenToContrib(0)
    }
}

const setUITitle = (title) => {
    CURRENT_TITLE = title
    const textfield = document.getElementById('newtitle')
    textfield.value = title
}

const setOpenToContrib = (status) => {     
    CURRENT_OPENTOCONTRIB = status   
    const checkbox = document.getElementById('opentocontribution')
    checkbox.checked = status
}

const setUIContributors = (contributors, compositionId) => {

    const button = document.getElementById('addContribButton')
    const input = document.getElementById('contributorinput')
    const ul = document.getElementById('listOfContributors')

    if (contributors.length) {
        CURRENT_CONTRIBUTORS = contributors
        contributors.flatMap((elem) => addContributorToUI(ul, elem))
    }

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
    li.id = contrib.user_id
    li.textContent = contrib.user_id + ' (' + role + ')'
    ul.appendChild(li)
}

const checkIfObjectExists = (array, obj) => {
    if(!array){
        return false
    } else {
        return array.some(function(arrayObj) {
            // To compare new contributor with existing in settings
            // do not consider "id" of the exisiting contributor        
            let compareObject = (({ id, ...object }) => object)(arrayObj)
            return (compareObject.user_id ===  obj.user_id && compareObject.role ===  obj.role)      
        })
    }    
}
const addContributorToList = async (ul, contrib, compositionId, role) => {
    
    const newcontrib = { user_id: contrib, composition_id: compositionId, role: parseInt(role) }    
    const checkContribDuplicateInCurrent = checkIfObjectExists(CURRENT_CONTRIBUTORS,newcontrib)
    const checkContribDuplicateInNew = checkIfObjectExists(NEW_CONTRIBUTORS,newcontrib) 
   
    // #TODO: replace with API call to new endpoint to validate contributor
    const response = await fetch(ENDPOINT + '/user/' + contrib)    
    if(response && response.ok){                      
        if(!CURRENT_CONTRIBUTORS  || (!checkContribDuplicateInCurrent && !checkContribDuplicateInNew)){
            NEW_CONTRIBUTORS.push(newcontrib)
            // remove from UI if is there
            const contribListElem = document.getElementById(contrib)
            if(contribListElem){
                contribListElem.remove()
            }
            addContributorToUI(ul, newcontrib)
        }
    }
}

const updateSettings = async (method, api, data) => {

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

const saveButtonHandler = async (compId) => {
    const confirmSettingsButton = document.getElementById('updatecompositionbutton')
    confirmSettingsButton && confirmSettingsButton.addEventListener('click', async (e) => {
        const deleteComp = document.getElementById('deleteComposition').checked
        if (deleteComp === true) {
            await deleteComposition(compId)
        } else {
            const newtitle = document.getElementById('newtitle').value
            if (newtitle !== CURRENT_TITLE) {
                await updateTitle(compId, newtitle)
            }
            const newPrivacyLevel = document.querySelector('input[name="settingsPrivacyRadios"]:checked').value
            const privacy = parseInt(newPrivacyLevel)
            if (privacy !== CURRENT_PRIVACY) {
                await updatePrivacy(compId, privacy)
            }
            const newOpenToContrib = document.getElementById('opentocontribution').checked                        
            if ( newOpenToContrib !== CURRENT_OPENTOCONTRIB) {                
                await updateOpenToContrib(compId, newOpenToContrib)
            }

            if(NEW_CONTRIBUTORS.length > 0){
                let copy_new_contribs = [...NEW_CONTRIBUTORS]
                for (let i=0; i < NEW_CONTRIBUTORS.length; i++){                    
                    const newcontrib = NEW_CONTRIBUTORS[i]
                    const resultAddContrib = await updateSettings('POST', '/addcontributorbyid', newcontrib)                    
                    if(resultAddContrib && resultAddContrib.ok){
                        copy_new_contribs[i] = null                       
                    }                       
                }
                const noEmptyValues = copy_new_contribs.filter((value) => value != null)
                NEW_CONTRIBUTORS = noEmptyValues                        
            }            

            //if no changes or updates are successfully => close modal dialog
            $('#settingsModal').modal('hide')
        }
    })
}

const updateTitle = async (compId, newtitle) => {

    const data = { id: compId, title: newtitle }
    const resultNewTitle = await updateSettings('PATCH', '/updatecomptitle', data)
    if (resultNewTitle.ok) {
        CURRENT_TITLE = newtitle
        document.getElementById('comp-title').innerHTML = newtitle
    }
}
const updatePrivacy = async (compId, privacy) => {

    const data = { id: compId, privacy: privacy }
    const resultNewPrivacy = await updateSettings('PATCH', '/updateprivacy', data)
    if (resultNewPrivacy.ok) {
        CURRENT_PRIVACY = privacy
    }
}

const updateOpenToContrib = async (compId, newstatus) => {

    const data = { id: compId, opentocontrib: newstatus }
    const resultNewOpenToContrib = await updateSettings('PATCH', '/updatecomptocontrib', data)
    if (resultNewOpenToContrib.ok) {
        CURRENT_OPENTOCONTRIB = newstatus
    }
}

const deleteComposition = async (compId) => {
    const dialog = confirm('Delete ' + CURRENT_TITLE + '?')
    if (dialog) {
        const data = { id: compId }
        const resultDeleteComp = await updateSettings('DELETE', '/deletecomposition', data)        
        if (resultDeleteComp.ok) {
            window.location.href = window.location.origin
        }
    }
}