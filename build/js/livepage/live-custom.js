/**
 * Update EWS value on the live page.
 * @param {number|string} ews_value - The EWS value to display.
 * @param {string} ews_color - The color to use for the EWS bar.
 * @returns {void}
 */
function ews_value_passing(ews_value, ews_color) {
  try {
    const cardContainer = document.getElementById("ews_id");
    const scoreElement = document.getElementById("ews_id1");
    const colorBar = document.getElementById("ews_color1");
    const ewsSection = cardContainer ? cardContainer.closest(".live-ews-surface") : null;

    if (!cardContainer || !scoreElement || !colorBar) {
      return;
    }

    // Treat missing/placeholder or non-numeric values as "no data" and hide the card
    const parsedScore = Number(ews_value);
    const isNoData = ews_value === undefined || ews_value === null || ews_value === "" || ews_value === "--" || typeof ews_value === "object" || !Number.isFinite(parsedScore);

    if (isNoData) {
      scoreElement.innerHTML = "";
      colorBar.style.backgroundColor = "#ffffff00";
      cardContainer.style.display = "none";
      ewsSection?.classList.remove("is-visible");
      return;
    }

    ewsSection?.classList.add("is-visible");
    cardContainer.style.display = "block";
    colorBar.style.backgroundColor = ews_color || colorBar.style.backgroundColor || "#ffffff";
    scoreElement.innerHTML = "EWS Score - " + parsedScore;
  } catch (e) {
    console.log("[live-custom.js] Error in ews_value_passing:", e);
  }
}
/**
 * Update ECG data on the live page.
 * @param {Array<number>} LiveEcgValues - The live ECG values.
 * @param {string} ecgdate - The date of the ECG data.  (Not Used)
 * @param {string} ecgtime - The time of the ECG data. (Not Used)
 * @param {Object} option1 - The chart options. (Not Used)
 * @param {number} value - The value to display. (Not Used)
 * @param {Array<number>} ecgdata - The ECG data array. (Not Used)
 * @param {number} endzoom - The end zoom value for the chart.
 * @returns {void}
 */
function ECG_data_passing(LiveEcgValues, ecgdate, ecgtime, option1, value, ecgdata, endzoom) {
  var EcgData;
  var contextECG;
  var echartLine;
  var value1;
  var echartLinecontext;
  if ($("#LiveECGId").length) {
    // console.log("Live  in echarts");
    echartLine = echarts.init(document.getElementById("LiveECGId"));
    EcgData = LiveEcgValues;
  }
  // console.log("[live-custom.js] EcgData received:", EcgData ? EcgData.length : "null/undefined");

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
    //console.log("inside randomdata",value1)
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
    console.error("[live-custom.js] Error in processing EcgData.length:", e);
  }
  var isZoomed = false;
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
      top: 5,
      left: 40,
      right: 40,
      bottom: 52,
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
        //endValue:[],
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
        show: false, // Hide full Line
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
      //scale: true ,
      //splitNumber:8,
      splitLine: {
        lineStyle: {
          color: "#0686AF",
          width: 1.2,
        },
      },
      /* min: function (value) {
						return value.min -40;
					}, */
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
        show: false, // Hide full Line
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
        //symbol: 'emptyCircle' ,
        //hoverAnimation: false,
        data: data,
        animation: false,
        smooth: false,
        lineStyle: {
          color: "#ffffff",
          width: 1.6,
          //miterLimit: 10 ,
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

      if ($("#context_ecg").length) {
        echartLinecontext.clear();
        echartLinecontext.setOption(option1);
      } else if ($("#LiveECGId").length) {
        echartLine.clear();
        echartLine.setOption(option1);
      }
    } else {
      if ($("#LiveECGId").length) {
        echartLine.setOption(plot);
        if (endzoom !== 0) {
          echartLine.dispatchAction({
            type: "dataZoom",
            endValue: endzoom,
          });
        }
      }
      echartLine.on("dataZoom", function (params) {
        // console.log(params.start, params.end);
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
    console.log("Error:", e.message);
  }
}
/**
 * Update PPG data on the live page
 * @param {Array<number>} LivePpgValues - The live PPG values.
 * @param {string} ecgdate - The date of the ECG data. (Not Used)
 * @param {string} ecgtime - The time of the ECG data. (Not Used)
 * @param {Object} option1 - The chart options. (Not Used)
 * @param {number} value - The value to display. (Not Used)
 * @param {Array<number>} ppgdata - The PPG data array. (Not Used)
 * @param {number} endzoom - The end zoom value for the chart.
 * @returns {void}
 */
function PPG_data_passing(LivePpgValues, ecgdate, ecgtime, option1, value, ppgdata, endzoom) {
  if (window.location.pathname.includes("context_assment.html")) return;

  var PpgData = [];
  var echartLine;
  var echartLinecontext;
  var value1;
  var ppgOption; // Renamed to avoid conflict with parameter
  var counter = 0;
  var minValidPpgPoints = 120;

  if ($("#context_ppg").length) {
    echartLinecontext = echarts.init(document.getElementById("context_ppg"));
    PpgData = Array.isArray(ppgdata) ? ppgdata : [];
  } else if ($("#LivePPGId").length) {
    echartLine = echarts.init(document.getElementById("LivePPGId"));
    PpgData = Array.isArray(LivePpgValues) ? LivePpgValues : [];
  }
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
    console.error("[live-custom.js] Error in processing PpgData:", e);
  }

  try {
    if (PpgData.length < minValidPpgPoints) {
      ppgOption = {
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

      if ($("#context_ppg").length && echartLinecontext) {
        echartLinecontext.setOption(ppgOption, true);
      } else if ($("#LivePPGId").length) {
        echartLine.setOption(ppgOption, true);
      }
    } else {
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
              /* iconStyle: {
									// color: '#ffffff',
									borderColor: '#6E6E6E' ,
									borderWidth: 1,
									opacity:'0.5',
									fill:'#fff',
								}, */
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
          // min:Math.min(...data) -20,
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
            //symbol: 'emptyCircle' ,
            //hoverAnimation: false,
            data: data,
            animation: false,
            smooth: true,
            lineStyle: {
              color: "#FFFFFF",
              width: 1.6,
              //miterLimit: 10 ,
            },
            labelLine: {
              show: false,
            },
            seriesLayoutBy: "column",
          },
        ],
      };
      if ($("#context_ppg").length && echartLinecontext) {
        // console.log("[live-custom.js] Setting option for context PPG");
        echartLinecontext.setOption(ppgOption, true);
        if (endzoom !== 0) {
          echartLinecontext.dispatchAction({
            type: "dataZoom",
            endValue: endzoom,
          });
        }
      } else if ($("#LivePPGId").length) {
        // console.log("[live-custom.js] Setting option for Live PPG");
        echartLine.setOption(ppgOption, true);
        if (endzoom !== 0) {
          echartLine.dispatchAction({
            type: "dataZoom",
            endValue: endzoom,
          });
        }
      }
    }
  } catch (e) {
    console.error("[live-custom.js] Error in building PPG chart:", e);
  }
}

/**
 * Update Respiration Rate (RR) data on the live page.
 * @param {Array<number>} LiveRrValues - The live RR values.
 * @param {string} rrdate - The date of the RR data. (Not Used)
 * @param {string} rrtime - The time of the RR data. (Not Used)
 * @param {Object} option1 - The chart options. (Not Used)
 * @param {number} value - The value to display. (Not Used)
 * @param {Array<number>} rrdata - The RR data array. (Not Used)
 * @param {number} endzoom - The end zoom value for the chart.
 * @returns {void}
 */
function RR_data_passing(LiveRrValues, rrdate, rrtime, option1, value, rrdata, endzoom) {
  if (!$("#LiveRRId").length) return;
  try {
    const echartLine = echarts.init(document.getElementById("LiveRRId"));
    var RrData = Array.isArray(LiveRrValues) ? LiveRrValues : [];
    var data = [];
    var value1;
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
      if (RrData.length === 0) return { value: [0, 0] };
      value1 = Number(RrData[counter % RrData.length]);
      counter++;
      return {
        value: [counter % RrData.length, Number.isFinite(value1) ? value1 : 0],
      };
    }
    try {
      for (var i = 1; i < RrData.length; i++) {
        data.push(randomData());
      }
      data = smoothRRSeries(data, 7);
    } catch (e) {
      console.error("[live-custom.js] Error in processing RrData:", e);
    }
    // y padding
    // const yMin = RrData.length ? Math.min(...RrData) : 0;
    // const yMax = RrData.length ? Math.max(...RrData) : 1;
    // const pad = Math.max((yMax - yMin) * 0.05, 1);

    let option;
    if (data.length < 120) {
      option = {
        title: {
          text: "WAITING FOR VALID RR",
          textStyle: {
            fontSize: "18",
            fontFamily: "Verdana",
            color: "#0686AF",
          },
          left: "center",
          top: "middle",
        },
        xAxis: { show: false },
        yAxis: { show: false },
        series: [],
      };
    } else {
      option = {
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
                echartLine.dispatchAction({ type: "dataZoom", start: 0, endValue: endzoom });
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
            showDetail: false,
            height: 25,
            handleIcon: "pin",
            handleStyle: { color: "#0865C1", borderColor: "#ACB8D1", borderWidth: 1 },
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
          // min:Math.min(...data) -20,
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
            name: "RR",
            type: "line",
            xAxisIndex: 0,
            yAxisIndex: 0,
            showSymbol: false,
            //symbol: 'emptyCircle' ,
            //hoverAnimation: false,
            data: data,
            animation: false,
            smooth: 0.7,
            sampling: "average",
            lineStyle: {
              color: "#FFFFFF",
              width: 1.6,
              //miterLimit: 10 ,
            },
            labelLine: {
              show: false,
            },
            seriesLayoutBy: "column",
          },
        ],
      };
    }
    if ($("#context_rr").length && echartLinecontext) {
      // console.log("[live-custom.js] Setting option for context RR");
      echartLinecontext.setOption(option, true);
      if (endzoom !== 0) {
        echartLinecontext.dispatchAction({
          type: "dataZoom",
          endValue: endzoom,
        });
      }
    } else if ($("#LiveRRId").length) {
      // console.log("[live-custom.js] Setting option for Live RR");
      echartLine.setOption(option, true);
      if (endzoom !== 0) {
        echartLine.dispatchAction({
          type: "dataZoom",
          endValue: endzoom,
        });
      }
    }
    // echartLine.setOption(option, true);
  } catch (e) {
    console.error("[live-custom.js] Error in RR_data_passing:", e);
  }
}
/**
 * Update Heart Rate (HR) data on the live page and context assessment.
 * @param {number|string} LiveHeartrate - The live heart rate value.
 * @param {number|string} ContextHeartrate - The context heart rate value.
 * @returns {void}
 */
function heartrate_data(LiveHeartrate, ContextHeartrate) {
  // console.log("[live-custom.js] Calling Heart rate *******88", ContextHeartrate);
  var LiveHRId;
  var ContextHRId;

  var RawechartGauge = {
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        center: ["49%", "51%"],
        radius: "100%",
        min: 0,
        max: 1.8,
        splitNumber: 8,

        axisLine: {
          lineStyle: {
            width: 10,
            /*color: [
					  [0.25, '#FF6E76'],
					  [0.5, '#FDDD60'],
					  [0.75, '#58D9F9'],
					  [1, '#7CFFB2']*/
            color: [
              [0.225, "#D56868"], //40-red
              [0.28, "#F5DB00"], //50-yello
              [0.5, "#98BF64"], //90-Green
              [0.615, "#F5DB00"], //110-yello
              [0.725, "#FFB601"], //130-orange
              [1, "#D56868"], //150-red
            ],
          },
        },
        pointer: {
          show: true,
          icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
          length: "15%",
          width: 10,
          offsetCenter: [0, "-60%"],
          itemStyle: {
            color: "auto",
          },
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        splitLine: {
          length: 0,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        axisLabel: {
          show: false,
        },
        title: {
          offsetCenter: [0, "10%"],
          fontSize: 0,
        },
        detail: {
          fontSize: 20,
          offsetCenter: [0, "10%"],
          valueAnimation: true,
          formatter: function (value) {
            var data = Math.round(value * 100);
            return (data = data == 0 || isNaN(data) ? (data = "- -") : data + " bpm");
            //return value+'bpm';
          },
          color: "white",
        },
        data: [
          {
            value: [],
            name: "HR",
          },
        ],
      },
    ],
  };

  if ($("#ContextHeartRateId").length) {
    ContextHRId = echarts.init(document.getElementById("ContextHeartRateId"));
    if (ContextHeartrate !== "") {
      var echartGauge1 = RawechartGauge;
      var d1 = ContextHeartrate;
      echartGauge1.series[0].data[0].value = d1;

      if (isNaN(d1) || d1 == 0 || d1 === undefined || d1 === "" || d1 === null) {
        echartGauge1.series[0].pointer.show = false;
      } else {
        echartGauge1.series[0].pointer.show = true;
      }

      ContextHRId.setOption(echartGauge1);
    }
  } else if ($("#LiveHeartRateId").length) {
    LiveHRId = echarts.init(document.getElementById("LiveHeartRateId"));
    var echartGauge2 = RawechartGauge;
    var d = LiveHeartrate;
    echartGauge2.series[0].data[0].value = d;

    if (isNaN(d) || d == 0 || d === undefined || d === "" || d === null) {
      echartGauge2.series[0].pointer.show = false;
    } else {
      echartGauge2.series[0].pointer.show = true;
    }

    LiveHRId.setOption(echartGauge2);
  }
}
/*********************** EOF of Heart Rate ****************************/

/***************************  BloodOxygen(spo2) ***********************/
// Shared normalizer so both live and context SPO2 can reuse it.
/**
 * Normalize SpO2 input so both percent values and fractional values can drive the gauge.
 * @param {number|string} value
 * @returns {number}
 */
function normalizeSpO2(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    return NaN;
  }

  // If value looks like a percentage (e.g. 90–100), convert to 0–1.
  if (n > 1.5) {
    return n / 100;
  }

  return n;
}

/**
 * Update Blood Oxygen (SpO2) data on the live page and context assessment.
 * @param {number|string} LiveBloodOxygen - The live blood oxygen value.
 * @returns {void}
 */
function blood_oxygen_data(LiveBloodOxygen) {
  // console.log("[live-custom.js] Calling blood_oxygen_data (live)", {
  // LiveBloodOxygen,
  // ContextBloodOxygen,
  // });

  var LiveBloodOxygenId;
  // var ContextBloodOxygenId;

  var RawechartGauge = {
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        center: ["49%", "51%"],
        radius: "100%",
        min: 0.9,
        max: 0.96,
        splitNumber: 4,
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.2, "#D56868"], //40-red
              [0.55, "#FFB601"], //130-orange
              [0.85, "#F5DB00"], //50-yello
              [1.05, "#98BF64"], //90-green
              //[0.64, '#F5DB00'],//110-yello
              //[0.72,'#FFB601'],//130-orange
              //[1, '#D56868'],//150-red
            ],
          },
        },
        pointer: {
          icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
          length: "15%",
          width: 10,
          offsetCenter: [0, "-60%"],
          itemStyle: {
            color: "auto",
          },
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        splitLine: {
          length: 0,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        axisLabel: {
          show: false,
        },
        title: {
          offsetCenter: [0, "-10%"],
          fontSize: 0,
        },
        detail: {
          fontSize: 20,
          offsetCenter: [0, "10%"],
          valueAnimation: true,
          formatter: function (value) {
            var data = Math.round(value * 100);
            return (data = data == 0 || isNaN(data) ? "- -" : data + " %");
          },
          color: "white",
        },
        data: [
          {
            value: [],
            name: "SPO2",
          },
        ],
      },
    ],
  };
  //console.log("ContextBloodOxygen data is :",ContextBloodOxygen);
  // if ($("#ContextBloodOxygenId").length) {
  //   ContextBloodOxygenId = echarts.init(document.getElementById("ContextBloodOxygenId"));
  //   var echartGauge1 = RawechartGauge;
  //   var d1 = normalizeSpO2(ContextBloodOxygen);
  //   if (isNaN(d1) || d1 === 0 || d1 === undefined || d1 === "" || d1 === null) {
  //     echartGauge1.series[0].pointer.show = false;
  //   } else {
  //     echartGauge1.series[0].pointer.show = true;
  //   }
  //   echartGauge1.series[0].data[0].value[0] = d1;
  //   ContextBloodOxygenId.setOption(echartGauge1);
  // } else
  if ($("#LiveBloodOxygenId").length) {
    LiveBloodOxygenId = echarts.init(document.getElementById("LiveBloodOxygenId"));
    var echartGauge2 = RawechartGauge;
    var d = normalizeSpO2(LiveBloodOxygen);
    // console.log("[live-custom.js] LiveBloodOxygen (normalized)", d);
    if (isNaN(d) || d === 0 || d === undefined || d === "" || d === null) {
      echartGauge2.series[0].pointer.show = false;
    } else {
      echartGauge2.series[0].pointer.show = true;
    }
    echartGauge2.series[0].data[0].value = d;
    LiveBloodOxygenId.setOption(echartGauge2);
  }
}

/**
 * Update Blood Oxygen (SpO2) data for context assessment.
 * @param {number|string} ContextBloodOxygen - The context blood oxygen value.
 * @returns {void}
 */
function blood_oxygen_data_context(ContextBloodOxygen) {
  console.log("[live-custom.js] Calling blood_oxygen_data_context", {
    ContextBloodOxygen,
  });

  if (!$("#ContextBloodOxygenId").length) {
    return;
  }

  var ContextBloodOxygenId = echarts.init(document.getElementById("ContextBloodOxygenId"));

  var RawechartGauge = {
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        center: ["49%", "51%"],
        radius: "100%",
        min: 0.9,
        max: 0.96,
        splitNumber: 4,
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.2, "#D56868"],
              [0.55, "#FFB601"],
              [0.85, "#F5DB00"],
              [1.05, "#98BF64"],
            ],
          },
        },
        pointer: {
          icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
          length: "15%",
          width: 10,
          offsetCenter: [0, "-60%"],
          itemStyle: {
            color: "auto",
          },
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        splitLine: {
          length: 0,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        axisLabel: {
          show: false,
        },
        title: {
          offsetCenter: [0, "-10%"],
          fontSize: 0,
        },
        detail: {
          fontSize: 15,
          offsetCenter: [0, "10%"],
          valueAnimation: true,
          formatter: function (value) {
            var data = Math.round(value * 100);
            return (data = data == 0 || isNaN(data) ? "- -" : data + " %");
          },
          color: "white",
        },
        data: [
          {
            value: [],
            name: "SPO2",
          },
        ],
      },
    ],
  };

  var echartGauge = RawechartGauge;
  var d = normalizeSpO2(ContextBloodOxygen);
  if (isNaN(d) || d === 0 || d === undefined || d === "" || d === null) {
    echartGauge.series[0].pointer.show = false;
  } else {
    echartGauge.series[0].pointer.show = true;
  }
  // ECharts gauge expects a numeric value; use direct assignment
  // instead of value[0] to avoid undefined behavior.
  echartGauge.series[0].data[0].value = d;
  ContextBloodOxygenId.setOption(echartGauge);
}

/**
 * Update Temperature data for live and context assessment.
 * @param {number|string} LiveTemperature - The live temperature value.
 * @param {number|string} ContextTemperature - The context temperature value.
 * @returns {void}
 */

function temperature_data(LiveTemperature, ContextTemperature) {
  // Convert inputs to strings if they are not already
  // console.log("[live-custom.js] LiveTemperature 1", LiveTemperature);
  // console.log("[live-custom.js] Calling temperature_data", ContextTemperature);

  LiveTemperature = String(LiveTemperature);
  ContextTemperature = String(ContextTemperature);

  var LiveTemperatureId;
  var ContextTemperatureId;

  var RawechartGauge = {
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        center: ["50%", "58%"],
        radius: "100%",
        // Use Celsius directly
        min: 30,
        max: 45,
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.2, "#D56868"],
              [0.5, "#F5DB00"],
              [0.8, "#98BF64"],
              [1, "#FFB601"],
            ],
          },
        },
        pointer: {
          icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
          length: "15%",
          width: 10,
          offsetCenter: [0, "-60%"],
          itemStyle: {
            color: "auto",
          },
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        splitLine: {
          length: 0,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        axisLabel: {
          show: false,
        },
        title: {
          offsetCenter: [0, "-10%"],
          fontSize: 0,
        },
        detail: {
          fontSize: 20,
          offsetCenter: [0, "20%"],
          valueAnimation: true,
          formatter: function (value) {
            const v = Number(value);
            if (!isFinite(v) || v <= 0) return "--";
            return v + "\u2103";
          },
          color: "white",
        },
        data: [
          {
            value: [],
            name: "Temperature",
          },
        ],
      },
    ],
  };

  if ($("#ContextTemperatureId").length) {
    ContextTemperatureId = echarts.init(document.getElementById("ContextTemperatureId"));
    // console.log("[live-custom.js] the ContextTemperature ** is: ", ContextTemperature);
    if (ContextTemperature !== "") {
      var echartGauge1 = RawechartGauge;
      var d1 = parseFloat(ContextTemperature);
      // var d1 = ContextTemperature;
      // console.log("[live-custom.js] ContextTemperature (C)", d1);
      if (d1 === null || isNaN(d1) || d1 == 0 || d1 === undefined || d1 === "" || d1 === null) {
        echartGauge1.series[0].pointer.show = false;
        d1 = 0; //if the data one is NaN or 0.00 or undefined or "" or a null, then setting to 0
      } else {
        echartGauge1.series[0].pointer.show = true;
      }
      // console.log("d1", d1);
      // Assign numeric value directly (ECharts gauge expects a number)
      echartGauge1.series[0].data[0].value = d1;
      ContextTemperatureId.setOption(echartGauge1);
    }
  } else if ($("#LiveTemperatureId").length) {
    LiveTemperatureId = echarts.init(document.getElementById("LiveTemperatureId"));
    var echartGauge2 = RawechartGauge;
    var d = parseFloat(LiveTemperature);
    // var d = LiveTemperature;
    if (d === null || isNaN(d) || d == 0 || d === undefined || d === "" || d === null) {
      echartGauge2.series[0].pointer.show = false;
      d = 0;
    } else {
      echartGauge2.series[0].pointer.show = true;
    }
    // Assign numeric value directly (ECharts gauge expects a number)
    echartGauge2.series[0].data[0].value = d;
    LiveTemperatureId.setOption(echartGauge2);
  }
}
/**
 * Update Blood Pressure (BP) data for live and context assessment.
 * @param {number|string} LiveSBP - The live systolic blood pressure value.
 * @param {number|string} LiveDBP - The live diastolic blood pressure value.
 * @param {number|string} ContextSBP - The context systolic blood pressure value.
 * @param {number|string} ContextDBP - The context diastolic blood pressure value.
 * @returns {void}
 */
function blood_pressure_data(LiveSBP, LiveDBP, ContextSBP, ContextDBP) {
  //var echartGauge;
  //var sbp;
  var ContextBPId;
  var LiveBPId;
  var dbp;

  var RawechartGauge = {
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        center: ["50%", "58%"],
        radius: "100%",
        min: 80,
        max: 230,
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.07, "#D56868"], //red
              [0.139, "#FFB601"], //orange
              [0.205, "#F5DB00"], //yello
              [0.93, "#98BF64"], //green
              //[0.63, '#F5DB00'],//yello
              //[0.75,'#FFB601'],//orange
              [1.0, "#D56868"], //150-red
            ],
          },
        },
        pointer: {
          show: true,
          icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
          length: "15%",
          width: 10,
          offsetCenter: [0, "-50%"],
          itemStyle: {
            color: "auto",
          },
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        splitLine: {
          length: 0,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        axisLabel: {
          show: false,
        },
        title: {
          offsetCenter: [0, "-10%"],
          fontSize: 0,
        },
        detail: {
          fontSize: 20,
          offsetCenter: [0, "30%"],
          valueAnimation: true,
          formatter: function (value) {
            var data = value ? value + "/" + dbp : "-- / --";
            return data;
          },

          color: "white",
        },
        data: [
          {
            value: [],
            name: "LiveSBP",
          },
        ],
      },
    ],
  };
  if ($("#ContextBloodPressureId").length) {
    ContextBPId = echarts.init(document.getElementById("ContextBloodPressureId"));
    if (ContextSBP !== "" && ContextDBP !== "") {
      var echartGauge1 = RawechartGauge;
      var d1 = ContextSBP;
      dbp = ContextDBP;
      // console.log("ContextBloodPressureId", d1, dbp);
      if (isNaN(d1) || d1 == 0 || d1 === undefined || d1 === "" || d1 === null) {
        echartGauge1.series[0].pointer.show = false;
      } else {
        echartGauge1.series[0].pointer.show = true;
      }

      echartGauge1.series[0].data[0].value = d1;
      ContextBPId.setOption(echartGauge1);
    }
  } else if ($("#LiveBloodPressureId").length) {
    LiveBPId = echarts.init(document.getElementById("LiveBloodPressureId"));
    var echartGauge2 = RawechartGauge;
    var d = LiveSBP;
    dbp = LiveDBP;
    if (isNaN(d) || d == 0 || d === undefined || d === "" || d === null) {
      echartGauge2.series[0].pointer.show = false;
    } else {
      echartGauge2.series[0].pointer.show = true;
    }
    echartGauge2.series[0].data[0].value = d;
    LiveBPId.setOption(echartGauge2);
  }
}

/**
 * Update Respiration Rate (RR) data for live and context assessment.
 * @param {number|string} LiveRRData - The live respiration rate value.
 * @param {number|string} contextRRData - The context respiration rate value.
 * @returns {void}
 */
function respiration_rate_data(LiveRRData, contextRRData) {
  // console.log("[live-custom.js] Calling LiveRRData in live page", LiveRRData, contextRRData);
  var LiveHRId;
  var ContextHRId;

  var RawechartGauge = {
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        center: ["50%", "58%"],
        radius: "100%",
        min: 5,
        max: 28,
        splitNumber: 8,
        // animation: false ,
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.15, "#D56868"], //red
              //[0.133,'#FFB601'],//orange
              [0.3, "#F5DB00"], //yello
              [0.75, "#98BF64"], //green
              //[0.63, '#F5DB00'],//yello
              [0.95, "#FFB601"], //orange
              [1, "#D56868"], //150-red
            ],
          },
        },
        pointer: {
          icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
          length: "15%",
          width: 10,
          offsetCenter: [0, "-50%"],
          itemStyle: {
            color: "auto",
          },
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        splitLine: {
          length: 0,
          lineStyle: {
            color: "auto",
            width: 0,
          },
        },
        axisLabel: {
          show: false,
        },
        title: {
          offsetCenter: [0, "-10%"],
          fontSize: 0,
        },
        detail: {
          fontSize: 20,
          offsetCenter: [0, "10%"],
          valueAnimation: true,
          formatter: function (value) {
            var data = value == 0 || isNaN(value) || value == undefined ? (data = "- -") : (data = value);
            return data;
          },
          color: "white",
        },
        data: [
          {
            value: [],
            name: "RR",
          },
        ],
      },
    ],
  };

  if ($("#ContextRespirationRateId").length) {
    ContextHRId = echarts.init(document.getElementById("ContextRespirationRateId"));
    if (contextRRData !== "") {
      var echartGauge1 = RawechartGauge;

      var d1 = contextRRData;
      if (isNaN(d1) || d1 == 0 || d1 === undefined || d1 === "" || d1 === null) {
        echartGauge1.series[0].pointer.show = false;
      } else {
        echartGauge1.series[0].pointer.show = true;
      }
      echartGauge1.series[0].data[0].value = d1;
      ContextHRId.setOption(echartGauge1);
    }
  } else if ($("#LiveRespirationRateId").length) {
    LiveHRId = echarts.init(document.getElementById("LiveRespirationRateId"));
    var echartGauge2 = RawechartGauge;
    var d = LiveRRData;
    if (isNaN(d) || d == 0 || d === undefined || d === "" || d === null) {
      echartGauge2.series[0].pointer.show = false;
    } else {
      echartGauge2.series[0].pointer.show = true;
    }

    echartGauge2.series[0].data[0].value = d;
    LiveHRId.setOption(echartGauge2);
  }
}
export {
  heartrate_data,
  blood_pressure_data,
  respiration_rate_data,
  blood_oxygen_data,
  blood_oxygen_data_context,
  temperature_data,
  PPG_data_passing,
  RR_data_passing,
  ECG_data_passing,
  ews_value_passing,
};
