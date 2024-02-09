import { callJsonApi, activateGoHomeLink } from '../../../common/js/utils'
import {breadcrumbHandler, navigate} from './breadcrumbhandler'
import {checkIfTermsAccepted, generateAcceptTermsModal} from '../../../common/js/acceptterms'
import {getGroupedCompositionsWithUsers, getGroupedCompositionsWithCollab, isuserpage, getGroupedCompositionsWithSubCollect} from './home_helper'

export const uriCompositionPage = '/composition.html?compositionId='

const uriUserPage = '/index.html?userid='
const uriCollectionPage = '/index.html?collectionid='

let CURRENT_USERNAME = null

let uriProfilePage = window.location.origin

const BADGE_STYLE = {'coll':'badge-collection', 'user':'badge-warning', 'collab':'badge-collab'}
const BORDER_STYLE = {'coll':'border-collection', 'user':'border-warning', 'collab':'border-collab'}
const URI_PAGE = {'coll':uriCollectionPage, 'user':uriUserPage}

const WELCOME_TEXT = 'We present Hi-Audio Online Platform a web application for musicians, researchers and an open community of enthusiasts of audio and music with a view to build a public database of music recordings from a wide variety of styles and different cultures.'

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
const getMyProfile = async () => {
  
  const isAuthenticated = await callJsonApi('/profile', 'GET')
  if (isAuthenticated.ok) {
    CURRENT_USERNAME = isAuthenticated.name
    document.getElementById('userlogin').style.display = 'none'
    document.getElementById('useroptions').style.display = ''
    document.getElementById('display_profile_name').innerText = `[${isAuthenticated.name}]`    
    checkIfTermsAccepted(isAuthenticated, homePageTermsAccepted)    
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

const displayUserNameInCard = (endpoint, username) => {
  let displayName = false
  if(!isuserpage(endpoint)){
    displayName = true
  } else {
    displayName = (username !== CURRENT_USERNAME)
  }
  return displayName
}
const updateUIWithUserInfo = (username, useruid) => {
  
  cleanWelcomeContainer(true)
  
  const userInfoContainer = document.createElement('div')
  userInfoContainer.id = 'infocontainer'
  userInfoContainer.innerHTML= `<div class="card mb-3" style="max-width: 540px;">
                                  <div class="row no-gutters">
                                    <div class="col-md-4">
                                      <img class="img-fluid" src="https://picsum.photos/seed/${useruid}/200" alt="User Picture">
                                    </div>
                                    <div class="col-md-8">
                                      <div class="card-body">
                                        <h5 class="card-title">User</h5>
                                        <p class="card-text" style="width:300px;">${username ?`${username }`: ''}</p>                                        
                                        <p class="card-text"><small class="text-muted"></small></p>
                                      </div>
                                    </div>
                                  </div>
                                </div>` 
  document.getElementById('welcomecontainer').appendChild(userInfoContainer) 
  
}
const getCompositionsByUserUid = async (useruid, auth) => {
  const endpoint = '/compositionsbyuserid/'+useruid
  const data = await callJsonApi(endpoint, 'GET')
  if(data.compositions){
    CURRENT_USERNAME = data.username
    updateUIWithUserInfo(data.username, useruid)
    return renderHomePage(data.compositions, endpoint)
  } else {
    alert('invalid return value for user id')
    if(auth.ok){
      navigate('my-comp')
    } else {
      navigate('recent-comp')
    }      
  }  
}

const cleanWelcomeContainer = (hidetext) => { 
  const welcomecontainer = document.getElementById('welcomecontainer')
  if(welcomecontainer.lastChild?.id){
    welcomecontainer.removeChild(welcomecontainer.lastChild)
  }
  if(!hidetext){
    const welcometextelem = document.createElement('div')
    welcometextelem.id = 'welcometext'
    welcometextelem.classList.add('col-sm-6')
    welcometextelem.classList.add('mx-auto')
    welcometextelem.innerHTML = `<em>${WELCOME_TEXT}</em>`
    document.getElementById('welcomecontainer').appendChild(welcometextelem)
  }  
}
const updateUIWithCollectionInfo = (collectiontitle, username, owner_uuid) => {

  cleanWelcomeContainer(true)  
  const collectionInfoContainer = document.createElement('div')
  collectionInfoContainer.id = 'infocontainer'
  collectionInfoContainer.innerHTML= `<div class="card border-collection mb-3">
                                        <div class="card-header bg-transparent border-collection"><b>Collection</b></div>
                                        <div class="card-body text-dark">
                                          <h5 class="card-title">${collectiontitle}</h5>
                                          <p class="card-text" style="width:300px;">Owner: <a href=${uriUserPage + owner_uuid} class="card-url">${username}</a></p>
                                        </div>
                                      </div>`
  document.getElementById('welcomecontainer').appendChild(collectionInfoContainer)
}

const getCompositionsByColelctionUid = async (collectionuid, auth) => {
  const endpoint = '/collectionastreebyid/'+collectionuid
  const data = await callJsonApi(endpoint, 'GET')
  if(data.compositions){
    CURRENT_USERNAME = data.username
    updateUIWithCollectionInfo(data.collection_name, data.username, data.owneruid)
    return renderHomePage(data.compositions, endpoint)
  } else {
    alert('invalid return value for collection id')
    if(auth.ok){
      navigate('my-comp')
    } else {
      navigate('recent-comp')
    }      
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
  const notUserPublicPage = !endpoint.includes('/compositionsbyuserid/') && !endpoint.includes('/collectionastreebyid/')
  if(notUserPublicPage){
    cleanWelcomeContainer(false)
  }
  if (!compositionsList.length && notUserPublicPage) {
    document.getElementById('initialmessage').hidden = false
    document.getElementById('initialmessage').classList.add('d-flex')
  } else {   
    renderHomePageWithLists(compositionsList, endpoint)
  }
}

const renderHomePageWithLists = (compositionsList, endpoint) => {
  if(endpoint.includes('/collectionastreebyid/')){        
    const parent_coll_id = endpoint.replace('/collectionastreebyid/', '')
    const groupedCompsAndSubColl = getGroupedCompositionsWithSubCollect(compositionsList, parent_coll_id)       
    paintListOfCompositions(groupedCompsAndSubColl, null, endpoint, compositionsList.length)
  } else if (!isuserpage(endpoint)) {
    const groupedComps = getGroupedCompositionsWithUsers(compositionsList)
    paintListOfCompositions(groupedComps, 'groupedbyuser_final', endpoint, compositionsList.length)
  }else {
    const groupedCompsWithCollab = getGroupedCompositionsWithCollab(compositionsList)
    paintListOfCompositions(groupedCompsWithCollab, 'groupedbycollab', endpoint, compositionsList.length)
  }
}

const paintSingleComposition = (element, endpoint) => {
  const displayName = displayUserNameInCard(endpoint, element.username)

  return `<div class='card border-success'>                       
            <div class="card-body">
            ${element.opentocontrib ? '<p class="badge badge-info">OPEN TO CONTRIB</p>' : ''}               
                <div>  
                  <a href='${uriCompositionPage + element.uuid}' class='card-url'>
                    <h5 class='card-title'>${element.title}</h5>
                  </a>
                  <p class='card-text text-truncate'>${element.description || ''}</p>
                  <p class='text-black-50'>${element.parent_collection ? ('Collection: ' + element.parent_collection) : ''}</p>
                  ${ displayName ? `<span class="d-inline-block text-truncate" style="max-width: 250px;">
                  <i class='fa fa-user'></i>&nbsp;
                  <a href='${uriUserPage + element.owner_uuid}' class='card-url'>
                    ${element.username}&nbsp;
                  </a>
                </span>`: ''}
                  <span class="d-inline-block text-truncate" style="max-width: 250px;">
                    <i class='fa fa-music'></i>&nbsp;${'Tracks: ' + element.tracks?.length}
                  </span>                  
                </div>                
            </div>            
        </div>`
}

const getUICardElemForCollection = (typebadge, numitems, groupTitle, groupId, listgroup) => {
    
    const badegstyle = BADGE_STYLE[typebadge]
    const borderstyle = BORDER_STYLE[typebadge]
    const url = URI_PAGE[typebadge]
    const badgeDisplayed = `<span class="badge ${badegstyle} d-inline-block text-truncate" style="max-width:85%;">
                              <span class="badge badge-light">${numitems}</span>&nbsp;
                              ${url ? `<a href=${url + groupId} class="card-header-url">${groupTitle}</a>` : `${groupTitle}`}                              
                          </span>`

    return `<div class='card ${borderstyle}'>                        
              <h4>${badgeDisplayed}</h4>        
              <div class="card-body">
                <div class="list-group border">              
                  ${listgroup}
                </div>
              </div>
            </div>`
}

const getUIListElemInsideCollection = (item, typebadge, endpoint) => {

  const displayName = displayUserNameInCard(endpoint, item.username)

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
            ${(typebadge !== 'user' && displayName) ? 
                '<span class="d-inline-block text-truncate" style="max-width: 220px;">'+
                  '<i class="fa fa-user"></i>&nbsp;' + 
                  '<a href='+uriUserPage + item.owner_uuid+' class="card-url">' + item.username + '&nbsp;'+                      
                  '</a>'+                  
                '</span>' : ''}            
            <span class="d-inline-block text-truncate" style="max-width: 200px;">
              <i class='fa fa-music'></i>&nbsp;${'Tracks: ' + item.tracks?.length}
            </span>
          </div>`
}

const paintGroupCollection = (listcomps, typebadge, endpoint) => {
  
  let allCompUIelem = ''  
  for (const comp in listcomps) {    
    const element = listcomps[comp]
    let listgroup = ''
    let groupTitle = ''
    let groupId = null
    if(typebadge === 'collab') {
      groupTitle = 'Collaborations'
    } else if (typebadge === 'coll'){
      groupTitle = Object.values(element)[0].parent_collection
      groupId = Object.values(element)[0].collection_uid
    } else {
      groupTitle = Object.values(element)[0].username
      groupId = Object.values(element)[0].owner_uuid
    } 
    for (const item of element) {      
      listgroup += getUIListElemInsideCollection(item, typebadge, endpoint)
    }    
    allCompUIelem += getUICardElemForCollection(typebadge, element.length, groupTitle, groupId, listgroup)
  }
  return allCompUIelem
}

const getLegendButtons = (numberGroupsByCollections, numberGroupsCustom, numberSinglComp, endpoint, totalcomps) => {
  const displayGroupsByLabel = (numberGroupsByCollections || ((!isuserpage(endpoint)) && numberGroupsCustom) || numberSinglComp)
  return `<ul class="nav justify-content-end">
            ${ displayGroupsByLabel ? '<li class="legenditem nav-item"><h4><span class="badge badge-light">Groups by:&nbsp;</span></h4></li>' : ''}
            ${numberGroupsByCollections ? '<li class="legenditem nav-item"><h4><span class="badge badge-collection">Collections&nbsp;<span class="badge badge-light">' + numberGroupsByCollections + '</span></span></h4></li>' : ''}            
            ${((!isuserpage(endpoint)) && numberGroupsCustom) ? '<li class="legenditem nav-item"><h4><span class="badge badge-warning">Users&nbsp;<span class="badge badge-light">' + numberGroupsCustom + '</span></span></h4></li>' : ''}
            ${numberSinglComp ? '<li class="legenditem nav-item"><h4><span class="badge badge-success">Singles&nbsp;<span class="badge badge-light">' + numberSinglComp + '</span></span></h4></li>' : ''}
            <li class="legenditem nav-item"><h4><span class="badge badge-light">Total:&nbsp;</span><span class="badge badge-light">${totalcomps}</span></h4></li>
          </ul>`
}

const getSingleComps = (groupedComps, endpoint) => {
  let listElelemts = ''
  const listCompsSingle = groupedComps.singlecomps
  listCompsSingle?.forEach((element) => {
    const template = paintSingleComposition(element, endpoint)
    listElelemts += template
  })
  return listElelemts
}

const paintListOfCompositions = (groupedComps, customgroup, endpoint, totalcomps) => {
  
  let listElelemts = ''
  const numberGroupsByCollections = Object.keys(groupedComps.groupedbycoll).length
  const numberCustomGroups = customgroup ? Object.keys(groupedComps[customgroup]).length : 0
  let numberSinglComp = groupedComps.singlecomps.length

  if (numberGroupsByCollections > 0) {
    const listComps = groupedComps.groupedbycoll
    const template = paintGroupCollection(listComps, 'coll', endpoint)
    listElelemts += template
  }
  if (numberCustomGroups > 0) {
    const listComps = groupedComps[customgroup]
    const typeofbadge = (customgroup==='groupedbycollab') ? 'collab' : 'user'
    const template = paintGroupCollection(listComps, typeofbadge, endpoint)
    listElelemts += template
  }
  if (numberSinglComp > 0) {
    listElelemts += getSingleComps(groupedComps, endpoint)    
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
  const queryString = window.location.search
  const user_id = queryString.split('userid=')[1]
  const collection_uid = queryString.split('collectionid=')[1]
  let isAuth  = await getMyProfile()    
  if(user_id){    
    await getCompositionsByUserUid(user_id, isAuth)
  } else if(collection_uid){
    await getCompositionsByColelctionUid(collection_uid, isAuth)
  } else if (isAuth.ok) {
    await getMyCompositions()
  } else {
    await getRecentCompositions()
  }
  breadcrumbHandler(isAuth, user_id || collection_uid)
}

activateGoHomeLink()
initHomPage()