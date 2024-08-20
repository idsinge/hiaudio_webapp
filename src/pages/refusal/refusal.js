import { callJsonApi, looksLikeMail, cancelLoader, LOADER_ELEM_ID, activateGoHomeLink } from '../../common/js/utils'

let params = new URLSearchParams(document.location.search);
let code = params.get('code')

if(!code){
    document.getElementById('code-refusal-container').hidden = false
} else {
    document.getElementById('inputrefusalcode').value = code
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

activateGoHomeLink()

document.getElementById('requestremovalbutton').onclick = sendRemovalRequest

cancelLoader(LOADER_ELEM_ID)