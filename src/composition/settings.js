import { ENDPOINT } from '../js/config'

let CURRENT_TITLE = null
let CURRENT_PRIVACY = null

export const enableCompositionSettings = (tracksInfo) => {
    setUIContributors(tracksInfo.contributors, tracksInfo.id)
    setUITitle(tracksInfo.title)
    setUIPrivacy(tracksInfo.privacy)
    saveButtonHandler(tracksInfo.id)
    document.getElementById('useroptions').innerHTML = `<li class="nav-item">
    <a class="nav-link" href="#" data-toggle="modal" data-target="#settingsModal">Settings</a>
  </li>
   `
}

const setUIPrivacy = (privacyLevel) => {
    CURRENT_PRIVACY = privacyLevel
    const radiobtn = document.getElementById('settingsPrivacyRadios' + privacyLevel)
    radiobtn.checked = true
}

const setUITitle = (title) => {
    CURRENT_TITLE = title
    const textfield = document.getElementById('newtitle')
    textfield.value = title
}
const setUIContributors = (contributors, compositionId) => {

    const button = document.getElementById('addContribButton')
    const input = document.getElementById('contributorinput')
    const ul = document.getElementById('listOfContributors')

    if (contributors.length) {
        contributors.flatMap((elem) => addContributorToUI(ul, elem.user_id))
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
    const li = document.createElement('li')
    li.className = 'list-group-item'
    li.textContent = contrib
    ul.appendChild(li)
}

const addContributorToList = async (ul, contrib, compositionId, role) => {

    const data = { email: contrib, composition_id: compositionId, role: parseInt(role) }
    const resultAddContrib = await updateSettings('POST', '/addcontributor', data)
    if (resultAddContrib && resultAddContrib.ok) {
        addContributorToUI(ul, contrib)
    }
}

const updateSettings = async (method, api, data) => {

    let body = JSON.stringify(data)
    let errorIs = null
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
        errorIs = error
        alert(error)
    }
    return response
}

const saveButtonHandler = (compId) => {
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