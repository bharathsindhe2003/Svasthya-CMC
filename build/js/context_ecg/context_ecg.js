/**
 * Renders the ECG-only context popup used from alert history and timestamp-based
 * drill-down views.
 */
import { fb } from "../livepage/database_function.js";
import { NoEcgData } from "../livepage/EchartGraphs.js";

var scale;
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

console.log("[context_ecg.js] originlalTimestamp", originlalTimestamp);
console.log("[context_ecg.js] Timestamp:", timestamp);
console.log("[context_ecg.js] ID:", id);
console.log("[context_ecg.js] page", page, "timestamp", timestamp);

if (page == "2") {
  const patientsDataRef = fb.database().ref().child("patientecgdata").child(id).child(timestamp);

  patientsDataRef
    .once("value", function (snapshot) {
      const patientData = snapshot.val() || {};
      // console.log("[context_ecg.js] patient data snapshot:", patientData);

      if (patientData) {
        if (page == "2") {
          // For Alert History, keep gauges and PPG section hidden (already hidden via HTML)
          // console.log("[context_ecg.js] Fetching Alert History data...");

          const ecg = patientData?.payload !== undefined ? patientData?.payload : null;
          if (ecg && ecg != null) {
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
            console.log("[context_ecg.js] ECG data passed successfully.");
          } else {
            document.getElementById("contextecgdate").innerHTML = "";
            document.getElementById("contextecgtime").innerHTML = "";
            var echartLinecontext = echarts.init(document.getElementById("context_ecg"));
            echartLinecontext.clear();
            echartLinecontext.setOption(NoEcgData);
          }
        }
      }
    })
    .catch((error) => {
      console.error("Error fetching live patient data:", error);
    })
    .finally(() => {
      const loader = document.querySelector(".loader");
      loader.classList.add("loader--hidden");
    });
}
/**
 * Add ECG data if exists for the given timestamp
 * @param {*} LiveEcgValues (Not Used)
 * @param {*} ecgdate (Not Used)
 * @param {*} ecgtime (Not Used)
 * @param {*} option1 (Not Used)
 * @param {*} value (Not Used)
 * @param {*} ecgdata
 * @param {*} endzoom (Not Used)
 */
function ECG_data(LiveEcgValues, ecgdate, ecgtime, option1, value, ecgdata, endzoom) {
  console.log("[context_ecg.js] [context_assessment_UI_2.js] EcgValues in echarts", "context:", ecgdata);
  var EcgData;
  var contextECG;
  var echartLine;
  var value1;
  var echartLinecontext;
  if ($("#context_ecg").length) {
    echartLinecontext = echarts.init(document.getElementById("context_ecg"));
    EcgData = ecgdata;
    console.log("[context_ecg.js] [context_assessment_UI_2.js] context_ecg in echarts", EcgData);
  } else if ($("#LiveECGId").length) {
    console.log("[context_ecg.js] [context_assessment_UI_2.js] Live in echarts");
    echartLine = echarts.init(document.getElementById("LiveECGId"));
    EcgData = LiveEcgValues;
  }

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
    console.log("[context_ecg.js] [context_assessment_UI_2.js] EcgData.length:", e.message);
  }
  var isZoomed = false;
  console.log("[context_ecg.js] [context_assessment_UI_2.js] ecg data after push", data);
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
        console.log(params.start, params.end);
        if (params.start !== 0 || params.end !== undefined) {
          console.log("[context_ecg.js] in if");
          isZoomed = true;
          plot.toolbox.feature.myTool1.show = isZoomed;
          echartLine.setOption(plot);
          console.log(plot);
        } else {
          isZoomed = false;
          plot.toolbox.feature.myTool1.show = isZoomed;
          echartLine.setOption(plot);
        }
      });
    }
  } catch (e) {
    console.log("[context_ecg.js] Error:", e.message);
  }
}
