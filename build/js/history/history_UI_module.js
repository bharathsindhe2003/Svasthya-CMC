var threshold_notifications_opt;
var ECG_scatter_opt;
var Heart_rate_graph_opt;
var blood_oxygen_opt;
var temperature_opt;
var blood_pressure_opt;
var Respiration_opt;
var vital_notifications_opt;

const threshold_notifications_graph = echarts.init(document.getElementById("threshold_notifications_echart_content"));
const vital_notifications_graph = echarts.init(document.getElementById("vital_notifications_echart_content"));
const ECG_scatter_graph = echarts.init(document.getElementById("ecg_echart_content"));
const Heart_rate_graph = echarts.init(document.getElementById("heart_rate_echart_content"));
const blood_oxygen_graph = echarts.init(document.getElementById("spo2_echart_content"));
const temperature_graph = echarts.init(document.getElementById("temperature_echart_content"));
const blood_pressure_graph = echarts.init(document.getElementById("blood_pressure_echart_content"));
const Respiration_graph = echarts.init(document.getElementById("respiration_rate_echart_content"));

/**
 * Inserts a null point after missing minute intervals so ECharts breaks the line
 * instead of drawing across gaps in the historical data.
 * @param {Array} rawData
 * @param {number} gapMultiplier
 * @returns {Array}
 */
function addTimeGapsForMissingData(rawData, gapMultiplier) {
  try {
    if (!Array.isArray(rawData) || rawData.length === 0) {
      return [];
    }

    // Sort by timestamp (assumed to be in milliseconds)
    var sorted = rawData.slice().sort(function (a, b) {
      return a[0] - b[0];
    });

    if (sorted.length < 2) {
      return sorted;
    }

    // Data is expected every minute. If any minute is missing
    // between two points, insert a null point to break the line
    // so that isolated data stays as a point and continuous
    // minute-wise data renders as a line.
    var ONE_MINUTE_MS = 60 * 1000;
    var result = [sorted[0]];

    for (var j = 1; j < sorted.length; j++) {
      var previous = sorted[j - 1];
      var current = sorted[j];

      var previousTime = previous && typeof previous[0] === "number" ? previous[0] : null;
      var currentTime = current && typeof current[0] === "number" ? current[0] : null;

      if (previousTime !== null && currentTime !== null) {
        var delta = currentTime - previousTime;

        // If there's at least one missing minute between points,
        // insert a null point at the first missing minute to
        // break the line.
        if (delta > ONE_MINUTE_MS) {
          var gapTime = previousTime + ONE_MINUTE_MS;
          var gapPoint = [gapTime];

          for (var k = 1; k < current.length; k++) {
            gapPoint.push(null);
          }

          result.push(gapPoint);
        }
      }

      result.push(current);
    }

    return result;
  } catch (error) {
    console.error(" [history_UI_module.js] Error in addTimeGapsForMissingData:", error);
    return Array.isArray(rawData) ? rawData : [];
  }
}

/**
 * Builds a multi-series tooltip string for history charts that share a timestamp.
 * @param {Array|Object} params
 * @returns {string}
 */
function formatTooltipWithValues(params) {
  try {
    if (!params) {
      return "";
    }

    if (!Array.isArray(params)) {
      params = [params];
    }

    if (!params.length) {
      return "";
    }

    var first = params[0];
    var firstVal = Array.isArray(first.value) ? first.value : first.data;
    var timestamp = Array.isArray(firstVal) ? firstVal[0] : firstVal;

    if (typeof timestamp !== "number") {
      return "";
    }

    var date = new Date(timestamp);
    var dd = ("0" + date.getDate()).slice(-2);
    var MM = ("0" + (date.getMonth() + 1)).slice(-2);
    var yy = ("" + date.getFullYear()).slice(-2);
    var HH = ("0" + date.getHours()).slice(-2);
    var mm = ("0" + date.getMinutes()).slice(-2);

    // First line: full time (date and time on same line)
    var text = "Time : " + dd + "/" + MM + "/" + yy + " " + HH + ":" + mm;

    for (var i = 0; i < params.length; i++) {
      var item = params[i];
      var v = item && Array.isArray(item.value) ? item.value : item.data;

      if (Array.isArray(v) && v.length > 1) {
        var seriesLabel = item.seriesName || "Value";
        var valuePart;

        if (v.length === 2) {
          valuePart = v[1];
        } else {
          valuePart = v.slice(1).join(", ");
        }

        if (valuePart === null || typeof valuePart === "undefined") {
          valuePart = "-";
        }

        // Each series/value on its own new line in the tooltip
        text += "<br/>" + seriesLabel + " : " + valuePart;
      }
    }

    return text;
  } catch (error) {
    console.error(" [history_UI_module.js] Error in formatTooltipWithValues:", error);
    return "";
  }
}

/**
 * Plot the point when data is captured in patientlivedata node
 * @param {number|string} min_time Start Date and time in epoch
 * @param {number|string} max_time End Date and time in epoch
 * @param {string} id Patient ID
 * @param {Array} context_timestamp Timestamps
 * @returns {void} No return params but when point is clicked it opens a popup
 */
function history_context_assessment_2(min_time, max_time, id, context_timestamp) {
  try {
    if (!$("#vital_notifications_echart_content").length) {
      return;
    }

    var context_data = context_timestamp || [];

    context_data.unshift([min_time * 1000, null]);
    context_data.push([max_time * 1000, null]);

    vital_notifications_opt = {
      grid: {
        top: 30,
        left: 30,
        right: 30,
        bottom: 80,
      },
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0],
          zoomOnMouseWheel: "ctrl",
          moveOnMouseMove: true,
          moveOnMouseWheel: true,
          filterMode: "none",
          realtime: true,
          start: 0,
          end: 100,
          minSpan: 0.1,
        },
        {
          type: "slider",
          xAxisIndex: [0],
          handleIcon: "pin",
          show: true,
          showDetail: false,
          handleSize: "100%",
          height: 25,
          handleStyle: {
            color: "#0865C1",
            borderColor: "#ACB8D1",
            borderWidth: 1,
          },
          start: 0,
          end: 100,
        },
      ],

      xAxis: {
        name: "Time",
        nameLocation: "end",
        nameGap: 1,
        type: "time",
        boundaryGap: true,
        scale: true,
        min: "dataMin",
        max: "dataMax",
        axisTick: {
          show: false,
        },
        axisLabel: {
          rotate: 40,
          show: true,
          margin: 12,
          hideOverlap: true,
          fontStyle: "oblique",
          fontSize: 10,
          formatter: "{d}-{MM}" + "\n" + "{HH}:{mm}",
          textStyle: {
            color: "#ffffff",
          },
        },
        splitLine: {
          show: false,
          opacity: 1,
          lineStyle: {
            color: "#0277ada9",
            width: 1,
          },
        },
        splitArea: {
          interval: "auto",
          show: false,
        },
      },

      yAxis: {
        type: "value",
        boundaryGap: [0, "100%"],
        min: function (finaldata) {
          return finaldata.min - 5;
        },
        max: function (finaldata) {
          return finaldata.max + 5;
        },
        splitLine: {
          show: false,
          lineStyle: {
            color: "#0277ada9",
            width: 1,
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
        minorSplitLine: {
          show: false,
          lineStyle: {
            color: "#2178a049",
          },
        },
      },
      tooltip: {
        trigger: "axis",
        formatter: "Time : {dd}/{MM}/{yy}" + "\n" + "{HH}:{mm}",
        axisPointer: {
          show: false,
        },
        textStyle: {
          color: "#4C5964",
          fontSize: 12,
        },
      },

      series: [
        {
          name: "Time:",
          type: "scatter",
          showSymbol: false,
          data: context_data,
          symbol: "circle",
          symbolSize: 10,
        },
      ],
    };

    vital_notifications_graph.clear();
    vital_notifications_graph.setOption(vital_notifications_opt);

    if (typeof vital_notifications_graph.off === "function") {
      vital_notifications_graph.off("click");
    }

    vital_notifications_graph.on("click", function (param) {
      var timestamp = param.data[0];
      var param1 = btoa(timestamp / 1000);
      var param2 = btoa(id);
      var param3 = btoa("1");

      var url = "context_assment.html" + "?param1=" + param1 + "&param2=" + param2 + "&param3=" + param3;
      openModal(url);
    });
  } catch (error) {
    console.error(" [history_UI_module.js] Error in history_context_assessment function:", error);
  }
}

/**
 * Plot point when data is capture in patientecgdata node
 * @param {*} min_time Start Date and time in epoch
 * @param {*} max_time End Date and time in epoch
 * @param {*} ecg_timestamp timestamps
 * @param {*} id Patient ID
 * @returns {void} No return params but when point is clicked it opens a popup
 */
function history_ECG(min_time, max_time, ecg_timestamp, id) {
  try {
    if (!$("#ecg_echart_content").length) {
      return;
    }

    var ECG_scatter_data = [];
    if (Array.isArray(ECG_scatter_data) && ecg_timestamp.length > 0) {
      ECG_scatter_data = ecg_timestamp;
    }

    ECG_scatter_data.unshift([min_time * 1000, null]);
    ECG_scatter_data.push([max_time * 1000, null]);

    ECG_scatter_opt = {
      grid: {
        top: 30,
        left: 30,
        right: 30,
        bottom: 80,
      },
      tooltip: {
        trigger: "axis",
        formatter: "Time : {dd}/{MM}/{yy}" + "\n" + "{HH}:{mm}",
        axisPointer: {
          show: false,
        },
        textStyle: {
          color: "#4C5964",
          fontSize: 12,
        },
      },

      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0],
          // allow zoom with mouse wheel and dragging
          zoomOnMouseWheel: "ctrl", // use "ctrl" or "alt" or "shift" or true depending on desired modifier
          moveOnMouseMove: true,
          moveOnMouseWheel: true,
          filterMode: "none",
          realtime: true,
          start: 0,
          end: 100,
          minSpan: 0.1,
        },
        {
          type: "slider",
          xAxisIndex: [0],
          handleIcon: "pin",
          show: true,
          showDetail: false,
          handleSize: "100%",
          height: 25,
          handleStyle: {
            color: "#0865C1",
            borderColor: "#ACB8D1",
            borderWidth: 1,
          },
          start: 0,
          end: 100,
        },
      ],

      xAxis: {
        name: "Time",
        nameLocation: "end",
        nameGap: 3,
        type: "time",
        min: "dataMin",
        max: "dataMax",
        axisLabel: {
          rotate: 40,
          show: true,
          margin: 12,
          hideOverlap: true,
          fontStyle: "oblique",
          fontSize: 10,
          formatter: "{d}-{MM}" + "\n" + "{HH}:{mm}",
          textStyle: {
            color: "#ffffff",
          },
        },
        splitLine: {
          show: false,
          opacity: 1,
          lineStyle: {
            color: "#0277ada9",
            width: 1,
          },
        },
        splitArea: {
          interval: "auto",
          show: false,
        },
      },
      yAxis: {
        type: "value",
        splitNumber: 8,
        boundaryGap: [0, "100%"],
        min: function (range) {
          return range.min - 5;
        },
        max: function (range) {
          return range.max + 5;
        },
        axisLine: {
          show: true,
        },
        axisLabel: {
          show: false,
        },
        splitLine: {
          show: false,
          lineStyle: {
            color: "#0277ada9",
            width: 1,
          },
        },
      },
      series: [
        {
          name: "Fake Data",
          type: "scatter",
          showSymbol: false,
          data: ECG_scatter_data,
          lineStyle: {
            color: "#1991c994",
            width: 1.5,
          },
        },
      ],
    };

    ECG_scatter_graph.clear();
    ECG_scatter_graph.setOption(ECG_scatter_opt);
    if (typeof ECG_scatter_graph.off === "function") {
      ECG_scatter_graph.off("click");
    }

    ECG_scatter_graph.on("click", function (param) {
      var timestamp = param.data[0];
      var param1 = btoa(timestamp / 1000);
      var param2 = btoa(id);
      var param3 = btoa("2");
      var url = "context_ecg.html" + "?param1=" + param1 + "&param2=" + param2 + "&param3=" + param3;
      openModal_ecg(url);
    });
    // // Graph-level click: any click inside the ECG chart area opens the modal
    // if (typeof ECG_scatter_graph.getZr === "function") {
    //   var zrECG = ECG_scatter_graph.getZr();
    //   zrECG.off("click");
    //   zrECG.on("click", function (params) {
    //     var pointInPixel = [params.offsetX, params.offsetY];
    //     if (!ECG_scatter_graph.containPixel({ gridIndex: 0 }, pointInPixel)) {
    //       return;
    //     }

    //     var param1 = btoa(min_time);
    //     var param2 = btoa(max_time);
    //     var param3 = btoa(id);
    //     var param4 = btoa("3");
    //     var param5 = btoa("ECG");
    //     var url = "context_assment_2.html" + "?param1=" + param1 + "&param2=" + param2 + "&param3=" + param3 + "&param4=" + param4 + "&param5=" + param5;
    //     openModal(url);
    //   });
    // }
  } catch (error) {
    console.error(" [history_UI_module.js] Error in history_ECG function:", error);
  }
}

/**
 * Plot Heart Rate values from the min_time to max_time
 * @param {number|string} min_time - Start Date and time in epoch
 * @param {number|string} max_time - End Date and time in epoch
 * @param {Array} heart_rate - Values of HR with Date and time in epoch
 * @param {string} id - Patient ID
 * @returns {void}
 */
function history_Heart_Rate(min_time, max_time, heart_rate, id) {
  try {
    if (!$("#heart_rate_echart_content").length) {
      return;
    }

    var heart_rate_data = heart_rate || [];

    if (!Array.isArray(heart_rate_data)) {
      heart_rate_data = [];
    }

    if (heart_rate_data.length > 1) {
      heart_rate_data = addTimeGapsForMissingData(heart_rate_data, 1.5);
    }

    heart_rate_data.unshift([min_time * 1000, null]);
    heart_rate_data.push([max_time * 1000, null]);

    Heart_rate_graph_opt = {
      grid: {
        top: 30,
        left: 30,
        right: 30,
        bottom: 80,
      },
      tooltip: {
        trigger: "axis",
        formatter: formatTooltipWithValues,
        axisPointer: {
          show: false,
        },
        textStyle: {
          color: "#4C5964",
          fontSize: 12,
        },
      },
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0],
          zoomOnMouseWheel: "ctrl",
          moveOnMouseMove: true,
          moveOnMouseWheel: true,
          filterMode: "none",
          realtime: true,
          start: 0,
          end: 100,
          minSpan: 0.1,
        },
        {
          type: "slider",
          xAxisIndex: [0],
          handleIcon: "pin",
          show: true,
          showDetail: false,
          handleSize: "100%",
          height: 25,
          handleStyle: {
            color: "#0865C1",
            borderColor: "#ACB8D1",
            borderWidth: 1,
          },
          start: 0,
          end: 100,
        },
      ],
      xAxis: {
        name: "Time",
        nameLocation: "end",
        nameGap: 3,
        type: "time",
        min: "dataMin",
        max: "dataMax",
        axisLabel: {
          rotate: 40,
          show: true,
          margin: 12,
          hideOverlap: true,
          fontStyle: "oblique",
          fontSize: 10,
          formatter: "{d}-{MM}" + "\n" + "{HH}:{mm}",
          textStyle: {
            color: "#ffffff",
          },
        },
        splitLine: {
          show: false,
          opacity: 1,
          lineStyle: {
            color: "#0277ada9",
            width: 1,
          },
        },
        splitArea: {
          interval: "auto",
          show: false,
        },
      },
      yAxis: {
        type: "value",
        splitNumber: 8,
        boundaryGap: [0, "100%"],
        min: function (range) {
          return range.min - 5;
        },
        max: function (range) {
          return range.max + 5;
        },
        axisLine: {
          show: true,
        },
        axisLabel: {
          show: true,
          formatter: "{value}",
          textStyle: {
            color: "#ffffff",
          },
        },
        splitLine: {
          show: false,
          lineStyle: {
            color: "#0277ada9",
            width: 1,
          },
        },
      },
      series: [
        {
          name: "Heart Rate",
          type: "line",
          showSymbol: true,
          connectNulls: false,
          data: heart_rate_data,
          lineStyle: {
            color: "#ff5252",
            width: 1.5,
          },
        },
      ],
    };

    Heart_rate_graph.clear();
    Heart_rate_graph.setOption(Heart_rate_graph_opt);
    console.log(" [history_UI_module.js] Completed Heart Rate Graph ");
  } catch (error) {
    console.error(" [history_UI_module.js] Error in history_Heart_Rate function:", error);
  }
}

/**
 * Plot SPO2 values from the min_time to max_time
 * @param {number|string} min_time - Start Date and time in epoch
 * @param {number|string} max_time - End Date and time in epoch
 * @param {Array} blood_oxygen - Values of SpO2 with Date and time in epoch
 * @param {string} id - Patient ID
 * @returns {void}
 */
function history_Blood_Oxygen(min_time, max_time, blood_oxygen, id) {
  try {
    if (!$("#spo2_echart_content").length) {
      return;
    }

    var spo2_data = blood_oxygen || [];

    if (!Array.isArray(spo2_data)) {
      spo2_data = [];
    }

    if (Array.isArray(spo2_data) && spo2_data.length > 1) {
      spo2_data = addTimeGapsForMissingData(spo2_data, 1.5);
    }

    if (Array.isArray(spo2_data)) {
      spo2_data.unshift([min_time * 1000, null]);
      spo2_data.push([max_time * 1000, null]);
    }

    blood_oxygen_opt = {
      grid: {
        top: 30,
        left: 30,
        right: 30,
        bottom: 80,
      },
      tooltip: {
        trigger: "axis",
        formatter: formatTooltipWithValues,
        axisPointer: {
          show: false,
        },
        textStyle: {
          color: "#4C5964",
          fontSize: 12,
        },
      },
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0],
          zoomOnMouseWheel: "ctrl",
          moveOnMouseMove: true,
          moveOnMouseWheel: true,
          filterMode: "none",
          realtime: true,
          start: 0,
          end: 100,
          minSpan: 0.1,
        },
        {
          type: "slider",
          xAxisIndex: [0],
          handleIcon: "pin",
          show: true,
          showDetail: false,
          handleSize: "100%",
          height: 25,
          handleStyle: {
            color: "#0865C1",
            borderColor: "#ACB8D1",
            borderWidth: 1,
          },
          start: 0,
          end: 100,
        },
      ],
      xAxis: {
        name: "Time",
        nameLocation: "end",
        nameGap: 3,
        type: "time",
        min: "dataMin",
        max: "dataMax",
        axisLabel: {
          rotate: 40,
          show: true,
          margin: 12,
          hideOverlap: true,
          fontStyle: "oblique",
          fontSize: 10,
          formatter: "{d}-{MM}" + "\n" + "{HH}:{mm}",
          textStyle: {
            color: "#ffffff",
          },
        },
        splitLine: {
          show: false,
          opacity: 1,
          lineStyle: {
            color: "#0277ada9",
            width: 1,
          },
        },
        splitArea: {
          interval: "auto",
          show: false,
        },
      },
      yAxis: {
        type: "value",
        splitNumber: 8,
        boundaryGap: [0, "100%"],
        min: function (range) {
          return range.min - 5;
        },
        max: function (range) {
          return range.max + 5;
        },
        axisLine: {
          show: true,
        },
        axisLabel: {
          show: true,
          formatter: "{value}",
          textStyle: {
            color: "#ffffff",
          },
        },
        splitLine: {
          show: false,
          lineStyle: {
            color: "#0277ada9",
            width: 1,
          },
        },
      },
      series: [
        {
          name: "SpO2",
          type: "line",
          showSymbol: true,
          connectNulls: false,
          data: spo2_data,
          lineStyle: {
            color: "#00e676",
            width: 1.5,
          },
        },
      ],
    };

    blood_oxygen_graph.clear();
    blood_oxygen_graph.setOption(blood_oxygen_opt);

    console.log("[history_UI_module.js] Completed Blod Oxygen Graph");
  } catch (error) {
    console.error(" [history_UI_module.js] Error in history_Blood_Oxygen function:", error);
  }
}

/**
 * Plot Temperature values from the min_time to max_time
 * @param {number|string} min_time - Start Date and time in epoch
 * @param {number|string} max_time - End Date and time in epoch
 * @param {Array} temperature - Values of Temperature with Date and time in epoch
 * @param {string} id - Patient ID
 * @returns {void}
 */
function history_temperature(min_time, max_time, temperature, id) {
  try {
    if (!$("#temperature_echart_content").length) {
      return;
    }

    var temp_data = temperature || [];

    if (!Array.isArray(temp_data)) {
      temp_data = [];
    }

    if (Array.isArray(temp_data) && temp_data.length > 1) {
      temp_data = addTimeGapsForMissingData(temp_data, 1.5);
    }

    if (Array.isArray(temp_data)) {
      temp_data.unshift([min_time * 1000, null]);
      temp_data.push([max_time * 1000, null]);
    }

    temperature_opt = {
      grid: {
        top: 30,
        left: 30,
        right: 30,
        bottom: 80,
      },
      tooltip: {
        trigger: "axis",
        formatter: formatTooltipWithValues,
        axisPointer: {
          show: false,
        },
        textStyle: {
          color: "#4C5964",
          fontSize: 12,
        },
      },
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0],
          zoomOnMouseWheel: "ctrl",
          moveOnMouseMove: true,
          moveOnMouseWheel: true,
          filterMode: "none",
          realtime: true,
          start: 0,
          end: 100,
          minSpan: 0.1,
        },
        {
          type: "slider",
          xAxisIndex: [0],
          handleIcon: "pin",
          show: true,
          showDetail: false,
          handleSize: "100%",
          height: 25,
          handleStyle: {
            color: "#0865C1",
            borderColor: "#ACB8D1",
            borderWidth: 1,
          },
          start: 0,
          end: 100,
        },
      ],
      xAxis: {
        name: "Time",
        nameLocation: "end",
        nameGap: 3,
        type: "time",
        min: "dataMin",
        max: "dataMax",
        axisLabel: {
          rotate: 40,
          show: true,
          margin: 12,
          hideOverlap: true,
          fontStyle: "oblique",
          fontSize: 10,
          formatter: "{d}-{MM}" + "\n" + "{HH}:{mm}",
          textStyle: {
            color: "#ffffff",
          },
        },
        splitLine: {
          show: false,
          opacity: 1,
          lineStyle: {
            color: "#0277ada9",
            width: 1,
          },
        },
        splitArea: {
          interval: "auto",
          show: false,
        },
      },
      yAxis: {
        type: "value",
        splitNumber: 8,
        boundaryGap: [0, "100%"],
        min: function (range) {
          return range.min - 5;
        },
        max: function (range) {
          return range.max + 5;
        },
        axisLine: {
          show: true,
        },
        axisLabel: {
          show: true,
          formatter: "{value}",
          textStyle: {
            color: "#ffffff",
          },
        },
        splitLine: {
          show: false,
          lineStyle: {
            color: "#0277ada9",
            width: 1,
          },
        },
      },
      series: [
        {
          name: "Temperature",
          type: "line",
          showSymbol: true,
          connectNulls: false,
          data: temp_data,
          lineStyle: {
            color: "#ffca28",
            width: 1.5,
          },
        },
      ],
    };

    temperature_graph.clear();
    temperature_graph.setOption(temperature_opt);

    console.log(" [history_UI_module.js] Completed Temperature Graph ");
  } catch (error) {
    console.error(" [history_UI_module.js] Error in history_temperature function:", error);
  }
}
/**
 * Plot Blood Pressure values from the min_time to max_time
 * @param {number|string} min_time - Start Date and time in epoch
 * @param {number|string} max_time - End Date and time in epoch
 * @param {Array} blood_pressure - Values of BP with Date and time in epoch
 * @param {string} id - Patient ID
 * @returns {void}
 */
function history_Blood_presure(min_time, max_time, blood_pressure, id) {
  try {
    if (!$("#blood_pressure_echart_content").length) {
      return;
    }

    var bp_data = blood_pressure || [];

    if (!Array.isArray(bp_data)) {
      bp_data = [];
    }

    if (Array.isArray(bp_data) && bp_data.length > 1) {
      bp_data = addTimeGapsForMissingData(bp_data, 1.5);
    }

    if (Array.isArray(bp_data)) {
      bp_data.unshift([min_time * 1000, null]);
      bp_data.push([max_time * 1000, null]);
    }

    // Split blood pressure into SBP and DBP series
    var sbp_data = [];
    var dbp_data = [];

    bp_data.forEach(function (point) {
      var timestamp = point[0];
      var sbp = point[1];
      var dbp = point[2];

      // For boundary/null points, keep timestamp with null values
      if (point.length < 3) {
        sbp_data.push([timestamp, null]);
        dbp_data.push([timestamp, null]);
      } else {
        sbp_data.push([timestamp, sbp]);
        dbp_data.push([timestamp, dbp]);
      }
    });

    blood_pressure_opt = {
      grid: {
        top: 30,
        left: 30,
        right: 30,
        bottom: 80,
      },
      tooltip: {
        trigger: "axis",
        formatter: formatTooltipWithValues,
        axisPointer: {
          show: false,
        },
        textStyle: {
          color: "#4C5964",
          fontSize: 12,
        },
      },
      legend: {
        show: true,
        top: 5,
        textStyle: {
          color: "#ffffff",
          fontSize: 11,
        },
      },
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0],
          zoomOnMouseWheel: "ctrl",
          moveOnMouseMove: true,
          moveOnMouseWheel: true,
          filterMode: "none",
          realtime: true,
          start: 0,
          end: 100,
          minSpan: 0.1,
        },
        {
          type: "slider",
          xAxisIndex: [0],
          handleIcon: "pin",
          show: true,
          showDetail: false,
          handleSize: "100%",
          height: 25,
          handleStyle: {
            color: "#0865C1",
            borderColor: "#ACB8D1",
            borderWidth: 1,
          },
          start: 0,
          end: 100,
        },
      ],
      xAxis: {
        name: "Time",
        nameLocation: "end",
        nameGap: 3,
        type: "time",
        min: "dataMin",
        max: "dataMax",
        axisLabel: {
          rotate: 40,
          show: true,
          margin: 12,
          hideOverlap: true,
          fontStyle: "oblique",
          fontSize: 10,
          formatter: "{d}-{MM}" + "\n" + "{HH}:{mm}",
          textStyle: {
            color: "#ffffff",
          },
        },
        splitLine: {
          show: false,
          opacity: 1,
          lineStyle: {
            color: "#0277ada9",
            width: 1,
          },
        },
        splitArea: {
          interval: "auto",
          show: false,
        },
      },
      yAxis: {
        type: "value",
        splitNumber: 8,
        boundaryGap: [0, "100%"],
        min: function (range) {
          return range.min - 5;
        },
        max: function (range) {
          return range.max + 5;
        },
        axisLine: {
          show: true,
        },
        axisLabel: {
          show: true,
          formatter: "{value}",
          textStyle: {
            color: "#ffffff",
          },
        },
        splitLine: {
          show: false,
          lineStyle: {
            color: "#0277ada9",
            width: 1,
          },
        },
      },
      series: [
        {
          name: "SBP",
          type: "line",
          showSymbol: true,
          connectNulls: false,
          data: sbp_data,
          lineStyle: {
            color: "#8e24aa", // violet for SBP
            width: 1.5,
          },
        },
        {
          name: "DBP",
          type: "line",
          showSymbol: true,
          connectNulls: false,
          data: dbp_data,
          lineStyle: {
            color: "#0d47a1", // dark blue for DBP
            width: 1.5,
          },
        },
      ],
    };

    blood_pressure_graph.clear();
    blood_pressure_graph.setOption(blood_pressure_opt);

    console.log(" [history_UI_module.js] Completed Blood Pressure Graph ");
  } catch (error) {
    console.error(" [history_UI_module.js] Error in history_Blood_presure function:", error);
  }
}
/**
 * Plot RR values from the min_time to max_time
 * @param {number|string} min_time Start Date and time in epoch
 * @param {number|string} max_time End Date and time in epoch
 * @param {Array} respiration_rate Values of RR with Date and time in epoch
 * @param {string} id Patient ID
 * @returns {void}
 */
function history_Respiration_Rate(min_time, max_time, respiration_rate, id) {
  try {
    if (!$("#respiration_rate_echart_content").length) {
      return;
    }

    var rr_data = respiration_rate || [];

    if (!Array.isArray(rr_data)) {
      rr_data = [];
    }

    if (Array.isArray(rr_data) && rr_data.length > 1) {
      rr_data = addTimeGapsForMissingData(rr_data, 1.5);
    }

    if (Array.isArray(rr_data)) {
      rr_data.unshift([min_time * 1000, null]);
      rr_data.push([max_time * 1000, null]);
    }

    Respiration_opt = {
      grid: {
        top: 30,
        left: 30,
        right: 30,
        bottom: 80,
      },
      tooltip: {
        trigger: "axis",
        formatter: formatTooltipWithValues,
        axisPointer: {
          show: false,
        },
        textStyle: {
          color: "#4C5964",
          fontSize: 12,
        },
      },
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0],
          zoomOnMouseWheel: "ctrl",
          moveOnMouseMove: true,
          moveOnMouseWheel: true,
          filterMode: "none",
          realtime: true,
          start: 0,
          end: 100,
          minSpan: 0.1,
        },
        {
          type: "slider",
          xAxisIndex: [0],
          handleIcon: "pin",
          show: true,
          showDetail: false,
          handleSize: "100%",
          height: 25,
          handleStyle: {
            color: "#0865C1",
            borderColor: "#ACB8D1",
            borderWidth: 1,
          },
          start: 0,
          end: 100,
        },
      ],
      xAxis: {
        name: "Time",
        nameLocation: "end",
        nameGap: 3,
        type: "time",
        min: "dataMin",
        max: "dataMax",
        axisLabel: {
          rotate: 40,
          show: true,
          margin: 12,
          hideOverlap: true,
          fontStyle: "oblique",
          fontSize: 10,
          formatter: "{d}-{MM}" + "\n" + "{HH}:{mm}",
          textStyle: {
            color: "#ffffff",
          },
        },
        splitLine: {
          show: false,
          opacity: 1,
          lineStyle: {
            color: "#0277ada9",
            width: 1,
          },
        },
        splitArea: {
          interval: "auto",
          show: false,
        },
      },
      yAxis: {
        type: "value",
        splitNumber: 8,
        boundaryGap: [0, "100%"],
        min: function (range) {
          return range.min - 5;
        },
        max: function (range) {
          return range.max + 5;
        },
        axisLine: {
          show: true,
        },
        axisLabel: {
          show: true,
          formatter: "{value}",
          textStyle: {
            color: "#ffffff",
          },
        },
        splitLine: {
          show: false,
          lineStyle: {
            color: "#0277ada9",
            width: 1,
          },
        },
      },
      series: [
        {
          name: "Respiration Rate",
          type: "line",
          showSymbol: true,
          connectNulls: false,
          data: rr_data,
          lineStyle: {
            color: "#ab47bc",
            width: 1.5,
          },
        },
      ],
    };

    Respiration_graph.clear();
    Respiration_graph.setOption(Respiration_opt);

    console.log(" [history_UI_module.js] Completed Respiration Rate Graph ");
  } catch (error) {
    console.error(" [history_UI_module.js] Error in history_Respiration_Rate function:", error);
  }
}

/**
 * Plot point when trigger are genrated in Threshold_trigers
 * @param {number|string} min_time Start Date and time in epoch
 * @param {number|string} max_time End Date and time in epoch
 * @param {Array} threshold_triggers Threshold triggers data
 * @param {string} id Patient ID
 * @returns {void} No return params but when point is clicked it opens a popup
 */
function history_threshold_triggers(min_time, max_time, threshold_triggers, id) {
  try {
    if (!$("#threshold_notifications_echart_content").length) {
      return;
    }

    var context_data = threshold_triggers || [];

    context_data.unshift([min_time * 1000, null]);
    context_data.push([max_time * 1000, null]);

    threshold_notifications_opt = {
      grid: {
        top: 30,
        left: 30,
        right: 30,
        bottom: 80,
      },
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0],
          zoomOnMouseWheel: "ctrl",
          moveOnMouseMove: true,
          moveOnMouseWheel: true,
          filterMode: "none",
          realtime: true,
          start: 0,
          end: 100,
          minSpan: 0.1,
        },
        {
          type: "slider",
          xAxisIndex: [0],
          handleIcon: "pin",
          show: true,
          showDetail: false,
          handleSize: "100%",
          height: 25,
          handleStyle: {
            color: "#0865C1",
            borderColor: "#ACB8D1",
            borderWidth: 1,
          },
          start: 0,
          end: 100,
        },
      ],

      xAxis: {
        name: "Time",
        nameLocation: "end",
        nameGap: 1,
        type: "time",
        boundaryGap: true,
        scale: true,
        min: "dataMin",
        max: "dataMax",
        axisTick: {
          show: false,
        },
        axisLabel: {
          rotate: 40,
          show: true,
          margin: 12,
          hideOverlap: true,
          fontStyle: "oblique",
          fontSize: 10,
          formatter: "{d}-{MM}" + "\n" + "{HH}:{mm}",
          textStyle: {
            color: "#ffffff",
          },
        },
        splitLine: {
          show: false,
          opacity: 1,
          lineStyle: {
            color: "#0277ada9",
            width: 1,
          },
        },
        splitArea: {
          interval: "auto",
          show: false,
        },
      },

      yAxis: {
        type: "value",
        boundaryGap: [0, "100%"],
        min: function (finaldata) {
          return finaldata.min - 5;
        },
        max: function (finaldata) {
          return finaldata.max + 5;
        },
        splitLine: {
          show: false,
          lineStyle: {
            color: "#0277ada9",
            width: 1,
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
        minorSplitLine: {
          show: false,
          lineStyle: {
            color: "#2178a049",
          },
        },
      },
      tooltip: {
        trigger: "axis",
        formatter: "Time : {dd}/{MM}/{yy}" + "\n" + "{HH}:{mm}",
        axisPointer: {
          show: false,
        },
        textStyle: {
          color: "#4C5964",
          fontSize: 12,
        },
      },

      series: [
        {
          name: "Time:",
          type: "scatter",
          showSymbol: false,
          data: context_data,
          symbol: "circle",
          symbolSize: 10,
        },
      ],
    };

    threshold_notifications_graph.clear();
    threshold_notifications_graph.setOption(threshold_notifications_opt);

    if (typeof threshold_notifications_graph.off === "function") {
      threshold_notifications_graph.off("click");
    }

    threshold_notifications_graph.on("click", function (param) {
      var timestamp = param.data[0];
      var param1 = btoa(timestamp / 1000);
      var param2 = btoa(id);
      var param3 = btoa("1");

      var url = "context_assment.html" + "?param1=" + param1 + "&param2=" + param2 + "&param3=" + param3;
      openModal(url);
    });
  } catch (error) {
    console.error(" [history_UI_module.js] Error in history_context_assessment function:", error);
  }
}

var parentDoc = window.parent && window.parent.document ? window.parent.document : document;

var modal = parentDoc.getElementById("myModal_2");
var modal_ecg = parentDoc.getElementById("myModal_3");

var span = modal ? modal.getElementsByClassName("close")[0] : null;
if (span) {
  span.addEventListener("click", closeModal);
}

var spanEcg = modal_ecg ? modal_ecg.getElementsByClassName("close")[0] : null;
if (spanEcg) {
  spanEcg.addEventListener("click", closeModal_ecg);
}

/**
 * Open the context-assessment modal inside the parent document iframe.
 * @param {string} pageUrl
 * @returns {void}
 */
function openModal(pageUrl) {
  if (!modal) {
    console.warn("[context_assessment_UI_2.js] myModal_2 not found on parent document");
    return;
  }

  var iframe = parentDoc.getElementById("iframeContent_2");
  if (!iframe) {
    console.warn("[context_assessment_UI_2.js] iframeContent_2 not found on parent document");
    return;
  }

  console.log("pageurl", pageUrl);
  iframe.src = pageUrl;
  modal.style.display = "block";
}

/**
 * Open the ECG drill-down modal inside the parent document iframe.
 * @param {string} pageUrl
 * @returns {void}
 */
function openModal_ecg(pageUrl) {
  if (!modal_ecg) {
    console.warn("[context_assessment_UI_2.js] myModal_3 not found on parent document");
    return;
  }

  var iframe = parentDoc.getElementById("iframeContent_3");
  if (!iframe) {
    console.warn("[context_assessment_UI_2.js] iframeContent_3 not found on parent document");
    return;
  }

  console.log("pageurl", pageUrl);
  iframe.src = pageUrl;
  modal_ecg.style.display = "block";
}

/**
 * Close the context-assessment modal and clear its iframe source.
 * @returns {void}
 */
function closeModal() {
  if (!modal) {
    return;
  }

  var iframe = parentDoc.getElementById("iframeContent_2");
  if (iframe) {
    iframe.src = "";
  }
  modal.style.display = "none";
}

/**
 * Close the ECG modal and clear its iframe source.
 * @returns {void}
 */
function closeModal_ecg() {
  if (!modal_ecg) {
    return;
  }

  var iframe = parentDoc.getElementById("iframeContent_3");
  if (iframe) {
    iframe.src = "";
  }
  modal_ecg.style.display = "none";
}

if (window.parent) {
  window.parent.addEventListener("click", function (event) {
    console.log("Clicked outside modal, event target:", event.target);
    if (event.target === modal) {
      closeModal();
    } else if (event.target === modal_ecg) {
      closeModal_ecg();
    }
  });
}

export { history_ECG, history_Heart_Rate, history_Blood_Oxygen, history_temperature, history_Blood_presure, history_Respiration_Rate, history_threshold_triggers, history_context_assessment_2 };
