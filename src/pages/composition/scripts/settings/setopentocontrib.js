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
            const nodeBadge = document.createElement('span')            
            nodeBadge.innerHTML ='<br><span class="badge badge-info">OPEN TO CONTRIB</span>'            
            document.getElementById('post-header').prepend(nodeBadge)            
        } else {     
            if(document.querySelector('.badge-info')){
                const brs =document.getElementById('post-header').getElementsByTagName('br')
                brs[0].parentNode.removeChild(brs[0])
                document.querySelector('.badge-info').innerHTML ='' 
            }                     
        }        
    }
}