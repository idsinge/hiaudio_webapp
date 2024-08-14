import { ENDPOINT } from '../../../common/js/config'
import DynamicModal from '../../../common/js/modaldialog'
import { LOADER_ELEM_ID, startLoader, cancelLoader, isSafari } from '../../../common/js/utils'
import { CURRENT_USER_ID } from './composition_helper'
import { playlist } from './composition'
import { createTrackInfoTable } from './trackinfo/trackinfo'

export class TrackHandler {
    displayOptMenuForNewTrack(newTrack){
        console.log('newTrack' ,newTrack)
        //console.log(newTrack)
        const element = newTrack.result
        const audio = element?.message?.audio || element?.message?.voice
        const title = audio.title || element.message.date
        const track_id = audio.file_unique_id 
        const controlsList = document.getElementsByClassName('controls')
        //console.log(controlsList)
        //console.log(playlist.tracks)
        //let pos = controlsList.length - 1 
        //if(pos>=0){
        // TODO: before using the pos, check if it's valid
        // as some tracks may have been deleted
        //const pos = newTrack.trackpos
        //console.log(playlist.tracks)
        let pos = 0
        let posFound = false
        while(!posFound && (pos < playlist.tracks.length)){                  
            if(playlist.tracks[pos].trackuid === newTrack.trackuid){
                console.log(playlist.tracks[pos].name + ' at ' + pos)
                posFound = true
            } else {
                pos ++
            }
        }
        
        //const pos = playlist.tracks.findIndex((obj) => obj.trackuid === newTrack.trackuid )
     
        //console.log(title + ' at ' + pos)
        if(posFound) {
            const customClass = { name: title, track_id: track_id, user_id:audio.user_id, user_uid:audio.user_uid, composition_id: audio.composition_id }
            playlist.tracks[pos].customClass = customClass            
            this.createMenuOptButton(controlsList, pos, title, track_id)
        }
        //}
        
    }
    displayOptMenuForTracks(role) {
        const menuBtns = document.querySelectorAll('.menuoptbtn')
        if(menuBtns.length){
            document.querySelectorAll('.menuoptbtn').forEach(e => e.remove())
        }
        const controlsList = document.getElementsByClassName('controls')
        const arrayTracks = playlist.getInfo().tracks

        for (let i = 0; i < arrayTracks.length; i++) {
            if(arrayTracks[i]?.customClass){                
                if ((role === 1 || role === 2)||(role === 3 && arrayTracks[i].customClass.user_uid === CURRENT_USER_ID)){                   
                    const name = arrayTracks[i].customClass.name
                    const track_id = arrayTracks[i].customClass.track_id
                    this.createMenuOptButton(controlsList, i, name, track_id)
                }                
            }            
        }
    }
    createMenuOptButton(controlsList, pos, name, track_id){
        console.log('createMenuOptButton', name)
        const menuBtnId = 'menuoptbtn-' + pos
        const menuDrpDownId = 'menuDropdown' + pos
        const buttonMenu = document.createElement('button')
        const txt = document.createTextNode('...')
        buttonMenu.className = 'menuoptbtn'
        buttonMenu.onclick = () => {
            document.getElementById(menuDrpDownId).classList.toggle('show')
        }
        buttonMenu.id = menuBtnId
        buttonMenu.appendChild(txt)
        controlsList[pos].appendChild(buttonMenu)
        const listOptions = this.createListMenuOpt(menuDrpDownId, pos, name, track_id)
        document.getElementById(menuBtnId).appendChild(listOptions)
        const spanTitle = controlsList[pos].getElementsByClassName('track-header')[0].getElementsByTagName('span')[0]        
        spanTitle.style['margin-left'] = '3em'
    }
    createListMenuOpt(menuDrpDownId, pos, name, track_id){
        const listOptions = document.createElement('ul')
        listOptions.id = menuDrpDownId
        listOptions.className = 'dropdown-menu'        
        const deleteMenuOpt = this.createDeleteMenuOpt(pos, name, track_id)
        const trackInfoMenuOpt = this.createTrackInfoMenuOpt(pos, name, track_id)        
        listOptions.appendChild(deleteMenuOpt)
        listOptions.appendChild(trackInfoMenuOpt)
        return listOptions
    }
    createDeleteMenuOpt(pos, name, track_id){
        const deleteMenuOpt = document.createElement('li')
        deleteMenuOpt.className = 'dropdown-item btn-light'        
        deleteMenuOpt.dataset.pos = pos
        deleteMenuOpt.dataset.name = name
        deleteMenuOpt.dataset.trackId = track_id
        deleteMenuOpt.onclick = (event) => {
            this.deleteTrackConfirmDialog(event, this.sendDeleteRequest, this.doAfterDeleted)
        }
        deleteMenuOpt.appendChild(document.createTextNode('Delete'))
        return deleteMenuOpt
    }
    createTrackInfoMenuOpt(pos, name, track_id){
        const trackInfoMenuOpt = document.createElement('li')
        trackInfoMenuOpt.className = 'dropdown-item btn-light'        
        trackInfoMenuOpt.dataset.target = '#trackInfoModal'
        trackInfoMenuOpt.dataset.toggle = 'modal'
        trackInfoMenuOpt.onclick = (event) => {            
            createTrackInfoTable(pos, name, track_id)            
        }              
        trackInfoMenuOpt.appendChild(document.createTextNode('Track Info'))
        return trackInfoMenuOpt
    }
    detectClickOutsideMenuOpt(){
        window.onclick = function(event) {
            const dropdownDisplayed = document.getElementsByClassName('dropdown-menu show')           
            if((dropdownDisplayed.length > 0) && (event.target.className!=='menuoptbtn')){                
                Array.from(dropdownDisplayed).forEach(function(item) {
                    item.className = 'dropdown-menu'
                })
            } else {
                if(dropdownDisplayed.length > 1){                    
                    Array.from(dropdownDisplayed).forEach(function(item) {                        
                        if(!event.target.contains(item)){
                            item.className = 'dropdown-menu'
                        }                        
                    })
                }                
            }
        }
    }
    deleteTrackConfirmDialog(event, callback, afterCallback) {       
        DynamicModal.dynamicModalDialog(
            'Delete ' + event.target.dataset.name + '?',
            'btn-delete-track',
            'OK',
            'Cancel',
            'Delete Track',
            'bg-warning'
        )
        document.getElementById('btn-delete-track').onclick = () => {
            callback(event.target.dataset.pos, event.target.dataset.trackId, afterCallback)
            DynamicModal.closeDynamicModal()
        }
    }
    sendDeleteRequest(pos,  track_id, doAfterDeleted) {
        startLoader(LOADER_ELEM_ID, 'Deleting track...')
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
