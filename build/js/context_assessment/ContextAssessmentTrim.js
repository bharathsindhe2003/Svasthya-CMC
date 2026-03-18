var lightbox = document.getElementById("lightboxcontext");
var lightboxContainer = document.getElementById("lightboxcontainercontext");
var closeButton = document.getElementById("closebuttoncontext");

var head = "images/head.jpg";
const upperbody = "images/abdominal1.jpg";
const lowerbody = "images/knee.jpg";
const chest = "images/chest.jpg";
const front = "images/pain_front.jpg";
const painpoint = "images/pain_spot.jpg";
var RawScale = "";
var pain_spot = "";
var painspots = [];

if (closeButton != null) {
  closeButton.addEventListener("click", closeLightbox);
}

export function SymptomMsg(PatientName, RawSymptoms, RawScale, pain_spot, trigger) {
  RawScale = RawScale.replace(/ ||/gi, "");

  pain_spot = pain_spot.replace("/", " ");
  console.log("[ContextAssessmentTrim.js] Raw scale", RawScale, "Raw symptoms", RawSymptoms, "Painspots", pain_spot);
  var scale = RawScale.split(",");

  painspots = pain_spot.split(",");
  scale = scale.map(Number);
  console.log("[ContextAssessmentTrim.js] scale", typeof scale[0]);

  var symptoms = RawSymptoms.split(",");

  var sequel = [];

  for (var i = 0; i < symptoms.length; i++) {
    if (symptoms[i].trim() !== "Dizziness" || symptoms[i].trim() !== "Nausea" || symptoms[i].trim() !== "Sweat" || symptoms[i].trim() !== "Tiredness" || symptoms[i].trim() !== "Fever") {
      for (var i = 0; i < scale.length; i++) {
        symptoms[i] = symptoms[i].replace("_", " ");
        if (scale[i] >= 0 && scale[i] <= 3) {
          sequel.push(" Mild ");
        } else if (scale[i] >= 4 && scale[i] <= 6) {
          sequel.push(" Moderate ");
        } else if (scale[i] >= 7 && scale[i] <= 10) {
          sequel.push(" Severe ");
        } else {
          sequel.push(" ");
        }
      }
    } else {
      sequel.push(" ");
    }
  }
  var SymptomsMerged = sequel.join([(SymptomsMerged = ",")]);

  var myVar;

  try {
    var painsymptoms = false;
    var symptom = "";
    var aTag = [];
    if (trigger == "on") {
      stoptimer();
      document.getElementById("SymptomMsg").innerHTML = "";
      document.getElementById("SymptomMsg").innerHTML = PatientName + " has ";
    } else if (trigger == "once") {
      document.getElementById("SymptomMsg").innerHTML = "";
      document.getElementById("SymptomMsg").innerHTML = PatientName + " has ";
    } else if (trigger == "contextPage") {
      document.getElementById("ContextSymptomName").innerHTML = "";
      document.getElementById("ContextSymptomName").innerHTML = PatientName + " has ";
    }
    var j = 0;
    for (var i = 0; i < symptoms.length; i++) {
      console.log("[ContextAssessmentTrim.js] Symptoms length", symptoms[i]);
      if (symptoms[i].trim() == "Dizziness" || symptoms[i].trim() == "Nausea" || symptoms[i].trim() == "Sweat" || symptoms[i].trim() == "Tiredness" || symptoms[i].trim() == "Fever") {
        painsymptoms = false;
        symptom = symptoms[i] + ",";
        console.log("[ContextAssessmentTrim.js] in if ", symptom);
      } else {
        aTag[j] = document.createElement("a");
        aTag[j].innerText = symptoms[i].trim();
        aTag[j].href = "#";

        painsymptoms = true;
      }

      if (trigger == "on") {
        if (painsymptoms == true) {
          document.getElementById("SymptomMsg").append(sequel[j]) + " ";
          document.getElementById("SymptomMsg").appendChild(aTag[j]);
          j = j + 1;
        } else {
          document.getElementById("SymptomMsg").append(symptom) + ",";
        }
      } else if (trigger == "once") {
        if (painsymptoms == true) {
          document.getElementById("SymptomMsg").append(sequel[j]) + " ";
          document.getElementById("SymptomMsg").appendChild(aTag[j]);
          j = j + 1;
        } else {
          document.getElementById("SymptomMsg").append(symptom) + ",";
        }
      } else if (trigger == "contextPage") {
        if (painsymptoms == true) {
          document.getElementById("ContextSymptomName").append(sequel[j]) + " ";
          document.getElementById("ContextSymptomName").appendChild(aTag[j]);
          j = j + 1;
        } else {
          document.getElementById("ContextSymptomName").append(symptom) + ",";
        }
      }

      if (trigger == "on") {
        document.getElementById("SymptomMsg").className = "SymptomMsgCls";
        clearMsg();
      } else if (trigger == "once") {
        document.getElementById("SymptomMsg").className = "SymptomMsgCls";
      } else if (trigger == "contextPage") {
        document.getElementById("ContextSymptomName").className = "SymptomMsgCls";
      }
    }
    var index = 0;

    console.log("[ContextAssessmentTrim.js] painspots", aTag.length);
    for (var x = 0; x < aTag.length; x++) {
      var painspot = "";
      aTag[x].addEventListener("click", function (e) {
        var cmparestr = e.target.innerText.toString();
        cmparestr = cmparestr.trim();
        console.log("[ContextAssessmentTrim.js] compstr clicked string", cmparestr);
        for (var i = 0; i < symptoms.length; i++) {
          console.log("[ContextAssessmentTrim.js] in for loop", symptoms[i], cmparestr);
          if (cmparestr == symptoms[i].trim()) {
            index = i;
            painspot = painspots[index];
            console.log("[ContextAssessmentTrim.js] index", index, painspot);
            index = 0;
            break;
          }
        }
        var newpt;
        var scale = RawScale.split("|");
        var imgw;
        var imgh;
        var url = "";

        console.log("[ContextAssessmentTrim.js] target ", cmparestr);
        switch (cmparestr) {
          case "Head Ache":
            url = head;
            newpt = painspot.replace("h", " ");
            console.log("[ContextAssessmentTrim.js] url,pain spot for head", url, newpt);
            break;
          case "Throat pain":
            url = head;
            newpt = painspot.replace("h", " ");
            console.log("[ContextAssessmentTrim.js] url,pain spot for throt", url, newpt);
            break;
          case "Shoulder pain":
            url = chest;
            newpt = painspot.replace("c", " ");
            break;
          case "Chest pain":
            url = chest;
            newpt = painspot.replace("a", " ");
            break;
          case "Abdominal pain":
            url = upperbody;
            newpt = painspot.replace("a", " ");
            break;
          case "Back pain":
            url = back;
            newpt = painspot.replace("b", " ");
            break;
          case "Ankle pain":
            url = lowerbody;
            newpt = painspot.replace("k", " ");
            break;
          case "Knee pain":
            url = lowerbody;
            newpt = painspot.replace("k", " ");
            break;
          case "Elbow pain":
            url = upperbody;
            newpt = painspot.replace("a", " ");
            break;
          case "Foot pain":
            url = lowerbody;
            newpt = painspot.replace("k", " ");
            break;
          case "Wrist pain":
            url = upperbody;
            newpt = painspot.replace("a", " ");
            break;
          case "Hip pain":
            url = upperbody;
            newpt = painspot.replace("a", " ");
            break;
          case "Forearm pain":
            url = upperbody;
            newpt = painspot.replace("a", " ");
            break;
          case "Hand pain":
            url = upperbody;
            newpt = painspot.replace("a", " ");
            break;
          case "Thigh pain":
            url = upperbody;
            newpt = painspot.replace("a", " ");
            break;
          case "Lower leg_pain":
            url = lowerbody;
            newpt = painspot.replace("k", " ");
            break;
          case "Upper arm pain":
            url = upperbody;
            newpt = painspot.replace("h", " ");
            break;
          case "Chin pain":
            url = head;
            newpt = painspot.replace("h", " ");
            break;
          case "Ear pain":
            url = head;
            newpt = painspot.replace("h", " ");
            break;
          case "Nose pain":
            url = head;
            newpt = painspot.replace("h", " ");
            break;
          case "Eye pain":
            url = head;
            newpt = painspot.replace("h", " ");
            break;
          case "default":
            url = "";
            break;
            console.log("[ContextAssessmentTrim.js] in default");
        }
        if (url !== "") {
          createcontext(url, newpt);
        }
      });
    }

    function createcontext(url, pain_spot) {
      console.log("[ContextAssessmentTrim.js] url", url, pain_spot);
      const xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          lightboxContainer.innerHTML = this.responseText;
          displayLightbox();

          const img = document.getElementById("painptimg");

          const pp = document.getElementById("point");
          img.src = url;

          img.style.top = 0 + "px";
          img.style.left = 0 + "px";
          img.onload = function () {
            pp.style.position = "absolute";
            var x = img.clientWidth / 12;
            var y = img.clientHeight / 12;
            pp.style.top = (pain_spot / 12) * y + "px";
            pp.style.left = (pain_spot % 12) * x + "px";
            pp.src = painpoint;
            console.log("[ContextAssessmentTrim.js] xpos", pp.style.top, pp.style.left);
          };
        }
      };
      xhttp.open("GET", "painpoint.php", true);
      xhttp.send();
    }

    function displayLightbox() {
      lightbox.style.display = "block";
    }

    function clearMsg() {
      console.log("[ContextAssessmentTrim.js] triggered to set timing:");
      myVar = setTimeout(function () {
        document.getElementById("SymptomMsg").innerHTML = "";
      }, 30000);
      console.log("[ContextAssessmentTrim.js] triggered to end timing:");
    }

    function stoptimer() {
      clearTimeout(myVar);
      console.log("[ContextAssessmentTrim.js] triggered to cleartime:");
    }
  } catch (e) {
    console.error("[ContextAssessmentTrim.js] Unable to set innerHTML", e);
  }
}

function closeLightbox() {
  lightbox.style.display = "none";
}
