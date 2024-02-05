/* TODO: REFACTORING */
import { ENDPOINT } from '../../common/js/config'
import { callJsonApi, activateGoHomeLink } from '../../common/js/utils'
import { checkIfTermsAccepted, generateAcceptTermsModal} from '../../common/js/acceptterms'

let CURRENT_USERNAME = null
let EDIT_STATUS = false

const editUserNameButton = document.getElementById('editusernamebutton')

const profilePageTermsAccepted = (termsAccepted) => {  
  if(!termsAccepted){
      generateAcceptTermsModal('main')
  } 
}

const getUser = async (callback) => {

  const data = await callJsonApi('/profile', 'GET')
  if (data) {    
    callback(data)
  }  

}

const setUserInfo = (userinfo) => {
  if (userinfo.ok) {
    checkIfTermsAccepted(userinfo, profilePageTermsAccepted)
    document.getElementById('profilecard').hidden = false
    document.getElementById('profilepicture').src = `https://picsum.photos/seed/${userinfo.user_uid}/200`
    CURRENT_USERNAME = userinfo.name
    document.getElementById('usernameinputfield').value = userinfo.name
    document.getElementById('userid').innerHTML = userinfo.user_uid
    document.getElementById('emailaddress').innerHTML = userinfo.email
    deleteProfileHandler(userinfo.user_uid)

    document.getElementById('apicard').hidden = false
    document.getElementById('apitoken').innerHTML = userinfo.token
    document.getElementById('curlcode').innerHTML = `$ export JWT="${userinfo.token}"  <br /><br />$ curl ${window.location.protocol}//${window.location.host}/profile   -H "Authorization: Bearer $JWT"`;
    copyPasteTokenValue()
  } else {
    document.getElementById('logincard').hidden = false
  }
}

const deleteProfileHandler = (userid) => {
    document.getElementById('button-deleteprofile').addEventListener('click', async () => {await deleteUserProfile(userid)})
}

const copyPasteTokenValue = () => {
  document.getElementById('copytokenbutton').onclick = () => {
    window.prompt('Copy to clipboard: Ctrl+C, Enter', document.getElementById('apitoken').innerHTML)
  }
}
const deleteUserProfile = async (userid) => {
  const api = '/deleteuser/'+userid
  let userDelete = prompt('To confirm, please enter your User ID', '')
  if (userDelete === userid) {
    const request = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    }
    try {
        const sendRqst = await fetch(ENDPOINT + api, request)
        const respToJson = await sendRqst.json()
        if (respToJson) {
            window.location.href = window.location.origin
        }
    } catch (error) {
        alert(error)
    }
  } else if ((userDelete !== userid) && (userDelete !== null)){
    alert('Sorry, the User ID does not match')
  }
}

const clickEditButtonHandler = () => {
    
  if(EDIT_STATUS){      
      disableEdition()
  } else {
      EDIT_STATUS = true
      editUserNameButton.innerHTML =  '<i class="fas fa-save">&nbsp;</i>Save'
      enableEdition()
  }   
}

const enableEdition = () => {
  document.getElementById('usernameinputfield').classList.add('italic')
  document.getElementById('usernameinputfield').removeAttribute('readonly')
}

const disableEdition = async () => {
  const usernameinput = document.getElementById('usernameinputfield')
  const newname =  usernameinput.value
  usernameinput.value = newname.trim()
  if(CURRENT_USERNAME === newname){
    setBackToReadOnly()    
  } else {
    const body = {user_name: newname}
    const resultNewName = await callJsonApi('/updateusername', 'PATCH', body)  
    if(!resultNewName.ok){    
      usernameinput.classList.add('is-invalid')     
      document.getElementById('validationusernameresult').innerText = 'Sorry, ' + resultNewName
    } else {
      CURRENT_USERNAME = newname
      setBackToReadOnly()     
    }  
  }  
}

const setBackToReadOnly = () => {
  const usernameinput = document.getElementById('usernameinputfield')
  EDIT_STATUS = false        
  editUserNameButton.innerHTML =  '<i class="fas fa-edit">&nbsp;</i>Edit username'
  usernameinput.setAttribute('readonly', 'true')
  usernameinput.classList.remove('is-invalid')
  usernameinput.classList.remove('italic')     
  document.getElementById('validationusernameresult').innerText = '' 
}

activateGoHomeLink()

editUserNameButton.addEventListener('click', clickEditButtonHandler, false)

getUser(setUserInfo)