import { callJsonApi } from '../../../common/js/utils'
import {breadcrumbHandler} from './breadcrumbhandler'
import {checkIfTermsAccepted, generateAcceptTermsModal} from '../../../common/js/acceptterms'
import {getGroupedCompositionsWithUsers, getGroupedCompositionsWithCollab} from './home_helper'

export const uriCompositionPage = '/composition.html?compositionId='
let uriProfilePage = window.location.origin

const BADGE_STYLE = {'coll':'badge-collection', 'user':'badge-warning', 'collab':'badge-collab'}
const BORDER_STYLE = {'coll':'border-collection', 'user':'border-warning', 'collab':'border-collab'}

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
  const endpoint = '/mycompositions'
  const data = await callJsonApi(endpoint, 'GET')
  if(data.compositions){
    return renderHomePage(data.compositions, endpoint)
  } else {
    alert('invalid return value for compisitions list')
  }  
}
export const getRecentCompositions = async () => {
  const endpoint = '/recentcompositions'
  const data = await callJsonApi('/recentcompositions', 'GET')
  if(data.compositions){
    return renderHomePage(data.compositions, endpoint)
  } else {
    alert('invalid return value for compisitions list')
  }
}

export const getAllCompositions = async () => {
  const endpoint = '/compositions'
  const data = await callJsonApi('/compositions', 'GET')
  if(data.compositions){
    return renderHomePage(data.compositions, endpoint)
  } else {
    alert('invalid return value for compisitions list')
  }
}

const renderHomePage = (compositionsList, endpoint) => {

  document.getElementById('loadertext').textContent = ''
  document.getElementById('grid').innerHTML = ''
  document.getElementById('legendbuttons').innerHTML = ''
  if (!compositionsList.length) {
    document.getElementById('initialmessage').hidden = false
    document.getElementById('initialmessage').classList.add('d-flex')
  } else {   
    renderHomePageWithLists(compositionsList, endpoint)
  }
}

const renderHomePageWithLists = (compositionsList, endpoint) => {
  if(endpoint !== '/mycompositions'){
    const groupedComps = getGroupedCompositionsWithUsers(compositionsList)
    paintListOfCompositions(groupedComps, 'groupedbyuser_final', endpoint, compositionsList.length)       
  } else {
    const groupedCompsWithCollab = getGroupedCompositionsWithCollab(compositionsList)
    paintListOfCompositions(groupedCompsWithCollab, 'groupedbycollab', endpoint, compositionsList.length)
  }
}

const paintSingleComposition = (element) => {

  return `<div class='card border-success'>                       
            <div class="card-body">
            ${element.opentocontrib ? '<p class="badge badge-info">OPEN TO CONTRIB</p>' : ''}               
                <div>  
                  <a href='${uriCompositionPage + element.uuid}' class='card-url'>
                    <h5 class='card-title'>${element.title}</h5>
                  </a>
                  <p class='card-text text-truncate'>${element.description || ''}</p>
                  <p class='text-black-50'>${element.parent_collection ? ('Collection: ' + element.parent_collection) : ''}</p>
                  <span class="d-inline-block text-truncate" style="max-width: 250px;">
                    <i class='fa fa-user'></i>&nbsp;${element.username}&nbsp;
                  </span>
                  <span class="d-inline-block text-truncate" style="max-width: 250px;">
                    <i class='fa fa-music'></i>&nbsp;${'Tracks: ' + element.tracks?.length}
                  </span>                  
                </div>                
            </div>            
        </div>`
}

const getUICardElemForCollection = (typebadge, numitems, collName, listgroup) => {
    
    const badegstyle = BADGE_STYLE[typebadge]
    const borderstyle = BORDER_STYLE[typebadge]

    return `<div class='card ${borderstyle}'>                        
              <h4>
                <span class="badge ${badegstyle} d-inline-block text-truncate" style="max-width: 250px;">
                    <span class="badge badge-light">${numitems}</span>&nbsp;
                    ${collName}
                </span>
              </h4>        
              <div class="card-body">
                <div class="list-group border">              
                  ${listgroup}
                </div>
              </div>
            </div>`
}

const getUIListElemInsideCollection = (item, typebadge) => {
    
    return `<div class="list-group-item ">
            ${item.opentocontrib ? '<span class="badge badge-info">OPEN TO CONTRIB</span>' : ''}  
            <p class="list-group-item-heading">
              <a href='${uriCompositionPage + item.uuid}' class='card-url'>
                  <h5 class='card-title'>${item.title}</h5>
              </a>
            </p>
            <p class="list-group-item-text text-truncate">
              ${item.description || ''}
            </p>
            ${typebadge !== 'user' ? 
                '<span class="d-inline-block text-truncate" style="max-width: 220px;">'+
                  '<i class="fa fa-user"></i>&nbsp;' + item.username + '&nbsp;'+
                '</span>' : ''}            
            <span class="d-inline-block text-truncate" style="max-width: 200px;">
              <i class='fa fa-music'></i>&nbsp;${'Tracks: ' + item.tracks?.length}
            </span>
          </div>`
}

const paintGroupCollection = (listcomps, typebadge) => {
  
  let allCompUIelem = ''  
  for (const comp in listcomps) {    
    const element = listcomps[comp]
    let listgroup = ''
    const collName = (typebadge === 'collab') ? 'Collaborations' : (Object.values(element)[0].parent_collection || Object.values(element)[0].username)
    for (const item of element) {
      listgroup += getUIListElemInsideCollection(item, typebadge)
    }
    allCompUIelem += getUICardElemForCollection(typebadge, element.length, collName, listgroup)
  }
  return allCompUIelem
}

const getLegendButtons = (numberGroupsByCollections, numberGroupsCustom, numberSinglComp, endpoint, totalcomps) => {
  const displayGroupsByLabel = (numberGroupsByCollections || ((endpoint !== '/mycompositions') && numberGroupsCustom) || numberSinglComp)
  return `<ul class="nav justify-content-end">
            ${ displayGroupsByLabel ? '<li class="legenditem nav-item"><h4><span class="badge badge-light">Groups by:&nbsp;</span></h4></li>' : ''}
            ${numberGroupsByCollections ? '<li class="legenditem nav-item"><h4><span class="badge badge-collection">Collection&nbsp;<span class="badge badge-light">' + numberGroupsByCollections + '</span></span></h4></li>' : ''}            
            ${((endpoint !== '/mycompositions') && numberGroupsCustom) ? '<li class="legenditem nav-item"><h4><span class="badge badge-warning">User&nbsp;<span class="badge badge-light">' + numberGroupsCustom + '</span></span></h4></li>' : ''}
            ${numberSinglComp ? '<li class="legenditem nav-item"><h4><span class="badge badge-success">None&nbsp;<span class="badge badge-light">' + numberSinglComp + '</span></span></h4></li>' : ''}
            <li class="legenditem nav-item"><h4><span class="badge badge-light">Total:&nbsp;</span><span class="badge badge-light">${totalcomps}</span></h4></li>
          </ul>`
}

const getSingleComps = (groupedComps) => {
  let listElelemts = ''
  const listCompsSingle = groupedComps.singlecomps
  listCompsSingle?.forEach((element) => {
    const template = paintSingleComposition(element)
    listElelemts += template
  })
  return listElelemts
}

const paintListOfCompositions = (groupedComps, customgroup, endpoint, totalcomps) => {
  
  let listElelemts = ''
  const numberGroupsByCollections = Object.keys(groupedComps.groupedbycoll).length
  const numberCustomGroups = Object.keys(groupedComps[customgroup]).length
  let numberSinglComp = groupedComps.singlecomps.length

  if (numberGroupsByCollections > 0) {
    const listComps = groupedComps.groupedbycoll
    const template = paintGroupCollection(listComps, 'coll')
    listElelemts += template
  }
  if (numberCustomGroups > 0) {
    const listComps = groupedComps[customgroup]
    const typeofbadge = (customgroup==='groupedbycollab') ? 'collab' : 'user'
    const template = paintGroupCollection(listComps, typeofbadge)
    listElelemts += template
  }
  if (numberSinglComp > 0) {
    listElelemts += getSingleComps(groupedComps)    
  }
  const legendButtons = getLegendButtons(numberGroupsByCollections, numberCustomGroups, numberSinglComp, endpoint, totalcomps) 
  paintMainElemsHomePage(listElelemts, legendButtons)
}

const paintMainElemsHomePage = (listElelemts, legendButtons) => {
  document.getElementById('grid').innerHTML = ''
  document.getElementById('grid').insertAdjacentHTML('afterbegin', listElelemts)
  document.getElementById('legendbuttons').innerHTML = ''
  document.getElementById('legendbuttons').insertAdjacentHTML('afterbegin', legendButtons)
  document.getElementById('searchInput').removeAttribute('disabled')
}

const initHomPage = async () => {
  const isAuth  = await getMyProfile(getMyCompositions,getRecentCompositions)  
  breadcrumbHandler(isAuth)
}

initHomPage()