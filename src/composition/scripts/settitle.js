import {updateSettings} from './settings'

let CURRENT_TITLE = null

export const getCurrentTitle = () => {
    return CURRENT_TITLE
}
export const setUITitle = (title) => {
    CURRENT_TITLE = title
    const textfield = document.getElementById('newtitle')
    textfield.value = title
}

export const saveTitle = async (compId) => {
    const newtitle = document.getElementById('newtitle').value
    if (newtitle !== CURRENT_TITLE) {
        await updateTitle(compId, newtitle)
    }
}

const updateTitle = async (compId, newtitle) => {

    const data = { uuid: compId, title: newtitle }
    const resultNewTitle = await updateSettings('PATCH', '/updatecomptitle', data)
    if (resultNewTitle.ok) {
        CURRENT_TITLE = newtitle
        document.getElementById('comp-title').innerHTML = newtitle
    }
}