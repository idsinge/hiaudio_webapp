import {updateSettings} from '../settings'

let CURRENT_DESCRIPTION = null

export const getCurrentDescription = () => {
    return CURRENT_DESCRIPTION
}
export const setUIDescription = (description) => {
    CURRENT_DESCRIPTION = description
    const textfield = document.getElementById('newdescription')
    textfield.value = description
}

export const saveDescription = async (compId) => {
    const newdescription= document.getElementById('newdescription').value
    if (newdescription !== CURRENT_DESCRIPTION) {
        await updateDescription(compId, newdescription)
    }
}

const updateDescription = async (compId, newdescription) => {

    const data = { uuid: compId, description: newdescription }
    const resultNewDescription = await updateSettings('PATCH', '/updatecompdescription', data)
    if (resultNewDescription.ok) {
        CURRENT_DESCRIPTION = newdescription
        document.getElementById('comp-description').innerHTML = newdescription
        document.getElementById('clonedescription').value = newdescription + ' (Copy)'
    }
}