/**
 * Loads the context assessment popup for a selected timestamp and renders
 * historical vitals, waveforms, and EWS information.
 */
import { fb } from "../livepage/database_function.js";
import { heartrate_data, blood_pressure_data, respiration_rate_data, blood_oxygen_data_context, temperature_data, ews_value_passing } from "../livepage/live-custom.js";
import { NoEcgData, NoPpgData, NoRRData, NoData } from "../livepage/EchartGraphs.js";

var username;
var heart_rate;
var bp;
var respiration_rate;
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

/**
 * Loads the context assessment popup for a selected timestamp and renders
 * historical vitals, waveforms, and EWS information.
 * @param {string} param1 - The encoded timestamp.
 * @param {string} param2 - The encoded patient ID.
 * @param {string} param3 - The encoded page identifier. (For Current implementation 1 is used because in Vitals and Alerts charts in Consolidated tab of History we use same node to display data. In future, for same structure, different values can be used/defined)
 */
const urlParams = new URLSearchParams(window.location.search);
var originlalTimestamp = parseInt(atob(urlParams.get("param1")));
var timestamp = originlalTimestamp;
var id = atob(urlParams.get("param2"));
var page = atob(urlParams.get("param3"));

console.log("[context_assessment_UI.js] originlalTimestamp", originlalTimestamp);
console.log("[context_assessment_UI.js] Timestamp:", timestamp);
console.log("[context_assessment_UI.js] ID:", id);
console.log("[context_assessment_UI.js] page", page, "timestamp", timestamp);

try {
  if (page === "1") {
    const patientsDataRef = fb.database().ref().child("patientlivedata").child(id).child(timestamp);
    const patientsECGDataRef = fb.database().ref().child("patientecgdata").child(id).child(timestamp);
    const patientsPPGDataRef = fb.database().ref().child("patientppgdata").child(id).child(timestamp);
    const patientsRRDataRef = fb.database().ref().child("patientrrdata").child(id).child(timestamp);
    const patientsEWSDataRef = fb.database().ref().child("EWS").child(id).child(timestamp);

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

          spo2 = patientData.spo !== undefined && patientData.spo !== null && patientData.spo !== "" ? Number(patientData.spo) : null;
          console.log("[context_assessment_UI.js] raw spo2:", patientData.spo);
          console.log("[context_assessment_UI.js] spo2:", spo2);

          temp = patientData.temp !== undefined && patientData.temp !== null && patientData.temp !== "" ? parseFloat(patientData.temp) : null;
          console.log("[context_assessment_UI.js] temp:", temp);

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
          spo2 = Number.isFinite(spo2) ? spo2.toString() : "-";
          bp = bp !== undefined && bp !== null && bp !== "" ? bp : "-/-";

          console.log("[context_assessment_UI.js] Processed patient data: ", {
            heart_rate,
            respiration_rate,
            temp,
            spo2,
            contextsbp,
            contextdbp,
          });

          heartrate_data("", heart_rate);
          respiration_rate_data("", respiration_rate);
          temperature_data("", temp);
          blood_oxygen_data_context(spo2);
          blood_pressure_data("", "", contextsbp, contextdbp);

          console.log("[context_assessment_UI.js] Live patient data processed and passed successfully.");

          var SensorDateTime = new Date(timestamp * 1000);
          var ContextSensorDate = ("0" + SensorDateTime.getDate()).slice(-2) + "/" + ("0" + (SensorDateTime.getMonth() + 1)).slice(-2) + "/" + SensorDateTime.getFullYear();
          var ContextSensorTime = ("0" + SensorDateTime.getHours()).slice(-2) + ":" + ("0" + SensorDateTime.getMinutes()).slice(-2) + ":" + ("0" + SensorDateTime.getSeconds()).slice(-2);

          document.getElementById("contextsensordate").innerHTML = ContextSensorDate;
          document.getElementById("contextsensortime").innerHTML = ContextSensorTime;
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
/**
 * Add EWS Score if data exists for the specific timestamp selected in context assessment card/pop-up
 * @param {number|null} ews_value - EWS value to be displayed
 * @param {string|null} ews_color - EWS color to be done around the value.
 * @returns {void}
 */
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
/**
 * Add ECG plot if data exists for a specific timestamp in context assessment card/pop-up
 * @param {Array} LiveEcgValues Live ECG values (Not Used)
 * @param {string} date Date string (Not Used)
 * @param {string} time Time string (Not Used)
 * @param {string} option1 Option 1 (Not Used)
 * @param {number} value Value (Not Used)
 * @param {Array} ecgdata ECG data
 * @param {number} endzoom End zoom value (Not Used)
 * @returns {void}
 */
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
/**
 * Add PPG plot if data exists for a specific timestamp in context assessment card/pop-up
 * @param {Array} LivePpgValues Live PPG values  (Not Used)
 * @param {string} date Date string  (Not Used)
 * @param {string} time Time string  (Not Used)
 * @param {string} option1 Option 1  (Not Used)
 * @param {number} value Value (Not Used)
 * @param {Array} ppgdata PPG data (Not Used)
 * @param {number} endzoom End zoom value (Not Used)
 * @returns {void}
 */
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
/**
 * Add RR plot if data exists for a specific timestamp in context assessment card/pop-up
 * @param {Array} LiveRRValues Live RR (Not Used)
 * @param {string} date Date string (Not Used)
 * @param {string} time Time string (Not Used)
 * @param {string} option1 Option 1 (Not Used)
 * @param {number} value Value (Not Used)
 * @param {Array} rrdata RR data
 * @param {number} endzoom End zoom value (Not Used)
 * @returns {void}
 */
function RR_data(LiveRRValues, date, time, option1, value, rrdata, endzoom) {
  var RrData;
  var echartLine;
  var echartLinecontext;
  var value1;
  if ($("#context_rr").length) {
    echartLinecontext = echarts.init(document.getElementById("context_rr"));
    RrData = Array.isArray(rrdata) ? rrdata : [];
  } else if ($("#LiveRRId").length) {
    echartLine = echarts.init(document.getElementById("LiveRRId"));
    RrData = Array.isArray(LiveRRValues) ? LiveRRValues : [];
  }

  console.log("[context_assessment_UI.js] RR_data called with RrData length:", RrData ? RrData.length : "null/undefined");

  var counter = 0;

  function smoothRRSeries(points, windowSize) {
    if (points.length < 3) return points;
    var radius = Math.floor(windowSize / 2);
    return points.map(function (point, index) {
      var sum = 0;
      var count = 0;
      for (var innerIndex = Math.max(0, index - radius); innerIndex <= Math.min(points.length - 1, index + radius); innerIndex++) {
        sum += points[innerIndex].value[1];
        count++;
      }
      return {
        value: [point.value[0], count ? sum / count : point.value[1]],
      };
    });
  }

  function randomData() {
    value1 = Number(RrData[counter % RrData.length]);
    counter++;
    return {
      value: [counter % RrData.length, Number.isFinite(value1) ? value1 : 0],
    };
  }
  var data = [];
  try {
    for (var i = 1; i < RrData.length; i++) {
      data.push(randomData());
    }
    data = smoothRRSeries(data, 7);
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
        smooth: 0.7,
        sampling: "average",
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
