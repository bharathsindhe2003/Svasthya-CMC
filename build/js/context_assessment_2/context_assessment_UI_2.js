// import { fb } from "../livepage/database_function.js";

// var loaderRoot = document.getElementById("loader");
// if (loaderRoot) {
//   loaderRoot.className = "loader";
// }

// const urlParams = new URLSearchParams(window.location.search);
// var min_time = parseInt(atob(urlParams.get("param1")));
// var max_time = parseInt(atob(urlParams.get("param2")));
// var id = atob(urlParams.get("param3"));
// var page = atob(urlParams.get("param4"));
// var displayContext = atob(urlParams.get("param5"));
// var node = "";

// var context_timestamp = [];
// var ecg_timestamp = [];
// var heart_rate = [];
// var blood_pressure = [];
// var spo2 = [];
// var temperature = [];
// var respiration_rate = [];
// var ews_score = [];
// var threshold_notifications = [];

// var EWS_Score_opt;
// var context_assment_opt;
// var ECG_scatter_opt;
// var Heart_rate_graph_opt;
// var blood_oxygen_opt;
// var temperature_opt;
// var blood_pressure_opt;
// var Respiration_opt;

// var ews_score_echart_context_graph = echarts.init(document.getElementById("context_graph"));
// var context_assment_graph = echarts.init(document.getElementById("context_graph"));
// var ECG_scatter_graph = echarts.init(document.getElementById("context_graph"));
// var Heart_rate_graph = echarts.init(document.getElementById("context_graph"));
// var blood_oxygen_graph = echarts.init(document.getElementById("context_graph"));
// var temperature_graph = echarts.init(document.getElementById("context_graph"));
// var blood_pressure_graph = echarts.init(document.getElementById("context_graph"));
// var Respiration_graph = echarts.init(document.getElementById("context_graph"));
// var vital_notification_graph = echarts.init(document.getElementById("context_graph"));
// var threshold_notification_graph = echarts.init(document.getElementById("context_graph"));

// var patientsDataRef;
// if (page === "3") {
//   try {
//     // Set context header
//     var context_header = document.getElementById("context_header");
//     if (context_header) context_header.innerHTML = displayContext;
//     else console.warn("[context_assessment_UI_2.js] Context header element not found");

//     // Min and Max time display
//     var min_context_date = document.getElementById("min_context_date");
//     var min_context_time = document.getElementById("min_context_time");
//     if (min_context_date && min_context_time) {
//       var minDateObj = new Date(min_time * 1000);
//       min_context_date.innerHTML = ("0" + minDateObj.getDate()).slice(-2) + "/" + ("0" + (minDateObj.getMonth() + 1)).slice(-2) + "/" + minDateObj.getFullYear();
//       min_context_time.innerHTML = ("0" + minDateObj.getHours()).slice(-2) + ":" + ("0" + minDateObj.getMinutes()).slice(-2) + ":" + ("0" + minDateObj.getSeconds()).slice(-2);
//     } else {
//       console.warn("[context_assessment_UI_2.js] Min context date/time elements not found");
//     }

//     var max_context_date = document.getElementById("max_context_date");
//     var max_context_time = document.getElementById("max_context_time");
//     if (max_context_date && max_context_time) {
//       var maxDateObj = new Date(max_time * 1000);
//       max_context_date.innerHTML = ("0" + maxDateObj.getDate()).slice(-2) + "/" + ("0" + (maxDateObj.getMonth() + 1)).slice(-2) + "/" + maxDateObj.getFullYear();
//       max_context_time.innerHTML = ("0" + maxDateObj.getHours()).slice(-2) + ":" + ("0" + maxDateObj.getMinutes()).slice(-2) + ":" + ("0" + maxDateObj.getSeconds()).slice(-2);
//     } else {
//       console.warn("[context_assessment_UI_2.js] Max context date/time elements not found");
//     }
//     if (displayContext === "Context Assessment") {
//       node = "patientlivedata";
//     } else if (displayContext === "ECG") {
//       node = "patientecgdata";
//     } else if (
//       displayContext === "Heart Rate" ||
//       displayContext === "Blood Oxygen" ||
//       displayContext === "Temperature" ||
//       displayContext === "Blood Pressure" ||
//       displayContext === "Respiration Rate"
//     ) {
//       node = "patientlivedata";
//     } else if (displayContext === "EWS Score") {
//       node = "EWS";
//     } else if (displayContext === "Threshold Notifications") {
//       node = "threshold_triggers";
//     }

//     console.log("[context_assessment_UI_2.js] Fetching data from node:", node);
//     console.log("[context_assessment_UI_2.js] Time range:", min_time, "to", max_time);

//     // Firebase requires string keys when using orderByKey() with startAt/endAt
//     var startKey = min_time != null ? String(min_time) : "";
//     var endKey = max_time != null ? String(max_time) : "";

//     console.log("[context_assessment_UI_2.js] Querying with startKey:", startKey, "endKey:", endKey);
//     patientsDataRef = fb.database().ref().child(node).child(id).orderByKey().startAt(startKey).endAt(endKey);

//     var loader = document.querySelector(".loader");

//     patientsDataRef
//       .once("value")
//       .then(function (snapshot) {
//         if (snapshot.val() != null) {
//           if (displayContext === "Context Assessment") {
//             console.log("[context_assessment_UI_2.js] snapshot data:", snapshot);

//             snapshot.forEach((data) => {
//               var tme_in_ms = data.key * 1000;
//               context_timestamp.push([parseInt(tme_in_ms), parseInt(5)]);
//             });
//           } else if (displayContext === "ECG") {
//             snapshot.forEach((data) => {
//               var tme_in_ms = data.key * 1000;
//               ecg_timestamp.push([parseInt(tme_in_ms), parseInt(5)]);
//             });
//           } else if (displayContext === "Heart Rate") {
//             snapshot.forEach((data) => {
//               const timestamp = parseInt(data.key) * 1000; // Convert to milliseconds
//               const patientData = data.val();
//               // Heart rate
//               const rawHR = patientData.hr;
//               if (rawHR && rawHR !== "--") {
//                 const hrValue = Number(rawHR);
//                 if (hrValue && !Number.isNaN(hrValue)) {
//                   heart_rate.push([timestamp, hrValue]);
//                 }
//               }
//             });
//           } else if (displayContext === "Blood Oxygen") {
//             snapshot.forEach((data) => {
//               const timestamp = parseInt(data.key) * 1000; // Convert to milliseconds
//               const patientData = data.val();
//               // SpO2
//               if (patientData.spo !== undefined && patientData.spo !== null) {
//                 const spoValue = Number(patientData.spo);
//                 if (spoValue && !Number.isNaN(spoValue)) {
//                   spo2.push([timestamp, spoValue]);
//                 }
//               }
//             });
//           } else if (displayContext === "Temperature") {
//             snapshot.forEach((data) => {
//               const timestamp = parseInt(data.key) * 1000; // Convert to milliseconds
//               const patientData = data.val();
//               // Temperature (may come with units, e.g., "36.5°C" or "98°F")
//               if (patientData.temp !== undefined && patientData.temp !== null) {
//                 let tempStr = String(patientData.temp).trim();
//                 if (tempStr.endsWith("°C") || tempStr.endsWith("°F")) {
//                   tempStr = tempStr.slice(0, -2).trim();
//                 }
//                 const tempValue = round(parseFloat(tempStr), 2);
//                 if (tempValue && !Number.isNaN(tempValue)) {
//                   temperature.push([timestamp, tempValue]);
//                 }
//               }
//             });
//           } else if (displayContext === "Blood Pressure") {
//             snapshot.forEach((data) => {
//               const timestamp = parseInt(data.key) * 1000; // Convert to milliseconds
//               const patientData = data.val();
//               // Blood pressure (expected format: "SBP/DBP")
//               if (patientData.bp !== undefined && patientData.bp !== null) {
//                 const bpStr = String(patientData.bp).trim();
//                 const parts = bpStr.split("/");
//                 if (parts.length === 2) {
//                   const sbp = parseInt(parts[0]);
//                   const dbp = parseInt(parts[1]);
//                   if (sbp && dbp && !Number.isNaN(sbp) && !Number.isNaN(dbp)) {
//                     blood_pressure.push([timestamp, sbp, dbp]);
//                   }
//                 }
//               }
//             });
//           } else if (displayContext === "Respiration Rate") {
//             snapshot.forEach((data) => {
//               const timestamp = parseInt(data.key) * 1000; // Convert to milliseconds
//               const patientData = data.val();
//               // Respiration rate
//               if (patientData.rr !== undefined && patientData.rr !== null) {
//                 const rrValue = Number(patientData.rr);
//                 if (rrValue && !Number.isNaN(rrValue)) {
//                   respiration_rate.push([timestamp, rrValue]);
//                 }
//               }
//             });
//             node = "patientlivedata";
//           } else if (displayContext === "EWS Score") {
//             snapshot.forEach((data) => {
//               var tme_in_ms = data.key * 1000;
//               const dataValue = data.val();
//               const rawEWS = dataValue.ews_score;
//               const ewsValue = rawEWS && rawEWS !== "--" ? Number(rawEWS) : null;
//               if (ewsValue && ewsValue !== null && !Number.isNaN(ewsValue)) ews_score.push([parseInt(tme_in_ms), ewsValue]);
//             });
//           } else if (displayContext === "Threshold Notifications") {
//             snapshot.forEach((data) => {
//               var tme_in_ms = data.key * 1000;
//               threshold_notifications.push([parseInt(tme_in_ms), parseInt(5)]);
//             });
//           }
//         } else {
//           console.log("No live patient data available for the given time range.");
//         }

//         if (displayContext === "Context Assessment") {
//           console.log("[context_assessment_UI_2.js] context_timestamp", context_timestamp);
//           history_context_assessment(min_time, max_time, id, context_timestamp);
//         } else if (displayContext === "ECG") {
//           console.log("[context_assessment_UI_2.js] ecg_timestamp", ecg_timestamp);
//           history_ECG(min_time, max_time, ecg_timestamp, id);
//         } else if (displayContext === "Heart Rate") {
//           console.log("[context_assessment_UI_2.js] heart_rate", heart_rate);
//           history_Heart_Rate(min_time, max_time, heart_rate, id);
//         } else if (displayContext === "Blood Oxygen") {
//           console.log("[context_assessment_UI_2.js] spo2", spo2);
//           history_Blood_Oxygen(min_time, max_time, spo2, id);
//         } else if (displayContext === "Temperature") {
//           console.log("[context_assessment_UI_2.js] temperature", temperature);
//           history_temperature(min_time, max_time, temperature, id);
//         } else if (displayContext === "Blood Pressure") {
//           console.log("[context_assessment_UI_2.js] blood_pressure", blood_pressure);
//           history_Blood_presure(min_time, max_time, blood_pressure, id);
//         } else if (displayContext === "Respiration Rate") {
//           console.log("[context_assessment_UI_2.js] respiration_rate", respiration_rate);
//           history_Respiration_Rate(min_time, max_time, respiration_rate, id);
//         } else if (displayContext === "EWS Score") {
//           console.log("[context_assessment_UI_2.js] ews_score", ews_score);
//           history_ews(min_time, max_time, ews_score, id);
//         } else if (displayContext === "Threshold Notifications") {
//           console.log("[context_assessment_UI_2.js] threshold_notifications", threshold_notifications);
//           history_context_assessment(min_time, max_time, id, threshold_notifications);
//         }
//       })
//       .catch(function (error) {
//         console.error("Error in firebase function:", error);
//       })
//       .finally(function () {
//         if (loader) {
//           loader.classList.add("loader--hidden");
//         }
//       });
//   } catch (error) {
//     console.error("Error in firebase setup:", error);
//     var fallbackLoader = document.querySelector(".loader");
//     if (fallbackLoader) {
//       fallbackLoader.classList.add("loader--hidden");
//     }
//   }
// }

// function history_context_assessment(min_time, max_time, id, context_timestamp) {
//   try {
//     if (!$("#context_graph").length) {
//       return;
//     }

//     var context_data = context_timestamp || [];

//     context_data.unshift([min_time * 1000, null]);
//     context_data.push([max_time * 1000, null]);

//     console.log(" [context_assessment_UI_2.js] Context Assessment Data:", context_data);

//     context_assment_opt = {
//       grid: {
//         top: 30,
//         left: 30,
//         right: 30,
//         bottom: 80,
//       },
//       dataZoom: [
//         {
//           type: "inside",
//           xAxisIndex: [0],
//           zoomOnMouseWheel: "ctrl",
//           moveOnMouseMove: true,
//           moveOnMouseWheel: true,
//           filterMode: "none",
//           realtime: true,
//           start: 0,
//           end: 100,
//           minSpan: 0.1,
//         },
//         {
//           type: "slider",
//           xAxisIndex: [0],
//           handleIcon: "pin",
//           show: true,
//           showDetail: false,
//           handleSize: "100%",
//           height: 25,
//           handleStyle: {
//             color: "#0865C1",
//             borderColor: "#ACB8D1",
//             borderWidth: 1,
//           },
//           start: 0,
//           end: 100,
//         },
//       ],

//       xAxis: {
//         name: "Time",
//         nameLocation: "end",
//         nameGap: 1,
//         type: "time",
//         boundaryGap: true,
//         scale: true,
//         min: "dataMin",
//         max: "dataMax",
//         axisTick: {
//           show: false,
//         },
//         axisLabel: {
//           rotate: 40,
//           show: true,
//           margin: 12,
//           hideOverlap: true,
//           fontStyle: "oblique",
//           fontSize: 10,
//           formatter: "{d}-{MM}" + "\n" + "{HH}:{mm}",
//           textStyle: {
//             color: "#ffffff",
//           },
//         },
//         splitLine: {
//           show: false,
//           opacity: 1,
//           lineStyle: {
//             color: "#0277ada9",
//             width: 1,
//           },
//         },
//         splitArea: {
//           interval: "auto",
//           show: false,
//         },
//       },

//       yAxis: {
//         type: "value",
//         boundaryGap: [0, "100%"],
//         min: function (finaldata) {
//           return finaldata.min - 5;
//         },
//         max: function (finaldata) {
//           return finaldata.max + 5;
//         },
//         splitLine: {
//           show: false,
//           lineStyle: {
//             color: "#0277ada9",
//             width: 1,
//           },
//         },
//         axisLine: {
//           show: true,
//         },
//         axisLabel: {
//           show: false,
//         },
//         axisTick: {
//           show: false,
//         },
//         minorSplitLine: {
//           show: false,
//           lineStyle: {
//             color: "#2178a049",
//           },
//         },
//       },
//       tooltip: {
//         trigger: "axis",
//         formatter: "Time : {dd}/{MM}/{yy}" + "\n" + "{HH}:{mm}",
//         axisPointer: {
//           show: false,
//         },
//         textStyle: {
//           color: "#4C5964",
//           fontSize: 12,
//         },
//       },

//       series: [
//         {
//           name: "Time:",
//           type: "scatter",
//           showSymbol: false,
//           data: context_data,
//           symbol: "circle",
//           symbolSize: 10,
//         },
//       ],
//     };

//     context_assment_graph.clear();
//     context_assment_graph.setOption(context_assment_opt);

//     if (typeof context_assment_graph.off === "function") {
//       context_assment_graph.off("click");
//     }

//     context_assment_graph.on("click", function (param) {
//       var timestamp = param.data[0];
//       var param1 = btoa(timestamp / 1000);
//       var param2 = btoa(id);
//       var param3 = btoa("1");

//       var url = "context_assment.html" + "?param1=" + param1 + "&param2=" + param2 + "&param3=" + param3;
//       openModal(url);
//     });
//   } catch (error) {
//     console.error(" [context_assessment_UI_2.js] Error in history_context_assessment function:", error);
//   }
// }

// function history_ECG(min_time, max_time, ecg_timestamp, id) {
//   try {
//     if (!$("#context_graph").length) {
//       return;
//     }

//     var ECG_scatter_data = [];
//     if (Array.isArray(ECG_scatter_data) && ecg_timestamp.length > 0) {
//       ECG_scatter_data = ecg_timestamp;
//     }

//     ECG_scatter_data.unshift([min_time * 1000, null]);
//     ECG_scatter_data.push([max_time * 1000, null]);

//     ECG_scatter_opt = {
//       grid: {
//         top: 30,
//         left: 30,
//         right: 30,
//         bottom: 80,
//       },
//       tooltip: {
//         trigger: "axis",
//         formatter: "Time : {dd}/{MM}/{yy}" + "\n" + "{HH}:{mm}",
//         axisPointer: {
//           show: false,
//         },
//         textStyle: {
//           color: "#4C5964",
//           fontSize: 12,
//         },
//       },

//       dataZoom: [
//         {
//           type: "inside",
//           xAxisIndex: [0],
//           // allow zoom with mouse wheel and dragging
//           zoomOnMouseWheel: "ctrl", // use "ctrl" or "alt" or "shift" or true depending on desired modifier
//           moveOnMouseMove: true,
//           moveOnMouseWheel: true,
//           filterMode: "none",
//           realtime: true,
//           start: 0,
//           end: 100,
//           minSpan: 0.1,
//         },
//         {
//           type: "slider",
//           xAxisIndex: [0],
//           handleIcon: "pin",
//           show: true,
//           showDetail: false,
//           handleSize: "100%",
//           height: 25,
//           handleStyle: {
//             color: "#0865C1",
//             borderColor: "#ACB8D1",
//             borderWidth: 1,
//           },
//           start: 0,
//           end: 100,
//         },
//       ],

//       xAxis: {
//         name: "Time",
//         nameLocation: "end",
//         nameGap: 3,
//         type: "time",
//         min: "dataMin",
//         max: "dataMax",
//         axisLabel: {
//           rotate: 40,
//           show: true,
//           margin: 12,
//           hideOverlap: true,
//           fontStyle: "oblique",
//           fontSize: 10,
//           formatter: "{d}-{MM}" + "\n" + "{HH}:{mm}",
//           textStyle: {
//             color: "#ffffff",
//           },
//         },
//         splitLine: {
//           show: false,
//           opacity: 1,
//           lineStyle: {
//             color: "#0277ada9",
//             width: 1,
//           },
//         },
//         splitArea: {
//           interval: "auto",
//           show: false,
//         },
//       },
//       yAxis: {
//         type: "value",
//         splitNumber: 8,
//         boundaryGap: [0, "100%"],
//         min: function (range) {
//           return range.min - 5;
//         },
//         max: function (range) {
//           return range.max + 5;
//         },
//         axisLine: {
//           show: true,
//         },
//         axisLabel: {
//           show: false,
//         },
//         splitLine: {
//           show: false,
//           lineStyle: {
//             color: "#0277ada9",
//             width: 1,
//           },
//         },
//       },
//       series: [
//         {
//           name: "Fake Data",
//           type: "scatter",
//           showSymbol: false,
//           data: ECG_scatter_data,
//           lineStyle: {
//             color: "#026492",
//             width: 1.5,
//           },
//         },
//       ],
//     };

//     ECG_scatter_graph.clear();
//     ECG_scatter_graph.setOption(ECG_scatter_opt);

//     if (typeof ECG_scatter_graph.off === "function") {
//       ECG_scatter_graph.off("click");
//     }

//     ECG_scatter_graph.on("click", function (param) {
//       var timestamp = param.data[0];
//       var param1 = btoa(timestamp / 1000);
//       var param2 = btoa(id);
//       var param3 = btoa("2");
//       var url = "context_ecg.html" + "?param1=" + param1 + "&param2=" + param2 + "&param3=" + param3;
//       openModal_ecg(url);
//     });
//   } catch (error) {
//     console.error(" [context_assessment_UI_2.js] Error in history_ECG function:", error);
//   }
// }

// function history_Heart_Rate(min_time, max_time, heart_rate, id) {
//   try {
//     if (!$("#context_graph").length) {
//       return;
//     }

//     var heart_rate_data = heart_rate || [];

//     if (!Array.isArray(heart_rate_data)) {
//       heart_rate_data = [];
//     }

//     if (heart_rate_data.length > 1) {
//       heart_rate_data = addTimeGapsForMissingData(heart_rate_data, 1.5);
//     }

//     heart_rate_data.unshift([min_time * 1000, null]);
//     heart_rate_data.push([max_time * 1000, null]);

//     Heart_rate_graph_opt = {
//       grid: {
//         top: 30,
//         left: 30,
//         right: 30,
//         bottom: 80,
//       },
//       tooltip: {
//         trigger: "axis",
//         formatter: formatTooltipWithValues,
//         axisPointer: {
//           show: false,
//         },
//         textStyle: {
//           color: "#4C5964",
//           fontSize: 12,
//         },
//       },
//       dataZoom: [
//         {
//           type: "inside",
//           xAxisIndex: [0],
//           zoomOnMouseWheel: "ctrl",
//           moveOnMouseMove: true,
//           moveOnMouseWheel: true,
//           filterMode: "none",
//           realtime: true,
//           start: 0,
//           end: 100,
//           minSpan: 0.1,
//         },
//         {
//           type: "slider",
//           xAxisIndex: [0],
//           handleIcon: "pin",
//           show: true,
//           showDetail: false,
//           handleSize: "100%",
//           height: 25,
//           handleStyle: {
//             color: "#0865C1",
//             borderColor: "#ACB8D1",
//             borderWidth: 1,
//           },
//           start: 0,
//           end: 100,
//         },
//       ],
//       xAxis: {
//         name: "Time",
//         nameLocation: "end",
//         nameGap: 3,
//         type: "time",
//         min: "dataMin",
//         max: "dataMax",
//         axisLabel: {
//           rotate: 40,
//           show: true,
//           margin: 12,
//           hideOverlap: true,
//           fontStyle: "oblique",
//           fontSize: 10,
//           formatter: "{d}-{MM}" + "\n" + "{HH}:{mm}",
//           textStyle: {
//             color: "#ffffff",
//           },
//         },
//         splitLine: {
//           show: false,
//           opacity: 1,
//           lineStyle: {
//             color: "#0277ada9",
//             width: 1,
//           },
//         },
//         splitArea: {
//           interval: "auto",
//           show: false,
//         },
//       },
//       yAxis: {
//         type: "value",
//         splitNumber: 8,
//         boundaryGap: [0, "100%"],
//         min: function (range) {
//           return range.min - 5;
//         },
//         max: function (range) {
//           return range.max + 5;
//         },
//         axisLine: {
//           show: true,
//         },
//         axisLabel: {
//           show: true,
//           formatter: "{value}",
//           textStyle: {
//             color: "#ffffff",
//           },
//         },
//         splitLine: {
//           show: false,
//           lineStyle: {
//             color: "#0277ada9",
//             width: 1,
//           },
//         },
//       },
//       series: [
//         {
//           name: "Heart Rate",
//           type: "line",
//           showSymbol: true,
//           connectNulls: false,
//           data: heart_rate_data,
//           lineStyle: {
//             color: "#ff5252",
//             width: 1.5,
//           },
//         },
//       ],
//     };

//     Heart_rate_graph.clear();
//     Heart_rate_graph.setOption(Heart_rate_graph_opt);
//     console.log(" [context_assessment_UI_2.js] Completed Heart Rate Graph ");
//   } catch (error) {
//     console.error(" [context_assessment_UI_2.js] Error in history_Heart_Rate function:", error);
//   }
// }

// function history_Blood_Oxygen(min_time, max_time, blood_oxygen, id) {
//   try {
//     if (!$("#context_graph").length) {
//       return;
//     }

//     var spo2_data = blood_oxygen || [];

//     if (!Array.isArray(spo2_data)) {
//       spo2_data = [];
//     }

//     if (Array.isArray(spo2_data) && spo2_data.length > 1) {
//       spo2_data = addTimeGapsForMissingData(spo2_data, 1.5);
//     }

//     if (Array.isArray(spo2_data)) {
//       spo2_data.unshift([min_time * 1000, null]);
//       spo2_data.push([max_time * 1000, null]);
//     }

//     blood_oxygen_opt = {
//       grid: {
//         top: 30,
//         left: 30,
//         right: 30,
//         bottom: 80,
//       },
//       tooltip: {
//         trigger: "axis",
//         formatter: formatTooltipWithValues,
//         axisPointer: {
//           show: false,
//         },
//         textStyle: {
//           color: "#4C5964",
//           fontSize: 12,
//         },
//       },
//       dataZoom: [
//         {
//           type: "inside",
//           xAxisIndex: [0],
//           zoomOnMouseWheel: "ctrl",
//           moveOnMouseMove: true,
//           moveOnMouseWheel: true,
//           filterMode: "none",
//           realtime: true,
//           start: 0,
//           end: 100,
//           minSpan: 0.1,
//         },
//         {
//           type: "slider",
//           xAxisIndex: [0],
//           handleIcon: "pin",
//           show: true,
//           showDetail: false,
//           handleSize: "100%",
//           height: 25,
//           handleStyle: {
//             color: "#0865C1",
//             borderColor: "#ACB8D1",
//             borderWidth: 1,
//           },
//           start: 0,
//           end: 100,
//         },
//       ],
//       xAxis: {
//         name: "Time",
//         nameLocation: "end",
//         nameGap: 3,
//         type: "time",
//         min: "dataMin",
//         max: "dataMax",
//         axisLabel: {
//           rotate: 40,
//           show: true,
//           margin: 12,
//           hideOverlap: true,
//           fontStyle: "oblique",
//           fontSize: 10,
//           formatter: "{d}-{MM}" + "\n" + "{HH}:{mm}",
//           textStyle: {
//             color: "#ffffff",
//           },
//         },
//         splitLine: {
//           show: false,
//           opacity: 1,
//           lineStyle: {
//             color: "#0277ada9",
//             width: 1,
//           },
//         },
//         splitArea: {
//           interval: "auto",
//           show: false,
//         },
//       },
//       yAxis: {
//         type: "value",
//         splitNumber: 8,
//         boundaryGap: [0, "100%"],
//         min: function (range) {
//           return range.min - 5;
//         },
//         max: function (range) {
//           return range.max + 5;
//         },
//         axisLine: {
//           show: true,
//         },
//         axisLabel: {
//           show: true,
//           formatter: "{value}",
//           textStyle: {
//             color: "#ffffff",
//           },
//         },
//         splitLine: {
//           show: false,
//           lineStyle: {
//             color: "#0277ada9",
//             width: 1,
//           },
//         },
//       },
//       series: [
//         {
//           name: "SpO2",
//           type: "line",
//           showSymbol: true,
//           connectNulls: false,
//           data: spo2_data,
//           lineStyle: {
//             color: "#00e676",
//             width: 1.5,
//           },
//         },
//       ],
//     };

//     blood_oxygen_graph.clear();
//     blood_oxygen_graph.setOption(blood_oxygen_opt);

//     console.log("[context_assessment_UI_2.js] Completed Blod Oxygen Graph");
//   } catch (error) {
//     console.error(" [context_assessment_UI_2.js] Error in history_Blood_Oxygen function:", error);
//   }
// }

// function history_temperature(min_time, max_time, temperature, id) {
//   try {
//     if (!$("#context_graph").length) {
//       return;
//     }

//     var temp_data = temperature || [];

//     if (!Array.isArray(temp_data)) {
//       temp_data = [];
//     }

//     if (Array.isArray(temp_data) && temp_data.length > 1) {
//       temp_data = addTimeGapsForMissingData(temp_data, 1.5);
//     }

//     if (Array.isArray(temp_data)) {
//       temp_data.unshift([min_time * 1000, null]);
//       temp_data.push([max_time * 1000, null]);
//     }

//     temperature_opt = {
//       grid: {
//         top: 30,
//         left: 30,
//         right: 30,
//         bottom: 80,
//       },
//       tooltip: {
//         trigger: "axis",
//         formatter: formatTooltipWithValues,
//         axisPointer: {
//           show: false,
//         },
//         textStyle: {
//           color: "#4C5964",
//           fontSize: 12,
//         },
//       },
//       dataZoom: [
//         {
//           type: "inside",
//           xAxisIndex: [0],
//           zoomOnMouseWheel: "ctrl",
//           moveOnMouseMove: true,
//           moveOnMouseWheel: true,
//           filterMode: "none",
//           realtime: true,
//           start: 0,
//           end: 100,
//           minSpan: 0.1,
//         },
//         {
//           type: "slider",
//           xAxisIndex: [0],
//           handleIcon: "pin",
//           show: true,
//           showDetail: false,
//           handleSize: "100%",
//           height: 25,
//           handleStyle: {
//             color: "#0865C1",
//             borderColor: "#ACB8D1",
//             borderWidth: 1,
//           },
//           start: 0,
//           end: 100,
//         },
//       ],
//       xAxis: {
//         name: "Time",
//         nameLocation: "end",
//         nameGap: 3,
//         type: "time",
//         min: "dataMin",
//         max: "dataMax",
//         axisLabel: {
//           rotate: 40,
//           show: true,
//           margin: 12,
//           hideOverlap: true,
//           fontStyle: "oblique",
//           fontSize: 10,
//           formatter: "{d}-{MM}" + "\n" + "{HH}:{mm}",
//           textStyle: {
//             color: "#ffffff",
//           },
//         },
//         splitLine: {
//           show: false,
//           opacity: 1,
//           lineStyle: {
//             color: "#0277ada9",
//             width: 1,
//           },
//         },
//         splitArea: {
//           interval: "auto",
//           show: false,
//         },
//       },
//       yAxis: {
//         type: "value",
//         splitNumber: 8,
//         boundaryGap: [0, "100%"],
//         min: function (range) {
//           return range.min - 5;
//         },
//         max: function (range) {
//           return range.max + 5;
//         },
//         axisLine: {
//           show: true,
//         },
//         axisLabel: {
//           show: true,
//           formatter: "{value}",
//           textStyle: {
//             color: "#ffffff",
//           },
//         },
//         splitLine: {
//           show: false,
//           lineStyle: {
//             color: "#0277ada9",
//             width: 1,
//           },
//         },
//       },
//       series: [
//         {
//           name: "Temperature",
//           type: "line",
//           showSymbol: true,
//           connectNulls: false,
//           data: temp_data,
//           lineStyle: {
//             color: "#ffca28",
//             width: 1.5,
//           },
//         },
//       ],
//     };

//     temperature_graph.clear();
//     temperature_graph.setOption(temperature_opt);

//     console.log(" [context_assessment_UI_2.js] Completed Temperature Graph ");
//   } catch (error) {
//     console.error(" [context_assessment_UI_2.js] Error in history_temperature function:", error);
//   }
// }

// function history_Blood_presure(min_time, max_time, blood_pressure, id) {
//   try {
//     if (!$("#context_graph").length) {
//       return;
//     }

//     var bp_data = blood_pressure || [];

//     if (!Array.isArray(bp_data)) {
//       bp_data = [];
//     }

//     if (Array.isArray(bp_data) && bp_data.length > 1) {
//       bp_data = addTimeGapsForMissingData(bp_data, 1.5);
//     }

//     if (Array.isArray(bp_data)) {
//       bp_data.unshift([min_time * 1000, null]);
//       bp_data.push([max_time * 1000, null]);
//     }

//     // Split blood pressure into SBP and DBP series
//     var sbp_data = [];
//     var dbp_data = [];

//     bp_data.forEach(function (point) {
//       var timestamp = point[0];
//       var sbp = point[1];
//       var dbp = point[2];

//       // For boundary/null points, keep timestamp with null values
//       if (point.length < 3) {
//         sbp_data.push([timestamp, null]);
//         dbp_data.push([timestamp, null]);
//       } else {
//         sbp_data.push([timestamp, sbp]);
//         dbp_data.push([timestamp, dbp]);
//       }
//     });

//     blood_pressure_opt = {
//       grid: {
//         top: 30,
//         left: 30,
//         right: 30,
//         bottom: 80,
//       },
//       tooltip: {
//         trigger: "axis",
//         formatter: formatTooltipWithValues,
//         axisPointer: {
//           show: false,
//         },
//         textStyle: {
//           color: "#4C5964",
//           fontSize: 12,
//         },
//       },
//       legend: {
//         show: true,
//         top: 5,
//         textStyle: {
//           color: "#ffffff",
//           fontSize: 11,
//         },
//       },
//       dataZoom: [
//         {
//           type: "inside",
//           xAxisIndex: [0],
//           zoomOnMouseWheel: "ctrl",
//           moveOnMouseMove: true,
//           moveOnMouseWheel: true,
//           filterMode: "none",
//           realtime: true,
//           start: 0,
//           end: 100,
//           minSpan: 0.1,
//         },
//         {
//           type: "slider",
//           xAxisIndex: [0],
//           handleIcon: "pin",
//           show: true,
//           showDetail: false,
//           handleSize: "100%",
//           height: 25,
//           handleStyle: {
//             color: "#0865C1",
//             borderColor: "#ACB8D1",
//             borderWidth: 1,
//           },
//           start: 0,
//           end: 100,
//         },
//       ],
//       xAxis: {
//         name: "Time",
//         nameLocation: "end",
//         nameGap: 3,
//         type: "time",
//         min: "dataMin",
//         max: "dataMax",
//         axisLabel: {
//           rotate: 40,
//           show: true,
//           margin: 12,
//           hideOverlap: true,
//           fontStyle: "oblique",
//           fontSize: 10,
//           formatter: "{d}-{MM}" + "\n" + "{HH}:{mm}",
//           textStyle: {
//             color: "#ffffff",
//           },
//         },
//         splitLine: {
//           show: false,
//           opacity: 1,
//           lineStyle: {
//             color: "#0277ada9",
//             width: 1,
//           },
//         },
//         splitArea: {
//           interval: "auto",
//           show: false,
//         },
//       },
//       yAxis: {
//         type: "value",
//         splitNumber: 8,
//         boundaryGap: [0, "100%"],
//         min: function (range) {
//           return range.min - 5;
//         },
//         max: function (range) {
//           return range.max + 5;
//         },
//         axisLine: {
//           show: true,
//         },
//         axisLabel: {
//           show: true,
//           formatter: "{value}",
//           textStyle: {
//             color: "#ffffff",
//           },
//         },
//         splitLine: {
//           show: false,
//           lineStyle: {
//             color: "#0277ada9",
//             width: 1,
//           },
//         },
//       },
//       series: [
//         {
//           name: "SBP",
//           type: "line",
//           showSymbol: true,
//           connectNulls: false,
//           data: sbp_data,
//           lineStyle: {
//             color: "#8e24aa", // violet for SBP
//             width: 1.5,
//           },
//         },
//         {
//           name: "DBP",
//           type: "line",
//           showSymbol: true,
//           connectNulls: false,
//           data: dbp_data,
//           lineStyle: {
//             color: "#0d47a1", // dark blue for DBP
//             width: 1.5,
//           },
//         },
//       ],
//     };

//     blood_pressure_graph.clear();
//     blood_pressure_graph.setOption(blood_pressure_opt);

//     console.log(" [context_assessment_UI_2.js] Completed Blood Pressure Graph ");
//   } catch (error) {
//     console.error(" [context_assessment_UI_2.js] Error in history_Blood_presure function:", error);
//   }
// }

// function history_Respiration_Rate(min_time, max_time, respiration_rate, id) {
//   try {
//     if (!$("#context_graph").length) {
//       return;
//     }

//     var rr_data = respiration_rate || [];

//     if (!Array.isArray(rr_data)) {
//       rr_data = [];
//     }

//     if (Array.isArray(rr_data) && rr_data.length > 1) {
//       rr_data = addTimeGapsForMissingData(rr_data, 1.5);
//     }

//     if (Array.isArray(rr_data)) {
//       rr_data.unshift([min_time * 1000, null]);
//       rr_data.push([max_time * 1000, null]);
//     }

//     Respiration_opt = {
//       grid: {
//         top: 30,
//         left: 30,
//         right: 30,
//         bottom: 80,
//       },
//       tooltip: {
//         trigger: "axis",
//         formatter: formatTooltipWithValues,
//         axisPointer: {
//           show: false,
//         },
//         textStyle: {
//           color: "#4C5964",
//           fontSize: 12,
//         },
//       },
//       dataZoom: [
//         {
//           type: "inside",
//           xAxisIndex: [0],
//           zoomOnMouseWheel: "ctrl",
//           moveOnMouseMove: true,
//           moveOnMouseWheel: true,
//           filterMode: "none",
//           realtime: true,
//           start: 0,
//           end: 100,
//           minSpan: 0.1,
//         },
//         {
//           type: "slider",
//           xAxisIndex: [0],
//           handleIcon: "pin",
//           show: true,
//           showDetail: false,
//           handleSize: "100%",
//           height: 25,
//           handleStyle: {
//             color: "#0865C1",
//             borderColor: "#ACB8D1",
//             borderWidth: 1,
//           },
//           start: 0,
//           end: 100,
//         },
//       ],
//       xAxis: {
//         name: "Time",
//         nameLocation: "end",
//         nameGap: 3,
//         type: "time",
//         min: "dataMin",
//         max: "dataMax",
//         axisLabel: {
//           rotate: 40,
//           show: true,
//           margin: 12,
//           hideOverlap: true,
//           fontStyle: "oblique",
//           fontSize: 10,
//           formatter: "{d}-{MM}" + "\n" + "{HH}:{mm}",
//           textStyle: {
//             color: "#ffffff",
//           },
//         },
//         splitLine: {
//           show: false,
//           opacity: 1,
//           lineStyle: {
//             color: "#0277ada9",
//             width: 1,
//           },
//         },
//         splitArea: {
//           interval: "auto",
//           show: false,
//         },
//       },
//       yAxis: {
//         type: "value",
//         splitNumber: 8,
//         boundaryGap: [0, "100%"],
//         min: function (range) {
//           return range.min - 5;
//         },
//         max: function (range) {
//           return range.max + 5;
//         },
//         axisLine: {
//           show: true,
//         },
//         axisLabel: {
//           show: true,
//           formatter: "{value}",
//           textStyle: {
//             color: "#ffffff",
//           },
//         },
//         splitLine: {
//           show: false,
//           lineStyle: {
//             color: "#0277ada9",
//             width: 1,
//           },
//         },
//       },
//       series: [
//         {
//           name: "Respiration Rate",
//           type: "line",
//           showSymbol: true,
//           connectNulls: false,
//           data: rr_data,
//           lineStyle: {
//             color: "#ab47bc",
//             width: 1.5,
//           },
//         },
//       ],
//     };

//     Respiration_graph.clear();
//     Respiration_graph.setOption(Respiration_opt);

//     console.log(" [context_assessment_UI_2.js] Completed Respiration Rate Graph ");
//   } catch (error) {
//     console.error(" [context_assessment_UI_2.js] Error in history_Respiration_Rate function:", error);
//   }
// }

// function history_ews(min_time, max_time, ews_score, id) {
//   try {
//     if (!$("#context_graph").length) {
//       return;
//     }

//     var ews_data = ews_score || [];
//     if (!Array.isArray(ews_data)) {
//       ews_data = [];
//     }

//     // Insert nulls where any minute is missing so continuous
//     // per-minute data becomes a line and isolated points stay
//     // disconnected.
//     var ews_series_data = Array.isArray(ews_data) ? addTimeGapsForMissingData(ews_data, 1.0) : [];

//     if (Array.isArray(ews_series_data)) {
//       ews_series_data.unshift([min_time * 1000, null]);
//       ews_series_data.push([max_time * 1000, null]);
//     }

//     console.log("[context_assessment_UI_2.js] display ews_series_data", ews_series_data);

//     EWS_Score_opt = {
//       grid: {
//         top: 30,
//         left: 30,
//         right: 30,
//         bottom: 80,
//       },
//       tooltip: {
//         trigger: "axis",
//         formatter: formatTooltipWithValues,
//         axisPointer: {
//           show: false,
//         },
//         textStyle: {
//           color: "#4C5964",
//           fontSize: 12,
//         },
//       },
//       dataZoom: [
//         {
//           type: "inside",
//           xAxisIndex: [0],
//           zoomOnMouseWheel: "ctrl",
//           moveOnMouseMove: true,
//           moveOnMouseWheel: true,
//           filterMode: "none",
//           realtime: true,
//           start: 0,
//           end: 100,
//           minSpan: 0.1,
//         },
//         {
//           type: "slider",
//           xAxisIndex: [0],
//           handleIcon: "pin",
//           show: true,
//           showDetail: false,
//           handleSize: "100%",
//           height: 25,
//           handleStyle: {
//             color: "#0865C1",
//             borderColor: "#ACB8D1",
//             borderWidth: 1,
//           },
//           start: 0,
//           end: 100,
//         },
//       ],
//       xAxis: {
//         name: "Time",
//         nameLocation: "end",
//         nameGap: 3,
//         type: "time",
//         min: "dataMin",
//         max: "dataMax",
//         axisLabel: {
//           rotate: 40,
//           show: true,
//           margin: 12,
//           hideOverlap: true,
//           fontStyle: "oblique",
//           fontSize: 10,
//           formatter: "{d}-{MM}" + "\n" + "{HH}:{mm}",
//           textStyle: {
//             color: "#ffffff",
//           },
//         },
//         splitLine: {
//           show: false,
//           opacity: 1,
//           lineStyle: {
//             color: "#0277ada9",
//             width: 1,
//           },
//         },
//         splitArea: {
//           interval: "auto",
//           show: false,
//         },
//       },
//       yAxis: {
//         type: "value",
//         splitNumber: 8,
//         boundaryGap: [0, "100%"],
//         min: function (range) {
//           return range.min - 5 < 0 ? 0 : range.min - 5;
//         },
//         max: function (range) {
//           return range.max + 5;
//         },
//         axisLine: {
//           show: true,
//         },
//         axisLabel: {
//           show: true,
//           formatter: "{value}",
//           textStyle: {
//             color: "#ffffff",
//           },
//         },
//         splitLine: {
//           show: false,
//           lineStyle: {
//             color: "#0277ada9",
//             width: 1,
//           },
//         },
//       },
//       series: [
//         {
//           name: "EWS Score",
//           type: "line",
//           showSymbol: true,
//           connectNulls: false,
//           symbolSize: 6,
//           data: ews_series_data,
//           lineStyle: {
//             color: "#ff7043",
//             width: 1.5,
//           },
//           itemStyle: {
//             color: "#ff7043",
//           },
//         },
//       ],
//     };

//     ews_score_echart_context_graph.clear();
//     ews_score_echart_context_graph.setOption(EWS_Score_opt);

//     console.log(" [context_assessment_UI_2.js] Completed EWS Score Graph ");
//   } catch (error) {
//     console.error(" [context_assessment_UI_2.js] Error in history_ews function:", error);
//   }
// }

// function addTimeGapsForMissingData(rawData, gapMultiplier) {
//   try {
//     if (!Array.isArray(rawData) || rawData.length === 0) {
//       return [];
//     }

//     // Sort by timestamp (assumed to be in milliseconds)
//     var sorted = rawData.slice().sort(function (a, b) {
//       return a[0] - b[0];
//     });

//     if (sorted.length < 2) {
//       return sorted;
//     }

//     // Data is expected every minute. If any minute is missing
//     // between two points, insert a null point to break the line
//     // so that isolated data stays as a point and continuous
//     // minute-wise data renders as a line.
//     var ONE_MINUTE_MS = 60 * 1000;
//     var result = [sorted[0]];

//     for (var j = 1; j < sorted.length; j++) {
//       var previous = sorted[j - 1];
//       var current = sorted[j];

//       var previousTime = previous && typeof previous[0] === "number" ? previous[0] : null;
//       var currentTime = current && typeof current[0] === "number" ? current[0] : null;

//       if (previousTime !== null && currentTime !== null) {
//         var delta = currentTime - previousTime;

//         // If there's at least one missing minute between points,
//         // insert a null point at the first missing minute to
//         // break the line.
//         if (delta > ONE_MINUTE_MS) {
//           var gapTime = previousTime + ONE_MINUTE_MS;
//           var gapPoint = [gapTime];

//           for (var k = 1; k < current.length; k++) {
//             gapPoint.push(null);
//           }

//           result.push(gapPoint);
//         }
//       }

//       result.push(current);
//     }

//     return result;
//   } catch (error) {
//     console.error(" [context_assessment_UI_2.js] Error in addTimeGapsForMissingData:", error);
//     return Array.isArray(rawData) ? rawData : [];
//   }
// }

// function formatTooltipWithValues(params) {
//   try {
//     if (!params) {
//       return "";
//     }

//     if (!Array.isArray(params)) {
//       params = [params];
//     }

//     if (!params.length) {
//       return "";
//     }

//     var first = params[0];
//     var firstVal = Array.isArray(first.value) ? first.value : first.data;
//     var timestamp = Array.isArray(firstVal) ? firstVal[0] : firstVal;

//     if (typeof timestamp !== "number") {
//       return "";
//     }

//     var date = new Date(timestamp);
//     var dd = ("0" + date.getDate()).slice(-2);
//     var MM = ("0" + (date.getMonth() + 1)).slice(-2);
//     var yy = ("" + date.getFullYear()).slice(-2);
//     var HH = ("0" + date.getHours()).slice(-2);
//     var mm = ("0" + date.getMinutes()).slice(-2);

//     // First line: full time (date and time on same line)
//     var text = "Time : " + dd + "/" + MM + "/" + yy + " " + HH + ":" + mm;

//     for (var i = 0; i < params.length; i++) {
//       var item = params[i];
//       var v = item && Array.isArray(item.value) ? item.value : item.data;

//       if (Array.isArray(v) && v.length > 1) {
//         var seriesLabel = item.seriesName || "Value";
//         var valuePart;

//         if (v.length === 2) {
//           valuePart = v[1];
//         } else {
//           valuePart = v.slice(1).join(", ");
//         }

//         if (valuePart === null || typeof valuePart === "undefined") {
//           valuePart = "-";
//         }

//         // Each series/value on its own new line in the tooltip
//         text += "<br/>" + seriesLabel + " : " + valuePart;
//       }
//     }

//     return text;
//   } catch (error) {
//     console.error(" [context_assessment_UI_2.js] Error in formatTooltipWithValues:", error);
//     return "";
//   }
// }

// // Use the parent document because this script runs inside an iframe
// // and the second modal (myModal_2) is defined on the parent page (index.html).
// var parentDoc = window.parent && window.parent.document ? window.parent.document : document;
// var modal = parentDoc.getElementById("myModal_2");
// var modal_ecg = parentDoc.getElementById("myModal_3");

// // Get the <span> elements that close the modals (scoped to each modal)
// var span = modal ? modal.getElementsByClassName("close")[0] : null;
// if (span) {
//   span.addEventListener("click", closeModal);
// }

// var spanEcg = modal_ecg ? modal_ecg.getElementsByClassName("close")[0] : null;
// if (spanEcg) {
//   spanEcg.addEventListener("click", closeModal_ecg);
// }

// function openModal(pageUrl) {
//   if (!modal) {
//     console.warn("[context_assessment_UI_2.js] myModal_2 not found on parent document");
//     return;
//   }

//   var iframe = parentDoc.getElementById("iframeContent_2");
//   if (!iframe) {
//     console.warn("[context_assessment_UI_2.js] iframeContent_2 not found on parent document");
//     return;
//   }

//   console.log("pageurl", pageUrl);
//   iframe.src = pageUrl;
//   modal.style.display = "block";
// }
// function openModal_ecg(pageUrl) {
//   if (!modal_ecg) {
//     console.warn("[context_assessment_UI_2.js] myModal_3 not found on parent document");
//     return;
//   }

//   var iframe = parentDoc.getElementById("iframeContent_3");
//   if (!iframe) {
//     console.warn("[context_assessment_UI_2.js] iframeContent_3 not found on parent document");
//     return;
//   }

//   console.log("pageurl", pageUrl);
//   iframe.src = pageUrl;
//   modal_ecg.style.display = "block";
// }

// // When the user clicks on <span> (x), close the modal
// function closeModal() {
//   if (!modal) {
//     return;
//   }

//   var iframe = parentDoc.getElementById("iframeContent_2");
//   if (iframe) {
//     iframe.src = "";
//   }
//   modal.style.display = "none";
// }
// function closeModal_ecg() {
//   if (!modal_ecg) {
//     return;
//   }

//   var iframe = parentDoc.getElementById("iframeContent_3");
//   if (iframe) {
//     iframe.src = "";
//   }
//   modal_ecg.style.display = "none";
// }

// // When the user clicks anywhere outside of the modal, close it
// if (window.parent) {
//   window.parent.addEventListener("click", function (event) {
//     console.log("Clicked outside modal, event target:", event.target);
//     if (event.target === modal) {
//       closeModal();
//     } else if (event.target === modal_ecg) {
//       closeModal_ecg();
//     }
//   });
// }
