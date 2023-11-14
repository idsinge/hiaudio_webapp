import {updateSettings} from '../settings'
import {changeOpenToContrib} from './setopentocontrib'

let CURRENT_PRIVACY = null

export const getPrivacyLevel = () => {
    return CURRENT_PRIVACY
}

export const privateRadioButtonHandler = () => {

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

export const setUIPrivacy = (privacyLevel) => {
    CURRENT_PRIVACY = privacyLevel
    const radiobtn = document.getElementById('settingsPrivacyRadios' + privacyLevel)
    radiobtn.checked = true
    if(privacyLevel === 3){
        changeOpenToContrib(0)
    }
}

export const savePrivacyLevel = async (compId) => {
    const newPrivacyLevel = document.querySelector('input[name="settingsPrivacyRadios"]:checked').value
    const privacy = parseInt(newPrivacyLevel)
    if (privacy !== CURRENT_PRIVACY) {
        await updateCompPrivacy(compId, privacy)
    }
}

const updateCompPrivacy = async (compId, privacy) => {

    const data = { uuid: compId, privacy: privacy }
    const resultNewPrivacy = await updateSettings('PATCH', '/updatecompprivacy', data)
    if (resultNewPrivacy.ok) {
        CURRENT_PRIVACY = privacy
    }
}