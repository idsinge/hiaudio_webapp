import { callJsonApi, looksLikeMail, cancelLoader, LOADER_ELEM_ID } from '../../common/js/utils'

const goHomeLink = document.getElementById('goHome')

if (window.location.host === 'localhost:80' || window.location.origin === 'http://localhost') {
    goHomeLink.href = window.location.origin + '/index.html'
} else {
    goHomeLink.href = window.location.origin
}

const sendRemovalRequest = async () => {
    const toRemoveEmail = document.getElementById('inputemailtoremove').value
    if(looksLikeMail(toRemoveEmail)){
        const refusalCode = document.getElementById('inputrefusalcode').value
        const rqstBody = {email:toRemoveEmail, refusal_code:refusalCode}
        const data = await callJsonApi('/refuseinvitation', 'POST', rqstBody)
        if(data.ok){
            alert('Your information has been sucessfully removed.')
            window.location.href = window.location.origin
        } else {
            alert(data)
        }
        
    } else {        
        document.getElementById('inputemailtoremove').classList.add('is-invalid')     
        document.getElementById('validationEmailResult').innerText = 'Sorry, invalid email address format.'
    }    
}

document.getElementById('requestremovalbutton').onclick = sendRemovalRequest

cancelLoader(LOADER_ELEM_ID)