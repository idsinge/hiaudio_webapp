import COMPOSITION_COVER from '../../../common/img/agp.png'
import { callJsonApi } from '../../../common/js/utils'
import {breadcrumbHandler} from './breadcrumbhandler'
import {checkIfTermsAccepted, generateAcceptTermsModal} from '../../../common/js/acceptterms'

export let uriCompositionPage = '/composition.html?compositionId='
let uriProfilePage = window.location.origin


document.getElementById('userlogin').innerHTML = `<li class='nav-item'>
  <a class='dropdown-item' href='${window.location.origin}/login.html'>Register / Login</a>
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


const homePageTermsAccepted = (termsAccepted) => {    
    if(!termsAccepted){
        generateAcceptTermsModal('header')
    } 
}
const getMyProfile = async (doAfterIfLogged, doAfterIfNotLogged) => {
  
  const isAuthenticated = await callJsonApi('/profile', 'GET')
  if (isAuthenticated.ok) {
    document.getElementById('userlogin').style.display = 'none'
    document.getElementById('useroptions').style.display = ''
    document.getElementById('display_profile_name').innerText = `[${isAuthenticated.name}]`    
    checkIfTermsAccepted(isAuthenticated, homePageTermsAccepted)
    await doAfterIfLogged(isAuthenticated)
  } else {
    await doAfterIfNotLogged(isAuthenticated)
  }
  return isAuthenticated
}

export const getMyCompositions = async () => {
  const data = await callJsonApi('/mycompositions', 'GET')
  if(data.compositions){
    return renderHomePage(data.compositions)
  } else {
    alert('invalid return value for compisitions list')
  }  
}
export const getRecentCompositions = async () => {
  const data = await callJsonApi('/recentcompositions', 'GET')
  if(data.compositions){
    return renderHomePage(data.compositions)
  } else {
    alert('invalid return value for compisitions list')
  }
}

export const getAllCompositions = async () => {
  const data = await callJsonApi('/compositions', 'GET')
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
        const template = `
        <a href='${uriCompositionPage + element.uuid}' class='card-url'>
        <div class='card'>          
            ${element.opentocontrib ? '<span class="badge badge-info">OPEN TO CONTRIB</span>' : ''}            
            <div class="card-body">              
                <div>  
                  <h5 class='card-title'>${element.title}</h5>
                  <p class='card-text text-truncate'>${element.description ||''}</p>
                  <p class='text-black-50'>${element.parent_collection ? ('Collection: ' + element.parent_collection) : ''}</p>
                  <span class='card-url'><i class='fa fa-user'></i>&nbsp;${element.username}</span>&nbsp;
                  <span class='card-url'><i class='fa fa-music'></i>&nbsp;${'Tracks: ' +element.tracks.length}</span>
                </div>
            </div>
        </div>
        </a>`
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