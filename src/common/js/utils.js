import { ENDPOINT } from './config'

export const LOADER_ELEM_ID = 'loader'

export const startLoader = (loaderId, loadingMessage) => {
    document.getElementById('loadertext').textContent = loadingMessage
    const loaderElement = document.getElementById(loaderId)
    loaderElement.classList.add(loaderId)
}

export const cancelLoader = (loaderId) => {
    const loaderElement = document.getElementById(loaderId)
    loaderElement.classList.remove(loaderId)
    document.getElementById('loadertext').textContent = ''
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