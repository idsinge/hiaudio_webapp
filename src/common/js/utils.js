import { ENDPOINT } from './config'

export const LOADER_ELEM_ID = 'loader'

export const UserRole = Object.freeze({
    none : 0,
    owner : 1,
    admin : 2,
    member : 3,
    guest : 4
})

export const LevelPrivacy = Object.freeze({
    public : 1,
    onlyreg : 2,
    private : 3
})

export const startLoader = (loaderId, loadingMessage) => {    
    const loaderElement = document.getElementById(loaderId)    
    loaderElement.nextElementSibling.textContent = loadingMessage
    loaderElement.classList.add(loaderId)
}

export const cancelLoader = (loaderId) => {
    const loaderElement = document.getElementById(loaderId)
    loaderElement.classList.remove(loaderId)
    loaderElement.nextElementSibling.textContent = ''
}

export const callJsonApi = async (apimethod, rqstmethod, body) => {
    const request = {
        method: rqstmethod || 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    }
    if(body){
        request.body = JSON.stringify(body)
    }
    try {
        startLoader(LOADER_ELEM_ID, 'Loading...')
        const sendRqst = await fetch(ENDPOINT + apimethod, request)
        cancelLoader(LOADER_ELEM_ID)
        const respToJson = await sendRqst.json()
        if (respToJson && !respToJson.error) {
            return respToJson
        } else {
            return (respToJson?.error || 'An error occurred')
        }
    } catch (error) {
        cancelLoader(LOADER_ELEM_ID)
        return(error)
    }
}

/* https://stackoverflow.com/a/5166806 */
export const looksLikeMail = (str) => {
    const lastAtPos = str.lastIndexOf('@')
    const lastDotPos = str.lastIndexOf('.')
    return (lastAtPos < lastDotPos && lastAtPos > 0 && str.indexOf('@@') == -1 && lastDotPos > 2 && (str.length - lastDotPos) > 2)
}

export const activateGoHomeLink = () => {
    const goHomeLink = document.getElementById('goHome')
    if(window.location.host === 'localhost:80' || window.location.origin === 'http://localhost'){
        goHomeLink.href = window.location.origin + '/index.html'
    } else {
        goHomeLink.href = window.location.origin
    }
}