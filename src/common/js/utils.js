import { ENDPOINT } from './config'

export const uriUserPage = '/index.html?userid='
export const uriCollectionPage = '/index.html?collectionid='

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

export const PRIVACY_BADGE_STYLE = {[LevelPrivacy.public] : 'badge-public', [LevelPrivacy.onlyreg] : 'badge-onlyreg', [LevelPrivacy.private] : 'badge-private'}
export const PRIVACY_BADGE_TEXT = {[LevelPrivacy.public] : 'PUBLIC', [LevelPrivacy.onlyreg] : 'REG USERS', [LevelPrivacy.private] : 'PRIVATE'}

export const startLoader = (loadingMessage) => {    
    const loaderElement = document.getElementById('loader')    
    loaderElement.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>&nbsp;${loadingMessage}`
    loaderElement.classList.remove('loader-hidden')
}

export const cancelLoader = () => {
    const loaderElement = document.getElementById('loader')
    loaderElement.classList.add('loader-hidden')
}

export const callJsonApi = async (apimethod, rqstmethod, body, useLoaderWithText) => {
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
        useLoaderWithText && startLoader(useLoaderWithText)
        const sendRqst = await fetch(ENDPOINT + apimethod, request)
        useLoaderWithText && cancelLoader()
        const respToJson = await sendRqst.json()
        if (respToJson && !respToJson.error) {
            return respToJson
        } else {
            return (respToJson?.error || 'An error occurred')
        }
    } catch (error) {
        useLoaderWithText && cancelLoader()
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

export const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

export const MEDIA_CONSTRAINTS = { audio: {echoCancellation:false, noiseSuppression:false, autoGainControl:false, latency: 0, channelCount: 1 }}