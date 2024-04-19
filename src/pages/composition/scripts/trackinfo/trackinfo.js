import { startLoader, cancelLoader, callJsonApi } from '../../../../common/js/utils'
import DynamicModal  from '../../../../common/js/modaldialog'
import { playlist } from '../composition'

let EDIT_STATUS = false
let CURRENT_TRACKINFO = null
let CURRENT_TRACKPOS = null
let CURRENT_TRACKID = null
let RESERVED_KEYS = null

const editButton = document.getElementById('edittrackinfobutton')

export const trackInfoHandler = () => {
    saveButtonHandler()
    cancelButtonHandler()
    editButton.addEventListener('click', clickEditButtonHandler, false)
}

export const createTrackInfoTable = async (trackpos, trackname, trackid) => {
    EDIT_STATUS = false    
    CURRENT_TRACKPOS = trackpos
    CURRENT_TRACKID = trackid
    editButton.innerText = 'Edit'
    startLoader('trackinfoloader', 'Loading track info...')
    const data = await callJsonApi('/getinfotrack/' + trackid, 'GET')
    if (typeof data === 'object') {
        CURRENT_TRACKINFO = data
        renderTable(data, null)
    } else {
        alert('Error getting track info')
        renderTable(null, trackname)
    }
}

const getTitleFromResp = (resp) => {
    let html = ''
    if (resp['title']) {
        html += `<tr><th scope='row'>title</th><td contenteditable='false' data-key='title'>${resp['title']}</td></tr>`
    }
    return html
}

const checkKeys = (objArray, wordsArray) => {
    const missingKeys = []    
    wordsArray.forEach(word => {
        if (!objArray.some(obj => obj.key === word)) {            
            missingKeys.push(word)
        }
    })
    return missingKeys
}

const createReservedKeysSection = (reservedkeys) => {
    let html = ''
    for(const pos in reservedkeys){
        if(reservedkeys[pos] !== 'title'){
            html += `<tr><th scope='row'>${reservedkeys[pos]}</th><td contenteditable='false' data-key='${reservedkeys[pos]}'></td></tr>`
        }        
    }
    return html
}
const getAnnotationsFromResp = (resp) => {
    let html = ''
    if (resp['annotations']) {
        const missingKeys = checkKeys(resp['annotations'], RESERVED_KEYS)
        html += createReservedKeysSection(missingKeys)
        html += createAnnotationsSection(resp['annotations'])
    }
    return html
}

const getReservedKeysFromResp = (resp) => {
    if (resp['reserved_keys']) {
        return resp['reserved_keys']
    } else {
        return null
    }
}

const renderTable = async (trackinfo, currenttrackname) => {
    cancelLoader('trackinfoloader')
    const tableContainer = document.getElementById('trackinfotablebody')
    let html = ''
    if (trackinfo) {
        RESERVED_KEYS = getReservedKeysFromResp(trackinfo)
        html += getTitleFromResp(trackinfo)
        html += getAnnotationsFromResp(trackinfo)
    } else {
        html += `<tr><th scope='row'>title</th><td data-key='title' class='linebreak'>${currenttrackname}</td></tr>`
    }
    tableContainer.innerHTML = html
}

const createAnnotationsSection = (annnotations) => {
    let html = ''
    for (const pos in annnotations) {
        const annotation = annnotations[pos]
        html += `<tr class="linebreak"><th ${annotation.custom_added ? "contenteditable='false'" : ''} scope='row'>${annotation.key}</th>
        <td contenteditable='false' data-key='${annotation.key}' data-uuid='${annotation.uuid}'>${annotation.value}</td>
        <td class='delete-row' data-key='${annotation.key}' data-uuid='${annotation.uuid}' hidden>${annotation.custom_added ? `&nbsp;<i class="fa fa-trash text-danger"></i>` : ''}</td>
        </tr>`
    }
    return html
}

const deleteRow = (row) => {
    DynamicModal.dynamicModalDialog('Delete: '+ '<b>'+row.dataset.key+'</b>'+ ' ?', 'btn-delete-row', 'Delete')
    document.getElementById('btn-delete-row').onclick = ()=>{
        doRowDeletion(row)
    }
}

const doRowDeletion = async (row) => {    
    const uuid = row.dataset.uuid
    if(uuid){
        const data = await callJsonApi('/deleteannotation/' + uuid, 'DELETE')
        if (typeof data === 'object') {
            row.parentNode.remove()
        }
    }
    else {
        console.log('NO UUID')
        row.parentNode.remove()
    }
    DynamicModal.closeDynamicModal()
}

const clickCancelButtonHandler = () => {
    const tableContainer = document.getElementById('trackinfotablebody')
    tableContainer.innerHTML = ''    
}

const cancelButtonHandler = () => {
    const cancelTrackInfoButton = document.getElementById('canceltrackinfobutton')
    cancelTrackInfoButton?.addEventListener('click', () => { clickCancelButtonHandler() })
}

const checkIfCellWasEdited = (cell) => {
    const uuid = cell.getAttribute('data-uuid')
    const newkey = cell.getAttribute('data-key')
    const newvalue = cell.innerText
    const current_annot = CURRENT_TRACKINFO.annotations.find(annotation => annotation.uuid === uuid)
    const editedObj = {}

    if (uuid && !RESERVED_KEYS.includes(current_annot.key) && !RESERVED_KEYS.includes(newkey)) {
        if (current_annot.key !== newkey) {
            editedObj.key = newkey
        }
    }
    if (current_annot.value !== newvalue) {
        editedObj.value = newvalue
    }
    if (Object.keys(editedObj).length > 0) {
        editedObj.uuid = uuid
    }
    return editedObj
}

const getEditedFields = () => {
    const editedObject = {}
    editedObject.annotations = []
    document.querySelectorAll('td[contenteditable]').forEach(cell => {
        if (cell.getAttribute('data-uuid')) {
            const editedObj = checkIfCellWasEdited(cell)
            if (Object.keys(editedObj).length > 0) {
                editedObject.annotations.push(editedObj)
            }
        } else {

            const keyId = cell.getAttribute('data-key')

            if(keyId === 'title'){
                if (CURRENT_TRACKINFO[keyId] !== cell.innerText) {
                    editedObject[keyId] = cell.innerText
                } 
            }
            else if(cell.innerText !== ''){
                if(!editedObject.annotations){
                    editedObject.annotations = []
                }
                editedObject.annotations.push({key:keyId, value:cell.innerText})
            }
        }
    })
    return editedObject
}

const saveButtonHandler = async () => {
    const confirmTrackInfoButton = document.getElementById('updatetrackinfobutton')
    confirmTrackInfoButton?.addEventListener('click', async (e) => {
        const editedObject = getEditedFields()
        if (editedObject.title || editedObject.annotations.length > 0) {
            startLoader('trackinfoloader', 'Updating track info...')
            const bodyrqst = {trackid:CURRENT_TRACKID}
            const data = await callJsonApi('/updatetrackinfo', 'PATCH', {...editedObject, ...bodyrqst})
            handleUpdatetrackInfo(data, editedObject)
            cancelLoader('trackinfoloader')
        }
        $('#trackInfoModal').modal('hide')
    })
}

const handleUpdatetrackInfo = (data, objEdited) => {
    if (typeof data === 'object' && data.ok) {
        if (objEdited?.title) {
            playlist.tracks[CURRENT_TRACKPOS].name = objEdited.title
            const menuBtnItem = document.querySelectorAll(`[data-track-id='${CURRENT_TRACKID}']`)
            if (menuBtnItem.length === 1) {
                menuBtnItem[0].dataset.name = objEdited.title
            }
            const ee = playlist.getEventEmitter()
            ee.emit('updateview')
        }
    } else {
        alert('Error updating track info: ' + data)
    }
}

const clickEditButtonHandler = () => {

    if (EDIT_STATUS) {
        EDIT_STATUS = false
        editButton.innerText = 'Edit'
        disableEdition()
    } else {
        EDIT_STATUS = true
        editButton.innerText = 'Done'
        enableEdition()
    }
}

const enableEdition = () => {

    document.querySelectorAll(`*[contenteditable='false']`).forEach(cell => {

        cell.contentEditable = true
        cell.classList.add('italic')
        if (cell.tagName === 'TH') {
            cell.addEventListener('input', function () {
                const nextTD = cell.parentNode.children[1]
                nextTD.dataset.key = cell.innerText
            })
            const nextTD = cell.parentNode.lastElementChild
            if (nextTD.classList.contains('delete-row')) {
                nextTD.hidden = false
                nextTD.onclick = () => { deleteRow(nextTD) }
            }
        }
    })
}

const disableEdition = () => {

    document.querySelectorAll(`*[contenteditable='true']`).forEach(cell => {
        cell.contentEditable = false
        cell.classList.remove('italic')
        if (cell.tagName === 'TH') {
            const nextTD = cell.parentNode.lastElementChild
            if (nextTD.classList.contains('delete-row')) {
                nextTD.hidden = true
            }
        }
    })
}