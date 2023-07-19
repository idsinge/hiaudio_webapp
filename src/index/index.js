import COMPOSITION_COVER from '../img/agp.png'
import { ENDPOINT } from '../js/config'

let listElelemts = ''
let errorIs = null
let compositions = []

const queryString = window.location.search
const isAuthenticated = queryString.split('auth=')[1]

const domainIs = window.location.host
export let uriCompositionPage = '/composition.html?compositionId='
let uriProfilePage = window.location.origin
if (domainIs !== 'localhost:80' && window.location.origin !== 'http://localhost') {
  uriCompositionPage = '/public' + uriCompositionPage
  uriProfilePage += '/public'
}

if (isAuthenticated) {
  document.getElementById('useroptions').innerHTML = `<li class='nav-item'>
    <a class='nav-link' href='${uriProfilePage + '/profile.html'}'>Profile</a>
  </li>
  <li class='nav-item'>
        <a class='nav-link' href='#' id='createNewCompButton' data-toggle='modal' data-target='#newMusicModal'>/ New Music</a>
  </li>
  <li class='nav-item'>
      <a class='nav-link' href='#' id='createNewCollButton' data-toggle='modal' data-target='#newCollectionModal'>/ New Collection</a>
  </li>`
} else {
  document.getElementById('useroptions').innerHTML = `<a class='dropdown-item' href='${window.location.origin}/login'>Google Login</a>`
}

fetch(ENDPOINT + '/compositions', {
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
    if (data.compositions) {
      compositions = data.compositions
    }
  }).catch((error) => {
    errorIs = error
  }).then(() => {
    renderHomePage(compositions, errorIs)
  })

const renderHomePage = (compositionsList, error) => {

  const loaderElement = document.getElementById('loader')
  loaderElement.classList.remove('loader')

  if (error) {
    alert(error)
  } else {
    paintListOfCompositions(compositionsList)
  }
}

const paintListOfCompositions = (compositionsList) => {
  compositionsList.forEach((element) => {
    if (element) {
      let collection = ''
      if (element.collection) {
        collection = `<a href='./index.html?collection=${element.collection}' class='card-link green'>${element.collection}</a>`
      }
      const template = `
        <div class='grid-div'>
          <div class='card'>
            ${element.opentocontrib ? '<span class="badge badge-info">OPEN TO CONTRIB</span>' : ''}
            <a href='${uriCompositionPage + element.uuid}'>
              <img src='${element.photo_url || COMPOSITION_COVER}' alt='Card image cap' class='card-img'>
            </a>
            <div class='card-container'>
              <a href='${uriCompositionPage + element.uuid}' class='card-link blue'>${element.title}</a>
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