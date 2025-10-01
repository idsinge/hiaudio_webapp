import { startLoader, cancelLoader, callJsonApi, UserRole } from '../../../../common/js/utils'
import DynamicModal  from '../../../../common/js/modaldialog'
import { playlist } from '../composition'

let EDIT_STATUS = false
let CURRENT_TRACKINFO = null
let CURRENT_TRACKPOS = null
let CURRENT_TRACKID = null
let RESERVED_KEYS = null

const META_DATA_KEYS = [
    'bit_rate',
    'bits_per_sample',
    'channel_layout',
    'channels',
    'codec_long_name',
    'codec_name',
    'duration',
    'format_long_name',
    'format_name',
    'probe_score',
    'sample_rate',
    'sample_fmt',
    'uploading_date',
    'RMS',
    'size']

const editButton = document.getElementById('edittrackinfobutton')
const buttonCreateNew = document.getElementById('btn-add-new-annot')
const trackinfoModalFooter = document.getElementById('trackinfo-modal-footer')

export const trackInfoHandler = () => {
    saveButtonHandler()
    cancelButtonHandler()
    createNewAnnotationBtnHandler()
    editButton.addEventListener('click', clickEditButtonHandler, false)
}

export const createTrackInfoTable = async (trackpos, trackname, trackid, role) => {
    EDIT_STATUS = false    
    CURRENT_TRACKPOS = trackpos
    CURRENT_TRACKID = trackid
    editButton.innerText = 'Edit'
    startLoader('Loading track info...')
    const data = await callJsonApi('/getinfotrack/' + trackid, 'GET')    
    handleUIeditMode(role)
    if (typeof data === 'object') {
        CURRENT_TRACKINFO = data
        renderTables(data, null)
    } else {
        DynamicModal.dynamicModalDialog(
            'Error getting track info', 
            null, 
            '',
            'Close',
            'Error',
            'bg-danger'
        )
        renderTables(null, trackname)
    }
}

const handleUIeditMode = (role) => {
    if(role !== UserRole.owner && role !== UserRole.admin){
        editButton.hidden = true
        buttonCreateNew.hidden = true
        trackinfoModalFooter.hidden = true
    } else {
        editButton.hidden = false
        buttonCreateNew.hidden = false
        trackinfoModalFooter.hidden = false
    }
}

const createNewAnnotationBtnHandler = () => {
    buttonCreateNew.onclick = () => {
        const uniqueId = Date.now()
        const tableContainer = document.getElementById('trackinfotablebody')
        const html = `<tr class="linebreak"><th id='key-edit-${uniqueId}' contenteditable='true' scope='row'></th>
        <td contenteditable='true' data-key=''></td>
        <td id='btn-rem-${uniqueId}' class='delete-row' data-key=''>&nbsp;<i class="fa fa-trash text-danger"></i></td>
        </tr>`
        tableContainer.insertAdjacentHTML('beforeend', html)
        if(!EDIT_STATUS){
            editButton.click()
        }
        const editKeyField = document.getElementById('key-edit-'+uniqueId)
        editKeyField.addEventListener('input', function () {
            const nextTD1 = editKeyField.parentNode.children[1]
            nextTD1.dataset.key = editKeyField.innerText
            const nextTD2 = editKeyField.parentNode.children[2]
            nextTD2.dataset.key = editKeyField.innerText
        })
        const btnRmRow = document.getElementById('btn-rem-'+uniqueId)
        btnRmRow.onclick = () => { deleteRow(btnRmRow) }
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

const getMetadataFromResp = (resp) => {
    let html = `<tr><th scope='row'>track_uuid</th><td data-key='track_uuid'>${CURRENT_TRACKID}</td></tr>`
    if(resp['file_metadata']){
        const meta_data = resp['file_metadata']
        for(const prop of META_DATA_KEYS){
            html += `<tr><th scope='row'>${prop}</th><td data-key='${prop}'>${meta_data[prop]}</td></tr>`
        }
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

const renderTables = async (trackinfo, currenttrackname) => {
    cancelLoader()
    const annotationsTableContainer = document.getElementById('trackinfotablebody')
    const metadataTableContainer = document.getElementById('metadatatablebody')
    let html_annotations = ''
    let html_metadata = ''
    if (trackinfo) {
        document.getElementById('audio-pending-analysis').hidden = trackinfo?.is_audio_processed
        RESERVED_KEYS = getReservedKeysFromResp(trackinfo)
        html_annotations += getTitleFromResp(trackinfo)
        html_annotations += getAnnotationsFromResp(trackinfo)
        html_metadata += getMetadataFromResp(trackinfo)
    } else {
        html_annotations += `<tr><th scope='row'>title</th><td data-key='title' class='linebreak'>${currenttrackname}</td></tr>`
    }
    annotationsTableContainer.innerHTML = html_annotations
    metadataTableContainer.innerHTML = html_metadata
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
    DynamicModal.dynamicModalDialog(
        'Delete: '+ '<b>'+row.dataset.key+'</b>'+ ' ?', 
        'btn-delete-row', 
        'Delete',
        'Cancel',
        'Warning',
        'bg-warning'
    )
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
            else if(cell.innerText !== '' || (keyId !== '' && !RESERVED_KEYS.includes(keyId))){
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
            startLoader('Updating track info...')
            const bodyrqst = {trackid:CURRENT_TRACKID}
            const data = await callJsonApi('/updatetrackinfo', 'PATCH', {...editedObject, ...bodyrqst})
            handleUpdatetrackInfo(data, editedObject)
            cancelLoader()
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
    } else if(data?.errors || typeof data === 'string'){
        let messages = ''
        if(data.errors){
            data.errors.forEach(str => {
                messages += str + '. '
            })
        } else {
            messages = data
        }        
        DynamicModal.dynamicModalDialog(
            'Error updating track info: ' + messages, 
            null, 
            '',
            'Close',
            'Error',
            'bg-danger'
        )
    } else {
        DynamicModal.dynamicModalDialog(
            'Unexpected error happened when updating track info', 
            null, 
            '',
            'Close',
            'Error',
            'bg-danger'
        )
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