import COMPOSITION_COVER from '../img/agp.png'
import { getJsonApi } from '../js/utils'

let listElelemts = ''

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
          <a class='nav-link' href='#' id='createNewCompButton' data-toggle='modal' data-target='#newMusicModal'>/ New Music</a>
    </li>
    <li class='nav-item'>
        <a class='nav-link' href='#' id='createNewCollButton' data-toggle='modal' data-target='#newCollectionModal'>/ New Collection</a>
    </li>
    <li class='nav-item'>
        <a class='nav-link' href='#' id='openMyCollectionsButton' data-toggle='modal' data-target='#editCollectionsModal'>/ My Collections</a>
    </li>`

const getMyProfile = async (doAfterIfLogged, doAfterIfNotLogged) => {
  await getJsonApi("/profile", async (r) => {

    const isAuthenticated = ('ok' in r && r['ok'] == true);
  
    if (isAuthenticated) {
      document.getElementById('userlogin').style.display = "none";
      document.getElementById('useroptions').style.display = "";
      document.getElementById('display_profile_name').innerText = `[${r.name}]`;
      await doAfterIfLogged(isAuthenticated)
    } else {
      await doAfterIfNotLogged(isAuthenticated)
    }
  
  });
}

const getMyCompositions = async (isAuth) => {
  await getJsonApi("/mycompositions", (data) => {

    if ("compositions" in data)
      return renderHomePage(data.compositions, "My Compositions", isAuth)

    alert("invalid return value for compisitions list");

  }, (error) => { alert(error) })
}
const getRecentCompositions = async (isAuth) => {
  getJsonApi("/recentcompositions", (data) => {

    if ("compositions" in data)
      return renderHomePage(data.compositions, "Last recent compositions", isAuth)

    alert("invalid return value for compisitions list");

  }, (error) => { alert(error) })
}

const renderHomePage = (compositionsList, renderOpt, isAuth) => {

  const loaderElement = document.getElementById('loader')
  loaderElement.classList.remove('loader')

  paintListOfCompositions(compositionsList, renderOpt, isAuth)

}

const paintListOfCompositions = (compositionsList, renderOpt, isAuth) => {
  
  if(!compositionsList.length && isAuth){
    document.getElementById('initialmessage').hidden = false
  } else {

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
    document.getElementById('homepageview').innerHTML = renderOpt
  }  
}

const initHomPage = async () => {
  await getMyProfile(getMyCompositions,getRecentCompositions)  
}

initHomPage()