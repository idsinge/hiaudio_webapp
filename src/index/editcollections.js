import { ENDPOINT } from '../common/js/config'
import {uriCompositionPage} from './index'

let EDIT_STATUS = false

const showAllCollButton = document.getElementById('openMyCollectionsButton')
const editButton = document.getElementById('editmycollectionsbutton')

const fetchCollectionsTree = async () => {
    const response = await fetch('/mycollectionsastree')
    const data = await response.json()
    return data
}

const createTreeHTML = (item) => {
    let html = `
        <span id='removeCollIcon${item.uuid}' data-uuid='${item.uuid}' data-title='${item.title}' role='button' class='badge badge-pill badge-danger' hidden>-</span>
        <li id='${item.uuid}' class='list-group-item border-bottom-0 border-right-0 border-top-0 border-warning'>
            <input type='text' class='form-control border-secondary' id='treecolltitleinput${item.uuid}' data-uuid='${item.uuid}' placeholder='Type a new title'
            title='collectiontitle' value='${item.title}' disabled>
        </li>`
    
    if (item.compositions.length > 0 || item.collections.length > 0) {
        html += '<ul>'
        for (const composition of item.compositions) {
            html += `<li class='list-group-item border-0'><a href='${uriCompositionPage + composition.uuid}'><u>${composition.title}</u></a></li>`
        }
        for (const collection of item.collections) {
            html += createTreeHTML(collection)
        }
        html += '</ul>'
    }    
    return html
}

const renderTree = async () => {
    const treeContainer = document.getElementById('listCollContainerAllColl')
    const data = await fetchCollectionsTree()
    let html = '<ul>'
    for (const collection of data) {
        html += createTreeHTML(collection)
    }
    html += '</ul>'
    treeContainer.innerHTML = html
}

const clickEditButtonHandler = () => {
    
    if(EDIT_STATUS){
        EDIT_STATUS = false        
        editButton.innerText =  'Edit'
        disableEdition()
    } else {
        EDIT_STATUS = true
        editButton.innerText =  'Done'
        enableEdition()
    }   
}

const enableEdition = () => {
    
    const elementsWithHiddenAttribute = document.querySelectorAll(`[id*='removeCollIcon']`)

    elementsWithHiddenAttribute.forEach(element => {
        element.removeAttribute('hidden')        
        removeCollectionClickhHandler(element.getAttribute('data-uuid'), element.getAttribute('data-title'))
    })   
    
    const elementsWithDisabledAttribute = document.querySelectorAll(`[id*='treecolltitleinput']`)

    elementsWithDisabledAttribute.forEach(element => {
        element.removeAttribute('disabled')
        updateInputTextEventHandler(element.getAttribute('data-uuid'), element.value)
    })
}

const disableEdition = () => {

    const elementsWithHiddenAttribute = document.querySelectorAll(`[id*='removeCollIcon']`)

    elementsWithHiddenAttribute.forEach(element => {
        element.setAttribute('hidden', 'true')
    })

    const elementsWithDisabledAttribute = document.querySelectorAll(`[id*='treecolltitleinput']`)    

    elementsWithDisabledAttribute.forEach(element => {
        element.setAttribute('disabled', 'true')
    })
}

const clickAllCollButtonHandler = async () => {
    EDIT_STATUS = false
    editButton.innerText =  'Edit'
    await renderTree()
    editButton.addEventListener('click', clickEditButtonHandler, false)
}

showAllCollButton?.addEventListener('click', clickAllCollButtonHandler, false)

const confirmDeleteCollectionModal = async (event, collectionId, collectionTitle) => {

    const chk = event.target

    if (chk.tagName === 'SPAN') {

        if (confirm(`Are you sure you want remove the collection ${collectionTitle} and all of its content?`) == true) {

            const response = await fetch(ENDPOINT + '/deletecollection/' + collectionId, { method: 'DELETE' })
            if (response?.ok) {
                document.getElementById('removeCollIcon'+collectionId).remove()
                const listElemToDelete = document.getElementById(collectionId)
                if(listElemToDelete?.nextSibling?.tagName === 'UL'){
                    listElemToDelete.nextSibling.remove()
                }
                listElemToDelete.remove()
            }

        } else {
            event.target.checked = false
        }
    }
}

const removeCollectionClickhHandler = (collectionId, collectionTitle) => {
    document.getElementById('removeCollIcon' + collectionId).onclick= async (event) => {
        await confirmDeleteCollectionModal(event, collectionId, collectionTitle)
    }
}

const updateInputTextEventHandler = (collectionId, currentTitle) => {    
    document.getElementById('treecolltitleinput'+collectionId).onblur = (event) => {
        handleInputBlur(event, collectionId, currentTitle)
    }    
}

const updateCollectionTitleRqst = (value, uuid) => {
   
    const updateTitleApi = ENDPOINT + '/updatecolltitle'
    const data = { title: value, uuid: uuid }
    
    fetch(updateTitleApi, {
        method: 'PATCH', 
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then()
    .catch(error => {
        console.error('Error updating value:', error)
    })
}

const handleInputBlur = (event, collId, currTitle) => {    
    const newValue = event.target.value
    if(currTitle !== newValue){
        if (!newValue || newValue === '') {
            event.target.value = currTitle
            alert('Introduce a valid title, please')
            return
        } else {
            updateCollectionTitleRqst(newValue, collId)
        }
    }
}