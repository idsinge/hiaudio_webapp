import SONG_COVER from '../img/agp.png'
import { ENDPOINT } from '../js/config'

let listElelemts = ''
let errorIs = null
let songs = []

const queryString = window.location.search
const isAuthenticated = queryString.split('auth=')[1]

const domainIs = window.location.host
let uriSongPage = '/song.html?songId='
let uriProfilePage = window.location.origin
if (domainIs !== 'localhost:80' && window.location.origin !== 'http://localhost') {
  uriSongPage = '/public' + uriSongPage
  uriProfilePage += '/public'
}

if (isAuthenticated) {
  document.getElementById('useroptions').innerHTML = `<li class="nav-item">
    <a class="nav-link" href="${uriProfilePage+'/profile.html'}">Profile</a>
  </li>
  <li class="nav-item">
        <a class="nav-link" href="#" data-toggle="modal" data-target="#exampleModal">New Music</a>
      </li>`
} else {
  document.getElementById('useroptions').innerHTML = `<a class="dropdown-item" href="${window.location.origin}/login">Google Login</a>`
}

fetch(ENDPOINT + '/songs', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}).then((r) => {
  if (!r.ok) {
    errorIs = r.statusText
  }
  return r.json()
})
  .then(data => {
    if (data.songs) {
      songs = data.songs
    }
  }).catch((error) => {
    errorIs = error
  }).then(() => {
    renderHomePage(songs, errorIs)
  })

const renderHomePage = (songsList, error) => {

  const loaderElement = document.getElementById('loader')
  loaderElement.classList.remove('loader')

  if (error) {
    alert(error)
  } else {
    paintListOfSongs(songsList)
  }
}

const paintListOfSongs = (songsList) => {
  songsList.forEach((element) => {
    if (element) {
      let collection = ''
      if (element.collection) {
        collection = `<a href="./index.html?collection=${element.collection}" class="card-link green">${element.collection}</a>`
      }
      const template = `
        <div class="grid-div">
          <div class="card">
            <a href="${uriSongPage + element.id}">
              <img src="${element.photo_url || SONG_COVER}" alt="Card image cap" class="card-img">
            </a>
            <div class="card-container">
              <a href="${uriSongPage + element.id}" class="card-link blue">${element.title}</a>
              <p>${collection}</p>
            </div>
          </div>
        </div>
      `
      listElelemts += template
    }
  })
  document.getElementById('grid').insertAdjacentHTML('afterbegin', listElelemts)
  document.getElementById('searchInput').removeAttribute('disabled')
}

const newProjectButton = document.getElementById('newsong')
newProjectButton && newProjectButton.addEventListener("click", (e) => {
  let newtitle = document.getElementById('newtitle').value
  if (!newtitle) {
    alert('Introduce a valid title, please')
    return
  }
  let body = JSON.stringify({
    title: newtitle
  })


  fetch(ENDPOINT + '/newsong', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: body
  })
    .then((r) => {
      if (!r.ok) {
        errorIs = r.statusText
      }
      return r.json()
    })
    .then(data => {
      if (data.song) {
        window.location.href = uriSongPage + data.song.id
      } else {
        throw new Error(data)
      }
    }).catch((error) => {
      errorIs = error
    })

})