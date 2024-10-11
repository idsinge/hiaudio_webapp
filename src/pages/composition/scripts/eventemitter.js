/*
 * This script is provided to give an example how the playlist can be controlled using the event emitter.
 * This enables projects to create/control the useability of the project.
*/
import { DB, openDB, updateTable } from '../../../common/js/indexedDB'
import { playlist, fileUploader, USER_PERMISSION, displayHiddenControls } from './composition'
import { CURRENT_USER_ID, NUM_TRACKS } from './composition_helper'

/* https://github.com/naomiaro/waveform-playlist/blob/master/dist/waveform-playlist/js/emitter.js */
//var ee = playlist.getEventEmitter();
var ee = null
var $container = $("body");
var $timeFormat = $container.find('.time-format');
var $audioStart = $container.find('.audio-start');
var $audioEnd = $container.find('.audio-end');
var $time = $container.find('.audio-pos');

var format = "hh:mm:ss.uuu";
var startTime = 0;
var endTime = 0;
var audioPos = 0;
var downloadUrl = undefined;
var isLooping = false;
var playoutPromises;
var isRecording = false;

function toggleActive(node) {
  var active = node.parentNode.querySelectorAll('.active');
  var i = 0, len = active.length;

  for (; i < len; i++) {
    active[i].classList.remove('active');
  }

  node.classList.toggle('active');
}

function cueFormatters(format) {

  function clockFormat(seconds, decimals) {
    var hours,
        minutes,
        secs,
        result;

    hours = parseInt(seconds / 3600, 10) % 24;
    minutes = parseInt(seconds / 60, 10) % 60;
    secs = seconds % 60;
    secs = secs.toFixed(decimals);

    result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (secs < 10 ? "0" + secs : secs);

    return result;
  }

  var formats = {
    "seconds": function (seconds) {
        return seconds.toFixed(0);
    },
    "thousandths": function (seconds) {
        return seconds.toFixed(3);
    },
    "hh:mm:ss": function (seconds) {
        return clockFormat(seconds, 0);   
    },
    "hh:mm:ss.u": function (seconds) {
        return clockFormat(seconds, 1);   
    },
    "hh:mm:ss.uu": function (seconds) {
        return clockFormat(seconds, 2);   
    },
    "hh:mm:ss.uuu": function (seconds) {
        return clockFormat(seconds, 3);   
    }
  };

  return formats[format];
}

function updateSelect(start, end) {
  if (start < end) {
    $('.btn-trim-audio').removeClass('disabled');
    $('.btn-loop').removeClass('disabled');
  }
  else {
    $('.btn-trim-audio').addClass('disabled');
    $('.btn-loop').addClass('disabled');
  }

  $audioStart.val(cueFormatters(format)(start));
  $audioEnd.val(cueFormatters(format)(end));

  startTime = start;
  endTime = end;
}

function updateTime(time) {
  $time.html(cueFormatters(format)(time));

  audioPos = time;
}

updateSelect(startTime, endTime);
updateTime(audioPos);


let downloadProgressItems = {}
function updateDownloadProgress(name, percent){
  const downloadProgressElem = document.getElementById('download-progress-elems')
  if(downloadProgressElem && !downloadProgressElem.hidden){
    let downloadProgress = 0
    downloadProgressItems[name] = percent
    const downloadProgressBar = document.getElementById('download-progress-bar')
    const downloadPercentage = document.getElementById('download-percentage')
    for (const [key, value] of Object.entries(downloadProgressItems)) {
      downloadProgress += value
    }
    const progressNumber = (downloadProgress / NUM_TRACKS).toFixed(2)
    downloadProgressBar.value = progressNumber / 100
    downloadPercentage.innerHTML = progressNumber + ' %'
    if(progressNumber == 100){
       downloadProgressElem.innerHTML = `Rendering...<br><progress></progress>`
    }
  }
}

/*
* Code below sets up events to send messages to the playlist.
*/
// $container.on("click", ".btn-playlist-state-group", function() {
//   //reset these for now.
//   $('.btn-fade-state-group').addClass('hidden');
//   $('.btn-select-state-group').addClass('hidden');

//   if ($('.btn-select').hasClass('active')) {
//     $('.btn-select-state-group').removeClass('hidden');
//   }

//   if ($('.btn-fadein').hasClass('active') || $('.btn-fadeout').hasClass('active')) {
//     $('.btn-fade-state-group').removeClass('hidden');
//   }
// });

$container.on("click", ".btn-annotations-download", function() {
  ee.emit("annotationsrequest");
});

$container.on("click", ".btn-loop", function() {
  isLooping = true;
  playoutPromises = playlist.play(startTime, endTime);
});

$container.on("click", ".btn-play", function() {
  ee.emit("play");
  $(".btn-group .btn-record").prop('disabled', true);
});

$container.on("click", ".btn-pause", function() {
  isLooping = false;
  ee.emit("pause");
  $(".btn-group .btn-record").prop('disabled', false);
});

$container.on("click", ".btn-stop", function() {
  isLooping = false;
  if(isRecording){
    isRecording = false
    if(USER_PERMISSION) {
      const newTrackPos = playlist.getInfo().tracks.length - 1 
      ee.emit('startaudiorendering', 'wav', newTrackPos)
    }
  }
  ee.emit("stop");
  $(".btn-group button").prop('disabled', false);
});

$container.on("click", ".btn-rewind", function() {
  isLooping = false;
  ee.emit("rewind");
  $(".btn-group .btn-record").prop('disabled', false);
});

$container.on("click", ".btn-fast-forward", function() {
  isLooping = false;
  ee.emit("fastforward");
  $(".btn-group .btn-record").prop('disabled', false);
});

$container.on("click", ".btn-clear", function() {
  isLooping = false;
  ee.emit("clear");
});

const startRecording = (currentLatency) => {
  if(!isRecording){
    isRecording = true;  
    const latencyInSeconds = currentLatency/1000;
    $(".btn-group button").prop('disabled', true);
    $(".btn-group .btn-stop").prop('disabled', false);
    ee.emit("record", latencyInSeconds);
  } 
}

$container.on("click", ".btn-record", function() {
  if(!isRecording){
    let currentLatency = localStorage.getItem('latency')
    currentLatency = currentLatency? parseInt(currentLatency):0
    startRecording(currentLatency)
  }
});

//track interaction states
$container.on("click", ".btn-cursor", function() {
  ee.emit("statechange", "cursor");
  toggleActive(this);
});

$container.on("click", ".btn-select", function() {
  ee.emit("statechange", "select");
  toggleActive(this);
});

$container.on("click", ".btn-shift", function() {
  ee.emit("statechange", "shift");
  toggleActive(this);
});

$container.on("click", ".btn-fadein", function() {
  ee.emit("statechange", "fadein");
  toggleActive(this);
});

$container.on("click", ".btn-fadeout", function() {
  ee.emit("statechange", "fadeout");
  toggleActive(this);
});

//fade types
$container.on("click", ".btn-logarithmic", function() {
  ee.emit("fadetype", "logarithmic");
  toggleActive(this);
});

$container.on("click", ".btn-linear", function() {
  ee.emit("fadetype", "linear");
  toggleActive(this);
});

$container.on("click", ".btn-scurve", function() {
  ee.emit("fadetype", "sCurve");
  toggleActive(this);
});

$container.on("click", ".btn-exponential", function() {
  ee.emit("fadetype", "exponential");
  toggleActive(this);
});

//zoom buttons
$container.on("click", ".btn-zoom-in", function() {
  ee.emit("zoomin");
});

$container.on("click", ".btn-zoom-out", function() {
  ee.emit("zoomout");
});

$container.on("click", ".btn-trim-audio", function() {
  ee.emit("trim");
});

$container.on("click", ".btn.print", function() {
  console.log(playlist.getInfo());
});

$container.on("click", ".btn-download", function () {
  if(playlist.tracks.length){
    ee.emit('startaudiorendering', 'wav');
  }
});

$container.on("click", ".btn-seektotime", function () {
  var time = parseInt(document.getElementById("seektime").value, 10);
  ee.emit("select", time, time);
});

$container.on("change", ".select-seek-style", function (node) {
  playlist.setSeekStyle(node.target.value);
});

//track drop
$container.on("change", "#fileInput", function(e) {  
  var changeEvent = this.files;  
  for (var i = 0; i < changeEvent.length; i++) {
    ee.emit("newtrack", changeEvent[i]);
  }
});

$container.on("dragenter", ".track-drop", function(e) {
  e.preventDefault();
  e.target.classList.add("drag-enter");
});

$container.on("dragover", ".track-drop", function(e) {
  e.preventDefault();
});

$container.on("dragleave", ".track-drop", function(e) {
  e.preventDefault();
  e.target.classList.remove("drag-enter");
});

$container.on("drop", ".track-drop", function(e) {
  e.preventDefault();
  e.target.classList.remove("drag-enter");

  var dropEvent = e.originalEvent;

  for (var i = 0; i < dropEvent.dataTransfer.files.length; i++) {
    ee.emit("newtrack", dropEvent.dataTransfer.files[i]);
  }
});

$container.on("change", ".time-format", function(e) {
  format = $timeFormat.val();
  ee.emit("durationformat", format);

  updateSelect(startTime, endTime);
  updateTime(audioPos);
});

$container.on("input change", ".master-gain", function(e){
  ee.emit("mastervolumechange", e.target.value);
});

$container.on("change", ".continuous-play", function(e){
  ee.emit("continuousplay", $(e.target).is(':checked'));
});

$container.on("change", ".link-endpoints", function(e){
  ee.emit("linkendpoints", $(e.target).is(':checked'));
});

$container.on("change", ".automatic-scroll", function(e){
  ee.emit("automaticscroll", $(e.target).is(':checked'));
});

function storeTrackSettings(trackObject){
  if(trackObject?.customClass){    
    let trackSettings = (({ muted, gain, soloed, stereoPan }) => ({ muted, gain, soloed, stereoPan}))(trackObject)    
    trackSettings['track_id'] = trackObject.customClass.track_id
    trackSettings['composition_id'] = trackObject.customClass.composition_id
    const viewer_id = trackObject.customClass.viewer_id || CURRENT_USER_ID   
    if(!DB){
      openDB(viewer_id).then((db) =>{
        updateTable(db, trackSettings) 
      })      
    } else {      
      updateTable(DB, trackSettings)      
    }       
  }
}

function displaySoundStatus(status, trackObject) {
  storeTrackSettings(trackObject)
  $(".sound-status").html(status);
}

function displayLoadingData(data) {
  var info = $("<div/>").append(data);
  $(".loading-data").append(info);
}

function displayDownloadLink(link) {
  var dateString = (new Date()).toISOString();
  var $link = $("<a/>", {
    'href': link,
    'download': 'waveformplaylist' + dateString + '.wav',
    'text': 'Download mix ' + dateString,
    'class': 'btn btn-small btn-download-link'
  });

  $('.btn-download-link').remove();
  $('.btn-download').after($link);
}


export const initEventEmitter = () => {

   ee = playlist.getEventEmitter();
}

export const enableUpdatesOnEmitter = () => {
  
  /*
  * Code below receives updates from the playlist.
  */
  ee.on("select", updateSelect);

  ee.on("timeupdate", updateTime);

  ee.on("mute", function(track) {
    displaySoundStatus("Mute button pressed for " + track.name, track);
  });

  ee.on("solo", function(track) {
    displaySoundStatus("Solo button pressed for " + track.name, track);
  });

  let volumetimeout = null
  ee.on("volumechange", function(volume, track) {
    displaySoundStatus(track.name + " now has volume " + volume + ".");
    clearTimeout(volumetimeout)
    volumetimeout = setTimeout(() => {   
      storeTrackSettings(track)   
    }, 500)  
  });

  let stereopantimeout = null
  ee.on("stereopan", function(value, track) {
    displaySoundStatus(track.name + " now has stereo pan " + value + ".");
    clearTimeout(stereopantimeout)
    stereopantimeout = setTimeout(() => {   
      storeTrackSettings(track)
    }, 500) 
  });

  ee.on("mastervolumechange", function(volume) {
    displaySoundStatus("Master volume now has volume " + volume + ".");
  });


  var audioStates = ["uninitialized", "loading", "decoding", "finished"];

  ee.on("audiorequeststatechange", function(state, src) {
    var name = src;

    if (src instanceof File) {
      name = src.name;
    }

    displayLoadingData("Track " + name + " is in state " + audioStates[state]);
  });

  ee.on("loadprogress", function(percent, src) {
    var name = src;

    if (src instanceof File) {
      name = src.name;
    }
    updateDownloadProgress(name, percent)
    displayLoadingData("Track " + name + " has loaded " + percent + "%");
  });

  ee.on("audiosourcesloaded", function() {
    displayLoadingData("Tracks have all finished decoding.");
  });
  
  let fileCounter = 0
  let processTracks = []
  ee.on("audiosourcesrendered", function() {
    displayHiddenControls()
    const downloadProgressElem = document.getElementById('download-progress-elems')
    if(downloadProgressElem && !downloadProgressElem.hidden){
      downloadProgressElem.remove()
    }
    if(USER_PERMISSION){
      const theFile = document.getElementById('fileInput')
      const numberNewFiles = theFile.files.length
      if(numberNewFiles){
        const trackPos = playlist.tracks.length - 1
        const trackUID = Date.now()
        playlist.tracks[trackPos].trackuid = trackUID
        if(fileCounter < numberNewFiles){
          processTracks.push(playlist.tracks[trackPos])         
          fileCounter ++
        }
        if(fileCounter === numberNewFiles){
          const arrayFiles = Array.from(theFile.files)
          for(let pos = 0; pos < theFile.files.length; pos++){
            const index = arrayFiles.findIndex((obj) => obj.name === processTracks[pos].name)
            fileUploader.sendData(arrayFiles[index], null, processTracks[pos].trackuid )
          }
          processTracks = []
          fileCounter = 0
        }
      } else {
        displayLoadingData("Tracks have been rendered");
      }
    }    
  });

  ee.on("audiosourceserror", function(e) {
    displayLoadingData(e.message);
  });

  ee.on('audiorenderingfinished', function (type, data, trackPos) {
    if(trackPos >= 0 && USER_PERMISSION){
      const trackUID = Date.now()
      data.name = 'audio'
      data.fileName = trackUID + '.wav'
      playlist.tracks[trackPos].trackuid = trackUID
      fileUploader.sendData(data, 'blob', trackUID)
    }
    else if (type == 'wav'){
      if (downloadUrl) {
        window.URL.revokeObjectURL(downloadUrl);
      }
      downloadUrl = window.URL.createObjectURL(data);
      displayDownloadLink(downloadUrl);
    }
  });

  ee.on('finished', function () {
    console.log("The cursor has reached the end of the selection !");
    $(".btn-group .btn-record").prop('disabled', false);

    if (isLooping) {
      playoutPromises.then(function() {
        playoutPromises = playlist.play(startTime, endTime);
      });
    }
  });
}