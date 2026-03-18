/* import of echarts from live-custom */
import {
  heartrate_data,
  blood_pressure_data,
  respiration_rate_data,
  acceleration_data,
  blood_oxygen_data,
  temperature_data,
  ECG_data_passing,
  ews_value_passing,
  PPG_data_passing,
  RR_data_passing,
} from "./live-custom.js";
import { SymptomMsg } from "../context_assessment/ContextAssessmentTrim.js";
import { NoEcgData, NoData, NoPpgData } from "./EchartGraphs.js";
import { joincall, userjoin, leave } from "../videoCall/index.js";
import { showToast } from "../backend/toastmsg.js";
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
var ongoing_val = 0;
var call_decline_val;
var docId = localStorage.getItem("doctor_id");

if (fb !== undefined && docId !== null) {
  var vc2 = fb.database().ref().child("video_call").child(docId);
  vc2.on("value", function (snapshot) {
    ongoing_val = snapshot.child("ongoing").val();
    if (ongoing_val == 0) {
      // closeLightbox();
    }
    call_decline_val = snapshot.child("call_decline").val();
    if (ongoing_val == 0 && userjoin == true && call_decline_val == 1) {
      console.log("Leave function line:", 86);
      console.log("ongoing_val", ongoing_val);
      showToast("call end");
      leave();
      userjoin = false;
    }
    if (call_decline_val == 1 && ongoing_val == 0) {
      leave();
      console.log("showToast***");
      showToast("call declined");
      fb.database().ref("/video_call_initiator").remove();
      fb.database().ref().child("video_call").child(docId).child("ongoing").set("0");
    }
  });
}

export var vct;

function init_echarts() {
  $(document).ready(() => {
    var PatientName;
    var heart_rate;
    var spo2;
    var sbp;
    var dbp;
    var oldtemp;
    var option1;
    var newTemp;
    var sbp_dbp;
    var respiration_rate;
    var temp;
    var acc;
    var final_min_ecg;
    var batteryPercentage;
    var value;
    var scale;
    var symptoms;
    var pain_spot;
    var flag = false;
    var id = localStorage.getItem("patient_unique_id");
    var ref;
    let ref_chart;
    let ecg_min;
    let ppg_min;
    let rr_min;
    let ews;
    var ref_valid;
    var context_assessment;
    var patients;
    sensor_flag = 0;
    var ecg_flag = 0;
    var ppg_ref;
    var rr_ref;
    var pat_bp_5sec_ref;
    let latestPatHr = null;
    let latestPatHrTs = 0;
    if (id != null || id != undefined) {
      ref = fb.database().ref().child("patientlivedata7s").child(id);
      ref_chart = fb.database().ref().child("ECG_plot").child(id);
      ppg_ref = fb.database().ref().child("PPG_plot").child(id);
      rr_ref = fb.database().ref().child("RR_plot").child(id);
      ecg_min = fb.database().ref().child("patientecgdata").child(id).limitToLast(1); //1 minute data
      ppg_min = fb.database().ref().child("patientppgdata").child(id).limitToLast(1); //1 minute data
      rr_min = fb.database().ref().child("patientrrdata").child(id).limitToLast(1); //1 minute data
      ref_valid = fb.database().ref().child("validpatientlivedata").child(id);
      ews = fb.database().ref().child("EWS").child(id).limitToLast(1); //ews inititlization
      pat_bp_5sec_ref = fb.database().ref().child("PAT_BP_5s_tree").child(id);
      context_assessment = fb.database().ref().child("context_assessment").child(id);
      patients = fb.database().ref().child("patients").child(id);

      patients.once("value", function (snapshot) {
        let patient_data = JSON.stringify(snapshot.val(), null, 2);
        let patient_data1 = JSON.parse(patient_data);
        PatientName = patient_data1.username;
        localStorage.setItem("patientname", PatientName);
      });

      pat_bp_5sec_ref.on("value", function (snapshot) {
        const val = snapshot.val();
        if (!val) return;
        const timestamps = Object.keys(val)
          .map((k) => Number(k))
          .filter((n) => Number.isFinite(n));
        if (timestamps.length === 0) return;
        const maxTs = Math.max(...timestamps);
        const latest = val[maxTs];
        if (latest && typeof latest.ECG_HR === "number") {
          latestPatHr = latest.ECG_HR / 100;
          latestPatHrTs = maxTs; // seconds epoch
        }
      });

      let listener = ref.on("value", function (snapshot) {
        const live = snapshot.val();
        if (live != null) {
          counter++;

          // Avoid unnecessary stringify/parse
          const data1 = live;

          // Decide heart rate using cached PAT BP HR if recent (<10s)
          const nowSec = Date.now() / 1000;
          let heart_rate;
          if (latestPatHr !== null && Number.isFinite(latestPatHrTs) && nowSec - latestPatHrTs < 10) {
            heart_rate = latestPatHr;
          } else {
            heart_rate = (data1.hr ?? 0) / 100;
          }

          let presentTimestamp = data1.timestamp;

          respiration_rate = data1.rr;
          spo2 = (data1.spo ?? 0) / 100;

          let bp_text = data1.bp || "";
          const array = String(bp_text).split("/");
          sbp = array[0];
          dbp = array[1];

          // Robust temperature parsing: strip any units/symbols (F, C, °)
          const rawTemp = String(data1.temp ?? "");
          const tempSanitized = rawTemp.replace(/[^0-9.+-]/g, "");
          temp = tempSanitized ? parseFloat(tempSanitized) : null;

          acc = data1.acc;
          var f_sensortimestamp = data1.timestamp;
          var date = new Date(f_sensortimestamp * 1000);
          batteryPercentage = data1.battery;

          var sensordate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
          var sensortime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
          document.getElementById("sensordate").innerHTML = sensordate;
          document.getElementById("sensortime").innerHTML = sensortime;

          console.log("battery", batteryPercentage);

          heart_rate = parseInt(heart_rate) === 238 || heart_rate === 2.38 ? "--" : heart_rate;
          sbp = parseInt(sbp) === 238 ? "--" : sbp;
          dbp = parseInt(dbp) === 238 ? "--" : dbp;
          respiration_rate = parseInt(respiration_rate) === 238 ? "--" : respiration_rate;
          spo2 = parseInt(spo2) === 238 || spo2 === 2.38 ? "--" : spo2;
          temp = parseInt(temp) === 238 ? "--" : temp;

          console.log("[database_function.js] LiveTemperature 7s", temp);

          heartrate_data(heart_rate, "");
          blood_pressure_data(sbp, dbp, "", "");
          respiration_rate_data(respiration_rate, "");
          acceleration_data(acc, "");
          blood_oxygen_data(spo2, "");
          temperature_data(temp, "");

          var batteryIconMarkup = getBatteryIcon(batteryPercentage);
          var batteryPercentageElement = document.getElementById("battery-percentage");

          batteryPercentageElement.innerHTML = batteryIconMarkup + batteryPercentage + "%";
        }
      });

      let listener1 = ref_chart.on("value", function (snapshot) {
        //console.log("inside the ECG trigger")
        if (snapshot.val() != null) {
          if (ecg_flag == 1) {
            let chart_string = JSON.stringify(snapshot.val(), null, 2);
            let chart_json = JSON.parse(chart_string);
            ////console.log("ecg data payload...",chart_json.ecg);
            ////console.log("ecg data timestamp...",chart_json.timestamp);
            let type = chart_json.type;
            let final_ecg;
            if (type == "noise" || type == "flat") {
              //console.log("Waiting for the valid ECG")
              final_ecg = [];
            } else {
              var ecg_text = chart_json.ecg;
              let result1 = ecg_text.replace(/\]\[/g, ", ").trim();
              result1 = result1.replace(/\]/g, "").trim();
              result1 = result1.replace(/\[/g, "").trim();
              final_ecg = result1.split(",").map(Number);
            }
            var f_ecgtimestamp = chart_json.timestamp;
            var date = new Date(f_ecgtimestamp * 1000);
            

            var ecgdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
            var ecgtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
            document.getElementById("ecgdate").innerHTML = ecgdate !== null || ecgdate !== undefined ? ecgdate : "--/--/----";
            document.getElementById("ecgtime").innerHTML = ecgtime !== null || ecgtime !== undefined ? ecgtime : "--:--:--";

            ECG_data_passing(final_ecg, ecgdate, ecgtime, option1, value, "", 0);
          } else {
            ecg_flag = 1;
          }
        }
      });
      let listener2 = ppg_ref.on("value", function (snapshot) {
        if (snapshot.val() !== null) {
          let ppg_data = JSON.stringify(snapshot.val(), null, 2);
          let ppg_json = JSON.parse(ppg_data);
          let ppgdata = ppg_json.ppg;

          //  let result1;// = ppgdata.replace(/\,/g, " ").trim();
          var f_ppgtimestamp = ppg_json.timestamp;
          var date = new Date(f_ppgtimestamp * 1000);
          var ppgdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
          var ppgtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
          ppgdate = date == undefined ? (ppgdate = "--/--/----") : ppgdate;
          ppgtime = date == undefined ? (ppgtime = "--/--/----") : ppgtime;
          try {
            document.getElementById("ppgdate").innerHTML = ppgdate;
            document.getElementById("ppgtime").innerHTML = ppgtime;
          } catch (e) {
            console.error("[database_function.js] In HTML, ppgdate and time ID is not defined");
          }
          let result1;
          var final_ppg;
          if (ppgdata != undefined) {
            result1 = ppgdata.replace(/\,/g, "").trim();
            final_ppg = result1.split(" ").map(Number);
          }
          console.log("[database_function.js] PPG from snapshot", final_ppg);

          // Data is available, pass it to the PPG_data_passing function
          PPG_data_passing(final_ppg, "", "", "", "", "", 0);
          // console.log("[database_function.js] PPG_data_passing", ppg_data); // Log the passed data
        } else {
          console.log("[database_function.js] No PPG data available."); // Log if no data is available
        }
      });

      let listener4 = rr_ref.on("value", function (snapshot) {
        if (snapshot.val() != null) {
          let rr_string = JSON.stringify(snapshot.val(), null, 2);
          let rr_json = JSON.parse(rr_string);
          let rrdata = rr_json.res;
          let rr_timestamp = rr_json.timestamp;
          var date = new Date(rr_timestamp * 1000);
          var rrdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
          var rrtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
          rrdate = date == undefined ? (rrdate = "--/--/----") : rrdate;
          rrtime = date == undefined ? (rrtime = "--/--/----") : rrtime;
          try {
            document.getElementById("rrdate").innerHTML = rrdate;
            document.getElementById("rrtime").innerHTML = rrtime;
          } catch (e) {
            console.error("[database_function.js] In HTML, rrdate and time ID is not defined");
          }
          let result1;
          var final_rr;
          if (rrdata != undefined) {
            result1 = rrdata.replace(/\,/g, "").trim();
            final_rr = result1.split(" ").map(Number);
          }
          console.log("[database_function.js] RR from snapshot", final_rr);
          RR_data_passing(final_rr); // Pass processed array
        }
      });

      
      var ValidpatientLiveTimestamp;
      var list = ref_valid.once("value", function (snapshot) {
        if (snapshot.val() != null) {
          let data = JSON.stringify(snapshot.val(), null, 2);
          let data1 = JSON.parse(data);
          ValidpatientLiveTimestamp = data1.timestamp;

          //  let presentTimestamp = data1.timestamp;
          respiration_rate = data1.rr;
          heart_rate = data1.hr / 100;
          spo2 = data1.spo / 100;
          let bp_text = data1.bp;
          const array = bp_text.split("/");
          sbp = array[0];
          dbp = array[1];
          respiration_rate = data1.rr;
          oldtemp = data1.temp;
          temp = parseFloat(String(oldtemp).replace(/[^0-9.+-]/g, ""));

          acc = data1.acc;
          var f_sensortimestamp = data1.timestamp;
          var date = new Date(f_sensortimestamp * 1000);
          batteryPercentage = data1.battery;

          var sensordate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
          var sensortime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);

          document.getElementById("sensordate").innerHTML = sensordate;
          document.getElementById("sensortime").innerHTML = sensortime;

          console.log("[database_function.js] in validapatientdata", {
            heart_rate,
            sbp,
            dbp,
            respiration_rate,
            spo2,
            temp,
          });
          heartrate_data(heart_rate, "");
          blood_pressure_data(sbp, dbp, "", "");
          respiration_rate_data(respiration_rate, "");
          acceleration_data(acc, "");
          blood_oxygen_data(spo2, "");
          temperature_data(temp, "");
        }
      });

      var counter = 0;

      var list2 = ecg_min.once("value", function (snapshot) {
        ////console.log("snapshot of 1 min ECG data"+snapshot.ecg);
        if (snapshot.val() != null) {
          let ecgd = JSON.stringify(snapshot.val(), null, 2);

          const parsedData = JSON.parse(ecgd);

          // Accessing the key
          const key = Object.keys(parsedData)[0];
          console.log("Key:", key);

          // Accessing values using the key
          console.log("Payload:", parsedData[key].payload);
          console.log("Timestamp:", parsedData[key].timestamp);
          console.log("User ID:", parsedData[key].userId);

          var ecg = parsedData ? parsedData[key].payload : null;

          console.log("[database_function.js] Fetching live patient data...", ecg);
          // let ecg_string = JSON.stringify(snapshot.val(),null,2);
          // let ecg_json = JSON.parse(ecg_string);

          // //console.log("ecg data ...",ecg_json.ecg);
          // //console.log("ecg data type ...",ecg_json.type);
          let type = parsedData[key].type;

          if (type == "noise" || type == "flat") {
            //console.log("Waiting for the valid ECG")
            final_min_ecg = [];
          } else {
            var ecg_text = ecg;
            let ecg_result = ecg_text.replace(/\]\[/g, ", ").trim();
            ecg_result = ecg_result.replace(/\]/g, "").trim();
            ecg_result = ecg_result.replace(/\[/g, "").trim();
            final_min_ecg = ecg_result.split(",").map(Number);
            console.log("[database_function.js]final ecg array", final_min_ecg);
          }

          /**Timestart to date time conversion*/
          var f_ecgtimestamp = parsedData[key].timestamp;
          var date = new Date(f_ecgtimestamp * 1000);
          var ecgdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
          var ecgtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
          ecgdate = date == undefined ? (ecgdate = "--/--/----") : ecgdate;
          ecgtime = date == undefined ? (ecgtime = "--/--/----") : ecgtime;
          try {
            document.getElementById("ecgdate").innerHTML = ecgdate;
            document.getElementById("ecgtime").innerHTML = ecgtime;
            //document.getElementById("contextecgdate").innerHTML = ecgdate;
            //document.getElementById("contextecgtime").innerHTML = ecgtime;
          } catch (e) {
            console.error("[database_function.js]In HTML, ecgdate and time ID is not defined");
          }
          console.log("[database_function.js] Ecg data passed successfully ", final_min_ecg);
          ECG_data_passing(final_min_ecg, ecgdate, ecgtime, option1, value, "", 690);
        } else {
          var echartLinecontext = echarts.init(document.getElementById("LiveECGId"));
          echartLinecontext.clear();
          echartLinecontext.setOption(NoEcgData);
        }
      });

      var list3 = ppg_min.once("value", function (snapshot) {
        ////console.log("snapshot of 1 min ECG data"+snapshot.ecg);
        if (snapshot.val() != null) {
          // let ppg_data = JSON.stringify(snapshot.val(),null,2);
          //let ppg_json = JSON.parse(ppg_data);
          //
          let ppgd = JSON.stringify(snapshot.val(), null, 2);

          const parsedData = JSON.parse(ppgd);

          // Accessing the key
          const key = Object.keys(parsedData)[0];

          let ppgdata = parsedData[key].payload;
          console.log("[database_function.js]Fetching live patient PPG data...", ppgdata);
          var f_ppgtimestamp = parsedData[key].timestamp;
          var date = new Date(f_ppgtimestamp * 1000);
          var ppgdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
          var ppgtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
          ppgdate = date == undefined ? (ppgdate = "--/--/----") : ppgdate;
          ppgtime = date == undefined ? (ppgtime = "--/--/----") : ppgtime;
          try {
            document.getElementById("ppgdate").innerHTML = ppgdate;
            document.getElementById("ppgtime").innerHTML = ppgtime;
          } catch (e) {
            console.error("[database_function.js]In HTML, ppgdate and time ID is not defined");
          }
          //result1= result1.replace(", ", " ").trim();
          //result1= result1.replace(",  ", " ").trim();
          let result1;
          var final_ppg;
          if (ppgdata != undefined) {
            result1 = ppgdata.replace(/\,/g, "").trim();
            final_ppg = result1.split(" ").map(Number);
          }
          console.log("[database_function.js]ppg data passed successfully ", final_ppg);
          PPG_data_passing(final_ppg, "", "", "", "", "", 500);
        } else {
          var echartLinecontext = echarts.init(document.getElementById("LivePPGId"));
          echartLinecontext.clear();
          echartLinecontext.setOption(NoPpgData);
        }
      });

      var list4 = rr_min.once("value", function (snapshot) {
        if (snapshot.val() != null) {
          console.log("[database_function.js] Snapdata RR will Loading ", snapshot.val());

          let rrd = JSON.stringify(snapshot.val(), null, 2);
          const parsedData = JSON.parse(rrd);
          const key = Object.keys(parsedData)[0];

          let rrdata = parsedData[key].res; // Use payload instead of res
          let rr_timestamp = parsedData[key].timestamp;
          var date = new Date(rr_timestamp * 1000);
          var rrdate = ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear();
          var rrtime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
          rrdate = date == undefined ? (rrdate = "--/--/----") : rrdate;
          rrtime = date == undefined ? (rrtime = "--/--/----") : rrtime;

          try {
            document.getElementById("rrdate").innerHTML = rrdate;
            document.getElementById("rrtime").innerHTML = rrtime;
          } catch (e) {
            console.error("[database_function.js] In HTML, rrdate and time ID is not defined");
          }

          let final_rr = [];
          if (rrdata != undefined) {
            // Process the nested array structure
            let cleanedData = rrdata.replace(/\]\[/g, ", ").replace(/\[/g, "").replace(/\]/g, "");
            let allValues = cleanedData
              .split(",")
              .map((num) => parseFloat(num.trim()))
              .filter((num) => !isNaN(num));

            // Filter out extreme values that cause display issues
            final_rr = allValues.filter((value) => {
              return value > -1000 && value < 1000; // Adjust range as needed
            });

            // If we have too few values after filtering, take a sample
            if (final_rr.length < 50 && allValues.length > 50) {
              // Take every nth value to get a reasonable sample
              const step = Math.floor(allValues.length / 200);
              final_rr = [];
              for (let i = 0; i < allValues.length; i += step) {
                if (allValues[i] > -1000 && allValues[i] < 1000) {
                  final_rr.push(allValues[i]);
                }
              }
            }
          }

          console.log("[database_function.js]RR data passed successfully ", final_rr.length, "data points");

          // Only pass data if we have a reasonable amount
          if (final_rr.length > 10) {
            RR_data_passing(final_rr);
          } else {
            console.log("[database_function.js]   Insufficient valid RR data points");
            // You might want to show a "no data" message here
          }
        }
      });

      let listener3 = ews.on("value", function (snapshot) {
        let ews = JSON.stringify(snapshot.val(), null, 2);
        console.log("[database_function.js]  ews_value" + ews);
        const parsedData = JSON.parse(ews);
        const key = Object.keys(parsedData)[0];

        console.log("[database_function.js] ews_value" + parsedData);
        let ews_value = parsedData[key].ews_score;
        let ewscolor = parsedData[key].color;
        console.log("[database_function.js] ews_value" + ews_value);
        if (ews_value !== undefined && ews_value !== null) {
          ews_value_passing(ews_value, ewscolor);
        } else {
          console.log("[database_function.js] ews_value", ews_value);
          ews_value_passing(NoData);
        }
      });
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

function getFormattedDate(timestamp) {
  let date = new Date(timestamp);
  let options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString(undefined, options);
}

function getFormattedTime(timestamp) {
  let date = new Date(timestamp);
  let options = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  return date.toLocaleTimeString(undefined, options);
}

window.onload = () => {
  console.log("[database_function.js] inside onload");
  init_echarts();
};
window.onchange = () => {
  console.log("[database_function.js] switching off listeners");
  //sensor_flag = 2;
};

window.onblur = () => {
  console.log("[database_function.js] switching off listeners");
  // ref.off("value", listener)
  // ref_chart.off("value",listener1)
  // ppg_ref.off("value",listener2)
  // ews.off("value",listener3)
  // ref_valid.off("value",list)
  // ecg_min.off("value",list2)
  // ppg_min.off("value",list3)
  //sensor_flag = 2;
};

export { init_echarts };
