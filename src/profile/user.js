/* TODO: REFACTORING */
import { ENDPOINT } from '../js/config'
const goHomeLink = document.getElementById('goHome')
if (window.location.host === 'localhost:80' || window.location.origin === 'http://localhost') {
  goHomeLink.href = window.location.origin + '/index.html'
} else {
  goHomeLink.href = window.location.origin
}

const getUser = async (callback) => {

  let errorIs = null
  let userInfo = {}

  await fetch(ENDPOINT + "/profile", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  })
    .then((r) => {
      if (!r.ok) {
        errorIs = r.statusText
      }
      return r.json()
    })
    .then((data) => {

      if (data) {
        userInfo = data
      }
    })
    .catch((error) => {
      errorIs = error
    })
    .then(() => {
      if (errorIs) {
        alert(errorIs)
      }
      callback(userInfo)
    })

}

const setUserInfo = (userinfo) => {
  if (userinfo.ok) {
    document.getElementById('profilecard').hidden = false
    document.getElementById('profilepicture').src = userinfo.profile_pic
    document.getElementById('username').innerHTML = userinfo.name
    document.getElementById('userid').innerHTML = 'User Id: ' + userinfo.user_id
    document.getElementById('emailaddress').innerHTML = userinfo.email
  } else {
    document.getElementById('logincard').hidden = false
  }
}

getUser(setUserInfo)