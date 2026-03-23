import { fb } from "../livepage/database_function.js";

var patientname;
var gender;
var age;
var height;
var weight;
var ailment;
var email;
var gender;
var mobile;

var doctor_id = localStorage.getItem("doctor_id");
if (doctor_id && doctor_id == undefined) {
  location.replace("login.html");
}

try {
  document.getElementById("logout").addEventListener("click", logout);
} catch (e) {
  console.error("In HTML ID: Login is not found", e);
}

// Toggle profile dropdown (logout menu) when profile avatar is clicked
try {
  const profileToggle = document.getElementById("profileToggle");
  const profileMenu = document.getElementById("profileMenu");

  if (profileToggle && profileMenu) {
    profileToggle.addEventListener("click", function (event) {
      event.stopPropagation();
      profileMenu.style.display = profileMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", function () {
      profileMenu.style.display = "none";
    });
  }
} catch (e) {
  console.error("Unable to attach profile dropdown handlers", e);
}

function logout() {
  localStorage.removeItem("patient_unique_id");
  localStorage.removeItem("doctor_id");
  localStorage.removeItem("docname");

  // Redirect the user to the login page or home page
  window.location.href = "login.html"; // Change "login.html" to the appropriate URL
}

var id = localStorage.getItem("patient_unique_id");
if (id && id != null && id != undefined) {
  var patients = fb.database().ref().child("patients").child(id);

  patients.once("value", function (snapshot) {
    let patient_data = JSON.stringify(snapshot.val(), null, 2);
    let patient_data1 = JSON.parse(patient_data);
    patientname = patient_data1.username;

    gender = patient_data1.gender == "" ? (gender = "--") : (gender = patient_data1.gender);
    if (patient_data1.gender == "F") {
      if (document.getElementById("PatientImg") != null) {
        document.getElementById("PatientImg").src = new URL("../../../production/images/Female.jpg", import.meta.url).href;
      }
    } else {
      if (document.getElementById("PatientImg") != null) {
        document.getElementById("PatientImg").src = new URL("../../../production/images/Male.jpg", import.meta.url).href;
      }
    }

    age = patient_data1.age == "" ? (age = "--") : (age = patient_data1.age);
    height = patient_data1.height == "" ? (height = "--") : (height = patient_data1.height);
    weight = patient_data1.weight == "" ? (weight = "--") : (weight = patient_data1.weight);
    ailment = patient_data1.ailment == "" ? (ailment = "--") : (ailment = patient_data1.ailment);
    email = patient_data1.email == "" ? (email = "--") : (email = patient_data1.email);
    gender = patient_data1.gender == "" ? (gender = "--") : (gender = patient_data1.gender);
    mobile = patient_data1.mobile == "" ? (mobile = "--") : (mobile = patient_data1.mobile);
    try {
      document.getElementById("PatientName").innerHTML = "Name: " + patientname;
      document.getElementById("PatientGender").innerHTML = "Gender: " + gender;

      document.getElementById("PatientAge").innerHTML = "Age: " + age;
      document.getElementById("PatientHeight").innerHTML = "Height: " + height;
      document.getElementById("PatientWeight").innerHTML = "Weight: " + weight;
      document.getElementById("PatientAilments").innerHTML = "Ailments: " + ailment;
      document.getElementById("PatientEmail").innerHTML = "Email Id: " + email;
      document.getElementById("PatientMob").innerHTML = "Mob No: " + mobile;
    } catch (e) {
      console.error("Unable to set innerHTML", e);
    }
    // document.getElementById("PatientEmail").innerHTML='Email: '+patient_data1.gender;
    //left_colomn_PD(Venu,27,6,70,"well","venu@mail.com",4448743543);
  });
} else {
  console.log("Time out id fetching");
}
/************************************** dashboard js  ********************************************/
