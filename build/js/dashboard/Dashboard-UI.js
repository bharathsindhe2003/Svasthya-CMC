export async function patient_details(patient_info) {
  console.log("[Dashboard-UI.js] patient_info before in array: ", patient_info.length);
  var d = [];

  for (var j = 0; j < patient_info.length; j++) {
    console.log("[Dashboard-UI.js] after :", patient_info[j][6]);
    switch (patient_info[j][6]) {
      case "#EE4B2B":
        patient_info[j].push(1);
        break;

      case "#ff781f":
        patient_info[j].push(2);
        break;

      case "#ffaf7a":
        patient_info[j].push(3);
        break;

      case "#76B947":
        patient_info[j].push(4);
        break;

      case "#d4d4d3":
        patient_info[j].push(5);
        break;

      default:
        patient_info[j].push(6);
        break;
    }
  }
  console.log("[Dashboard-UI.js] patient_info before in array: ", patient_info);
  patient_info.sort(sortFunction);

  function sortFunction(a, b) {
    if (a[7] === b[7]) {
      return 0;
    } else {
      return a[7] < b[7] ? -1 : 1;
    }
  }
  console.log("[Dashboard-UI.js] patient_info after in array: ", patient_info);

  console.log("[Dashboard-UI.js] Data before creating charts:", patient_info);

  var modal = document.getElementById("myModal");

  var span = document.getElementsByClassName("close")[0];

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  if ($("#p_details").length) {
    const products = document.querySelector(".patient_details");

    const bg = document.querySelector(".ews_card_js");

    for (var i = 0; i < patient_info.length; i++) {
      console.log("[Dashboard-UI.js] Creating card for:", patient_info[i]);
      let LiveECGId = "chart" + patient_info[i][4];
      let LivePPGId = "ppgchart" + patient_info[i][4];
      let LiveRRId = "rrchart" + patient_info[i][4];
      let hrId = "hr" + patient_info[i][4];
      let spoId = "spo" + patient_info[i][4];
      let bpId = "bp" + patient_info[i][4];
      let rrId = "rr" + patient_info[i][4];
      let tempId = "temp" + patient_info[i][4];
      let ewsvId = "ewsv" + patient_info[i][4];
      let ewscId = "ewsc" + patient_info[i][4];
      let borderId = "border" + patient_info[i][4];
      let hrBorderId = "hrBorder" + patient_info[i][4];
      let spo2BorderId = "spo2Border" + patient_info[i][4];
      let tempBorderId = "tempBorder" + patient_info[i][4];
      let rrBorderId = "rrBorder" + patient_info[i][4];
      let bpBorderId = "bpBorder" + patient_info[i][4];

      createCard(patient_info[i], LiveECGId, LivePPGId, LiveRRId, hrId, spoId, bpId, rrId, tempId, ewsvId, ewscId, borderId, hrBorderId, spo2BorderId, tempBorderId, rrBorderId, bpBorderId);

      console.log("[Dashboard-UI.js] Created card for:", patient_info[i]);
    }

    function createCard(patientDetails, LiveECGId, LivePPGId, LiveRRId, hrId, spoId, bpId, rrId, tempId, ewsvId, ewscId, borderId, hrBorderId, spo2BorderId, tempBorderId, rrBorderId, bpBorderId) {
      const [name, age, gender, ailment, patient_id_no, ews, color] = patientDetails;
      console.log("[Dashboard-UI.js] Creating card with IDs:", ewsvId, ewscId);

      let code = `
          <div class="well profile_view patient-card" id="${borderId}">
            <div class="border_1 patient-card__shell">
              <div class="patient-card__header animated flipInY">
                <div class="patient-card__identity">
                  <span class="patient-card__caption">Name</span>
                  <h2 class="patient-card__name">${name}</h2>
                </div>
                <div class="patient-card__ews" id="${ewscId}">
                  <span class="patient-card__ews-label">EWS</span>
                  <h2 id="${ewsvId}" class="patient-card__ews-value">${ews ?? "--"}</h2>
                </div>
              </div>
              <div class="patient-card__content">
                <div class="patient-card__waveforms">
                  <div class="wave-card wave-card--ecg">
                    <h3 class="wave-card__title">ECG</h3>
                    <div class="wave-card__chart wave-card__chart--ecg" id="${LiveECGId}"></div>
                  </div>
                  <div class="wave-card wave-card--ppg">
                    <h3 class="wave-card__title">PPG</h3>
                    <div class="wave-card__chart wave-card__chart--ppg" id="${LivePPGId}"></div>
                  </div>
                  <div class="wave-card wave-card--rr">
                    <h3 class="wave-card__title">RR</h3>
                    <div class="wave-card__chart wave-card__chart--rr" id="${LiveRRId}"></div>
                  </div>
                </div>
                <div class="patient-card__vitals-panel">
                  <ul class="vitals-list">
                    <li class="vital vital--hr" id="${hrBorderId}">
                      <span class="vital-label">HR</span>
                      <div class="vital-main">
                        <h1 id="${hrId}" class="vital-value"></h1>
                      </div>
                    </li>
                    <li class="vital vital--spo2" id="${spo2BorderId}">
                      <span class="vital-label">SPO2</span>
                      <div class="vital-main">
                        <h1 id="${spoId}" class="vital-value"></h1>
                      </div>
                    </li>
                    <li class="vital vital--temp" id="${tempBorderId}">
                      <span class="vital-label">TEMP</span>
                      <div class="vital-main">
                        <h1 id="${tempId}" class="vital-value"></h1>
                      </div>
                    </li>
                    <li class="vital vital--rr" id="${rrBorderId}">
                      <span class="vital-label">RR</span>
                      <div class="vital-main">
                        <h1 id="${rrId}" class="vital-value"></h1>
                      </div>
                    </li>
                    <li class="vital vital--bp vital--wide" id="${bpBorderId}">
                      <span class="vital-label">BP</span>
                      <div class="vital-main">
                        <h1 id="${bpId}" class="vital-value"></h1>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          `;

      products.innerHTML += code;
    }

    const items = products.children;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      item.addEventListener("click", function (index) {
        console.log("[Dashboard-UI.js] Clicked on " + i, patient_info[i][4]);
        history.pushState({ page: "index" }, "Title", "../production/index.html");
        cardclick(patient_info[i][4]);
      });
    }
    for (let i = 0; i < patient_info.length; i++) {
      // patient_info[i][4] = patient_id, [5] = ews value, [6] = color
      refreshews(patient_info[i][5], patient_info[i][6], patient_info[i][4]);
    }

    if (typeof window.flushPendingBlinkAlerts === "function") {
      window.flushPendingBlinkAlerts();
    }

    const loader = document.querySelector(".loader");
    loader.classList.add("loader--hidden");
  }
}

function refreshews(ews_value, ews_color, ID) {
  var ewsvId = "ewsv" + ID;
  var ewscId = "ewsc" + ID;

  var ews_v = document.getElementById(ewsvId);
  var ews_c = document.getElementById(ewscId);

  if (ews_v === null) {
  } else {
    ews_v.textContent = ews_value;
    ews_c.style.background = ews_color;
    ews_c.style.borderRadius = "10px";
  }
}
