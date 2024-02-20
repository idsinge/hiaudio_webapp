import {updateSettings} from '../settings'

let CURRENT_OPENTOCONTRIB = null

export const getOpenToContrib = () => {
    return CURRENT_OPENTOCONTRIB
}

export const setOpenToContrib = (status) => {     
    CURRENT_OPENTOCONTRIB = status   
    const checkbox = document.getElementById('opentocontribution')
    checkbox.checked = status
}

export const saveOpenToContrib = async (compId) => {
    const newOpenToContrib = document.getElementById('opentocontribution').checked                        
    if ( newOpenToContrib !== CURRENT_OPENTOCONTRIB) {                
        await updateOpenToContrib(compId, newOpenToContrib)
    }
}

export const changeOpenToContrib = (newstate) => {
    const opentocontribcheckbox = document.getElementById('opentocontribution')    
    if(newstate === 0){
        opentocontribcheckbox.checked = false
        opentocontribcheckbox.disabled = true
    } else {
        opentocontribcheckbox.disabled = false
    }
}

const updateOpenToContrib = async (compId, newstatus) => {

    const data = { uuid: compId, opentocontrib: newstatus }
    const resultNewOpenToContrib = await updateSettings('PATCH', '/updatecomptocontrib', data)
    if (resultNewOpenToContrib.ok) {
        CURRENT_OPENTOCONTRIB = newstatus        
        if(newstatus){
            const privacybadgetext = document.getElementById('privacybadgetext')
            const badgeHtml = '&nbsp;<span class="badge badge-light">STATUS:&nbsp;</span><span class="badge badge-info">OPEN TO CONTRIB</span>'
            privacybadgetext.insertAdjacentHTML('afterend', badgeHtml)           
        } else {     
            if(document.querySelector('.badge-info')){
                const openToContribBadgeText = document.getElementById('privacybadgetext').nextSibling.nextSibling                
                const openToContribBadgeStatus = openToContribBadgeText.nextSibling
                openToContribBadgeText.remove()
                openToContribBadgeStatus.remove()                
            }                     
        }        
    }
}