import { ENDPOINT } from '../js/config'
import {uriCompositionPage} from './index'

const showAllCollButton = document.getElementById('editCollectionsButton')

const fetchCollectionsTree = async () => {
    const response = await fetch('/mycollectionsastree')
    const data = await response.json()
    return data
}

const createTreeHTML = (item) => {
    let html = `
        <li class="list-group-item border-bottom-0 border-right-0 border-top-0 border-warning">
            <b>${item.title}</b>
        </li>`
    
    if (item.compositions.length > 0 || item.collections.length > 0) {
        html += '<ul>'
        for (const composition of item.compositions) {
            html += `<li class="list-group-item border-bottom-0 border-right-0 border-left-0 border-top-0"><a href='${uriCompositionPage + composition.uuid}'><u>${composition.title}</u></a></li>`
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

const clickAllCollButtonHandler = async () => {
    await renderTree()
}

showAllCollButton?.addEventListener('click', clickAllCollButtonHandler, false)

const addCollectionToList = (collection, ulelem) => {
    const li = document.createElement('li')
    li.className = 'list-group-item'
    li.id = collection.uuid
    const inputText1 = `
    <div class="form-row">
        <div class="form-group col-sm-8">
            <input type="text" class="form-control" id="collectiontitle" placeholder="Type a new title"
            title="collectiontitle" value="${collection.title}">
        </div>
        <div class="form-group col-sm-4">
            <div class="form-check">
                <div class='custom-control custom-switch custom-control-inline float-right'>
                    <input type='checkbox' class='custom-control-input is-invalid' id='removeCollSwitch${collection.uuid}'>
                    <label class='custom-control-label is-invalid' for='removeCollSwitch${collection.uuid}'>Remove</label>
                </div>
            </div>
            <div class="form-check" hidden>
                <button id="editsavecollbttn" type="button" class="btn btn-primary">Save</button>
            </div>
        </div>
    </div>`

    li.innerHTML += inputText1
    ulelem.appendChild(li)
    removeCollectionSwitchHandler(collection.uuid, collection.title)
}

const removeCollectionSwitchHandler = (collectionId, collectionTitle) => {

    document.getElementById('removeCollSwitch' + collectionId).addEventListener('change', async function (event) {
        const chk = event.target
        if (chk.tagName === 'INPUT' && chk.type === 'checkbox') {
            if (chk.checked) {
                if (confirm(`Do you want remove the collection: ${collectionTitle}?`) == true) {

                    const response = await fetch(ENDPOINT + '/deletecollection/' + collectionId, { method: 'DELETE' })
                    if (response?.ok) {
                        document.getElementById(collectionId).remove()
                    }

                } else {
                    event.target.checked = false
                }
            }
        }
    })
}