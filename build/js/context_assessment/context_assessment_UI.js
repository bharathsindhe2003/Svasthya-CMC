import { fb } from "../livepage/database_function.js";
import { heartrate_data, blood_pressure_data, respiration_rate_data, acceleration_data, blood_oxygen_data, temperature_data, ews_value_passing } from "../livepage/live-custom.js";
import { NoEcgData, NoPpgData, NoRRData, NoData } from "../livepage/EchartGraphs.js";

var username;
var heart_rate;
var bp;
var respiration_rate;
var acc;
var spo2;
var temp;

var ecg;
var ppg;
var rr;

var scale;
var symptoms;
var pain_spot = [];
var option1;
var value;

document.getElementById("loader").className = "loader";

const urlParams = new URLSearchParams(window.location.search);
var originlalTimestamp = parseInt(atob(urlParams.get("param1")));
var timestamp = originlalTimestamp;
var id = atob(urlParams.get("param2"));
var page = atob(urlParams.get("param3"));

console.log("[context_assessment_UI.js] originlalTimestamp", originlalTimestamp);
console.log("[context_assessment_UI.js] Timestamp:", timestamp);
console.log("[context_assessment_UI.js] ID:", id);
console.log("[context_assessment_UI.js] page", page, "timestamp", timestamp);

var patients = fb.database().ref().child("patients").child(id);

patients.once("value", function (snapshot) {
  console.log("[context_assessment_UI.js] Fetching patient data...");
  let patient_data = snapshot.val() || {};
  username = patient_data.username;
});

var patientsDataRef;
var patientsECGDataRef;
var patientsPPGDataRef;
var patientsRRDataRef;
var patientsEWSDataRef;
try {
  if (page === "1") {
    patientsDataRef = fb.database().ref().child("patientlivedata").child(id).child(timestamp);
    patientsECGDataRef = fb.database().ref().child("patientecgdata").child(id).child(timestamp);
    patientsPPGDataRef = fb.database().ref().child("patientppgdata").child(id).child(timestamp);
    patientsRRDataRef = fb.database().ref().child("patientrrdata").child(id).child(timestamp);
    patientsEWSDataRef = fb.database().ref().child("EWS").child(id).child(timestamp);

    Promise.all([
      patientsDataRef.once("value").then((snapshot) => snapshot.val() || {}),
      patientsECGDataRef.once("value").then((snapshot) => snapshot.val() || {}),
      patientsPPGDataRef.once("value").then((snapshot) => snapshot.val() || {}),
      patientsRRDataRef.once("value").then((snapshot) => snapshot.val() || {}),
      patientsEWSDataRef.once("value").then((snapshot) => snapshot.val() || {}),
    ])
      .then(([patientData, patientECGData, patientPPGData, patientRRData, patientEWSData]) => {
        if (patientECGData) {
          // ECG
          ecg = patientECGData.payload ? patientECGData.payload : null;
          if (ecg != null) {
            var ECGDateTime = new Date(timestamp * 1000);
            var ContextEcgDate = ("0" + ECGDateTime.getDate()).slice(-2) + "/" + ("0" + (ECGDateTime.getMonth() + 1)).slice(-2) + "/" + ECGDateTime.getFullYear();
            var ContextEcgTime = ("0" + ECGDateTime.getHours()).slice(-2) + ":" + ("0" + ECGDateTime.getMinutes()).slice(-2) + ":" + ("0" + ECGDateTime.getSeconds()).slice(-2);
            document.getElementById("contextecgdate").innerHTML = ContextEcgDate;
            document.getElementById("contextecgtime").innerHTML = ContextEcgTime;

            let result1 = ecg.replace(/\]\[/g, ", ").trim();
            result1 = result1.replace(/\]/g, "").trim();
            result1 = result1.replace(/\[/g, "").trim();
            var final_ecg = result1.split(",").map(Number);

            ECG_data("", ContextEcgDate, ContextEcgTime, option1, value, final_ecg, scale);
            console.log("[context_assessment_UI.js] ECG data passed successfully.", final_ecg);
          } else {
            document.getElementById("contextecgdate").innerHTML = "";
            document.getElementById("contextecgtime").innerHTML = "";
            var echartLinecontext = echarts.init(document.getElementById("context_ecg"));
            echartLinecontext.clear();
            echartLinecontext.setOption(NoEcgData);
            console.log("[context_assessment_UI.js] ECG No Data chart displayed.");
          }
        }
        if (patientPPGData) {
          // PPG
          ppg = patientPPGData.payload ? patientPPGData.payload : null;
          if (ppg != null) {
            var PpgDateTime = new Date(timestamp * 1000);
            var ContextPpgDate = ("0" + PpgDateTime.getDate()).slice(-2) + "/" + ("0" + (PpgDateTime.getMonth() + 1)).slice(-2) + "/" + PpgDateTime.getFullYear();
            var ContextPpgTime = ("0" + PpgDateTime.getHours()).slice(-2) + ":" + ("0" + PpgDateTime.getMinutes()).slice(-2) + ":" + ("0" + PpgDateTime.getSeconds()).slice(-2);

            document.getElementById("contextppgdate").innerHTML = ContextPpgDate;
            document.getElementById("contextppgtime").innerHTML = ContextPpgTime;

            let result1 = ppg.replace(/\,/g, "").trim();
            var final_ppg = result1.split(" ").map(Number);
            PPG_data("", ContextPpgDate, ContextPpgTime, option1, value, final_ppg, scale);
            console.log("[context_assessment_UI.js] PPG data passed successfully.");
          } else {
            console.log("[context_assessment_UI.js] PPG data is null, displaying No Data chart.");
            document.getElementById("contextppgdate").innerHTML = "";
            document.getElementById("contextppgtime").innerHTML = "";

            var echartLinecontext = echarts.init(document.getElementById("context_ppg"));
            echartLinecontext.clear();
            echartLinecontext.setOption(NoPpgData);
            console.log("[context_assessment_UI.js] PPG No Data chart displayed.");
          }
        }
        if (patientRRData) {
          // RR
          rr = patientRRData.payload ? patientRRData.payload : null;
          if (rr !== null) {
            var RRDateTime = new Date(timestamp * 1000);
            var ContextRRDate = ("0" + RRDateTime.getDate()).slice(-2) + "/" + ("0" + (RRDateTime.getMonth() + 1)).slice(-2) + "/" + RRDateTime.getFullYear();
            var ContextRRTime = ("0" + RRDateTime.getHours()).slice(-2) + ":" + ("0" + RRDateTime.getMinutes()).slice(-2) + ":" + ("0" + RRDateTime.getSeconds()).slice(-2);

            document.getElementById("contextrrdate").innerHTML = ContextRRDate;
            document.getElementById("contextrrtime").innerHTML = ContextRRTime;

            let result1 = rr.replace(/\,/g, " ").trim();
            var final_rr = result1
              .split(/\s+/)
              .map(Number)
              .filter(function (n) {
                return !isNaN(n);
              });

            RR_data("", ContextRRDate, ContextRRTime, option1, value, final_rr, scale);
            console.log("[context_assessment_UI.js] RR data passed successfully.");
          } else {
            console.log("[context_assessment_UI.js] RR data is null, displaying No Data chart.");
            document.getElementById("contextrrdate").innerHTML = "";
            document.getElementById("contextrrtime").innerHTML = "";

            var echartLinecontext = echarts.init(document.getElementById("context_rr"));
            echartLinecontext.clear();
            echartLinecontext.setOption(NoRRData);
            console.log("[context_assessment_UI.js] RR No Data chart displayed.");
          }
        }
        if (patientData) {
          // Other
          heart_rate = patientData.hr !== undefined && patientData.hr !== null && patientData.hr !== "" ? parseFloat(patientData.hr) / 100 : null;
          console.log("[context_assessment_UI.js] heart_rate:", heart_rate);

          spo2 = patientData.spo !== undefined && patientData.spo !== null && patientData.spo !== "" ? parseFloat(patientData.spo) / 100 : null;
          console.log("[context_assessment_UI.js] spo2:", spo2);

          temp = patientData.temp !== undefined && patientData.temp !== null && patientData.temp !== "" ? parseFloat(patientData.temp) : null;
          console.log("[context_assessment_UI.js] temp:", temp);

          acc = patientData.acc ? patientData.acc : null;
          console.log("[context_assessment_UI.js] acc:", acc);

          bp = patientData.bp ? patientData.bp : null;
          console.log("[context_assessment_UI.js] bp:", bp);

          let [contextsbp, contextdbp] = bp && bp.includes("/") ? bp.split("/") : ["-", "-"];
          console.log("[context_assessment_UI.js] contextsbp:", contextsbp);
          console.log("[context_assessment_UI.js] contextdbp:", contextdbp);

          respiration_rate = patientData.rr !== undefined && patientData.rr !== null && patientData.rr !== "" ? patientData.rr : NaN;
          console.log("[context_assessment_UI.js] respiration_rate:", respiration_rate);

          heart_rate = Number.isFinite(heart_rate) ? heart_rate : "-";
          respiration_rate = Number.isFinite(Number(respiration_rate)) ? Number(respiration_rate) : "-";
          temp = Number.isFinite(temp) ? temp : "-";
          spo2 = Number.isFinite(spo2) ? spo2 : "-";
          bp = bp !== undefined && bp !== null && bp !== "" ? bp : "-/-";
          acc = acc !== undefined && acc !== null && acc !== "" ? acc : "-";

          console.log("[context_assessment_UI.js] Processed patient data: ", { heart_rate, respiration_rate, temp, spo2, contextsbp, contextdbp, acc });

          heartrate_data("", heart_rate);
          respiration_rate_data("", respiration_rate);
          temperature_data("", temp);
          blood_oxygen_data("", spo2);
          blood_pressure_data("", "", contextsbp, contextdbp);
          acceleration_data("", acc);

          console.log("[context_assessment_UI.js] Live patient data processed and passed successfully.");

          var SensorDateTime = new Date(timestamp * 1000);
          var ContextSensorDate = ("0" + SensorDateTime.getDate()).slice(-2) + "/" + ("0" + (SensorDateTime.getMonth() + 1)).slice(-2) + "/" + SensorDateTime.getFullYear();
          var ContextSensorTime = ("0" + SensorDateTime.getHours()).slice(-2) + ":" + ("0" + SensorDateTime.getMinutes()).slice(-2) + ":" + ("0" + SensorDateTime.getSeconds()).slice(-2);

          document.getElementById("contextsensordate").innerHTML = ContextSensorDate;
          document.getElementById("contextsensortime").innerHTML = ContextSensorTime;

          // Symptoms
          if (patientData.symptoms) {
            symptoms = patientData.symptoms;

            const scale_array = patientData.scale ? patientData.scale.split(",").map((s) => s.trim()) : [];
            const symptoms_array = symptoms.split(",").map((symptom) => symptom.trim().replace(/_/g, " "));

            // remove /
            pain_spot = patientData.pain_spot ? patientData.pain_spot.split(",").map((s) => s.trim().replace(/\//g, "")) : [];
            // Build symptom text with severity based on scale values
            const painSymptoms = {
              "Head Ache": { imagePath: new URL("../../../production/images/head.jpg", import.meta.url).href, grid: "12X12" },
              "Throat pain": { imagePath: new URL("../../../production/images/head.jpg", import.meta.url).href, grid: "12X12" },
              "Shoulder pain": { imagePath: new URL("../../../production/images/chest.jpg", import.meta.url).href, grid: "12X12" },
              "Chest pain": { imagePath: new URL("../../../production/images/chest.jpg", import.meta.url).href, grid: "12X12" },
              "Abdominal pain": { imagePath: new URL("../../../production/images/abdominal.jpg", import.meta.url).href, grid: "12X12" },
              "Back pain": { imagePath: new URL("../../../production/images/back_pain.jpg", import.meta.url).href, grid: "12X12" },
              "Ankle pain": { imagePath: new URL("../../../production/images/knee.jpg", import.meta.url).href, grid: "12X12" },
              "Knee pain": { imagePath: new URL("../../../production/images/knee.jpg", import.meta.url).href, grid: "12X12" },
              "Elbow pain": { imagePath: new URL("../../../production/images/abdominal.jpg", import.meta.url).href, grid: "12X12" },
              "Foot pain": { imagePath: new URL("../../../production/images/knee.jpg", import.meta.url).href, grid: "12X12" },
              "Wrist pain": { imagePath: new URL("../../../production/images/abdominal.jpg", import.meta.url).href, grid: "12X12" },
              "Hip pain": { imagePath: new URL("../../../production/images/abdominal.jpg", import.meta.url).href, grid: "12X12" },
              "Forearm pain": { imagePath: new URL("../../../production/images/abdominal.jpg", import.meta.url).href, grid: "12X12" },
              "Hand pain": { imagePath: new URL("../../../production/images/abdominal.jpg", import.meta.url).href, grid: "12X12" },
              "Thigh pain": { imagePath: new URL("../../../production/images/abdominal.jpg", import.meta.url).href, grid: "12X12" },
              "Lower leg pain": { imagePath: new URL("../../../production/images/knee.jpg", import.meta.url).href, grid: "12X12" },
              "Upper arm pain": { imagePath: new URL("../../../production/images/chest.jpg", import.meta.url).href, grid: "12X12" },
              "Chin pain": { imagePath: new URL("../../../production/images/head.jpg", import.meta.url).href, grid: "12X12" },
              "Ear pain": { imagePath: new URL("../../../production/images/head.jpg", import.meta.url).href, grid: "12X12" },
              "Nose pain": { imagePath: new URL("../../../production/images/head.jpg", import.meta.url).href, grid: "12X12" },
              "Eye pain": { imagePath: new URL("../../../production/images/head.jpg", import.meta.url).href, grid: "12X12" },
            };

            const symptomHTMLParts = [];

            for (let i = 0; i < symptoms_array.length; i++) {
              const symptomName = symptoms_array[i];
              if (painSymptoms.hasOwnProperty(symptomName)) {
                const scaleRaw = scale_array[i];
                const scaleValue = scaleRaw !== undefined && scaleRaw !== null && scaleRaw !== "" ? parseInt(scaleRaw, 10) : NaN;
                const painspot = pain_spot[i];

                let severity = "";
                if (!isNaN(scaleValue)) {
                  if (scaleValue >= 1 && scaleValue <= 3) severity = "mild";
                  else if (scaleValue >= 4 && scaleValue <= 6) severity = "moderate";
                  else if (scaleValue >= 7 && scaleValue <= 10) severity = "severe";
                }

                if (severity !== "") {
                  const imgSrc = painSymptoms[symptomName].imagePath;
                  const grid = painSymptoms[symptomName].grid;
                  if (imgSrc && grid) {
                    symptomHTMLParts.push(` ${severity} <a href="#" class="symptom-link" data-image-src="${imgSrc}" data-grid="${grid}" data-painspot="${painspot}">${symptomName}</a>`);
                  }
                }
              } else {
                symptomHTMLParts.push(symptomName);
              }
            }

            const element_systoms = document.getElementById("symtoms");
            if (element_systoms) {
              element_systoms.innerHTML = `<h5>${username} has ${symptomHTMLParts.join(", ")}</h5>`;
              element_systoms.style.display = "block";
              // color light red and text color dark red
              element_systoms.style.color = "#990000";
              element_systoms.style.backgroundColor = "#ffcccc";
              element_systoms.style.padding = "10px";
              element_systoms.style.borderRadius = "5px";

              console.log("[context_assessment_UI.js]Symptoms displayed:", symptomHTMLParts.join(", "));
              // Attach click handler to open popup with image when a pain symptom is clicked
              element_systoms.addEventListener("click", function (event) {
                const target = event.target;
                if (target && target.classList && target.classList.contains("symptom-link")) {
                  event.preventDefault();
                  const imageSrc = target.getAttribute("data-image-src");
                  const grid = target.getAttribute("data-grid");
                  const painspot = target.getAttribute("data-painspot");
                  if (imageSrc && grid && painspot) {
                    openSymptomImagePopup(imageSrc, grid, painspot);
                  }
                }
              });
            } else {
              console.log("[context_assessment_UI.js]Symptoms element not found in the DOM.");
            }
          } else {
            console.log("[context_assessment_UI.js] No Symptoms data available.");
          }
        }
        if (patientEWSData) {
          const ewsColor = patientEWSData.color !== undefined && patientEWSData.color !== null && patientEWSData.color !== "" ? patientEWSData.color : null;
          const parsedEwsScore = patientEWSData.ews_score !== undefined && patientEWSData.ews_score !== null && patientEWSData.ews_score !== "" ? parseInt(patientEWSData.ews_score, 10) : null;
          const ewsScore = Number.isNaN(parsedEwsScore) ? null : parsedEwsScore;

          ews_value_passing_context(ewsScore, ewsColor);
        } else {
          ews_value_passing_context(NoData);
        }
      })
      .catch((error) => {
        console.error("[context_assessment_UI.js] Error fetching patient data:", error);
      })
      .finally(() => {
        const loader = document.querySelector(".loader");
        loader.classList.add("loader--hidden");
      });
  }
} catch (error) {
  console.log("[context_assessment_UI.js] Error:", error);
}
// Popup helper to show symptom image from imageMapping
function openSymptomImagePopup(imageSrc, grid, painspot) {
  if (!imageSrc || !grid || !painspot) return;

  let modal = document.getElementById("symptomImageModal");
  let imagePainSpotPath = new URL("../../../production/images/pain_spot1-removebg.png", import.meta.url).href;
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "symptomImageModal";
    modal.className = "symptom-modal";
    modal.innerHTML =
      '<div class="symptom-modal-content">' +
      '  <span class="symptom-modal-close">&times;</span>' +
      '  <div class="symptom-image-container" style="position:relative; display:flex; align-items:center; justify-content:center; max-width:100%; max-height:100%; width:100%; height:100%; margin:0 auto;">' +
      '    <img id="symptomModalImage" src="" alt="Symptom image" style="display:block; max-width:100%; max-height:100%; width:auto; height:auto; object-fit:contain; margin:0 auto;" />' +
      '    <img id="symptomPainSpot" src="' +
      imagePainSpotPath +
      '" alt="Pain spot" style="position:absolute; width:8%; height:auto; transform:translate(-50%, -50%); display:none;" />' +
      "  </div>" +
      "</div>";

    document.body.appendChild(modal);

    // Basic styles for the popup (self-contained)
    if (!document.getElementById("symptomModalStyles")) {
      const style = document.createElement("style");
      style.id = "symptomModalStyles";
      style.textContent =
        ".symptom-modal{" +
        "position:fixed;" +
        "z-index:9999;" +
        "left:0;top:0;width:100%;height:100%;" +
        "display:none;" +
        "align-items:center;justify-content:center;" +
        "background:rgba(0,0,0,0.6);" +
        "}" +
        ".symptom-modal-content{" +
        "background:#fff;" +
        "padding:10px;" +
        "border-radius:6px;" +
        "max-width:80%;max-height:80vh;" +
        "box-sizing:border-box;" +
        "box-shadow:0 2px 10px rgba(0,0,0,0.4);" +
        "position:relative;" +
        "overflow:hidden;" +
        "}" +
        ".symptom-modal-close{" +
        "position:absolute;" +
        "top:8px;right:12px;" +
        "font-size:28px;" +
        "cursor:pointer;" +
        "color:#000;" +
        "background:rgba(255,255,255,0.9);" +
        "border-radius:50%;" +
        "padding:4px 10px;" +
        "z-index:10000;" +
        "}";
      document.head.appendChild(style);
    }

    const closeBtn = modal.querySelector(".symptom-modal-close");
    closeBtn.addEventListener("click", function () {
      modal.style.display = "none";
    });

    // Close when clicking outside the content
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  const img = modal.querySelector("#symptomModalImage");
  const painSpotImg = modal.querySelector("#symptomPainSpot");

  // Helper to parse grid like "12X12" or "12x12"
  function parseGrid(gridStr) {
    if (!gridStr) return null;
    const parts = String(gridStr)
      .toLowerCase()
      .split("x")
      .map(function (p) {
        return p.trim();
      });
    if (parts.length !== 2) return null;
    var cols = parseInt(parts[0], 10);
    var rows = parseInt(parts[1], 10);
    if (!cols || !rows || cols <= 0 || rows <= 0) return null;
    return { cols: cols, rows: rows };
  }

  // Convert column letters (e.g. "A", "B", ..., "L") to 0-based index
  function columnLettersToIndex(letters) {
    if (!letters) return -1;
    var idx = 0;
    var upper = String(letters).toUpperCase();
    for (var i = 0; i < upper.length; i++) {
      var code = upper.charCodeAt(i);
      if (code < 65 || code > 90) return -1; // not A-Z
      idx = idx * 26 + (code - 65 + 1);
    }
    return idx - 1; // convert to 0-based
  }

  // Parse painspot like "B11" where 11 means
  // "11th box in the grid when counted row-wise".
  // For a 12x12 grid: 1..12 = row 0, 13..24 = row 1, etc.
  function parsePainspot(painStr, cols, rows) {
    if (!painStr || !cols || !rows) return null;
    var match = /^([A-Za-z]+)?(\d+)$/.exec(String(painStr).trim());
    if (!match) return null;
    var cellNumber = parseInt(match[2], 10); // 1-based linear index
    if (!cellNumber || cellNumber < 1 || cellNumber > cols * rows) return null;

    var zeroBased = cellNumber - 1;
    var rowIndex = Math.floor(zeroBased / cols); // 0-based row
    var colIndex = zeroBased % cols; // 0-based column

    return { colIndex: colIndex, rowIndex: rowIndex, cellNumber: cellNumber };
  }

  // Position the pain spot image based on grid and painspot value
  function positionPainSpot(gridStr, painStr) {
    if (!painSpotImg) {
      console.log("[context_assessment_UI.js] No painSpotImg element found. Cannot place pain spot.");
      return;
    }
    var gridInfo = parseGrid(gridStr);
    if (!gridInfo) {
      painSpotImg.style.display = "none";
      console.log("[context_assessment_UI.js] Failed to place pain spot - invalid grid.", {
        grid: gridStr,
        painspot: painStr,
      });
      return;
    }

    var cols = gridInfo.cols;
    var rows = gridInfo.rows;
    var painInfo = parsePainspot(painStr, cols, rows);
    if (!gridInfo || !painInfo) {
      painSpotImg.style.display = "none";
      console.log("[context_assessment_UI.js] Failed to place pain spot - invalid grid or painspot.", {
        grid: gridStr,
        painspot: painStr,
      });
      return;
    }

    var colIdx = Math.min(Math.max(painInfo.colIndex, 0), cols - 1);
    var rowIdx = Math.min(Math.max(painInfo.rowIndex, 0), rows - 1);

    var leftPercent = ((colIdx + 0.5) / cols) * 100;
    var topPercent = ((rowIdx + 0.5) / rows) * 100;

    painSpotImg.style.left = leftPercent + "%";
    painSpotImg.style.top = topPercent + "%";
    painSpotImg.style.display = "block";
    console.log("[context_assessment_UI.js] Pain spot placed successfully.", {
      grid: gridStr,
      painspot: painStr,
      cellNumber: painInfo.cellNumber,
      leftPercent: leftPercent,
      topPercent: topPercent,
    });
  }

  // Ensure the body image fits within the viewport ("zoom out" if needed)
  function fitImageToViewport(imageElement) {
    if (!imageElement || !imageElement.naturalWidth || !imageElement.naturalHeight) return;

    var viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    if (!viewportWidth || !viewportHeight) return;

    var maxWidth = viewportWidth * 0.8; // match ~80% modal max width
    var maxHeight = viewportHeight * 0.8; // match ~80vh modal max height

    var naturalWidth = imageElement.naturalWidth;
    var naturalHeight = imageElement.naturalHeight;

    var widthScale = maxWidth / naturalWidth;
    var heightScale = maxHeight / naturalHeight;
    var scale = Math.min(widthScale, heightScale, 1); // never scale up

    var finalWidth = naturalWidth * scale;
    var finalHeight = naturalHeight * scale;

    imageElement.style.width = finalWidth + "px";
    imageElement.style.height = finalHeight + "px";

    console.log("[context_assessment_UI.js] Image fitted to viewport.", {
      naturalWidth: naturalWidth,
      naturalHeight: naturalHeight,
      finalWidth: finalWidth,
      finalHeight: finalHeight,
      viewportWidth: viewportWidth,
      viewportHeight: viewportHeight,
    });
  }

  img.onload = function () {
    // First, make sure the whole image fits inside the modal/viewport
    fitImageToViewport(img);
    // Then place the pain spot marker using the final rendered size
    positionPainSpot(grid, painspot);
  };

  img.src = imageSrc;
  modal.style.display = "flex";
}
function ews_value_passing_context(ews_value, ews_color) {
  try {
    const cardContainer = document.getElementById("context_ews_id");
    const scoreElement = document.getElementById("context_ews_id1");
    const colorBar = document.getElementById("context_ews_color1");

    if (!cardContainer || !scoreElement || !colorBar) {
      return;
    }

    // Treat missing/placeholder or non-numeric values as "no data" and hide the card
    const isNoData = ews_value === undefined || ews_value === null || ews_value === "" || ews_value === "--" || typeof ews_value === "object";

    if (isNoData) {
      scoreElement.innerHTML = "";
      colorBar.style.backgroundColor = "#ffffff00";
      cardContainer.style.display = "none";
      return;
    }

    cardContainer.style.display = "block";
    colorBar.style.backgroundColor = ews_color || colorBar.style.backgroundColor || "#ffffff";
    scoreElement.innerHTML = "EWS Score - " + ews_value;
  } catch (e) {
    console.log("[live-custom.js] Error in ews_value_passing:", e);
  }
}
function ECG_data(LiveEcgValues, date, time, option1, value, ecgdata, endzoom) {
  var EcgData;
  var contextECG;
  var echartLine;
  var value1;
  var echartLinecontext;
  if ($("#context_ecg").length) {
    echartLinecontext = echarts.init(document.getElementById("context_ecg"));
    EcgData = ecgdata;
    console.log("[context_assessment_UI.js] context_ecg in echarts", EcgData);
  } else if ($("#LiveECGId").length) {
    console.log("[context_assessment_UI.js] Live  in echarts");
    echartLine = echarts.init(document.getElementById("LiveECGId"));
    EcgData = LiveEcgValues;
  }
  console.log("[context_assessment_UI.js] ECG_data called with EcgData length:", EcgData ? EcgData.length : "null/undefined");

  var reference_data = [
    [-20, 100],
    [-30, 100],
    [-30, 201],
    [-50, 201],
    [-50, 100],
    [-60, 100],
  ];

  var counter = 0;

  function randomData() {
    value1 = EcgData[counter % EcgData.length];
    counter++;
    return {
      name: counter % EcgData.length,
      value: [counter % EcgData.length, Math.round(value1)],
    };
  }

  var data = [];
  try {
    for (var i = 1; i < EcgData.length; i++) {
      data.push(randomData());
    }
  } catch (e) {
    console.error("[context_assessment_UI.js] EcgData.length error:", e);
  }
  var isZoomed = false;
  console.log("[context_assessment_UI.js] ecg data after push", data);
  var plot = {
    title: {
      top: "0px",
      left: "35px",
      text: "",
      textStyle: {
        fontSize: 12,
        fontStyle: "normal",
      },
    },
    grid: {
      top: 40,
      left: 40,
      right: 20,
      bottom: 52,
      width: "auto",
      height: "auto",
    },
    toolbox: {
      orient: "",
      right: 8,
      feature: {
        myTool1: {
          show: isZoomed,
          title: "Reset",
          icon: "image://data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PgogICAgICAgIDwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgCiAgICAgICAgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+ICA8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgPiA8cGF0aCBkPSJNMTAgMmg0IiAvPiA8cGF0aCBkPSJNMTIgMTR2LTQiIC8+IDxwYXRoIGQ9Ik00IDEzYTggOCAwIDAgMSA4LTcgOCA4IDAgMSAxLTUuMyAxNEw0IDE3LjYiIC8+IDxwYXRoIGQ9Ik05IDE3SDR2NSIgLz4gPC9zdmc+ICA=",
          fontSize: 28,
          onclick: function () {
            (echartLinecontext || echartLine).dispatchAction({
              type: "dataZoom",
              start: 0,
              endValue: endzoom,
            });
          },
        },
      },
    },

    dataZoom: [
      {
        id: "dataZoomX",
        type: "slider",
        xAxisIndex: [0],
        filterMode: "none",
        zoomLock: false,
        showDetail: false,
        height: 25,
        handleIcon: "pin",
        handleStyle: {
          color: "#0865C1",
          borderColor: "#ACB8D1",
          borderWidth: 1,
        },
      },
    ],
    xAxis: {
      type: "value",
      splitNumber: 25,
      splitLine: {
        lineStyle: {
          color: "#0686AF",
          width: 1.2,
        },
      },
      grid: {
        show: false,
      },
      minorSplitLine: {
        show: true,
        lineStyle: {
          color: "#23B5E4",
          width: 0.5,
        },
      },
      axisLine: {
        show: false,
      },
      axisLabel: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      minorTick: {
        show: false,
      },
      alignTicks: false,
    },
    yAxis: {
      type: "value",
      show: true,
      splitLine: {
        lineStyle: {
          color: "#0686AF",
          width: 1.2,
        },
      },
      max: function (value) {
        return value.max + 99;
      },
      grid: {
        show: false,
      },
      minorSplitLine: {
        show: true,
        lineStyle: {
          color: "#23B5E4",
          width: 0.5,
        },
      },
      axisLine: {
        show: false,
      },
      axisLabel: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      minorTick: {
        show: false,
      },
      alignTicks: false,
    },

    series: [
      {
        name: "????",
        type: "line",
        xAxisIndex: 0,
        yAxisIndex: 0,
        showSymbol: false,
        data: data,
        animation: false,
        smooth: false,
        lineStyle: {
          color: "#ffffff",
          width: 1.6,
        },
        labelLine: {
          show: false,
        },
        seriesLayoutBy: "column",
      },
      {
        name: "????",
        type: "line",
        showSymbol: false,
        hoverAnimation: false,
        data: reference_data,
        lineStyle: {
          color: "#ffffff",
          width: 1.5,
        },
        label: {
          show: false,
        },
      },
    ],
  };

  try {
    if (EcgData.length < 625 && endzoom == 0) {
      option1 = {
        title: {
          text: "WAITING FOR VALID ECG",
          textStyle: {
            fontSize: "18",
            fontFamily: "Verdana",
            color: "#0686AF",
          },
          left: "center",
          top: "middle",
          dataZoom: [
            {
              type: "inside",
              yAxisIndex: "none",
              xAxisIndex: "none",
              filterMode: "none",
              show: true,
              realtime: true,
              start: 0,
              end: 100,
            },
            {
              type: "slider",
              show: true,
              showDetail: false,
              handleSize: "100%",
              handleColor: "#056F94",
            },
          ],
          series: {
            show: false,
          },
          xaxis: {
            grid: {
              show: false,
            },
          },
          yaxis: {
            grid: {
              show: false,
            },
          },
        },
      };

      if ($("#context_ecg").length) {
        echartLinecontext.clear();
        echartLinecontext.setOption(option1);
      } else if ($("#LiveECGId").length) {
        echartLine.clear();
        echartLine.setOption(option1);
      }
    } else {
      if ($("#context_ecg").length) {
        if (context_ecg.length < 625) {
          echartLinecontext.setOption(NoEcgData);
        } else {
          echartLinecontext.setOption(plot);
        }
        echartLinecontext.dispatchAction({
          type: "dataZoom",
          endValue: 658,
        });
      } else if ($("#LiveECGId").length) {
        echartLine.setOption(plot);
        if (endzoom !== 0) {
          echartLine.dispatchAction({
            type: "dataZoom",
            endValue: endzoom,
          });
        }
      }
      echartLine.on("dataZoom", function (params) {
        if (params.start !== 0 || params.end !== undefined) {
          isZoomed = true;
          plot.toolbox.feature.myTool1.show = isZoomed;
          echartLine.setOption(plot);
        } else {
          isZoomed = false;
          plot.toolbox.feature.myTool1.show = isZoomed;
          echartLine.setOption(plot);
        }
      });
    }
  } catch (e) {
    console.error("[context_assessment_UI.js] Error:", e);
  }
}

function PPG_data(LivePpgValues, date, time, option1, value, ppgdata, endzoom) {
  var PpgData;
  var echartLine;
  var echartLinecontext;
  var value1;
  var ppgOption;
  var counter = 0;

  if ($("#context_ppg").length) {
    echartLinecontext = echarts.init(document.getElementById("context_ppg"));
    PpgData = ppgdata;
  } else if ($("#LivePPGId").length) {
    echartLine = echarts.init(document.getElementById("LivePPGId"));
    PpgData = LivePpgValues;
  }
  console.log("[context_assessment_UI.js] PPG_data called with PpgData length:", PpgData ? PpgData.length : "null/undefined");
  function randomData() {
    if (PpgData.length === 0) return { value: [0, 0] };
    value1 = PpgData[counter % PpgData.length];
    counter++;
    return {
      value: [counter % PpgData.length, Math.round(value1)],
    };
  }
  var data = [];
  try {
    for (var i = 1; i < PpgData.length; i++) {
      data.push(randomData());
    }
  } catch (e) {
    console.error("[context_assessment_UI.js] PPG error:", e);
  }

  try {
    // Check if we have insufficient data (less than 500) OR if this is initial load (endzoom == 0)
    // For your case with 599 data points, this should go to the else block
    if (PpgData && PpgData.length > 0) {
      // render chart as before
      ppgOption = {
        grid: {
          top: 5,
          left: 40,
          right: 40,
          bottom: 52,
        },
        toolbox: {
          orient: "vertical",
          right: 5,
          feature: {
            myTool1: {
              show: true,
              title: "Reset",
              icon: "image://data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PgogICAgICAgIDwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgCiAgICAgICAgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+ICA8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgPiA8cGF0aCBkPSJNMTAgMmg0IiAvPiA8cGF0aCBkPSJNMTIgMTR2LTQiIC8+IDxwYXRoIGQ9Ik00IDEzYTggOCAwIDAgMSA4LTcgOCA4IDAgMSAxLTUuMyAxNEw0IDE3LjYiIC8+IDxwYXRoIGQ9Ik05IDE3SDR2NSIgLz4gPC9zdmc+ICA=",
              onclick: function () {
                (echartLinecontext || echartLine).dispatchAction({
                  type: "dataZoom",
                  start: 0,
                  endValue: endzoom,
                });
              },
            },
          },
        },
        dataZoom: [
          {
            id: "dataZoomX",
            type: "slider",
            xAxisIndex: [0],
            filterMode: "none",
            zoomLock: false,
            showDetail: false,
            height: 25,
            handleIcon: "pin",
            handleStyle: {
              color: "#0865C1",
              borderColor: "#ACB8D1",
              borderWidth: 1,
            },
          },
        ],
        xAxis: {
          type: "value",
          splitNumber: 25,
          splitLine: {
            show: false,
            lineStyle: {
              color: "#0686AF",
              width: 1.2,
            },
          },
          grid: {
            show: false,
          },
          minorSplitLine: {
            show: false,
            lineStyle: {
              color: "#23B5E4",
              width: 0.5,
            },
          },
          axisLine: {
            show: true,
          },
          axisLabel: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          minorTick: {
            show: false,
          },
          alignTicks: false,
        },
        yAxis: {
          type: "value",
          show: false,
          splitLine: {
            lineStyle: {
              color: "#0686AF",
              width: 1.2,
            },
          },
          min: function (value) {
            return value.min - 10;
          },
          max: function (value) {
            return value.max + 100;
          },
          grid: {
            show: false,
          },
          minorSplitLine: {
            show: false,
            lineStyle: {
              color: "#23B5E4",
              width: 0.5,
            },
          },
          axisLine: {
            show: true,
          },
          axisLabel: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          minorTick: {
            show: false,
          },
          alignTicks: false,
        },
        series: [
          {
            name: "????",
            type: "line",
            xAxisIndex: 0,
            yAxisIndex: 0,
            showSymbol: false,
            data: data,
            animation: false,
            smooth: false,
            lineStyle: {
              color: "#FFFFFF",
              width: 1.6,
            },
            labelLine: {
              show: false,
            },
            seriesLayoutBy: "column",
          },
        ],
      };
      if ($("#context_ppg").length && echartLinecontext) {
        echartLinecontext.clear();
        echartLinecontext.setOption(ppgOption);
        if (endzoom !== 0) {
          echartLinecontext.dispatchAction({
            type: "dataZoom",
            endValue: endzoom,
          });
        }
      } else if ($("#LivePPGId").length) {
        echartLine.clear();
        echartLine.setOption(ppgOption);
        if (endzoom !== 0) {
          echartLine.dispatchAction({
            type: "dataZoom",
            endValue: endzoom,
          });
        }
      }
    } else {
      // No data: clear chart (or optionally show a blank chart)
      if ($("#context_ppg").length && echartLinecontext) {
        echartLinecontext.clear();
      } else if ($("#LivePPGId").length) {
        echartLine.clear();
      }
    }
  } catch (e) {
    console.error("[context_assessment_UI.js] PPG building chart:", e);
  }
}
function RR_data(LiveRRValues, date, time, option1, value, rrdata, endzoom) {
  var RrData;
  var echartLine;
  var echartLinecontext;
  var value1;
  if ($("#context_rr").length) {
    echartLinecontext = echarts.init(document.getElementById("context_rr"));
    RrData = rrdata;
  } else if ($("#LiveRRId").length) {
    echartLine = echarts.init(document.getElementById("LiveRRId"));
    RrData = LiveRRValues;
  }

  console.log("[context_assessment_UI.js] RR_data called with RrData length:", RrData ? RrData.length : "null/undefined");

  var counter = 0;

  function randomData() {
    value1 = RrData[counter % RrData.length];
    counter++;
    return {
      value: [counter % RrData.length, Math.round(value1)],
    };
  }
  var data = [];
  try {
    for (var i = 1; i < RrData.length; i++) {
      data.push(randomData());
    }
  } catch (e) {
    console.error("[context_assessment_UI.js] RrData.length:", e);
  }
  var plot = {
    title: {
      top: "0px",
      left: "35px",
      text: "",
      textStyle: {
        fontSize: 12,
        fontStyle: "normal",
      },
    },
    grid: {
      top: 40,
      left: 40,
      right: 20,
      bottom: 52,
    },
    toolbox: {
      orient: "vertical",
      right: 5,
      feature: {
        myTool1: {
          show: true,
          title: "Reset",
          icon: "image://data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PgogICAgICAgIDwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgCiAgICAgICAgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+ICA8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgPiA8cGF0aCBkPSJNMTAgMmg0IiAvPiA8cGF0aCBkPSJNMTIgMTR2LTQiIC8+IDxwYXRoIGQ9Ik00IDEzYTggOCAwIDAgMSA4LTcgOCA4IDAgMSAxLTUuMyAxNEw0IDE3LjYiIC8+IDxwYXRoIGQ9Ik05IDE3SDR2NSIgLz4gPC9zdmc+ICA=",
          onclick: function () {
            (echartLinecontext || echartLine).dispatchAction({
              type: "dataZoom",
              start: 0,
              endValue: endzoom,
            });
          },
        },
      },
    },

    dataZoom: [
      {
        id: "dataZoomX",
        type: "slider",
        xAxisIndex: [0],
        filterMode: "none",
        zoomLock: false,
        showDetail: false,
        height: 25,
        handleIcon: "pin",
        handleStyle: {
          color: "#0865C1",
          borderColor: "#ACB8D1",
          borderWidth: 1,
        },
        //endValue:[],
      },
    ],
    xAxis: {
      type: "value",
      splitNumber: 25,
      splitLine: {
        show: false,
        lineStyle: {
          color: "#0686AF",
          width: 1.2,
        },
      },
      grid: {
        show: false,
      },
      minorSplitLine: {
        show: false,
        lineStyle: {
          color: "#23B5E4",
          width: 0.5,
        },
      },
      axisLine: {
        show: true, // Hide full Line
      },
      axisLabel: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      minorTick: {
        show: false,
      },
      alignTicks: false,
    },
    yAxis: {
      type: "value",
      show: false,
      splitLine: {
        lineStyle: {
          color: "#0686AF",
          width: 1.2,
        },
      },
      min: function (value) {
        return value.min - 10;
      },
      max: function (value) {
        return value.max + 100;
      },
      grid: {
        show: false,
      },
      minorSplitLine: {
        show: false,
        lineStyle: {
          color: "#23B5E4",
          width: 0.5,
        },
      },
      axisLine: {
        show: true, // Hide full Line
      },
      axisLabel: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      minorTick: {
        show: false,
      },
      alignTicks: false,
    },
    series: [
      {
        name: "????",
        type: "line",
        xAxisIndex: 0,
        yAxisIndex: 0,
        showSymbol: false,
        data: data,
        animation: false,
        smooth: false,
        lineStyle: {
          color: "#FFFFFF",
          width: 1.6,
        },
        labelLine: {
          show: false,
        },
        seriesLayoutBy: "column",
      },
    ],
  };
  try {
    if (RrData.length < 120 && endzoom == 0) {
      option1 = {
        title: {
          text: "WAITING FOR VALID PPG",
          textStyle: {
            fontSize: "18",
            fontFamily: "Verdana",
            color: "#0686AF",
          },
          left: "center",
          top: "middle",
          dataZoom: [
            {
              type: "inside",
              yAxisIndex: "none",
              xAxisIndex: "none",
              filterMode: "none",
              show: true,
              realtime: true,
              start: 0,
              end: 100,
              //xAxisIndex: [0, 1],
            },
            {
              type: "slider",
              show: true,
              showDetail: false,
              handleSize: "100%",
              handleColor: "#056F94",
            },
          ],

          series: {
            show: false,
          },
          xaxis: {
            grid: {
              show: false,
            },
          },
          yaxis: {
            grid: {
              show: false,
            },
          },
        },
      };

      if ($("#context_rr").length) {
        echartLinecontext.clear();
        echartLinecontext.setOption(option1);
      } else if ($("#LiveRRId").length) {
        echartLine.clear();
        echartLine.setOption(option1);
      }
    } else {
      if ($("#context_rr").length) {
        if (context_rr.length < 120) {
          echartLinecontext.setOption(NoRRData);
        } else {
          echartLinecontext.setOption(plot);
        }
        echartLinecontext.dispatchAction({
          type: "dataZoom",
          endValue: 60,
        });
      } else if ($("#LiveRRId").length) {
        echartLine.setOption(plot);
        if (endzoom !== 0) {
          echartLine.dispatchAction({
            type: "dataZoom",
            endValue: endzoom,
          });
        }
      }
    }
  } catch (e) {
    console.error("[context_assessment_UI.js] Error:", e.message);
  }
}
// Keep live ECG/PPG charts responsive to layout changes
// by resizing the echarts instances when the window size changes.
window.addEventListener("resize", function () {
  try {
    var liveEcgDom = document.getElementById("LiveECGId");
    if (liveEcgDom) {
      var ecgInstance = echarts.getInstanceByDom(liveEcgDom);
      if (ecgInstance) {
        ecgInstance.resize();
      }
    }

    var livePpgDom = document.getElementById("LivePPGId");
    if (livePpgDom) {
      var ppgInstance = echarts.getInstanceByDom(livePpgDom);
      if (ppgInstance) {
        ppgInstance.resize();
      }
    }
  } catch (e) {
    console.error("[context_assessment_UI.js] Live chart resize error:", e);
  }
});
