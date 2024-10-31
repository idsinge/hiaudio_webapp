import { updateSettings } from '../settings'

let CURRENT_ISTEMPLATE = null

export const getCompAsTemplate = () => {
    return CURRENT_ISTEMPLATE
}

export const setCompAsTemplate = (status) => {
    CURRENT_ISTEMPLATE = status
    const checkbox = document.getElementById('markastemplatebtn')
    checkbox.checked = status
}

export const saveCompAsTemplate = async (compId) => {
    const newCompAsTemplate = document.getElementById('markastemplatebtn').checked
    if (newCompAsTemplate !== CURRENT_ISTEMPLATE) {
        await updateCompAsTemplate(compId, newCompAsTemplate)
    }
}

export const changeCompAsTemplate = (newstate) => {
    const compastemplatecheckbox = document.getElementById('markastemplatebtn')
    if (newstate === 0) {
        compastemplatecheckbox.checked = false
        compastemplatecheckbox.disabled = true
    } else {
        compastemplatecheckbox.disabled = false
    }
}

const updateCompAsTemplate = async (compId, newstatus) => {

    const data = { uuid: compId, is_template: newstatus }
    const resultNewCompAsTemplate = await updateSettings('PATCH', '/updatecompastemplate', data)
    if (resultNewCompAsTemplate.ok) {
        CURRENT_ISTEMPLATE = newstatus
        if (newstatus) {
            document.getElementById('btn-clone-container').hidden = false
        } else {
            document.getElementById('btn-clone-container').hidden = true
        }
    }
}