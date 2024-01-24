import { startLoader, cancelLoader, callJsonApi } from '../../../common/js/utils'
import { playlist } from './composition'

let EDIT_STATUS = false
let CURRENT_TRACKINFO = null
let CURRENT_TRACKPOS = null
let CURRENT_TRACKID = null

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

const renderTable = async (trackinfo, currenttrackname) => {
    cancelLoader('trackinfoloader')
    const tableContainer = document.getElementById('trackinfotablebody')
    let html = ''
    if (trackinfo) {
        for (const key in trackinfo) {
            html += `<tr><th scope='row'>${key}</th><td contenteditable='false' data-key=${key}>${trackinfo[key]}</td></tr>`
        }       
    } else {
        html += `<tr><th scope='row'>title</th><td data-key='title'>${currenttrackname}</td></tr>`        
    }
    tableContainer.innerHTML = html
}

const clickCancelButtonHandler = () => {
    const tableContainer = document.getElementById('trackinfotablebody')
    tableContainer.innerHTML = ''    
}

const cancelButtonHandler = () => {
    const cancelTrackInfoButton = document.getElementById('canceltrackinfobutton')
    cancelTrackInfoButton?.addEventListener('click', () => { clickCancelButtonHandler() })
}

const saveButtonHandler = async () => {
    const confirmTrackInfoButton = document.getElementById('updatetrackinfobutton')
    confirmTrackInfoButton?.addEventListener('click', async (e) => {

        const editedObject = {}
        document.querySelectorAll('td[contenteditable]').forEach(cell => {
            editedObject[cell.getAttribute('data-key')] = cell.innerText
        })
        if (JSON.stringify(CURRENT_TRACKINFO) !== JSON.stringify((editedObject))) {
            // TODO: before sending all annotations, 
            // check if the title has changed or not to send it with the other attributes
            // so we avoid an update title in Tracks table
            // if the title has not changed then is not sent
            //if(editedObject.title === CURRENT_TRACKINFO.title){     
            //    delete editedObject.title
            //}        
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
        CURRENT_TRACKINFO = objEdited
        playlist.tracks[CURRENT_TRACKPOS].name = CURRENT_TRACKINFO.title
        const menuBtnItem = document.querySelectorAll(`[data-track-id='${CURRENT_TRACKID}']`)
        if(menuBtnItem.length === 1){
            menuBtnItem[0].dataset.name = CURRENT_TRACKINFO.title
        }        
        const ee = playlist.getEventEmitter()
        ee.emit('updateview')
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

    document.querySelectorAll(`td[contenteditable='false']`).forEach(cell => {
        cell.contentEditable = true
        cell.classList.add('italic')
    })
}

const disableEdition = () => {

    document.querySelectorAll(`td[contenteditable='true']`).forEach(cell => {
        cell.contentEditable = false
        cell.classList.remove('italic')
    })
}