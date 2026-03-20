import { fb } from "../livepage/database_function.js";
import { patient_details } from "./Dashboard-UI.js";

document.getElementById("loader").className = "loader";

let ews_list = fb.database().ref().child("EWS");

let ecg_list = fb.database().ref().child("ECG_plot");
let ppg_list = fb.database().ref().child("PPG_plot");
let rr_list = fb.database().ref().child("RR_plot");
let vital_list = fb.database().ref().child("patientlivedata7s");

var obj = {};
const waveformCache = {
  ECG: new Map(),
  PPG: new Map(),
  RR: new Map(),
};
const chartRegistry = new Map();

// let pat_bp_5sec_ref = fb.database().ref().child("PAT_BP_5s_tree");
var doctor_id = localStorage.getItem("doctor_id");
var doctor = fb.database().ref().child("doctors").child(doctor_id);

var DoctorNameElement = document.getElementById("DoctorName");
try {
  doctor.on("value", function (snapshot) {
    let doctor_data = snapshot.val();
    var ref_doc_id = doctor_data.registerId;

    if (DoctorNameElement) {
      DoctorNameElement.innerHTML = "Dr. " + doctor_data.username;
    } else {
      console.warn('[dashboard-custom.js] Element with id "DoctorName" not found.');
    }
    firebase_Data_retrieval(ref_doc_id);
  });
} catch (e) {
  console.error("[dashboard-custom.js] Error retrieving doctor data:", e);
}

function firebase_Data_retrieval(ref_doc_id) {
  try {
    var patient_list = fb.database().ref().child("patients");
    patient_list.on(
      "value",
      function (snapshot) {
        try {
          var patient_info = [];
          var patient_id = [];
          var user_name = [];
          var user_age = [];
          var user_gender = [];
          var user_ailment = [];
          snapshot.forEach((data) => {
            let patients_string = JSON.stringify(data.val(), null, 2);
            let patients_json = JSON.parse(patients_string);

            var doc_id = patients_json.docId;
            if (doc_id === ref_doc_id) {
              var id = patients_json.id.toString();
              patient_id.push(id);

              user_name.push(patients_json.username);
              user_age.push(patients_json.age);
              user_ailment.push(patients_json.ailment);
              user_gender.push(patients_json.gender);
            }
          });

          for (var i = 0; i < patient_id.length; i++) {
            patient_info.push([user_name[i], user_age[i], user_gender[i], user_ailment[i], patient_id[i]]);
          }
          var NewPatientInfo = [];
          var ews_value = "";
          var ews_color = "";
          var ID;

          const Obtain_ews = new Promise((resolve, reject) => {
            for (let i = 0; i < patient_info.length; i++) {
              ews_list
                .child(patient_info[i][4])
                .limitToLast(1)
                .on("value", function (snapshot) {
                  if (snapshot.val() != null) {
                    snapshot.forEach((data) => {
                      ID = patient_info[i][4];
                      obj[ID] = ID;
                      let ews_string = JSON.stringify(data.val(), null, 2);
                      let ews_json = JSON.parse(ews_string);
                      ews_value = ews_json.ews_score.toString();
                      obj[ID + "ewsv"] = ews_value;
                      ews_color = ews_json.color.toString();
                      obj[ID + "ewsc"] = ews_color;

                      NewPatientInfo.push([patient_info[i][0], patient_info[i][1], patient_info[i][2], patient_info[i][3], patient_info[i][4], ews_value, ews_color]);
                    });
                  } else {
                    obj[ID + "ewsv"] = "--";
                    obj[ID + "ewsc"] = "0";
                    NewPatientInfo.push([patient_info[i][0], patient_info[i][1], patient_info[i][2], patient_info[i][3], patient_info[i][4], "--", "0"]);
                  }
                  refreshews(obj[ID + "ewsv"], obj[ID + "ewsc"], ID);
                  console.log("[dashboard-custom.js]  refreshews", obj[ID + "ewsv"], obj[ID + "ewsc"], ID);
                  if (i == patient_info.length - 1) {
                    resolve(NewPatientInfo);
                  }
                });
            }
          });
          var ID;
          // let validTimestamp = {};
          const Obtain_vitals = new Promise((resolve, reject) => {
            var ID;
            var vitalinfo = [];
            const nowSec = Date.now() / 1000;
            for (let i = 0; i < patient_info.length; i++) {
              vital_list
                .child(patient_info[i][4])
                // .limitToLast(1)
                .on("value", (snapshot) => {
                  if (snapshot.val() != null) {
                    // validTimestamp[patient_info[i][4]] = Math.floor(snapshot.val().timestamp / 60) * 60;
                    // console.log("validTimestamp:", patient_info[i][4], Math.floor(snapshot.val().timestamp / 60) * 60);
                    ID = snapshot.val().userId;
                    obj[ID] = snapshot.val().userId;
                    // const latest = latest5secHR.find((entry) => entry.patientId === ID);
                    // const latestPatHr = latest ? latest.HR : null;
                    // const latestPatHrTs = latest ? latest.timestamps : null;
                    // console.log("[dashboard-custom.js] retrieving vitals for ID:", ID, "with latestPatHr:", latestPatHr, "at ts:", latestPatHrTs, snapshot.val().hr);

                    // if (latestPatHr !== null && typeof latestPatHrTs === "number" && Number.isFinite(latestPatHrTs) && !isNaN(latestPatHrTs) && nowSec - latestPatHrTs < 10) {
                    //   obj[ID + "hr"] = latestPatHr;
                    // } else {
                    obj[ID + "hr"] = snapshot.val().hr === "00" || snapshot.val().hr === "0" || snapshot.val().hr === 0 ? "--" : snapshot.val().hr;
                    // }
                    if (snapshot.val().bp == "0/0") {
                      obj[ID + "bp"] = "--/--";
                    } else {
                      obj[ID + "bp"] = snapshot.val().bp;
                    }
                    if (snapshot.val().spo == "00") {
                      obj[ID + "spo"] = "--";
                    } else {
                      obj[ID + "spo"] = snapshot.val().spo;
                    }
                    if (parseFloat(snapshot.val().temp) == 0.0 || parseFloat(snapshot.val().temp) >= 238.48) {
                      obj[ID + "temp"] = "--";
                    } else {
                      obj[ID + "temp"] = parseFloat(snapshot.val().temp).toFixed(2);
                    }
                    if (snapshot.val().rr == "0") {
                      obj[ID + "rr"] = "--";
                    } else {
                      obj[ID + "rr"] = snapshot.val().rr;
                    }
                    console.log("[dashboard-custom.js] retrieved bp", snapshot.val());
                  } else {
                    obj[ID + "hr"] = "--";
                    obj[ID + "bp"] = "--/--";
                    obj[ID + "spo"] = "--";
                    obj[ID + "temp"] = "--";
                    obj[ID + "rr"] = "--";
                    vitalinfo.push([obj[ID + "hr"], obj[ID + "rr"], obj[ID + "temp"], obj[ID + "spo"], obj[ID + "bp"]]);
                    validTimestamp[patient_info[i][4]] = null;
                  }

                  refreshvitals(obj[ID + "hr"], obj[ID + "bp"], obj[ID + "temp"], obj[ID + "rr"], obj[ID + "spo"], obj[ID]);

                  if (i == vitalinfo.length - 1) {
                    resolve(vitalinfo);
                  }
                });
            }
          });
          var ecg_info = [];
          const Obtain_ecg = new Promise((resolve, reject) => {
            for (let i = 0; i < patient_info.length; i++) {
              ecg_list.child(patient_info[i][4]).on("value", function (snapshot) {
                if (snapshot.val() != null) {
                  // if (validTimestamp[patient_info[i][4]] === snapshot.key) {
                  ID = patient_info[i][4];
                  obj[ID] = ID;

                  let ecg_string = JSON.stringify(snapshot.val(), null, 2);
                  let ecg_json = JSON.parse(ecg_string);
                  let type = ecg_json.type;
                  let ecg1 = ecg_json.ecg;
                  let timestamp = ecg_json.timestamp;

                  if (type == "noise" || type == "flat") {
                    obj[ID + "final_min_ecg"] = [];
                  } else {
                    var ecg_text = ecg1;
                    let ecg_result = ecg_text.replace(/\]\[/g, ", ").trim();
                    ecg_result = ecg_result.replace(/\]/g, "").trim();
                    ecg_result = ecg_result.replace(/\[/g, "").trim();
                    var ecgvalue = ecg_result.split(",").map(Number);

                    obj[ID + "final_min_ecg"] = ecgvalue;
                  }

                  var f_ecgtimestamp = timestamp;
                  var date = new Date(f_ecgtimestamp * 1000);
                  var ecgdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
                  var ecgtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
                  ecgdate = date == undefined ? (ecgdate = "--/--/----") : ecgdate;
                  ecgtime = date == undefined ? (ecgtime = "--/--/----") : ecgtime;

                  var dt = ecgdate + " " + ecgtime;
                  obj[ID + "dt"] = dt;
                  // } else {
                  //   obj[ID + "final_min_ecg"] = [];
                  //   obj[ID + "dt"] = "";
                  // }
                } else {
                  obj[ID + "final_min_ecg"] = [];
                  obj[ID + "dt"] = "";
                }

                createECGchart(obj[ID + "final_min_ecg"], ID);
                if (i == ecg_info.length - 1) {
                  resolve(ecg_info);
                }
              });
            }
          });

          const ppg_info = [];
          const Obtain_ppg = new Promise((resolve, reject) => {
            for (let i = 0; i < patient_info.length; i++) {
              let promise = new Promise((resolve, reject) => {
                ppg_list.child(patient_info[i][4]).on("value", function (snapshot) {
                  // if (validTimestamp[patient_info[i][4]] === snapshot.key) {
                  let ID = patient_info[i][4];
                  let obj = {};

                  if (snapshot.val() != null) {
                    obj[ID] = ID;
                    let ppg_string = JSON.stringify(snapshot.val(), null, 2);
                    let ppg_json = JSON.parse(ppg_string);
                    let ppg_data = ppg_json.ppg;

                    let result1;
                    if (typeof ppg_data === "string") {
                      result1 = ppg_data.replace(/\,/g, "").trim();
                    } else {
                      result1 = "";
                    }

                    var final_ppg = result1
                      .split(" ")
                      .map(Number)
                      .filter((n) => !isNaN(n));

                    obj[ID + "ppg"] = final_ppg;

                    var f_ecgtimestamp = ppg_json.timestamp;
                    var date = new Date(f_ecgtimestamp * 1000);
                    var ecgdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
                    var ecgtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
                    ecgdate = date == undefined ? (ecgdate = "--/--/----") : ecgdate;
                    ecgtime = date == undefined ? (ecgtime = "--/--/----") : ecgtime;

                    var dt = ecgdate + " " + ecgtime;
                    obj[ID + "dt"] = dt;
                    // } else {
                    //   obj[ID + "ppg"] = [];
                    //   obj[ID + "dt"] = "";
                    // }
                  } else {
                    obj[ID + "ppg"] = [];
                    obj[ID + "dt"] = "";
                  }
                  createPPGchart(obj[ID + "ppg"], ID);
                  if (i == ppg_info.length - 1) {
                    resolve(ppg_info);
                  }
                });
              });
            }
          });
          const rr_info = [];
          const Obtain_rr = new Promise((resolve, reject) => {
            for (let i = 0; i < patient_info.length; i++) {
              let promise = new Promise((resolve, reject) => {
                rr_list.child(patient_info[i][4]).on("value", function (snapshot) {
                  let ID = patient_info[i][4];
                  let obj = {};
                  if (snapshot.val() != null) {
                    // if (validTimestamp[patient_info[i][4]] === snapshot.key) {
                    console.log("[dashboard-custom.js] RR data found for ID:", ID);
                    console.log("[dashboard-custom.js] RR Snapshot value: ", snapshot.val());

                    obj[ID] = ID;
                    let rr_string = JSON.stringify(snapshot.val(), null, 2);
                    let rr_json = JSON.parse(rr_string);
                    let rr_data = rr_json.res;
                    console.log("[dashboard-custom.js] RR data:", rr_data);
                    let rr_timestamp = rr_json.timestamp;

                    let result1 = rr_data.replace(/\,/g, "").trim();
                    console.log("[dashboard-custom.js] RR data from replace", result1);
                    var final_rr = result1.split(" ").map(Number);
                    console.log("[dashboard-custom.js] Parsed RR data:", final_rr);
                    obj[ID + "rr"] = final_rr;

                    var date = new Date(rr_timestamp * 1000);
                    var rrdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
                    var rrtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
                    rrdate = date == undefined ? (rrdate = "--/--/----") : rrdate;
                    rrtime = date == undefined ? (rrtime = "--/--/----") : rrtime;
                    var dt = rrdate + " " + rrtime;
                    obj[ID + "dt"] = dt;
                    // } else {
                    //   obj[ID + "rr"] = [];
                    //   obj[ID + "dt"] = "";
                    // }
                  } else {
                    obj[ID + "rr"] = [];
                    obj[ID + "dt"] = "";
                  }
                  createRRchart(obj[ID + "rr"], ID);
                  if (i == rr_info.length - 1) {
                    resolve(rr_info);
                  }
                });
              });
            }
          });
          // const latest5secHR = [];
          // const obtain_5sec_HR = new Promise((resolve, reject) => {
          //   for (let i = 0; i < patient_info.length; i++) {
          //     // pat_bp_5sec_ref.child(patient_info[i][4]).on("value", (snapshot) => {
          //     //   var ID = patient_info[i][4];
          //     //   const val = snapshot.val();
          //     //   if (val != null) {
          //     //     const timestamps = Object.keys(val)
          //     //       .map((k) => Number(k))
          //     //       .filter((n) => Number.isFinite(n));
          //     //     if (timestamps.length === 0) return;
          //     //     const maxTs = Math.max(...timestamps);
          //     //     const latest = val[maxTs];
          //     //     if (latest && typeof latest.ECG_HR === "number") {
          //     //       // Find existing entry
          //     //       const idx = latest5secHR.findIndex((entry) => entry.patientId === ID);
          //     //       if (idx !== -1) {
          //     //         // Update existing
          //     //         latest5secHR[idx] = {
          //     //           patientId: ID,
          //     //           HR: latest.ECG_HR,
          //     //           timestamps: maxTs,
          //     //         };
          //     //       } else {
          //     //         // Add new
          //     //         latest5secHR.push({
          //     //           patientId: ID,
          //     //           HR: latest.ECG_HR,
          //     //           timestamps: maxTs,
          //     //         });
          //     //       }
          //     //     }
          //     //   }
          //     // });
          //   }
          // });

          Obtain_ews.then((value) => {
            if (NewPatientInfo.length == value.length) {
              patient_details(value);
            }

            const searchInput = document.getElementById("searchid");
            if (searchInput) {
              searchInput.onkeyup = function () {
                const patientDetailsContainer = document.getElementById("p_details");

                if (!patientDetailsContainer) {
                  return;
                }

                const filter = searchInput.value.toUpperCase();
                console.log("[dashboard-custom.js] filter", filter);

                const filteredPatients = [];

                for (let i = 0; i < value.length; i++) {
                  const txtValue = value[i][0] || "";

                  if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    filteredPatients.push(value[i]);
                  }
                }

                if (filteredPatients.length === 0) {
                  patientDetailsContainer.className = "SearchNoData";
                  patientDetailsContainer.innerHTML = `<img src="images/search.png"></br></br> No Results Found`;
                } else {
                  patientDetailsContainer.className = "patient_details";
                  patient_details(filteredPatients);
                }
              };
            } else {
              console.warn('[dashboard-custom.js] Element with id "searchid" not found.');
            }
          });

          for (let i = 0; i < patient_info.length; i++) {
            const patientId = patient_info[i][4];
            console.log("LOOPING", patientId);

            const ecg_min = fb.database().ref().child("patientecgdata").child(patientId).orderByKey().limitToLast(1); //1 minute data
            const ppg_min = fb.database().ref().child("patientppgdata").child(patientId).orderByKey().limitToLast(1); //1 minute data
            const rr_min = fb.database().ref().child("patientrrdata").child(patientId).orderByKey().limitToLast(1); //1 minute data
            const ref_valid = fb.database().ref().child("patientlivedata").child(patientId).orderByKey().limitToLast(1); //1 minute data

            Promise.all([ecg_min.once("value"), ppg_min.once("value"), rr_min.once("value"), ref_valid.once("value")])
              .then(([ecgSnapshot, ppgSnapshot, rrSnapshot, refValidSnapshot]) => {
                // vitals
                // const validTimestamp = dataKey;
                // console.log("[dashboard-custom.js] validTimestamp ", validTimestamp);
                const data = refValidSnapshot.val();
                const latestValidEntry = getLatestSnapshotEntry(data);
                const validTimestamp = latestValidEntry.key;
                console.log("[dashboard-custom.js] validTimestamp ", patientId, validTimestamp);
                const data1 = latestValidEntry.value || {};
                let respiration_rate = data1.rr === "00" || data1.rr === "0" || data1.rr === 0 ? "--" : data1.rr;

                let heart_rate = data1.hr === "00" || data1.hr === "0" || data1.hr === 0 ? "--" : data1.hr;
                let spo2 = data1.spo === "00" || data1.spo === "0" || data1.spo === 0 ? "--" : data1.spo;
                let bp_text = data1.bp === 0 / 0 || data1.bp === "0/0" || data1.bp === "--/--" ? "--/--" : data1.bp;

                let oldtemp = data1.temp;
                let parsedTemp = parseFloat(String(oldtemp).replace(/[^0-9.+-]/g, ""));
                let temp = isNaN(parsedTemp) ? "--" : parsedTemp;

                console.log("LOOPING vitals", heart_rate, bp_text, oldtemp, respiration_rate, spo2, patientId);
                refreshvitals(heart_rate, bp_text, temp, respiration_rate, spo2, patientId);
                // ecg
                const ecgData = ecgSnapshot.val();
                const latestECGEntry = getLatestSnapshotEntry(ecgData);
                const ECGkey = latestECGEntry.key;
                const latestECG = latestECGEntry.value;
                const ecg = latestECG ? latestECG.payload : null;
                const type = latestECG ? latestECG.type : null;
                let final_min_ecg = [];

                if (typeof ecg === "string" && type !== "noise" && type !== "flat") {
                  let ecg_result = ecg.replace(/\]\[/g, ", ").trim();
                  ecg_result = ecg_result.replace(/\]/g, "").trim();
                  ecg_result = ecg_result.replace(/\[/g, "").trim();
                  final_min_ecg = ecg_result
                    .split(",")
                    .map(Number)
                    .filter((value) => !isNaN(value));
                }

                console.log("LOOPING ECG", patientId, final_min_ecg);
                console.log("[dashboard-custom.js] validTimestamp ECG", patientId, ECGkey, shouldRenderWaveform(validTimestamp, ECGkey));
                if (shouldRenderWaveform(validTimestamp, ECGkey)) {
                  createECGchart(final_min_ecg, patientId);
                } else {
                  createECGchart([], patientId);
                }
                // ppg
                const ppgDataValue = ppgSnapshot.val();
                const latestPPGEntry = getLatestSnapshotEntry(ppgDataValue);
                const PPGkey = latestPPGEntry.key;
                const latestPPG = latestPPGEntry.value;
                const ppgdata = latestPPG ? latestPPG.payload : undefined;
                let final_ppg = [];

                if (typeof ppgdata === "string") {
                  let result1 = ppgdata.replace(/\,/g, "").trim();
                  final_ppg = result1
                    .split(" ")
                    .map(Number)
                    .filter((value) => !isNaN(value));
                }

                console.log("LOOPING PPG", final_ppg);
                console.log("[dashboard-custom.js] validTimestamp PPG", patientId, PPGkey, shouldRenderWaveform(validTimestamp, PPGkey));
                if (shouldRenderWaveform(validTimestamp, PPGkey)) {
                  createPPGchart(final_ppg, patientId);
                } else {
                  createPPGchart([], patientId);
                }

                // RR
                const rrDataValue = rrSnapshot.val();
                const latestRREntry = getLatestSnapshotEntry(rrDataValue);
                const RRkey = latestRREntry.key;
                const latestRR = latestRREntry.value;
                const rrdata = latestRR ? latestRR.res : undefined;
                let final_rr = [];

                if (typeof rrdata === "string") {
                  // Process the nested array structure
                  let cleanedData = rrdata.replace(/\]\[/g, ", ").replace(/\[/g, "").replace(/\]/g, "");
                  let allValues = cleanedData
                    .split(",")
                    .map((num) => parseFloat(num.trim()))
                    .filter((num) => !isNaN(num));

                  // Filter out extreme values that cause display issues
                  final_rr = allValues.filter((value) => {
                    return value > -1000 && value < 1000;
                  });

                  // If we have too few values after filtering, take a sample
                  if (final_rr.length < 50 && allValues.length > 50) {
                    const step = Math.max(1, Math.floor(allValues.length / 200));
                    final_rr = [];
                    for (let j = 0; j < allValues.length; j += step) {
                      if (allValues[j] > -1000 && allValues[j] < 1000) {
                        final_rr.push(allValues[j]);
                      }
                    }
                  }
                }

                console.log("LOOPING RR", patientId, final_rr);
                console.log("[dashboard-custom.js] validTimestamp RR", patientId, RRkey, shouldRenderWaveform(validTimestamp, RRkey));
                if (shouldRenderWaveform(validTimestamp, RRkey)) {
                  createRRchart(final_rr, patientId);
                } else {
                  createRRchart([], patientId);
                }
              })
              .catch((error) => {
                console.error("[dashboard-custom.js] Error retrieving chart/vital snapshots for patient:", patientId, error);
              });
          }
        } catch (e) {
          console.error("[dashboard-custom.js] Error processing patient data:", e);
        }
      },
      function (error) {
        console.error("[dashboard-custom.js] Error retrieving patient data:", error);
      },
    );
  } catch (e) {
    console.error("[dashboard-custom.js] Error in firebase_Data_retrieval:", e);
  }
}
function refreshews(ews_value, ews_color, ID) {
  var ewsvId = "ewsv" + ID;
  var ewscId = "ewsc" + ID;

  var ews_v = document.getElementById(ewsvId);
  var ews_c = document.getElementById(ewscId);
  console.log("[dashboard-custom.js]  refreshews", ewsvId, ews_v, ews_color);
  if (ews_v === null) {
  } else {
    ews_v.textContent = ews_value;
    ews_c.style.background = ews_color;
  }
}

function getOrCreateChart(containerId) {
  const container = document.getElementById(containerId);

  if (!container) {
    return null;
  }

  let chart = echarts.getInstanceByDom(container);
  if (!chart) {
    chart = echarts.init(container);
  }

  chartRegistry.set(containerId, chart);
  return chart;
}

function getStableWaveformData(type, id, data, minLength) {
  const safeData = Array.isArray(data) ? data.filter((value) => Number.isFinite(value)) : [];
  const cache = waveformCache[type];

  if (safeData.length >= minLength) {
    cache.set(id, safeData);
    return safeData;
  }

  return cache.get(id) || safeData;
}

function getLatestSnapshotEntry(snapshotValue) {
  if (!snapshotValue || typeof snapshotValue !== "object") {
    return { key: null, value: null };
  }

  const keys = Object.keys(snapshotValue);
  if (keys.length === 0) {
    return { key: null, value: null };
  }

  const latestKey = keys[keys.length - 1];

  return {
    key: latestKey,
    value: snapshotValue[latestKey] || null,
  };
}

function shouldRenderWaveform(validTimestamp, waveformKey) {
  if (validTimestamp == null || waveformKey == null) {
    return false;
  }

  return String(validTimestamp) === String(waveformKey);
}

function resizeAllCharts() {
  chartRegistry.forEach((chart, containerId) => {
    const container = document.getElementById(containerId);

    if (!container) {
      chartRegistry.delete(containerId);
      return;
    }

    chart.resize();
  });
}

window.addEventListener("resize", resizeAllCharts);
document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    setTimeout(resizeAllCharts, 0);
  }
});

function createECGchart(ecg, Id) {
  console.log("");
  var LiveECGId = "chart" + Id;
  var chart = getOrCreateChart(LiveECGId);

  if (!chart) {
    console.warn("[dashboard-custom.js] ECG container not found for ID:", LiveECGId);
    return;
  }

  var ecgData = ecg;
  var reference_data = [
    [-20, 100],
    [-30, 100],
    [-30, 201],
    [-50, 201],
    [-50, 100],
    [-60, 100],
  ];
  var counter = 0;
  var value;
  function randomData() {
    value = ecgData[counter % ecgData.length];

    counter++;
    return {
      value: [counter % ecgData.length, Math.round(value)],
    };
  }

  var data = [];

  try {
    for (var i = 1; i < ecgData.length; i++) {
      data.push(randomData());
    }
  } catch (e) {
    console.log("[dashboard-custom.js] EcgData.length:", e.message);
  }
  console.log("[dashboard-custom.js] data ecg", ecgData.length);
  if (ecgData.length < 625) {
    chart.clear();

    option1 = {
      title: {
        text: "WAITING FOR VALID ECG",
        textStyle: {
          fontSize: "10",
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
    chart.setOption(option1, true);
  } else {
    var endzoom = 0;
    var option1 = {
      title: {
        top: "0px",
        left: "15px",
        text: "",
        textStyle: {
          fontSize: 12,
          fontStyle: "normal",
        },
      },
      grid: {
        top: 5,
        left: 10,
        right: 10,
        bottom: 8,
      },
      toolbox: {
        orient: "vertical",
        right: 5,
        feature: {
          myTool1: {
            show: false,

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
          show: false,
          type: "slider",
          xAxisIndex: [0],
          filterMode: "none",
          zoomLock: false,
          showDetail: false,
          height: 10,
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

        splitLine: {
          lineStyle: {
            color: "#0686AF",
            width: 1.2,
          },
        },
        grid: {
          show: false,
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
            color: "#37FD12",
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
            color: "#37FD12",
            width: 1.5,
          },
          label: {
            show: false,
          },
        },
      ],
    };

    if (endzoom !== 0) {
      chart.dispatchAction({
        type: "dataZoom",
        endValue: endzoom,
      });
    }
    chart.setOption(option1, true);
  }
}
function createPPGchart(ppg, ID) {
  var LivePPGId = "ppgchart" + ID;
  var chart = getOrCreateChart(LivePPGId);

  if (!chart) {
    console.error("PPG container not found for ID:", LivePPGId);
    return;
  }

  var ppgData = ppg;

  var counter = 0;
  var value;
  function randomData() {
    value = ppgData[counter % ppgData.length];

    counter++;
    return {
      value: [counter % ppgData.length, value],
    };
  }

  var data = [];

  try {
    for (var i = 1; i < ppgData.length; i++) {
      data.push(randomData());
    }
  } catch (e) {
    console.log("[dashboard-custom.js] EcgData.length:", e.message);
  }
  if (ppgData.length < 501) {
    chart.clear();

    option1 = {
      title: {
        text: "WAITING FOR VALID PPG",
        textStyle: {
          fontSize: "10",
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
    chart.setOption(option1, true);
  } else {
    var endzoom = 0;
    var option1 = {
      title: {
        top: "0px",
        left: "15px",
        text: "",
        textStyle: {
          fontSize: 12,
          fontStyle: "normal",
        },
      },
      grid: {
        top: 5,
        left: 10,
        right: 10,
        bottom: 8,
      },
      toolbox: {
        orient: "vertical",
        right: 5,
        feature: {
          myTool1: {
            show: false,

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
          show: false,
          type: "slider",
          xAxisIndex: [0],
          filterMode: "none",
          zoomLock: false,
          showDetail: false,
          height: 10,
          handleIcon: "pin",
          handleStyle: {
            color: "#0865C1",
            borderColor: "#ACB8D1",
            borderWidth: 1,
          },
        },
      ],
      xAxis: {
        show: false,
        type: "value",

        splitLine: {
          lineStyle: {
            color: "#0686AF",
            width: 1.2,
          },
        },
        grid: {
          show: false,
        },

        axisLine: {
          show: true,
          onZero: true,
          lineStyle: {
            color: "#FFFFFF",
            width: 1.2,
            opacity: 1,
          },
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
          return value.min - 40;
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
          onZero: true,
          lineStyle: {
            color: "#0686AF",
            width: 1.2,
          },
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
            color: "#37FD12",
            width: 1.6,
          },
          labelLine: {
            show: false,
          },
          seriesLayoutBy: "column",
        },
      ],
    };

    if (endzoom !== 0) {
      chart.dispatchAction({
        type: "dataZoom",
        endValue: endzoom,
      });
    }
    chart.setOption(option1, true);
  }
}
function createRRchart(rr, ID) {
  var LiveRRId = "rrchart" + ID;
  var chart = getOrCreateChart(LiveRRId);

  if (!chart) {
    console.error("[dashboard-custom.js] RR container not found for ID:", LiveRRId);
    return;
  }

  var rrData = rr;

  var counter = 0;
  function randomData() {
    var value = rrData[counter % rrData.length];
    counter++;
    return { value: [counter, value] };
  }
  console.log("[dashboard-custom.js] rrdata length", rrData.length);
  var data = [];
  try {
    for (var i = 0; i < rrData.length; i++) {
      data.push(randomData());
    }
  } catch (e) {
    console.error("[dashboard-custom.js] RRData.length error:", e);
  }
  let option;
  chart.clear();
  if (rrData.length < 120) {
    option = {
      title: {
        text: "WAITING FOR VALID RR",
        textStyle: {
          fontSize: "10",
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
  } else {
    option = {
      grid: { top: 5, left: 10, right: 10, bottom: 8 },
      xAxis: {
        type: "value",
        show: false,
        splitLine: { lineStyle: { color: "#0686AF", width: 1.2 } },
        axisLine: { show: true, lineStyle: { color: "#FFFFFF", width: 1.2 } },
      },
      yAxis: {
        type: "value",
        show: false,
        splitLine: { lineStyle: { color: "#0686AF", width: 1.2 } },
        axisLine: { show: true, lineStyle: { color: "#0686AF", width: 1.2 } },
      },
      series: [
        {
          name: "RR",
          type: "line",
          showSymbol: false,
          data: data,
          animation: false,
          smooth: true,
          lineStyle: { color: "#37FD12", width: 2.0 },
          connectNulls: true,
        },
      ],
    };
  }
  chart.setOption(option, true);
}
function refreshvitals(hr, bp, temp, rr, spo, ID) {
  var hrId = "hr" + ID;
  var bpId = "bp" + ID;
  var spoId = "spo" + ID;
  var rrId = "rr" + ID;
  var tempId = "temp" + ID;

  var hrv = document.getElementById(hrId);
  var bpv = document.getElementById(bpId);
  var rrv = document.getElementById(rrId);
  var spov = document.getElementById(spoId);
  var tempv = document.getElementById(tempId);

  console.log("[dashboard-custom.js] in refresh vitals", hr, bp, temp, rr, spo, ID);
  console.log("[dashboard-custom.js] id in refresh vitals", hrId, bpId, spoId, rrId, tempId);

  if (hrv) hrv.textContent = hr + " bpm";
  if (bpv) bpv.textContent = bp + " mmHg";
  if (rrv) rrv.textContent = rr + " rpm";
  if (spov) spov.textContent = spo + " %";
  if (tempv) tempv.textContent = temp + " ˚C";
}
// listener
const messagesRef = fb.database().ref().child("threshold_triggers");
const activeAlertTargets = new Set();
const activePatientAlerts = new Map();
const pendingBlinkAlerts = new Map();

function parseThresholdVitals(vitalString) {
  if (typeof vitalString !== "string") {
    return [];
  }

  return vitalString
    .split(",")
    .map((vital) =>
      String(vital || "")
        .trim()
        .toUpperCase(),
    )
    .filter(Boolean);
}

function resolveAlertElementId(id, vital) {
  if (vital === "HR") {
    return "hrBorder" + id;
  }
  if (vital === "BP") {
    return "bpBorder" + id;
  }
  if (vital === "RR") {
    return "rrBorder" + id;
  }
  if (vital === "SPO2") {
    return "spo2Border" + id;
  }
  if (vital === "TEMP") {
    return "tempBorder" + id;
  }

  return "border" + id;
}

function getPatientBorderId(id) {
  return "border" + id;
}
const sessionStorageName = "THRESHOLD_TRIGGERS";

function getStoredThresholdAlerts() {
  try {
    const storedValue = sessionStorage.getItem(sessionStorageName);
    if (!storedValue) {
      return {};
    }

    const parsedValue = JSON.parse(storedValue);
    if (!parsedValue || typeof parsedValue !== "object" || Array.isArray(parsedValue)) {
      return {};
    }

    return parsedValue;
  } catch (error) {
    console.warn("[dashboard-custom.js] Unable to read threshold alerts from session storage:", error);
    return {};
  }
}

function setStoredThresholdAlerts(alertsByPatient) {
  const patientIds = Object.keys(alertsByPatient || {});

  if (patientIds.length === 0) {
    sessionStorage.removeItem(sessionStorageName);
    return;
  }

  sessionStorage.setItem(sessionStorageName, JSON.stringify(alertsByPatient));
}

function queuePendingBlink(id, vital) {
  const patientVitals = pendingBlinkAlerts.get(id) || new Set();
  patientVitals.add(vital);
  pendingBlinkAlerts.set(id, patientVitals);
}

function flushPendingBlinkAlerts() {
  if (pendingBlinkAlerts.size === 0) {
    return;
  }

  const pendingEntries = Array.from(pendingBlinkAlerts.entries());
  pendingBlinkAlerts.clear();

  pendingEntries.forEach(([id, vitals]) => {
    vitals.forEach((vital) => {
      addBlink(id, vital);
    });
  });
}

function restoreBlinkAlertsFromSession() {
  const storedAlerts = getStoredThresholdAlerts();
  const patientIds = Object.keys(storedAlerts);

  if (patientIds.length === 0) {
    return;
  }

  console.log("[dashboard-custom.js] Applying blink effect for session data:", storedAlerts);

  patientIds.forEach((patientId) => {
    const patientVitals = Array.isArray(storedAlerts[patientId]) ? storedAlerts[patientId] : [];
    patientVitals.forEach((vital) => {
      addBlink(patientId, vital);
      console.log("[dashboard-custom.js] Applying blink effect for session data:", patientId, vital);
    });
  });

  console.log("[dashboard-custom.js] Completed");
}

// Apply the blink effect to the users
restoreBlinkAlertsFromSession();

messagesRef.on("child_added", (patientSnapshot) => {
  const patientId = patientSnapshot.key;
  const patientRef = patientSnapshot.ref;

  console.log("[dashboard-custom.js] threshold patient:", patientId);

  patientRef.once("value", (initialSnap) => {
    const oldTimestampKeys = new Set();

    initialSnap.forEach((child) => {
      oldTimestampKeys.add(child.key);
    });

    patientRef.on("child_added", (timestampSnapshot) => {
      const timestampKey = timestampSnapshot.key;

      if (oldTimestampKeys.has(timestampKey)) return;

      const rawVitals = timestampSnapshot.val();

      console.log("[dashboard-custom.js] threshold timestamp:", timestampKey);
      console.log("[dashboard-custom.js] threshold data:", rawVitals);

      if (typeof rawVitals !== "string") return;

      const normalizedVitals = parseThresholdVitals(rawVitals);

      const sessionData = getStoredThresholdAlerts();

      const alreadyExistingVitals = sessionData[patientId] || [];

      sessionData[patientId] = [...new Set([...alreadyExistingVitals, ...normalizedVitals])];

      setStoredThresholdAlerts(sessionData);

      normalizedVitals.forEach((vital) => addBlink(patientId, vital));
    });
  });
});
const sound = document.getElementById("alertSound");
let alertSoundPrimed = false;

if (sound) {
  sound.preload = "auto";
}

function primeAlertSound() {
  if (!sound || alertSoundPrimed) {
    return;
  }

  const playAttempt = sound.play();
  if (!playAttempt || typeof playAttempt.then !== "function") {
    alertSoundPrimed = true;
    sound.pause();
    sound.currentTime = 0;
    return;
  }

  sound.muted = true;
  playAttempt
    .then(() => {
      sound.pause();
      sound.currentTime = 0;
      sound.muted = false;
      alertSoundPrimed = true;
    })
    .catch(() => {
      sound.muted = false;
    });
}

document.addEventListener("pointerdown", primeAlertSound, { once: true });
document.addEventListener("keydown", primeAlertSound, { once: true });

function syncAlertSound() {
  if (!sound) {
    return;
  }

  if (activeAlertTargets.size > 0) {
    sound.loop = true;
    sound.play().catch((error) => {
      console.warn("[dashboard-custom.js] Unable to play alert sound:", error);
    });
    return;
  }

  sound.pause();
  sound.currentTime = 0;
}

function clearAllBlinkAlerts() {
  document.querySelectorAll(".blink-border").forEach((element) => {
    element.classList.remove("blink-border");
  });
  document.querySelectorAll(".blink-text").forEach((element) => {
    element.classList.remove("blink-text");
  });
  activeAlertTargets.clear();
  activePatientAlerts.clear();
  pendingBlinkAlerts.clear();
  syncAlertSound();
}

function addBlink(id, vital) {
  try {
    let val = resolveAlertElementId(id, vital);
    const alertBox = document.getElementById(val);
    const patientBorderId = getPatientBorderId(id);
    const patientBorder = document.getElementById(patientBorderId);

    if (!alertBox) {
      queuePendingBlink(id, vital);
      console.warn("[dashboard-custom.js] Alert UI element not found:", val);
      return;
    }

    const pendingVitals = pendingBlinkAlerts.get(id);
    if (pendingVitals) {
      pendingVitals.delete(vital);
      if (pendingVitals.size === 0) {
        pendingBlinkAlerts.delete(id);
      }
    }

    if (val.startsWith("border")) alertBox.classList.add("blink-border");
    else alertBox.classList.add("blink-text");

    if (patientBorder) {
      patientBorder.classList.add("blink-border");
      activeAlertTargets.add(patientBorderId);
    }

    const patientVitals = activePatientAlerts.get(id) || new Set();
    patientVitals.add(vital);
    activePatientAlerts.set(id, patientVitals);

    activeAlertTargets.add(val);
    syncAlertSound();
  } catch (error) {
    console.error("[dashboard-custom.js] Error in addBlink function:", error);
  }
}

function removeBlink(id, vital) {
  try {
    // remove from session storage
    const sessionData = getStoredThresholdAlerts();
    const storedVitals = Array.isArray(sessionData[id]) ? sessionData[id] : [];

    if (storedVitals.length > 0) {
      const updatedVitals = storedVitals.filter((storedVital) => storedVital !== vital);
      if (updatedVitals.length > 0) {
        sessionData[id] = updatedVitals;
      } else {
        delete sessionData[id];
      }

      setStoredThresholdAlerts(sessionData);
    }

    let val = resolveAlertElementId(id, vital);

    const alertBox = document.getElementById(val);
    const patientBorderId = getPatientBorderId(id);
    const patientBorder = document.getElementById(patientBorderId);

    if (!alertBox) {
      const pendingVitals = pendingBlinkAlerts.get(id);
      if (pendingVitals) {
        pendingVitals.delete(vital);
        if (pendingVitals.size === 0) {
          pendingBlinkAlerts.delete(id);
        }
      }
      console.warn("[dashboard-custom.js] Alert UI element not found:", val);
      return;
    }

    if (val.startsWith("border")) alertBox.classList.remove("blink-border");
    else alertBox.classList.remove("blink-text");

    const patientVitals = activePatientAlerts.get(id);
    if (patientVitals) {
      patientVitals.delete(vital);
      if (patientVitals.size === 0) {
        activePatientAlerts.delete(id);
        if (patientBorder) {
          patientBorder.classList.remove("blink-border");
        }
        activeAlertTargets.delete(patientBorderId);
      }
    }

    activeAlertTargets.delete(val);
    syncAlertSound();
  } catch (error) {
    console.error("[dashboard-custom.js] Error in removeBlink function:", error);
  }
}

window.addBlink = addBlink;
window.removeBlink = removeBlink;
window.clearAllBlinkAlerts = clearAllBlinkAlerts;
window.flushPendingBlinkAlerts = flushPendingBlinkAlerts;

// Firebase Notifications
let messaging = null;
try {
  messaging = fb.messaging();
} catch (error) {
  console.error("notification [dashboard-custom.js] in messaging initialization error catch", error);
}

try {
  navigator.serviceWorker
    .register(new URL("../../../production/firebase-messaging-sw.js", import.meta.url))
    .then(function (registration) {
      console.log("notification [dashboard-custom.js] Service Worker registered with scope:", registration.scope);
      messaging.useServiceWorker(registration);
      return messaging.requestPermission();
    })

    .then(function () {
      console.log("notification [dashboard-custom.js] Have permission");

      var docid = localStorage.getItem("doctor_id");
      console.log("notification [dashboard-custom.js] docid", docid);
      return messaging.getToken(messaging, { vapidKey: "BDSMgbKCwTOC9f7r4FPoXsymskTh_M_GfLXi_sszHMbzLMaLG1zVD0jyVUVMkuVAszaNSrUwyb-aM8X9E5Qclv0" });
    })
    .then((currentToken) => {
      if (currentToken) {
        var context_assessmenttoken = fb.database().ref().child("FCM_token").child(currentToken);

        context_assessmenttoken.set({
          Id: localStorage.getItem("doctor_id"),
        });

        console.log("notification [dashboard-custom.js] current token", currentToken);
      } else {
        console.log("notification [dashboard-custom.js] No registration token available. Request permission to generate one.");
      }
    })
    .catch(function (err) {
      console.error("notification [dashboard-custom.js]in first error ctch", err);
    });
} catch (e) {
  console.error("notification [dashboard-custom.js] in request permission error catch", e);
}
try {
  messaging.onMessage(function (payload) {
    console.log("notification [dashboard-custom.js] Inside onMessage:", payload);

    if (payload.data.timestamp && payload.data.uid) {
      const param1 = btoa(payload.data.timestamp);
      console.log("notification [dashboard-custom.js] param1:", param1);

      const param2 = btoa(payload.data.uid);
      console.log("notification [dashboard-custom.js] param2:", param2);

      const param3 = btoa("1");

      const url = "context_assment.html" + "?param1=" + param1 + "&param2=" + param2 + "&param3=" + param3;

      var childWindow = window.open(url, "Context Assessment", "width=1050,height=670,left=150,top=200,titlebar=0,toolbar=0,status=0");

      setTimeout(function () {
        if (childWindow && !childWindow.closed) {
          childWindow.close();
        } else {
          console.log("notification [dashboard-custom.js] Child window is already closed or not available.");
        }
      }, 30000);
    } else {
      console.log("notification [dashboard-custom.js] Invalid timestamp or final_patient_uid in payload data");
    }
  });
} catch (e) {
  console.error("notification [dashboard-custom.js] in onMessage error catch", e);
}
