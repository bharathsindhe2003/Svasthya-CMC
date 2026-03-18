import { fb } from "../livepage/database_function.js";
import { loadIncoming } from "../backend/incomingpopup.js";
import { SymptomMsg } from "../context_assessment/ContextAssessmentTrim.js";

// Helper to detect if current browser/context supports Firebase Messaging
function isMessagingSupported() {
  try {
    // If global firebase with isSupported() is available (Firebase v8 pattern), prefer that
    if (typeof firebase !== "undefined" && firebase.messaging && typeof firebase.messaging.isSupported === "function") {
      // console.error("notification [notification.js] Using firebase.messaging.isSupported() to check messaging support.");
      return firebase.messaging.isSupported();
    }

    // Fallback: basic feature detection for required Web APIs
    const hasNotification = "Notification" in window;
    const hasServiceWorker = "serviceWorker" in navigator;
    const hasPushManager = "PushManager" in window;
    return hasNotification && hasServiceWorker && hasPushManager;
  } catch (e) {
    console.error("notification [notification.js] Error while checking messaging support:", e);
    return false;
  }
}

if (fb !== undefined) {
  console.log("Firebase initialized successfully.");
  try {
    if (!isMessagingSupported()) {
      console.warn("notification [notification.js] This browser/context does not support Firebase Messaging. Skipping messaging initialization.");
    } else {
      const messaging = fb.messaging();
      console.log("Messaging initialized successfully.");

      navigator.serviceWorker
        .register(new URL("../../../production/firebase-messaging-sw.js", import.meta.url))
        .then((registration) => {
          console.log("notification [notification.js] Service worker registered successfully.", registration.scope);
          messaging.useServiceWorker(registration);

          return messaging.requestPermission();
        })
        .then(() => {
          console.log("notification [notification.js] Notification permission flow completed. Current permission:", Notification.permission);

          var docid = localStorage.getItem("doctor_id");
          console.log("notification [notification.js] Doctor ID retrieved from local storage:", docid);

          return messaging.getToken({ vapidKey: "BDSMgbKCwTOC9f7r4FPoXsymskTh_M_GfLXi_sszHMbzLMaLG1zVD0jyVUVMkuVAszaNSrUwyb-aM8X9E5Qclv0" });
        })
        .then((currentToken) => {
          if (currentToken) {
            console.log("notification [notification.js] Token retrieved successfully:", currentToken);

            var context_assessmenttoken = fb.database().ref().child("FCM_token").child(currentToken);
            context_assessmenttoken.set({
              Id: localStorage.getItem("doctor_id"),
            });

            var docId = localStorage.getItem("doctor_id");
          } else {
            console.log("notification [notification.js] No registration token available. Request permission to generate one.");
          }
        })
        .catch((error) => {
          console.error("notification [notification.js] Error:", error);
        });

      messaging.onMessage(function (payload) {
        console.log("notification [notification.js] Inside onMessage:", payload);
        if (payload.data.timestamp && payload.data.uid) {
          console.log("notification [notification.js] Valid timestamp and final_patient_uid found in payload data.");

          const param1 = btoa(payload.data.timestamp);
          const param2 = btoa(payload.data.uid);
          const param3 = btoa("1");
          console.log("notification [notification.js] param1:", param1);
          console.log("notification [notification.js] param2:", param2);

          const url = "context_assment.html" + "?param1=" + param1 + "&param2=" + param2 + "&param3=" + param3;
          console.log("notification [notification.js] Constructed URL:", url);

          var childWindow = window.open(url, "Context Assessment", "width=1050,height=670,left=150,top=200,titlebar=0,toolbar=0,status=0");
          console.log("notification [notification.js] Valid timestamp and final_patient_uid found in payload data.");
        } else {
          console.log("notification [notification.js]Invalid timestamp or final_patient_uid in payload data");
        }

        console.log("notification [notification.js] Payload:", payload);
      });
    }
  } catch (e) {
    console.error("notification [notification.js] Error during messaging initialization:", e);
  }
} else {
  console.warn("notification [notification.js] Firebase not initialized.");
}
