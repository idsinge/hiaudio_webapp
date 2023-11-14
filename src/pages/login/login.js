const goHomeLink = document.getElementById('goHome')
if (window.location.host === 'localhost:80' || window.location.origin === 'http://localhost') {
    goHomeLink.href = window.location.origin + '/index.html'
} else {
    goHomeLink.href = window.location.origin
}

document.getElementById('googleLoginButton').onclick = redirectToGoogleLogin
function redirectToGoogleLogin() {
    window.location.href = "/login";
}