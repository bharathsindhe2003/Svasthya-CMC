import { fb } from "../livepage/database_function.js";

import { showToast } from "../backend/toastmsg.js";
import { loadIncomingBg } from "../backend/incomingpopup.js";
export var userjoin = false;
// create Agora client
$("#defaultOpen").on("click", function (e) {
  //  $("#LiveSpecification").load(location.href + " #LiveSpecification");
  openPage("LiveComponents", this, "#FEDEF", 6);
});

var docId = localStorage.getItem("doctor_id");
var patientname = localStorage.getItem("patientname");
var uid = localStorage.getItem("patient_unique_id");
var docname = localStorage.getItem("docname");
var ongoing_val = 0;
var call_decline_val;
var Timeout;
var MakeOutgoingCall = false;
var channelid;

var queryString = window.location.search;
var urlParams = new URLSearchParams(queryString);
var openpage = urlParams.get("openpage");

/*navigator.serviceWorker.addEventListener("message", (event) => {

   var queryString1 = event.data.url;
  
   urlParams = new URLSearchParams(queryString1);
   console.log("querystring",urlParams);
  if((queryString1 != undefined) && (urlParams.get('name') !== null))
  {
        let pname = atob(urlParams.get('name'));
        var channelid=atob(urlParams.get('channelid'));
        var puid=atob(urlParams.get('uid'));
        console.log("uid: notification",puid);
        loadIncomingBg(pname,channelid,puid);
  }
  else if((queryString1 != undefined) && (urlParams.has("index.html?")) && (urlParams.get('timestamp') !== null))
  {
       localStorage.setItem('patient_unique_id',atob(urlParams.get('id')));
       location.replace('index.html?openpage=livecomponents');
       
       let param1 = urlParams.get('timestamp');
       console.log("in context param",param1);
       let param2 = urlParams.get('id');
       console.log("in context param",param2);
       const url = 'context_assment.html' + '?param1=' + param1+ '&param2=' + param2;
       window.open(url,"Context Assessment","width=1050,height=670,left=150,top=200,titlebar=0,toolbar=0,status=0");
       

  }
  else if(urlParams.get('param1') !== null)
  {
       let param1 = urlParams.get('param1');
       console.log("in context param",urlParams.get('param1'));
       let param2 = urlParams.get('param2');
       console.log("in context param",param2);

       const url = 'context_assment.html' + '?param1=' + param1+ '&param2=' + param2;
       window.open(url,"Context Assessment","width=1050,height=670,left=150,top=200,titlebar=0,toolbar=0,status=0");
       
  }
});*/

window.addEventListener("focus", function () {
  if (openpage == "outgoing") {
    let incomingchanneid = localStorage.getItem("incomingchannel_id");
    console.log("channelid ", incomingchanneid);
    generateToken(incomingchanneid);
    openPage("outgoing", this, "#3F79A4", 107);
    const loader = document.querySelector(".loader");
    loader.classList.add("loader--hidden");
  } else if (openpage == "backgroundnotification") {
    let pname = atob(urlParams.get("name"));
    var channelid = atob(urlParams.get("channelid"));
    var puid = atob(urlParams.get("uid"));
    console.log("uid: notification", puid);
    loadIncomingBg(pname, channelid, puid);
    uid = puid;
    openPage("LiveComponents", this, "#FEDEF", 102);
  } else if (openpage == this) {
    openPage("this", this, "#FEDEF", 16);
    document.getElementById("onehourbutton").click();
  }
});

window.addEventListener("load", function () {
  if (openpage == "livecomponents") {
    document.getElementById("defaultOpen").click();
  } else if (openpage == "outgoing") {
    let incomingchanneid = localStorage.getItem("incomingchannel_id");
    console.log("channelid ", incomingchanneid);
    generateToken(incomingchanneid);
    openPage("outgoing", this, "#3F79A4", 107);
    const loader = document.querySelector(".loader");
    loader.classList.add("loader--hidden");
  } else if (openpage == "backgroundnotification") {
    let pname = atob(urlParams.get("name"));
    var channelid = atob(urlParams.get("channelid"));
    var puid = atob(urlParams.get("uid"));
    console.log("uid: notification", puid);
    loadIncomingBg(pname, channelid, puid);
    uid = puid;
    openPage("LiveComponents", this, "#FEDEF", 102);
  } else if (openpage == this) {
    openPage("this", this, "#FEDEF", 16);
    document.getElementById("onehourbutton").click();
  }
});

$("#openhistory").on("click", function (e) {
  openPage("HistoryComponents", this, "#FEDEF", 16);
  document.getElementById("onehourbutton").click();
});

// console.log("[index.js] fb", fb);

$("#joinclick").on("click", function (e) {
  console.log("before openpage", Date.now());
  console.log("before generatetoken", Date.now(), MakeOutgoingCall, ongoing_val);
  if (MakeOutgoingCall == false && ongoing_val == 0) {
    MakeOutgoingCall = true;
    generateToken("");
    openPage("outgoing", this, "#3F79A4", 41);
    //Timeout = setTimeout(callPickup, 30000);
  } else if (MakeOutgoingCall == true && ongoing_val == 1) {
    openPage("outgoing", this, "#3F79A4", 44);
    //showToast("you can't call, already you're on another call ");
  } else if (userjoin == true) {
    openPage("outgoing", this, "#3F79A4", 44);
  } else {
    showToast("Active call is in process");
  }
});

function callPickup() {
  console.log("Leave function line:", 55);
  leave();
  showToast("No Answer");
}

// console.log("[index.js] fb", fb);

function generateToken(channel_id) {
  console.log("print inside the generateToken", channel_id);
  console.log("doc name", docname);
  var vc = fb.database().ref().child("video_call").child(docId);
  vc.set({
    call_decline: "0",
    channel_id: channel_id,
    from: docId,
    name: docname,
    ongoing: "0",
    timestamp: Date.now(),
    to: uid,
  });

  if (channel_id == "") {
    var channel_id = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("channelid creation", channel_id);
    var vc = fb.database().ref().child("video_call").child(docId).child("channel_id").set(channel_id);
    var vci = fb.database().ref("/video_call_initiator_1").child(docId).set(true);
    console.log("after setting channelid", vci);
    var vc1 = fb.database().ref("/video_call_initiator").child(docId).set(true);
    var vc = fb.database().ref().child("video_call").child(docId).child("ongoing").set("1");
    console.log("set initiator", vc1);
  } else {
    console.log("channel id from notification", channel_id);
    var vc = fb.database().ref().child("video_call").child(docId).child("channel_id").set(channel_id);
    console.log("after setting channelid", Date.now());
    var vci = fb.database().ref("/video_call_initiator_1").child(docId).set(true);
  }

  console.log("after script initiator", Date.now());

  // var token = '006fc9003567fdb4f0d8913e2122e3cd7b1IACrUM6U+UzCnG3OpQYKO0IOZV+W4cpBtW/bnnsrQgjqeW502gwh39v0IgDPZ5FIwEEAZAQAAQAAAAAAAgAAAAAAAwAAAAAABAAAAAAA'
  // joincall(token,channel_id);
}

$("#leave").on("click", function (e) {
  // generateToken();
  fb.database().ref().child("video_call").child(docId).child("call_decline").set("1");
  leave();
  console.log("Leave function line:", 149);
});

$("#mic-icon").on("click", function (e) {
  if (localTrackState.audioTrackEnabled) {
    muteAudio();
  } else {
    unmuteAudio();
  }
});

$("#cam-icon").on("click", function (e) {
  if (localTrackState.videoTrackEnabled) {
    muteVideo();
  } else {
    unmuteVideo();
  }
});

// Mute audio function
async function muteAudio() {
  if (!localTracks.audioTrack) return;
  await localTracks.audioTrack.setEnabled(false);
  localTrackState.audioTrackEnabled = false;
  $("#mic-icon").toggleClass("fa fa-microphone").toggleClass("fa fa-microphone-slash");
}

async function unmuteAudio() {
  if (!localTracks.audioTrack) return;
  await localTracks.audioTrack.setEnabled(true);
  localTrackState.audioTrackEnabled = true;
  $("#mic-icon").toggleClass("fa fa-microphone-slash").toggleClass("fa fa-microphone");
}

async function muteVideo() {
  if (!localTracks.videoTrack) return;
  await localTracks.videoTrack.setEnabled(false);
  localTrackState.videoTrackEnabled = false;
  $("#cam-icon").toggleClass("fa fa-video").toggleClass("fa fa-video-slash");
}

async function unmuteVideo() {
  if (!localTracks.videoTrack) return;
  await localTracks.videoTrack.setEnabled(true);
  localTrackState.videoTrackEnabled = true;
  $("#cam-icon").toggleClass("fa fa-video-slash").toggleClass("fa fa-video");
}

async function unsubscribe(user, mediaType) {
  const uid = user.uid;
  // subscribe to a remote user
  await client.unsubscribe(user, mediaType);
  console.log("unsubscribe success");
}

async function subscribe(user, mediaType) {
  const uid = user.uid;
  console.log("subscribe success", uid);
  // subscribe to a remote user
  try {
    await client.subscribe(user, mediaType);

    console.log("subscribe success", user, mediaType);

    if (mediaType === "video") {
      const player = $(`
      <div id="player-wrapper-${uid}">
        <div id="player-${uid}" class="player"></div>
      </div>
    `);
      $("#remote-playerlist").append(player);
      user.videoTrack.play(`player-${uid}`);
      var vc = fb.database().ref().child("video_call").child(docId).child("ongoing").set("0");
    } else if (mediaType === "audio") {
      user.audioTrack.play();
    }
  } catch (e) {
    console.log("not joined", e);
  }
}

function openPage(pageName, elmnt, color, lineno) {
  $(".right_col").hide(); // hide all elements with the class "right_col"
  $("#" + pageName).show(); // show the element with the ID equal to the value of pageName

  // ECharts measures container size at render time.
  // Since we hide/show entire sections, force a resize pass after the DOM updates.
  try {
    window.dispatchEvent(new Event("sidebar:toggled"));
    window.dispatchEvent(new Event("resize"));
    requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    setTimeout(() => window.dispatchEvent(new Event("resize")), 150);
  } catch {
    // ignore
  }

  // Remove the background color property from all tablink buttons
  $(".tablink").css("background-color", "");

  // Set the background color of the clicked tablink button to #0f7fb893
  $(elmnt).css("background-color", "#0f7fb893");
  $("#joinclick").css("background-color", "");

  switch (pageName) {
    case "outgoing":
      $("#joinclick").hide();
      break;
    default:
      $("#joinclick").show();
      break;
  }
}

function handleUserPublished(user, mediaType) {
  const id = user.uid;
  console.log("in user published", id);
  remoteUsers[id] = user;
  console.log("remote", remoteUsers[id]);
  subscribe(user, mediaType);
}

function handleUserUnpublished(user, mediaType) {
  console.log("in unpublished event");
  unsubscribe(user, mediaType);
  const id = user.uid;
  if (mediaType === "video") {
    delete remoteUsers[id];
    $(`#player-wrapper-${id}`).remove();
    var vc = fb.database().ref().child("video_call").child(docId);
    vc.child("ongoing").set("0");
    vc.child("call_decline").set("1");
    // vc.set({
    //    call_decline:"1",
    //    channel_id:channelid,
    //    from:docId,
    //    name:docname,
    //    ongoing:"0",
    //    timestamp:Date.now(),
    //    to:uid
    // });
  } else if (mediaType === "audio") {
    //user.audioTrack.stop();
  }
}
var localTracks = {
  videoTrack: null,
  audioTrack: null,
};
var localTrackState = {
  videoTrackEnabled: true,
  audioTrackEnabled: true,
};
var remoteUsers = {};
var client;

async function joincall(token, channel_id) {
  channelid = channel_id;
  console.log("print token", token);
  console.log("print channel_id", channel_id);

  client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  // Agora client options
  var options = {
    appid: null,
    channel: null,
    uid: null,
    token: null,
  };

  console.log("");
  options.appid = "fc9003567fdb4f0d8913e2122e3cd7b1"; //$("#appid").val();
  options.token = token; //'007eJxTYNiyqr9Z8u4u1w1rfmQ9Xvfw8eKUAAMxnkWeyT9mTfzzn6lMgSEt2dLAwNjUzDwtJckkzSDFwtLQONXI0Mgo1Tg5xTzJ8Kzv4+SGQEYGU2YmFkYGCATx2RgMjYxNTM0YGABJeCCC';  //' ;//$("#token").val();
  options.channel = channel_id; // '123456';
  console.log("channel id:", options.channel, "options.token", options.token);
  // add event listener to play remote tracks when remote user publishs.
  client.on("user-joined", UserJoined);
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);
  client.on("user-left", userleft);

  client.on("connection-state-change", (currentState, previousState, reason) => {
    if (currentState === "DISCONNECTED") {
      console.log("currentState", currentState);
    } else if (currentState === "CONNECTED") {
      console.log("currentState", currentState);
    }
  });

  // join a channel and create local tracks, we can use Promise.all to run them concurrently
  [options.uid, localTracks.audioTrack, localTracks.videoTrack] = await Promise.all([
    // join the channel
    client.join(options.appid, options.channel, options.token || null),

    // create local tracks, using microphone and camera
    AgoraRTC.createMicrophoneAudioTrack(),
    AgoraRTC.createCameraVideoTrack(),
  ]);

  // play local video track
  localTracks.videoTrack.play("local-player");
  console.log("call played", Date.now());
  //$("#local-player-name").text(`localVideo(${options.uid})`);

  // publish local tracks to channel
  await client.publish(Object.values(localTracks));
  console.log("call published", Date.now());

  // publish local tracks to channel

  var vc = fb.database().ref().child("video_call").child(docId);
  vc.child("call_decline").set("0");
  vc.child("ongoing").set("1");

  console.log("publish success");

  var vct = fb.database().ref().child("video_token").child(docId);
  vct.remove();
}
function userleft() {
  console.log("user is left the call");
  leave();
}

function UserJoined() {
  clearTimeout(Timeout);
  console.log("UserJoin : true");
  userjoin = true;
  //  setTimeout(() => userjoin = true, 3000);
}

function leave() {
  for (var trackName in localTracks) {
    var track = localTracks[trackName];
    if (track) {
      track.stop();
      track.close();
      localTracks[trackName] = undefined;
    }
    console.log("leave function is executing");
  }

  // remove remote users and player views
  remoteUsers = {};
  $("#remote-playerlist").html("");
  fb.database().ref().child("video_call").child(docId).child("ongoing").set("0");

  // leave the channel
  client.leave();

  $("#local-player-name").text("");
  $("#join").attr("disabled", false);
  $("#leave").attr("disabled", true);
  console.log("client leaves channel success");
  location.replace("index.html?openpage=livecomponents");
  MakeOutgoingCall = false;
  clearTimeout(Timeout);
}

$("#openvitals").on("click", function (e) {
  openPage("VitalsComponents", this, "#FEDEF", 16);
  // document.getElementById("onehourbutton").click();
});
export { joincall, openPage, generateToken, leave };
