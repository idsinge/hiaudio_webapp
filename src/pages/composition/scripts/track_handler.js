import { ENDPOINT } from '../../../common/js/config'
import DynamicModal from '../../../common/js/modaldialog'
import { startLoader, cancelLoader, UserRole } from '../../../common/js/utils'
import { CURRENT_USER_ID } from './composition_helper'
import { playlist } from './composition'
import { createTrackInfoTable } from './trackinfo/trackinfo'

export class TrackHandler {
    displayOptMenuForNewTrack(newTrack){
        const element = newTrack.result
        const audio = element?.message?.audio || element?.message?.voice
        const title = audio.title || element.message.date
        const track_id = audio.file_unique_id
        const controlsList = document.getElementsByClassName('controls')
        let pos = 0
        let posFound = false
        while(!posFound && (pos < playlist.tracks.length)){
            if(playlist.tracks[pos].trackuid === newTrack.trackuid){
                posFound = true
            } else {
                pos ++
            }
        }
        if(posFound) {
            const customClass = { 
                name: title,
                track_id: track_id,
                user_id:audio.user_id,
                user_uid:audio.user_uid,
                composition_id: audio.composition_id
            }
            playlist.tracks[pos].customClass = customClass
            this.createMenuOptButton(controlsList, pos, title, track_id, UserRole.owner)
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
            if(arrayTracks[i]?.customClass){
                let userRole = role
                if (role === UserRole.member && arrayTracks[i].customClass.user_uid === CURRENT_USER_ID){
                    userRole = UserRole.owner
                }                
                const name = arrayTracks[i].customClass.name
                const track_id = arrayTracks[i].customClass.track_id
                this.createMenuOptButton(controlsList, i, name, track_id, userRole)
                
            }            
        }
    }
    createMenuOptButton(controlsList, pos, name, track_id, role){
        const menuBtnId = 'menuoptbtn-' + pos
        const menuDrpDownId = 'menuDropdown' + pos
        const buttonMenu = document.createElement('button')
        const txt = document.createTextNode('...')
        buttonMenu.className = 'menuoptbtn'
        buttonMenu.onclick = () => {
            document.getElementById(menuDrpDownId).classList.toggle('dropdown-show')
        }
        buttonMenu.id = menuBtnId
        buttonMenu.appendChild(txt)
        controlsList[pos].appendChild(buttonMenu)
        const listOptions = this.createListMenuOpt(menuDrpDownId, pos, name, track_id, role)
        document.getElementById(menuBtnId).appendChild(listOptions)
        const spanTitle = controlsList[pos].getElementsByClassName('track-header')[0].getElementsByTagName('span')[0]        
        spanTitle.style['margin-left'] = '3em'
    }
    createListMenuOpt(menuDrpDownId, pos, name, track_id, role){
        const listOptions = document.createElement('ul')
        listOptions.id = menuDrpDownId
        listOptions.className = 'dropdown-menu'        
        if ((role === UserRole.owner || role === UserRole.admin)){
            const deleteMenuOpt = this.createDeleteMenuOpt(pos, name, track_id)
            const downloadMenuOpt = this.createDownloadMenuOpt(track_id)
            listOptions.appendChild(deleteMenuOpt)
            listOptions.appendChild(downloadMenuOpt)
        }       
        const trackInfoMenuOpt = this.createTrackInfoMenuOpt(pos, name, track_id, role)        
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
    createDownloadMenuOpt(track_id){
        const downloadMenuOpt = document.createElement('li')
        downloadMenuOpt.className = 'dropdown-item btn-light'
        downloadMenuOpt.dataset.trackId = track_id
        downloadMenuOpt.onclick = (event) => {
            window.open( window.location.protocol+'//'+window.location.host+'/trackfile/'+track_id, '_blank')
        }
        downloadMenuOpt.appendChild(document.createTextNode('Download'))
        return downloadMenuOpt
    }
    createTrackInfoMenuOpt(pos, name, track_id, role){
        const trackInfoMenuOpt = document.createElement('li')
        trackInfoMenuOpt.className = 'dropdown-item btn-light'        
        trackInfoMenuOpt.dataset.target = '#trackInfoModal'
        trackInfoMenuOpt.dataset.toggle = 'modal'
        trackInfoMenuOpt.onclick = (event) => {            
            createTrackInfoTable(pos, name, track_id, role)            
        }              
        trackInfoMenuOpt.appendChild(document.createTextNode('Track Info'))
        return trackInfoMenuOpt
    }
    detectClickOutsideMenuOpt(){
        window.onclick = function(event) {
            const dropdownDisplayed = document.getElementsByClassName('dropdown-menu dropdown-show')           
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
            `Delete <span class="breakword"><i>${event.target.dataset.name}</i></span> ?`,
            'btn-delete-track',
            'OK',
            'Cancel',
            'Delete Track',
            'bg-danger'
        )
        document.getElementById('btn-delete-track').onclick = () => {
            callback(event.target.dataset.pos, event.target.dataset.trackId, afterCallback)
            DynamicModal.closeDynamicModal()
        }
    }
    sendDeleteRequest(pos,  track_id, doAfterDeleted) {
        startLoader('Deleting track...')
        fetch(ENDPOINT+'/deletetrack/' + track_id, {
            method: 'DELETE',
        }).then(res => res.json()).then(res => {
            doAfterDeleted(res, pos)
        }).catch(err =>{
            console.log(err)
            cancelLoader()
        })       
    }
    doAfterDeleted(deleteTrackResult, pos) {
        cancelLoader()
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
