import {
  history_ECG,
  history_Heart_Rate,
  history_Blood_Oxygen,
  history_temperature,
  history_Blood_presure,
  history_Respiration_Rate,
  history_threshold_triggers,
  history_context_assessment_2,
} from "./history_UI_module.js";
import { fb } from "../livepage/database_function.js";

/**
 * Fetches data from Firebase for the given time range and updates the local array.
 * @param {number} min_time - The minimum timestamp (in seconds) for the data range.
 * @param {number} max_time - The maximum timestamp (in seconds) for the data range.
 * @param {Array} localarray - The local array to store the fetched data.
 * @param {number} trim - The trim value for data processing.
 */
export function firebase(min_time, max_time, localarray, trim) {
  try {
    var start_index = min_time.toString();
    var end_index = max_time.toString();
    var id = localStorage.getItem("patient_unique_id");

    var context_timestamp = [];

    var patientecgdata = fb.database().ref().child("patientecgdata").child(id).orderByKey().startAt(start_index).endAt(end_index);
    var ecg_timestamp = [];

    var patientlivedata = fb.database().ref().child("patientlivedata").child(id).orderByKey().startAt(start_index).endAt(end_index);
    const heart_rate = [];
    const blood_pressure = [];
    const spo2 = [];
    const temperature = [];
    const respiration_rate = [];

    var threshold_triggers = fb.database().ref().child("threshold_triggers").child(id).orderByKey().startAt(start_index).endAt(end_index);
    const threshold_triggers_timestamps = [];

    function init_echarts() {
      if (typeof echarts === "undefined") {
        return;
      }
      Promise.all([
        // For History ECG Data
        patientecgdata
          .once("value", function (snapshot) {
            if (snapshot.val() != null) {
              snapshot.forEach((data) => {
                var tme_in_ms = data.key * 1000;
                ecg_timestamp.push([parseInt(tme_in_ms), parseInt(5)]);
              });
            } else {
              console.log("[history_fb_module.js] No ECG data available for the given time range.");
            }
            // console.log("[history_fb_module.js] ecg_timestamp", ecg_timestamp);
            history_ECG(min_time, max_time, ecg_timestamp, id);
          })
          .catch((error) => {
            console.error("[history_fb_module.js] Error fetching Firebase data:", error);
          }),
        // For History Patient Live Data
        patientlivedata
          .once("value", function (snapshot) {
            if (snapshot.val() != null) {
              snapshot.forEach((data) => {
                const timestamp = parseInt(data.key) * 1000; // Convert to milliseconds
                const patientData = data.val();

                context_timestamp.push([parseInt(timestamp), parseInt(5)]);
                // Heart rate
                const rawHR = patientData.hr;
                if (rawHR && rawHR !== "--") {
                  const hrValue = Number(rawHR);
                  if (hrValue && !Number.isNaN(hrValue)) {
                    heart_rate.push([timestamp, hrValue]);
                  }
                }

                // Blood pressure (expected format: "SBP/DBP")
                if (patientData.bp !== undefined && patientData.bp !== null) {
                  const bpStr = String(patientData.bp).trim();
                  const parts = bpStr.split("/");
                  if (parts.length === 2) {
                    const sbp = parseInt(parts[0]);
                    const dbp = parseInt(parts[1]);
                    if (sbp && dbp && !Number.isNaN(sbp) && !Number.isNaN(dbp)) {
                      blood_pressure.push([timestamp, sbp, dbp]);
                    }
                  }
                }

                // SpO2
                if (patientData.spo !== undefined && patientData.spo !== null) {
                  const spoValue = Number(patientData.spo);
                  if (spoValue && !Number.isNaN(spoValue)) {
                    spo2.push([timestamp, spoValue]);
                  }
                }

                // Temperature
                if (patientData.temp !== undefined && patientData.temp !== null) {
                  let tempStr = String(patientData.temp).trim();
                  // Temperature may come with units, e.g., "36.5°C" or "98°F"
                  if (tempStr.endsWith("°C") || tempStr.endsWith("°F")) {
                    tempStr = tempStr.slice(0, -2).trim();
                  }
                  const parsedTemp = Number.parseFloat(tempStr);
                  if (!Number.isNaN(parsedTemp)) {
                    const tempValue = Number.isInteger(parsedTemp) ? parsedTemp : Number(parsedTemp.toFixed(2));
                    temperature.push([timestamp, tempValue]);
                  }
                }

                // Respiration rate
                if (patientData.rr !== undefined && patientData.rr !== null) {
                  const rrValue = Number(patientData.rr);
                  if (rrValue && !Number.isNaN(rrValue)) {
                    respiration_rate.push([timestamp, rrValue]);
                  }
                }
              });
            } else {
              console.log("[history_fb_module.js] No patient live data available for the given time range.");
            }

            history_Heart_Rate(min_time, max_time, heart_rate, id);
            history_Blood_presure(min_time, max_time, blood_pressure, id);
            history_Blood_Oxygen(min_time, max_time, spo2, id);
            history_temperature(min_time, max_time, temperature, id);
            history_Respiration_Rate(min_time, max_time, respiration_rate, id);
            history_context_assessment_2(min_time, max_time, id, context_timestamp);
            console.log(" [history_fb_module.js] Completed All 5 ");
          })
          .catch((error) => {
            console.error("[history_fb_module.js] Error fetching Firebase data:", error);
          }),
        // For Threshold Triggers
        threshold_triggers
          .once("value", function (snapshot) {
            if (snapshot.val() != null) {
              snapshot.forEach((data) => {
                var tme_in_ms = data.key * 1000;
                threshold_triggers_timestamps.push([parseInt(tme_in_ms), parseInt(5)]);
              });
            } else {
              console.log("[history_fb_module.js] No threshold triggers data available for the given time range.");
            }
            history_threshold_triggers(min_time, max_time, threshold_triggers_timestamps, id);
          })
          .catch((error) => {
            console.error("[history_fb_module.js] Error fetching threshold triggers data:", error);
          }),
      ]).then(() => {
        const loader = document.querySelector(".loader");
        loader.classList.add("loader--hidden");
      });
    }
    const loader = document.querySelector(".loader");
    loader.classList.add("loader--hidden");
    $(document).ready(function () {
      init_echarts();
    });
  } catch (error) {
    console.error(" [history_fb_module.js] Error in firebase function:", error);
  }
}
