import { callJsonApi, looksLikeMail, activateGoHomeLink } from '../../common/js/utils'

let TEMP_EMAIL = null

const redirectToGoogleLogin = () => {
    window.location.href = '/googlelogin'
}

const getUser = async () => {
    const data = await callJsonApi('/profile', 'GET')
    if (data.ok) {
        window.location.href = window.location.origin + '/profile.html'
    }
}

const sendVerificationCode = async () => {
    const loginEmail = document.getElementById('inputloginemail').value
    if(looksLikeMail(loginEmail)){
        const data = await callJsonApi('/generatelogincode/'+loginEmail, 'PUT')
        if (data.ok) {
            TEMP_EMAIL = loginEmail
            document.getElementById('authmethodform').hidden = true
            document.getElementById('validationcodefield').hidden = false
        }
    } else {
        document.getElementById('inputloginemail').classList.add('is-invalid')
        document.getElementById('validationEmailResult').innerText = 'Sorry, invalid email address format.'
    }
}

const requestCodeValidation = async () => {
    const codeIs =  document.getElementById('verificationCode').value
    const sixDigits = /\d{6}/
    if (sixDigits.test(codeIs)){
        const body = {email: TEMP_EMAIL, code: codeIs}
        const data = await callJsonApi('/logincodevalidation', 'POST', body)
        if (data.ok) {
            TEMP_EMAIL = null
            window.location.href = window.location.origin
        } else {
            // TODO: if the code is expired display button to request a new one
            document.getElementById('verificationCode').classList.add('is-invalid')
            document.getElementById('validationCodeResult').innerText = 'Wrong code, sorry'
        }
    } else {
        document.getElementById('verificationCode').classList.add('is-invalid')
        document.getElementById('validationCodeResult').innerText = 'Sorry, invalid code format.'
    }
}

activateGoHomeLink()

document.getElementById('googleLoginButton').onclick = redirectToGoogleLogin

document.getElementById('sendcodebutton').onclick = sendVerificationCode
document.getElementById('inputloginemail').onkeydown = function(e) {
    if (e.key == "Enter") {
        return sendVerificationCode()
    }
}



document.getElementById('validatecodebutton').onclick = requestCodeValidation
document.getElementById('verificationCode').onkeydown = function(e) {
    if (e.key == "Enter") {
        return requestCodeValidation()
    }
}



getUser()
