import { fb } from "../livepage/database_function.js";

const uid = localStorage.getItem("patient_unique_id");
const rootRef = fb.database().ref();
const vitalsRef = rootRef.child("Threshold_Default").child(uid || "");
const saveButton = document.getElementById("saveVitalsConfig");
const saveStatus = document.getElementById("vitalsSaveStatus");

const TYPE_BY_CONDITION = {
  off: "",
  lt: "<",
  gt: ">",
  between: "<>",
};

const CONDITION_BY_TYPE = {
  "": "off",
  "<": "lt",
  ">": "gt",
  "<>": "between",
};

const VITALS = [
  { key: "spo2", label: "SpO2", parser: parseInteger },
  { key: "hr", label: "Heart Rate", parser: parseInteger },
  { key: "temp", label: "Temperature", parser: parseDecimal },
  { key: "rr", label: "Respiratory Rate", parser: parseInteger },
  { key: "sbp", label: "Systolic Blood Pressure", parser: parseInteger },
  { key: "dbp", label: "Diastolic Blood Pressure", parser: parseInteger },
];

if (!uid) {
  setSaveStatus("Patient not selected", true);
  if (saveButton) {
    saveButton.disabled = true;
  }
  console.warn("[vitals_module.js] Missing patient_unique_id in localStorage");
} else {
  wireEvents();
  loadVitals();
}

/**
 * Attach toggle, rule, and save handlers for the threshold configuration form.
 * @returns {void}
 */
function wireEvents() {
  VITALS.forEach((vital) => {
    const toggle = document.getElementById(`${vital.key}toggle`);
    const condition = document.getElementById(`${vital.key}condition`);

    if (toggle) {
      toggle.addEventListener("change", () => updateVitalUI(vital.key));
    }

    if (condition) {
      condition.addEventListener("change", () => updateVitalUI(vital.key));
    }
  });

  saveButton?.addEventListener("click", saveVitals);
}

/**
 * Load the saved threshold rules for the active patient and hydrate the form.
 * @returns {Promise<void>}
 */
async function loadVitals() {
  try {
    const snapshot = await vitalsRef.once("value");
    const data = snapshot.val() || {};
    const legacyBloodPressure = splitLegacyBloodPressure(data.bp);

    VITALS.forEach((vital) => {
      const fallback = legacyBloodPressure[vital.key];
      hydrateVital(vital.key, data[vital.key], fallback);
    });

    setSaveStatus("Loaded saved threshold rules", false, true);
  } catch (error) {
    console.error("[vitals_module.js] Error fetching vitals data:", error);
    setSaveStatus("Unable to load existing thresholds", true);
  }
}

/**
 * Push a normalized vital state into the corresponding form controls.
 * @param {string} key
 * @param {Object} node
 * @param {Object} fallback
 * @returns {void}
 */
function hydrateVital(key, node, fallback) {
  const state = normalizeState(node, fallback);
  const toggle = document.getElementById(`${key}toggle`);
  const condition = document.getElementById(`${key}condition`);
  const singleInput = document.getElementById(`${key}value`);
  const minInput = document.getElementById(`${key}min`);
  const maxInput = document.getElementById(`${key}max`);

  if (!toggle || !condition || !singleInput || !minInput || !maxInput) {
    return;
  }

  toggle.checked = state.enabled;
  condition.value = state.condition === "off" ? "lt" : state.condition;
  singleInput.value = state.singleValue;
  minInput.value = state.minValue;
  maxInput.value = state.maxValue;

  updateVitalUI(key);
}

/**
 * Normalize a stored threshold node into the UI state consumed by the form.
 * @param {Object} node
 * @param {Object} fallback
 * @returns {{enabled: boolean, condition: string, singleValue: string, minValue: string, maxValue: string}}
 */
function normalizeState(node, fallback) {
  const enabledValue = node?.enabled;
  const condition = normalizeCondition(node?.condition || CONDITION_BY_TYPE[node?.typ] || fallback?.condition || "off");
  const hasStoredState = node && Object.keys(node).length > 0;
  const enabled =
    enabledValue === true ||
    enabledValue === "true" ||
    enabledValue === "on" ||
    enabledValue === 1 ||
    enabledValue === "1" ||
    (enabledValue == null && hasStoredState && condition !== "off") ||
    fallback?.enabled === true;

  const val1 = stringifyValue(node?.val1 ?? fallback?.val1);
  const val2 = stringifyValue(node?.val2 ?? fallback?.val2);
  const minValue = stringifyValue(node?.Min ?? fallback?.minValue ?? (condition === "between" ? val1 : ""));
  const maxValue = stringifyValue(node?.Max ?? fallback?.maxValue ?? (condition === "between" ? val2 : ""));
  const singleValue = stringifyValue(fallback?.singleValue ?? deriveSingleValue(condition, node, fallback));

  return {
    enabled,
    condition: enabled ? condition : "off",
    singleValue,
    minValue,
    maxValue,
  };
}

/**
 * Pick the single comparison value from either the new node structure or the legacy fallback.
 * @param {string} condition
 * @param {Object} node
 * @param {Object} fallback
 * @returns {string}
 */
function deriveSingleValue(condition, node, fallback) {
  if (condition === "lt") {
    return node?.val1 ?? node?.Max ?? fallback?.singleValue ?? fallback?.maxValue ?? "";
  }

  if (condition === "gt") {
    return node?.val1 ?? node?.Min ?? fallback?.singleValue ?? fallback?.minValue ?? "";
  }

  if (condition === "eq") {
    return node?.val1 ?? node?.Min ?? node?.Max ?? fallback?.singleValue ?? fallback?.minValue ?? fallback?.maxValue ?? "";
  }

  return node?.val1 ?? fallback?.singleValue ?? "";
}

/**
 * Show or hide the correct input controls for the selected vital rule.
 * @param {string} key
 * @returns {void}
 */
function updateVitalUI(key) {
  const card = document.querySelector(`[data-vital-key="${key}"]`);
  const toggle = document.getElementById(`${key}toggle`);
  const label = document.getElementById(`${key}togglelabel`);
  const rule = document.getElementById(`${key}rule`);
  const offState = document.getElementById(`${key}offstate`);
  const condition = document.getElementById(`${key}condition`);
  const singleField = document.querySelector(`[data-vital-values="${key}"] .vital-field--single`);
  const minField = document.querySelector(`[data-vital-values="${key}"] .vital-field--min`);
  const maxField = document.querySelector(`[data-vital-values="${key}"] .vital-field--max`);
  const isEnabled = Boolean(toggle?.checked);
  const currentCondition = condition?.value || "lt";
  const isBetween = currentCondition === "between";

  card?.classList.toggle("is-active", isEnabled);

  if (label) {
    label.textContent = isEnabled ? "On" : "Off";
  }

  rule?.classList.toggle("is-hidden", !isEnabled);
  offState?.classList.toggle("is-hidden", isEnabled);
  singleField?.classList.toggle("is-hidden", !isEnabled || isBetween);
  minField?.classList.toggle("is-hidden", !isEnabled || !isBetween);
  maxField?.classList.toggle("is-hidden", !isEnabled || !isBetween);
}

/**
 * Validate and persist the currently selected threshold rules to Firebase.
 * @returns {Promise<void>}
 */
async function saveVitals() {
  if (!uid) {
    return;
  }

  try {
    setSaveStatus("Saving configuration...", false);
    if (saveButton) {
      saveButton.disabled = true;
    }

    const updates = {};

    VITALS.forEach((vital) => {
      const state = collectVitalState(vital);
      const vitalUpdates = buildVitalUpdates(vital.key, state);

      Object.keys(vitalUpdates).forEach((field) => {
        updates[`/Threshold_Default/${uid}/${vital.key}/${field}`] = vitalUpdates[field];
      });
    });

    // updates[`/Threshold_Default/${uid}/bp`] = null;
    updates[`/Threshold_Default/${uid}/timestamp`] = Math.floor(new Date().getTime() / 1000.0).toString();

    await rootRef.update(updates);
    setSaveStatus("Configuration saved", false, true);
  } catch (error) {
    console.error("[vitals_module.js] Error saving vitals data:", error);
    const message = error?.message || "Unable to save configuration";
    setSaveStatus(message, true);
    alert(message);
  } finally {
    if (saveButton) {
      saveButton.disabled = false;
    }
  }
}

/**
 * Read and validate the current UI state for a single vital rule.
 * @param {Object} vital
 * @returns {{enabled: boolean, condition: string, singleValue: string, minValue: string, maxValue: string}}
 */
function collectVitalState(vital) {
  const toggle = document.getElementById(`${vital.key}toggle`);
  const conditionElement = document.getElementById(`${vital.key}condition`);
  const singleInput = document.getElementById(`${vital.key}value`);
  const minInput = document.getElementById(`${vital.key}min`);
  const maxInput = document.getElementById(`${vital.key}max`);

  const enabled = Boolean(toggle?.checked);
  const condition = enabled ? normalizeCondition(conditionElement?.value) : "off";

  if (!enabled) {
    return {
      enabled: false,
      condition: "off",
      singleValue: "",
      minValue: "",
      maxValue: "",
    };
  }

  if (condition === "between") {
    const minValue = vital.parser(minInput?.value, `${vital.label} minimum value`);
    const maxValue = vital.parser(maxInput?.value, `${vital.label} maximum value`);

    if (minValue > maxValue) {
      throw new Error(`${vital.label} minimum value cannot be greater than the maximum value`);
    }

    return {
      enabled: true,
      condition,
      singleValue: "",
      minValue: minValue.toString(),
      maxValue: maxValue.toString(),
    };
  }

  const singleValue = vital.parser(singleInput?.value, `${vital.label} value`);

  return {
    enabled: true,
    condition,
    singleValue: singleValue.toString(),
    minValue: condition === "gt" || condition === "eq" ? singleValue.toString() : "",
    maxValue: condition === "lt" || condition === "eq" ? singleValue.toString() : "",
  };
}

/**
 * Convert the normalized form state into the compact Firebase payload format.
 * @param {string} key
 * @param {Object} state
 * @returns {{typ: string, val1: string, val2: string}}
 */
function buildVitalUpdates(key, state) {
  const typeCode = state.enabled ? TYPE_BY_CONDITION[state.condition] || "" : "";
  const valueOne = state.condition === "between" ? state.minValue : state.singleValue;
  const valueTwo = state.condition === "between" ? state.maxValue : "";

  return {
    typ: typeCode,
    val1: valueOne,
    val2: valueTwo,
  };
}

/**
 * Split the legacy combined blood-pressure node into SBP and DBP fallback states.
 * @param {Object} bpNode
 * @returns {{sbp: Object|null, dbp: Object|null}}
 */
function splitLegacyBloodPressure(bpNode) {
  const minParts = splitBloodPressureValue(bpNode?.Min);
  const maxParts = splitBloodPressureValue(bpNode?.Max);
  const hasSbp = Boolean(minParts[0] || maxParts[0]);
  const hasDbp = Boolean(minParts[1] || maxParts[1]);
  const hasCompleteSbp = Boolean(minParts[0] && maxParts[0]);
  const hasCompleteDbp = Boolean(minParts[1] && maxParts[1]);

  return {
    sbp: hasSbp
      ? {
          // enabled: hasCompleteSbp,
          // condition: hasCompleteSbp ? "between" : "off",
          // minValue: minParts[0],
          // maxValue: maxParts[0],
          val1: minParts[0],
          val2: maxParts[0],
        }
      : null,
    dbp: hasDbp
      ? {
          enabled: hasCompleteDbp,
          condition: hasCompleteDbp ? "between" : "off",
          minValue: minParts[1],
          maxValue: maxParts[1],
          val1: minParts[1],
          val2: maxParts[1],
        }
      : null,
  };
}

/**
 * Break a blood-pressure string like SBP/DBP into separate values.
 * @param {string} value
 * @returns {Array<string>}
 */
function splitBloodPressureValue(value) {
  const normalized = stringifyValue(value);

  if (!normalized) {
    return ["", ""];
  }

  const parts = normalized.split("/");
  return [parts[0]?.trim() || "", parts[1]?.trim() || ""];
}

/**
 * Limit condition values to the rule types supported by the UI.
 * @param {string} value
 * @returns {string}
 */
function normalizeCondition(value) {
  return ["lt", "eq", "gt", "between", "off"].includes(value) ? value : "off";
}

/**
 * Convert optional values into trimmed strings for form consumption.
 * @param {unknown} value
 * @returns {string}
 */
function stringifyValue(value) {
  if (value == null) {
    return "";
  }

  return String(value).trim();
}

/**
 * Parse an integer rule input and throw a user-facing validation error on failure.
 * @param {string|number} value
 * @param {string} label
 * @returns {number}
 */
function parseInteger(value, label) {
  const parsed = Number.parseInt(String(value).trim(), 10);

  if (Number.isNaN(parsed)) {
    throw new Error(`Please enter a valid number for ${label}`);
  }

  return parsed;
}

/**
 * Parse a decimal rule input and throw a user-facing validation error on failure.
 * @param {string|number} value
 * @param {string} label
 * @returns {number}
 */
function parseDecimal(value, label) {
  const parsed = Number.parseFloat(String(value).trim());

  if (Number.isNaN(parsed)) {
    throw new Error(`Please enter a valid number for ${label}`);
  }

  return parsed;
}

/**
 * Show transient save feedback beside the vitals configuration form.
 * @param {string} message
 * @param {boolean} isError
 * @param {boolean} autoClear
 * @returns {void}
 */
function setSaveStatus(message, isError, autoClear) {
  if (!saveStatus) {
    return;
  }

  saveStatus.textContent = message || "";
  saveStatus.classList.toggle("is-error", Boolean(isError));

  if (autoClear && message) {
    window.clearTimeout(setSaveStatus.timeoutId);
    setSaveStatus.timeoutId = window.setTimeout(() => {
      if (saveStatus.textContent === message) {
        saveStatus.textContent = "";
        saveStatus.classList.remove("is-error");
      }
    }, 2500);
  }
}
