import { ENDPOINT } from '../js/config'

let CURRENT_TITLE = null
let CURRENT_PRIVACY = null

export const enableCompositionSettings = (tracksInfo) => {
    setUIContributors(tracksInfo.contributors, tracksInfo.id)
    setUITitle(tracksInfo.title)
    setUIPrivacy(tracksInfo.privacy)
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
    const resultAddContrib = await updateSettings('/addcontributor', data)
    if (resultAddContrib && resultAddContrib.ok) {
        addContributorToUI(ul, contrib)
    } else {
        console.log(resultAddContrib)
    }

}

const updateSettings = async (method, data) => {
    
    let body = JSON.stringify(data)
    let errorIs = null
    let response = null
    const request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: body
    }
    try {
        const sendRqst = await fetch(ENDPOINT + method, request)
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

const confirmSettingsButton = document.getElementById('updatecompositionbutton')
confirmSettingsButton && confirmSettingsButton.addEventListener('click', (e) => {

    const newtitle = document.getElementById('newtitle').value

    if (newtitle !== CURRENT_TITLE) {
        console.log('new title', newtitle)
        // updateSettings
        // CURRENT_TITLE = null
    }

    const newPrivacyLevel = document.querySelector('input[name="settingsPrivacyRadios"]:checked').value

    if (parseInt(newPrivacyLevel) !== CURRENT_PRIVACY) {
        console.log('new privacy', newPrivacyLevel)
        // updateSettings
        // CURRENT_PRIVACY = null
    }

    //if no changes or updates are successfully => close modal dialog
    $('#settingsModal').modal('hide')
})
