import { ENDPOINT } from '../../js/config'
import { startLoader, cancelLoader, CURRENT_USER_ID } from './composition_helper'
import { COMPOSITION_ID, LOADER_ELEM_ID, playlist } from './composition'

export class TrackHandler {
    displayOptMenuForNewTrack(newTrack){        
        const element = newTrack.result
        const audio = element?.message?.audio || element?.message?.voice
        const title = audio.title || element.message.date
        // const track_id = audio.file_unique_id + '_' + element.message.date
        const track_id = audio.file_unique_id 
        const controlsList = document.getElementsByClassName('controls')
        const message_id = element.message.message_id
        let pos = controlsList.length - 1 
        if(pos>=0){
            const customClass = { name: title, track_id: track_id, user_id:audio.user_id}
            playlist.tracks[pos].customClass = customClass            
            this.createMenuOptButton(controlsList, pos, message_id, title, track_id, COMPOSITION_ID)
        }
        
    }
    displayOptMenuForTracks(role) {
        const menuBtns = document.querySelectorAll('.menuoptbtn')
        if(menuBtns.length){
            document.querySelectorAll('.menuoptbtn').forEach(e => e.remove())
        }
        const controlsList = document.getElementsByClassName('controls')
        const arrayTracks = playlist.getInfo().tracks

        for (let i = 0; i < arrayTracks.length; i++) {
            if(arrayTracks && arrayTracks[i].customClass){                
                if ((role === 1 || role === 2)||(role === 3 && arrayTracks[i].customClass.user_id === CURRENT_USER_ID)){                   
                    const message_id = arrayTracks[i].customClass.message_id
                    const name = arrayTracks[i].customClass.name
                    const track_id = arrayTracks[i].customClass.track_id
                    const chatId = arrayTracks[i].customClass.chatId
                    this.createMenuOptButton(controlsList, i, message_id, name, track_id, chatId)
                }                
            }            
        }
    }
    createMenuOptButton(controlsList, pos, message_id, name, track_id, chatId){
        const menuBtnId = 'menuoptbtn-' + pos
        const menuDrpDownId = 'menuDropdown' + pos
        const span = document.createElement('span')
        const txt = document.createTextNode('...')
        span.className = 'menuoptbtn'
        span.onclick = () => {
            document.getElementById(menuDrpDownId).classList.toggle('show')
        }
        span.id = menuBtnId
        span.appendChild(txt)
        controlsList[pos].appendChild(span)
        const listOptions = document.createElement('ul')
        listOptions.id = menuDrpDownId
        listOptions.className = 'dropdown-content'
        const listOptionsItem = document.createElement('li')
        listOptionsItem.id = message_id
        listOptionsItem.dataset.pos = pos
        listOptionsItem.dataset.name = name
        listOptionsItem.dataset.trackId = track_id
        listOptionsItem.dataset.chatId = chatId
        listOptionsItem.onclick = (event) => {
            this.deleteTrackConfirmDialog(event, this.sendDeleteRequest, this.doAfterDeleted)
        }
        listOptionsItem.appendChild(document.createTextNode('Delete'))
        listOptions.appendChild(listOptionsItem)
        document.getElementById(menuBtnId).appendChild(listOptions)
    }
    deleteTrackConfirmDialog(event, callback, afterCallback) {       
        const dialog = confirm('Delete ' + event.target.dataset.name + '?')
        if (dialog) {
            callback(event.target.dataset.pos, event.target.dataset.trackId, afterCallback)
        }
    }
    sendDeleteRequest(pos,  track_id, doAfterDeleted) {
        startLoader(LOADER_ELEM_ID)
        fetch(ENDPOINT+'/deletetrack/' + track_id, {
            method: 'DELETE',
        }).then(res => res.json()).then(res => {
            doAfterDeleted(res, pos)
        }).catch(err =>{
            console.log(err)
            cancelLoader(LOADER_ELEM_ID)
        })       
    }
    doAfterDeleted(deleteTrackResult, pos) {
        cancelLoader(LOADER_ELEM_ID)
        if (deleteTrackResult.ok) {
            const role = deleteTrackResult.role
            const arrayTracks = playlist.tracks            
            const ee = playlist.getEventEmitter()
            ee.emit('removeTrack', arrayTracks[pos])
            const trackHandler = new TrackHandler()
            trackHandler.displayOptMenuForTracks(role)
        }
    }
}
