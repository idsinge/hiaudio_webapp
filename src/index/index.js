import SONG_COVER from '../img/agp.png'
import { ENDPOINT } from '../js/config'
import { TelegramLogin } from '../js/telegramlogin'

const telegramLogin = new TelegramLogin()
telegramLogin.init()

let listElelemts = ''
let errorIs = null
let songs = []

// const queryString = window.location.search
// const urlParams = new URLSearchParams(queryString)
// let collectionName = urlParams.get('collection')

// let query = `query GetSongs {
//   songs{id, title, photo_url, collection}
// }`
// let body = JSON.stringify({
//   query,
// })
// if(collectionName){
//   collectionName = decodeURI(collectionName)
//   query = `query GetSongs($collectionName: String!) {
//     collection(collectionName: $collectionName){id, title, photo_url}
//   }`
//   body = JSON.stringify({
//     query,
//     variables: {collectionName},
//   })
// }

// fetch(ENDPOINT, {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json',
//   },
//   body: body
// })

fetch(ENDPOINT + "/", {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})
.then((r) => {
  if(!r.ok){
    errorIs = r.statusText
  }
  return r.json()
})
.then(data => {
  console.log("then x2 data = ", data);
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
    if(element){
      let collection = ''
      if(element.collection){
        collection = `<a href="./index.html?collection=${element.collection}" class="card-link green">${element.collection}</a>`
      }
      const template = `
        <div class="grid-div">
          <div class="card">
            <a href="../song/song.html?songId=${element.id}">
              <img src="${element.photo_url || SONG_COVER}" alt="Card image cap" class="card-img">
            </a>
            <div class="card-container">
              <a href="../song/song.html?songId=${element.id}" class="card-link blue">${element.title}</a>
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

document.getElementById('newsong').addEventListener("click", (e) => {
  let newtitle = document.getElementById('newtitle').value ;

  let body = JSON.stringify({
    title: newtitle
  })


  fetch(ENDPOINT + "/newsong", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: body
  })
  .then((r) => {
    if(!r.ok){
      errorIs = r.statusText
    }
    return r.json()
  })
  .then(data => {
    if (data.song) {
      window.location.href = "/song/song.html?songId=" + data.song.id;
    }
  }).catch((error) => {
    errorIs = error
  })


});