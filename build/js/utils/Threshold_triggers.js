import { fb } from "../livepage/database_function.js";

const PATIENT_ID_INDEX = 4;
const thresholdListenerPatients = new Set();
const patient_info = JSON.parse(localStorage.getItem("patient_info") || "[]");
// listener
const messagesRef = fb.database().ref().child("threshold_triggers");
const activeAlertTargets = new Set();
const activePatientAlerts = new Map();
const pendingBlinkAlerts = new Map();

registerThresholdListeners(patient_info);

/**
 * Normalize a comma-separated threshold payload into dashboard vital keys.
 * @param {string} vitalString
 * @returns {Array<string>}
 */
function parseThresholdVitals(vitalString) {
  if (typeof vitalString !== "string") {
    return [];
  }
  if (vitalString === "") {
    return [""];
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

/**
 * Map a patient/vital pair to the dashboard element id that should blink.
 * @param {string} id
 * @param {string} vital
 * @returns {string}
 */
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

/**
 * Get the wrapper id for the full patient card border.
 * @param {string} id
 * @returns {string}
 */
function getPatientBorderId(id) {
  return "border" + id;
}
const sessionStorageName = "THRESHOLD_TRIGGERS";

/**
 * Read the currently active threshold alerts persisted in session storage.
 * @returns {Object}
 */
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
    console.warn("[Threshold_triggers.js] Unable to read threshold alerts from session storage:", error);
    return {};
  }
}
/**
 * Persist active alert vitals by patient for the current browser session.
 * @param {Object} alertsByPatient
 * @returns {void}
 */
function setStoredThresholdAlerts(alertsByPatient) {
  const patientIds = Object.keys(alertsByPatient || {});

  if (patientIds.length === 0) {
    sessionStorage.removeItem(sessionStorageName);
    return;
  }

  sessionStorage.setItem(sessionStorageName, JSON.stringify(alertsByPatient));
}
/**
 * Queue an alert until the related dashboard card is available in the DOM.
 * @param {string} id
 * @param {string} vital
 * @returns {void}
 */
function queuePendingBlink(id, vital) {
  const patientVitals = pendingBlinkAlerts.get(id) || new Set();
  patientVitals.add(vital);
  pendingBlinkAlerts.set(id, patientVitals);
}

/**
 * Replay queued blink states after dashboard cards finish rendering.
 * @returns {void}
 */
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

/**
 * Restore persisted blink indicators after a page reload within the same session.
 * @returns {void}
 */
function restoreBlinkAlertsFromSession() {
  const storedAlerts = getStoredThresholdAlerts();
  const patientIds = Object.keys(storedAlerts);

  if (patientIds.length === 0) {
    return;
  }

  console.log("[Threshold_triggers.js] Applying blink effect for session data:", storedAlerts);

  patientIds.forEach((patientId) => {
    const patientVitals = Array.isArray(storedAlerts[patientId]) ? storedAlerts[patientId] : [];
    patientVitals.forEach((vital) => {
      addBlink(patientId, vital);
      console.log("[Threshold_triggers.js] Applying blink effect for session data:", patientId, vital);
    });
  });

  console.log("[Threshold_triggers.js] Completed");
}

// Apply the blink effect to the users
restoreBlinkAlertsFromSession();
/**
 * Subscribe to threshold-trigger updates for each dashboard patient exactly once.
 * @param {Array} patient_info
 * @returns {void}
 */
function registerThresholdListeners(patient_info) {
  if (!Array.isArray(patient_info) || patient_info.length === 0) {
    return;
  }

  for (let i = 0; i < patient_info.length; i++) {
    const patientId = patient_info[i][PATIENT_ID_INDEX];

    if (!patientId || thresholdListenerPatients.has(patientId)) {
      continue;
    }

    thresholdListenerPatients.add(patientId);

    const patientRef = messagesRef.child(patientId);

    console.log("[Threshold_triggers.js] threshold patient:", patientId);

    // Fetching the data onceand then adding listern
    //  because the we only need to track new entries since this JS file will be attached in index.html and dashboard.html
    patientRef.once("value", (initialSnap) => {
      const oldTimestampKeys = new Set();

      initialSnap.forEach((child) => {
        oldTimestampKeys.add(child.key);
      });

      patientRef.on("child_added", (timestampSnapshot) => {
        const timestampKey = timestampSnapshot.key;

        if (oldTimestampKeys.has(timestampKey)) return;

        const rawVitals = timestampSnapshot.val();

        console.log("[Threshold_triggers.js] threshold timestamp:", timestampKey);
        console.log("[Threshold_triggers.js] threshold data:", rawVitals);

        if (typeof rawVitals !== "string") return;

        const normalizedVitals = parseThresholdVitals(rawVitals);
        const sessionData = getStoredThresholdAlerts();
        const alreadyExistingVitals = sessionData[patientId] || [];

        sessionData[patientId] = [...new Set([...alreadyExistingVitals, ...normalizedVitals])];

        setStoredThresholdAlerts(sessionData);

        normalizedVitals.forEach((vital) => addBlink(patientId, vital));
      });
    });
  }
}
const sound = document.getElementById("alertSound");
let alertSoundPrimed = false;

if (sound) {
  sound.preload = "auto";
}

/**
 * Prime the browser audio element so alert playback can start without later user prompts.
 * @returns {void}
 */
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

/**
 * There might be more the 1 active alert targets so this function sync the alert as one
 * @returns {void}
 */
function syncAlertSound() {
  if (!sound) {
    return;
  }

  if (activeAlertTargets.size > 0) {
    sound.loop = true;
    sound.play().catch((error) => {
      console.warn("[Threshold_triggers.js] Unable to play alert sound:", error);
    });
    return;
  }

  sound.pause();
  sound.currentTime = 0;
}
/**
 * Function clears all blink alerts from the dashboard
 * @returns {void}
 */
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

/**
 * Apply blink styling and alert-sound state for a patient/vital target.
 * @param {string} id
 * @param {string} vital
 * @returns {void}
 */
function addBlink(id, vital) {
  try {
    let val = resolveAlertElementId(id, vital);
    const alertBox = document.getElementById(val);
    const patientBorderId = getPatientBorderId(id);
    const patientBorder = document.getElementById(patientBorderId);

    if (!alertBox) {
      queuePendingBlink(id, vital);
      console.warn("[Threshold_triggers.js] Alert UI element not found:", val);
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
    console.error("[Threshold_triggers.js] Error in addBlink function:", error);
  }
}

/**
 * Function removes blink from the dashboard
 * @param {string} id
 * @param {string} vital
 * @returns {void}
 */
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
      console.warn("[Threshold_triggers.js] Alert UI element not found:", val);
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
    console.error("[Threshold_triggers.js] Error in removeBlink function:", error);
  }
}

window.addBlink = addBlink;
window.removeBlink = removeBlink;
window.clearAllBlinkAlerts = clearAllBlinkAlerts;
window.flushPendingBlinkAlerts = flushPendingBlinkAlerts;
