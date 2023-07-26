import { ENDPOINT } from '../js/config'
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
        <span id="removeCollIcon${item.uuid}" data-uuid="${item.uuid}" data-title="${item.title}" role="button" class="badge badge-pill badge-danger" hidden>-</span>
        <li id="${item.uuid}" class="list-group-item border-bottom-0 border-right-0 border-top-0 border-warning">
            <input type="text" class="form-control border-secondary" id="treecollectiontitleinput" placeholder="Type a new title"
            title="collectiontitle" value="${item.title}" disabled>
        </li>`
    
    if (item.compositions.length > 0 || item.collections.length > 0) {
        html += '<ul>'
        for (const composition of item.compositions) {
            html += `<li class="list-group-item border-0"><a href='${uriCompositionPage + composition.uuid}'><u>${composition.title}</u></a></li>`
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
    
    const elementsWithHiddenAttribute = document.querySelectorAll('[id*="removeCollIcon"]')

    elementsWithHiddenAttribute.forEach(element => {
        element.removeAttribute('hidden')        
        removeCollectionClickhHandler(element.getAttribute('data-uuid'), element.getAttribute('data-title'))
    })   
    
    const elementsWithDisabledAttribute = document.querySelectorAll('[id*="treecollectiontitleinput"]')

    elementsWithDisabledAttribute.forEach(element => {
        element.removeAttribute('disabled')
    })
}

const disableEdition = () => {

    const elementsWithHiddenAttribute = document.querySelectorAll('[id*="removeCollIcon"]')

    elementsWithHiddenAttribute.forEach(element => {
        element.setAttribute('hidden', 'true')
    })

    const elementsWithDisabledAttribute = document.querySelectorAll('[id*="treecollectiontitleinput"]')    

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

        if (confirm(`Do you want remove the collection: ${collectionTitle}?`) == true) {

            const response = await fetch(ENDPOINT + '/deletecollection/' + collectionId, { method: 'DELETE' })
            if (response?.ok) {
                document.getElementById('removeCollIcon'+collectionId).remove()
                document.getElementById(collectionId).remove()
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