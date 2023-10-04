import COMPOSITION_COVER from '../img/agp.png'
import { getJsonApi } from '../js/utils'
import {breadcrumbHandler} from './breadcrumbhandler'

export let uriCompositionPage = '/composition.html?compositionId='
let uriProfilePage = window.location.origin


document.getElementById('userlogin').innerHTML = `<li class='nav-item'>
  <a class='dropdown-item' href='${window.location.origin}/login'>Google Login</a>
  </li>
  <li class='nav-item'>
    <a class='dropdown-item' href='${uriCompositionPage}demopage'>Test DAW</a>
  </li>`
document.getElementById('useroptions').innerHTML = `<li class='nav-item'>
      <a class='nav-link' href='${uriProfilePage + '/profile.html'}'>Profile <i id='display_profile_name'></i></a>
    </li>
    <li class='nav-item'>
          <a class='nav-link' href='#' id='createNewButton' data-toggle='modal' data-target='#newMusicModal'>/ Create new</a>
    </li>
    <li class='nav-item'>
        <a class='nav-link' href='#' id='openMyCollectionsButton' data-toggle='modal' data-target='#editCollectionsModal'>/ My Collections</a>
    </li>`

const getMyProfile = async (doAfterIfLogged, doAfterIfNotLogged) => {
  
  const isAuthenticated = await getJsonApi('/profile')
  if (isAuthenticated.ok) {
    document.getElementById('userlogin').style.display = 'none'
    document.getElementById('useroptions').style.display = ''
    document.getElementById('display_profile_name').innerText = `[${isAuthenticated.name}]`
    await doAfterIfLogged(isAuthenticated)
  } else {
    await doAfterIfNotLogged(isAuthenticated)
  }
  return isAuthenticated
}

export const getMyCompositions = async () => {
  const data = await getJsonApi('/mycompositions')
  if(data.compositions){
    return renderHomePage(data.compositions)
  } else {
    alert('invalid return value for compisitions list')
  }  
}
export const getRecentCompositions = async () => {
  const data = await getJsonApi('/recentcompositions')
  if(data.compositions){
    return renderHomePage(data.compositions)
  } else {
    alert('invalid return value for compisitions list')
  }
}

export const getAllCompositions = async () => {
  const data = await getJsonApi('/compositions')
  if(data.compositions){
    return renderHomePage(data.compositions)
  } else {
    alert('invalid return value for compisitions list')
  }
}

const renderHomePage = (compositionsList) => {

  document.getElementById('loadertext').textContent = ''
  document.getElementById('grid').innerHTML = ''
  paintListOfCompositions(compositionsList)

}

const paintListOfCompositions = (compositionsList) => {
  
  if(!compositionsList.length){
    document.getElementById('initialmessage').hidden = false
    document.getElementById('initialmessage').classList.add('d-flex')
  } else {
    let listElelemts = ''
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
    document.getElementById('grid').innerHTML = ''
    document.getElementById('grid').insertAdjacentHTML('afterbegin', listElelemts)
    document.getElementById('searchInput').removeAttribute('disabled')
  }  
}

const initHomPage = async () => {
  const isAuth  = await getMyProfile(getMyCompositions,getRecentCompositions)  
  breadcrumbHandler(isAuth)
}

initHomPage()