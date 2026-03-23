/* import of echarts from live-custom */
import {
  heartrate_data,
  blood_pressure_data,
  respiration_rate_data,
  // acceleration_data,
  blood_oxygen_data,
  temperature_data,
  ECG_data_passing,
  ews_value_passing,
  PPG_data_passing,
  RR_data_passing,
} from "./live-custom.js";
// import { SymptomMsg } from "../context_assessment/ContextAssessmentTrim.js";
import { NoEcgData, NoData, NoRRData, NoPpgData } from "./EchartGraphs.js";
// import { joincall, userjoin, leave } from "../videoCall/index.js";
// import { showToast } from "../backend/toastmsg.js";
import { installGlobalEchartsAutoResize } from "../utils/echarts-auto-resize.js";

// Keep ECharts charts responsive when components are shown/hidden,
// the sidebar toggles, or the viewport/container resizes.
installGlobalEchartsAutoResize();

export let firebaseConfig = {
  // apiKey: "AIzaSyApKpSVyxHwdN5wjJxXy0tuf0nKKWTrjn4",
  // authDomain: "custom-query-staging.firebaseapp.com",
  // databaseURL: "https://custom-query-staging-default-rtdb.firebaseio.com",
  // projectId: "custom-query-staging",
  // storageBucket: "custom-query-staging.firebasestorage.app",
  // messagingSenderId: "600965219265",
  // appId: "1:600965219265:web:d505441a645bcb7a8b2540",
  // measurementId: "G-1W0CXXKETD",

  apiKey: "AIzaSyATp1WsFIaNNI01a4u5qU9M7LF73mLMuw0",
  authDomain: "testing-1348b.firebaseapp.com",
  databaseURL: "https://testing-1348b-default-rtdb.firebaseio.com",
  projectId: "testing-1348b",
  storageBucket: "testing-1348b.firebasestorage.app",
  messagingSenderId: "951902946643",
  appId: "1:951902946643:web:7c966f39647606cdc9cda6",
  measurementId: "G-Y61QB1SQK2",
};

export let sensor_flag;

export var fb = firebase.initializeApp(firebaseConfig);
// var ongoing_val = 0;
// var call_decline_val;
// var docId = localStorage.getItem("doctor_id");

// if (fb !== undefined && docId !== null) {
//   var vc2 = fb.database().ref().child("video_call").child(docId);
//   vc2.on("value", function (snapshot) {
//     ongoing_val = snapshot.child("ongoing").val();
//     if (ongoing_val == 0) {
//       // closeLightbox();
//     }
//     call_decline_val = snapshot.child("call_decline").val();
//     if (ongoing_val == 0 && userjoin == true && call_decline_val == 1) {
//       // console.log("Leave function line:", 86);
//       // console.log("ongoing_val", ongoing_val);
//       showToast("call end");
//       leave();
//       userjoin = false;
//     }
//     if (call_decline_val == 1 && ongoing_val == 0) {
//       leave();
//       showToast("call declined");
//       fb.database().ref("/video_call_initiator").remove();
//       fb.database().ref().child("video_call").child(docId).child("ongoing").set("0");
//     }
//   });
// }

export var vct;

function formatDateTime(unixTimestamp) {
  if (!Number.isFinite(Number(unixTimestamp))) {
    return {
      date: "--/--/----",
      time: "--:--:--",
    };
  }

  const date = new Date(Number(unixTimestamp) * 1000);

  return {
    date: ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear(),
    time: ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2),
  };
}

function setInnerHtml(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = value;
  }
}

function updateChartDateTime(dateElementId, timeElementId, unixTimestamp) {
  const formatted = formatDateTime(unixTimestamp);
  setInnerHtml(dateElementId, formatted.date);
  setInnerHtml(timeElementId, formatted.time);
}

function clearChartDateTime(dateElementId, timeElementId) {
  setInnerHtml(dateElementId, "");
  setInnerHtml(timeElementId, "");
}

function showNoDataChart(chartElementId, option, dateElementId, timeElementId) {
  clearChartDateTime(dateElementId, timeElementId);

  const chartElement = document.getElementById(chartElementId);
  if (!chartElement) {
    return;
  }

  const chart = echarts.init(chartElement);
  chart.clear();
  chart.setOption(option);
}

function getLatestSnapshotEntry(snapshotValue) {
  if (!snapshotValue || typeof snapshotValue !== "object") {
    return { timestamp: null, record: null };
  }

  const timestamps = Object.keys(snapshotValue)
    .map((key) => Number(key))
    .filter((timestamp) => Number.isFinite(timestamp))
    .sort((left, right) => right - left);

  if (timestamps.length === 0) {
    return { timestamp: null, record: null };
  }

  const timestamp = timestamps[0];
  return {
    timestamp,
    record: snapshotValue[String(timestamp)] ?? snapshotValue[timestamp] ?? null,
  };
}

function parseEcgPayload(payload) {
  if (typeof payload !== "string") {
    return [];
  }

  let normalized = payload.replace(/\]\[/g, ", ").trim();
  normalized = normalized.replace(/\]/g, "").trim();
  normalized = normalized.replace(/\[/g, "").trim();

  return normalized
    .split(",")
    .map(Number)
    .filter((value) => Number.isFinite(value));
}

function parseSpaceSeparatedWaveform(payload) {
  if (typeof payload !== "string") {
    return [];
  }

  return payload
    .replace(/,/g, " ")
    .trim()
    .split(/\s+/)
    .map(Number)
    .filter((value) => Number.isFinite(value));
}

function sanitizeVitalValue(value, invalidSentinel) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue === invalidSentinel) {
    return "--";
  }

  return numericValue;
}

function applyVitalsToUi(data) {
  if (!data) {
    return;
  }

  const heartRate = sanitizeVitalValue((data.hr ?? 0) / 100, 2.38);
  const spo2 = sanitizeVitalValue((data.spo ?? 0) / 100, 2.38);
  const respirationRate = sanitizeVitalValue(data.rr, 238);

  const bpText = String(data.bp || "");
  const bpParts = bpText.split("/");
  const sbp = sanitizeVitalValue(bpParts[0], 238);
  const dbp = sanitizeVitalValue(bpParts[1], 238);

  const rawTemp = String(data.temp ?? "");
  const tempSanitized = rawTemp.replace(/[^0-9.+-]/g, "");
  const parsedTemp = tempSanitized ? parseFloat(tempSanitized) : NaN;
  const temp = sanitizeVitalValue(parsedTemp, 238);

  heartrate_data(heartRate, "");
  blood_pressure_data(sbp, dbp, "", "");
  respiration_rate_data(respirationRate, "");
  blood_oxygen_data(spo2, "");
  temperature_data(temp, "");

  const batteryPercentage = data.battery;
  const batteryPercentageElement = document.getElementById("battery-percentage");
  if (batteryPercentageElement !== null && batteryPercentage !== undefined && batteryPercentage !== null) {
    batteryPercentageElement.innerHTML = getBatteryIcon(batteryPercentage) + batteryPercentage + "%";
  }

  if (Number.isFinite(Number(data.timestamp))) {
    updateChartDateTime("sensordate", "sensortime", Number(data.timestamp));
  }
}

function shouldRenderForActiveTimestamp(signalTimestamp, activeVitalsTimestamp) {
  if (!Number.isFinite(Number(activeVitalsTimestamp))) {
    return true;
  }

  if (!Number.isFinite(Number(signalTimestamp))) {
    return false;
  }

  return Math.abs(Number(signalTimestamp) - Number(activeVitalsTimestamp)) <= 3;
}

function init_echarts() {
  $(document).ready(() => {
    var PatientName;
    var heart_rate;
    var spo2;
    var sbp;
    var dbp;
    var oldtemp;
    var option1;
    // var newTemp;
    // var sbp_dbp;
    var respiration_rate;
    var temp;
    // var acc;
    var final_min_ecg;
    var batteryPercentage;
    var value;
    // var scale;
    // var symptoms;
    // var pain_spot;
    // var flag = false;
    var id = localStorage.getItem("patient_unique_id");
    var ref;
    let ecg_ref;
    let ecg_min;
    let ppg_min;
    let rr_min;
    let ews;
    var ref_valid;
    // var context_assessment;
    var patients;
    sensor_flag = 0;
    var ecg_flag = 0;
    var ppg_flag = 0;
    var rr_flag = 0;
    var live_vitals_flag = 0;
    var ppg_ref;
    var rr_ref;
    // var pat_bp_5sec_ref;
    let latestPatHr = null;
    let latestPatHrTs = 0;
    let activeVitalsTimestamp = null;
    let latestVitalsRecord = null;
    if (id != null || id != undefined) {
      ref = fb.database().ref().child("patientlivedata7s").child(id);
      ecg_ref = fb.database().ref().child("ECG_plot").child(id);
      ppg_ref = fb.database().ref().child("PPG_plot").child(id);
      rr_ref = fb.database().ref().child("RR_plot").child(id);

      ecg_min = fb.database().ref().child("patientecgdata").child(id);
      ppg_min = fb.database().ref().child("patientppgdata").child(id);
      rr_min = fb.database().ref().child("patientrrdata").child(id);
      ref_valid = fb.database().ref().child("patientlivedata").child(id).limitToLast(1);
      ews = fb.database().ref().child("EWS").child(id).limitToLast(1); //ews inititlization
      // pat_bp_5sec_ref = fb.database().ref().child("PAT_BP_5s_tree").child(id);
      // context_assessment = fb.database().ref().child("context_assessment").child(id);
      patients = fb.database().ref().child("patients").child(id);

      patients.once("value", function (snapshot) {
        let patient_data = JSON.stringify(snapshot.val(), null, 2);
        let patient_data1 = JSON.parse(patient_data);
        PatientName = patient_data1.username;
        localStorage.setItem("patientname", PatientName);
      });

      // pat_bp_5sec_ref.on("value", function (snapshot) {
      //   const val = snapshot.val();
      //   if (!val) return;
      //   const timestamps = Object.keys(val)
      //     .map((k) => Number(k))
      //     .filter((n) => Number.isFinite(n));
      //   if (timestamps.length === 0) return;
      //   const maxTs = Math.max(...timestamps);
      //   const latest = val[maxTs];
      //   if (latest && typeof latest.ECG_HR === "number") {
      //     latestPatHr = latest.ECG_HR / 100;
      //     latestPatHrTs = maxTs; // seconds epoch
      //   }
      // });

      const loadHistoricalWaveforms = function (timestamp) {
        if (!Number.isFinite(Number(timestamp))) {
          showNoDataChart("LiveECGId", NoEcgData, "ecgdate", "ecgtime");
          showNoDataChart("LivePPGId", NoPpgData, "ppgdate", "ppgtime");
          showNoDataChart("LiveRRId", NoRRData, "rrdate", "rrtime");
          return;
        }

        ecg_min
          .child(String(timestamp))
          .once("value")
          .then(function (snapshot) {
            const record = snapshot.val();
            if (!record) {
              showNoDataChart("LiveECGId", NoEcgData, "ecgdate", "ecgtime");
              return;
            }

            const type = record.type;
            const waveform = type === "noise" || type === "flat" ? [] : parseEcgPayload(record.payload);
            if (!waveform.length) {
              showNoDataChart("LiveECGId", NoEcgData, "ecgdate", "ecgtime");
              return;
            }

            updateChartDateTime("ecgdate", "ecgtime", record.timestamp ?? timestamp);
            ECG_data_passing(waveform, "", "", option1, value, "", 625);
          })
          .catch(function (error) {
            console.error("[database_function.js] Unable to load ECG for timestamp", timestamp, error);
            showNoDataChart("LiveECGId", NoEcgData, "ecgdate", "ecgtime");
          });

        ppg_min
          .child(String(timestamp))
          .once("value")
          .then(function (snapshot) {
            const record = snapshot.val();
            if (!record) {
              showNoDataChart("LivePPGId", NoPpgData, "ppgdate", "ppgtime");
              return;
            }

            const waveform = parseSpaceSeparatedWaveform(record.payload);
            if (!waveform.length) {
              showNoDataChart("LivePPGId", NoPpgData, "ppgdate", "ppgtime");
              return;
            }

            updateChartDateTime("ppgdate", "ppgtime", record.timestamp ?? timestamp);
            PPG_data_passing(waveform, "", "", "", "", "", 500);
          })
          .catch(function (error) {
            console.error("[database_function.js] Unable to load PPG for timestamp", timestamp, error);
            showNoDataChart("LivePPGId", NoPpgData, "ppgdate", "ppgtime");
          });

        rr_min
          .child(String(timestamp))
          .once("value")
          .then(function (snapshot) {
            const record = snapshot.val();
            if (!record) {
              showNoDataChart("LiveRRId", NoRRData, "rrdate", "rrtime");
              return;
            }

            const waveform = parseSpaceSeparatedWaveform(record.payload);
            if (!waveform.length) {
              showNoDataChart("LiveRRId", NoRRData, "rrdate", "rrtime");
              return;
            }

            updateChartDateTime("rrdate", "rrtime", record.timestamp ?? timestamp);
            RR_data_passing(waveform, "", "", "", "", "", 125);
          })
          .catch(function (error) {
            console.error("[database_function.js] Unable to load RR for timestamp", timestamp, error);
            showNoDataChart("LiveRRId", NoRRData, "rrdate", "rrtime");
          });
      };

      window.addEventListener("main-section:shown", function (event) {
        if (event?.detail?.sectionId !== "LiveComponents") {
          return;
        }

        if (latestVitalsRecord) {
          setTimeout(function () {
            applyVitalsToUi(latestVitalsRecord);
          }, 0);
          setTimeout(function () {
            applyVitalsToUi(latestVitalsRecord);
          }, 120);
        }

        if (Number.isFinite(Number(activeVitalsTimestamp))) {
          setTimeout(function () {
            loadHistoricalWaveforms(activeVitalsTimestamp);
          }, 80);
        }
      });

      let listener = ref.on("value", function (snapshot) {
        const live = snapshot.val();
        if (live != null) {
          if (live_vitals_flag === 1) {
            counter++;

            const data1 = live;
            console.log("[database_function.js] Live data:", data1);
            activeVitalsTimestamp = Number(data1.timestamp) || activeVitalsTimestamp;
            latestVitalsRecord = data1;
            applyVitalsToUi(data1);
          } else {
            // First snapshot from live vitals stream – treat as baseline.
            // Subsequent changes will override the default/ref_valid data.
            live_vitals_flag = 1;
          }
        }
      });

      let listener1 = ecg_ref.on("value", function (snapshot) {
        if (snapshot.val() != null) {
          if (ecg_flag == 1) {
            const chart_json = snapshot.val();
            let type = chart_json.type;
            const signalTimestamp = Number(chart_json.timestamp);
            const final_ecg = type == "noise" || type == "flat" ? [] : parseEcgPayload(chart_json.ecg);

            if (!shouldRenderForActiveTimestamp(signalTimestamp, activeVitalsTimestamp)) {
              return;
            }

            if (!final_ecg.length) {
              showNoDataChart("LiveECGId", NoEcgData, "ecgdate", "ecgtime");
              return;
            }

            updateChartDateTime("ecgdate", "ecgtime", signalTimestamp);
            ECG_data_passing(final_ecg, "", "", option1, value, "", 0);
          } else {
            ecg_flag = 1;
          }
        }
      });
      let listener2 = ppg_ref.on("value", function (snapshot) {
        const raw = snapshot.val();
        if (raw !== null) {
          if (ppg_flag === 1) {
            const ppg_json = raw;
            const signalTimestamp = Number(ppg_json.timestamp);
            const final_ppg = parseSpaceSeparatedWaveform(ppg_json.ppg);

            if (!shouldRenderForActiveTimestamp(signalTimestamp, activeVitalsTimestamp)) {
              return;
            }

            if (!final_ppg.length) {
              showNoDataChart("LivePPGId", NoPpgData, "ppgdate", "ppgtime");
              return;
            }

            updateChartDateTime("ppgdate", "ppgtime", signalTimestamp);
            PPG_data_passing(final_ppg, "", "", "", "", "", 0);
          } else {
            // First snapshot from live PPG stream – use as baseline.
            // Subsequent changes will override the default/historical data.
            ppg_flag = 1;
          }
        } else {
          showNoDataChart("LivePPGId", NoPpgData, "ppgdate", "ppgtime");
        }
      });

      let listener4 = rr_ref.on("value", function (snapshot) {
        const raw = snapshot.val();
        if (raw != null) {
          if (rr_flag === 1) {
            const rr_json = raw;
            const signalTimestamp = Number(rr_json.timestamp);
            const final_rr = parseSpaceSeparatedWaveform(rr_json.res);

            if (!shouldRenderForActiveTimestamp(signalTimestamp, activeVitalsTimestamp)) {
              return;
            }

            if (!final_rr.length) {
              showNoDataChart("LiveRRId", NoRRData, "rrdate", "rrtime");
              return;
            }

            updateChartDateTime("rrdate", "rrtime", signalTimestamp);
            RR_data_passing(final_rr, "", "", "", "", "", 0);
          } else {
            // First snapshot from live RR stream – use as baseline.
            // Subsequent changes will override the default/historical data.
            rr_flag = 1;
          }
        }
      });

      let listener3 = ews.on("value", function (snapshot) {
        let ews = JSON.stringify(snapshot.val(), null, 2);
        const parsedData = JSON.parse(ews);
        const key = Object.keys(parsedData)[0];

        let ews_value = parsedData[key].ews_score;
        let ewscolor = parsedData[key].color;
        if (ews_value !== undefined && ews_value !== null) {
          ews_value_passing(ews_value, ewscolor);
        } else {
          ews_value_passing(NoData);
        }
      });
      var list = ref_valid.once("value", function (snapshot) {
        if (snapshot.val() != null) {
          // console.log("[database_function.js] in validapatientdata");
          let data = snapshot.val();
          // console.log("[database_function.js] in validapatientdata", data);
          const latestEntry = getLatestSnapshotEntry(data);
          activeVitalsTimestamp = latestEntry.timestamp;

          if (latestEntry.record) {
            console.log("[database_function.js] in validapatientdata", latestEntry.record);
            latestVitalsRecord = latestEntry.record;
            applyVitalsToUi(latestEntry.record);
          }
          console.log("[database_function.js] Applying data from last timestamp from patientlivedata:", activeVitalsTimestamp);

          loadHistoricalWaveforms(activeVitalsTimestamp);
        } else {
          showNoDataChart("LiveECGId", NoEcgData, "ecgdate", "ecgtime");
          showNoDataChart("LivePPGId", NoPpgData, "ppgdate", "ppgtime");
          showNoDataChart("LiveRRId", NoRRData, "rrdate", "rrtime");
        }
      });

      var counter = 0;
    }
  });
}

function getBatteryIcon(batteryPercentage) {
  if (batteryPercentage >= 90) {
    return '<i class="fa fa-battery-full" aria-hidden="true"></i> ';
  } else if (batteryPercentage >= 60) {
    return '<i class="fa fa-battery-three-quarters" aria-hidden="true"></i> ';
  } else if (batteryPercentage >= 30) {
    return '<i class="fa fa-battery-half" aria-hidden="true"></i> ';
  } else if (batteryPercentage >= 10) {
    return '<i class="fa fa-battery-quarter" aria-hidden="true"></i> ';
  } else {
    return '<i class="fa fa-battery-empty" aria-hidden="true"></i> ';
  }
}

window.onload = () => {
  // console.log("[database_function.js] inside onload");
  init_echarts();
};
// window.onchange = () => {
//   console.log("[database_function.js] switching off listeners");
//   //sensor_flag = 2;
// };

// window.onblur = () => {
//   console.log("[database_function.js] switching off listeners");
//   // ref.off("value", listener)
//   // ecg_ref.off("value",listener1)
//   // ppg_ref.off("value",listener2)
//   // ews.off("value",listener3)
//   // ref_valid.off("value",list)
//   // ecg_min.off("value",list2)
//   // ppg_min.off("value",list3)
//   //sensor_flag = 2;
// };

export { init_echarts };
