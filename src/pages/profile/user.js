/* TODO: REFACTORING */
import { ENDPOINT } from '../../common/js/config'
import { callJsonApi } from '../../common/js/utils'
import { checkIfTermsAccepted, generateAcceptTermsModal} from '../../common/js/acceptterms'

const goHomeLink = document.getElementById('goHome')
if (window.location.host === 'localhost:80' || window.location.origin === 'http://localhost') {
  goHomeLink.href = window.location.origin + '/index.html'
} else {
  goHomeLink.href = window.location.origin
}

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
    document.getElementById('profilepicture').src = userinfo.profile_pic
    document.getElementById('username').innerHTML = userinfo.name
    document.getElementById('userid').innerHTML = 'User Id: ' + userinfo.user_uid
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
getUser(setUserInfo)