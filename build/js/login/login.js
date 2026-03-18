import { firebaseConfig, fb } from "../livepage/database_function.js";
import { showToast } from "../backend/toastmsg.js";

console.log("now data is fetching : " + firebaseConfig);

let internetConnectionStatus = window.navigator.onLine ? "Online" : "OFFline";
if (internetConnectionStatus == "OFFline") {
  showToast("No Internet connection..!! Check your internet connectivity or try again later");
}

fnBrowserDetect();
function fnBrowserDetect() {
  let userAgent = navigator.userAgent;
  let browserName;

  if (userAgent.match(/chrome|chromium|crios/i)) {
    browserName = "chrome";
  } else if (userAgent.match(/firefox|fxios/i)) {
    browserName = "firefox";
  } else if (userAgent.match(/safari/i)) {
    browserName = "safari";
  } else if (userAgent.match(/opr\//i)) {
    browserName = "opera";
  } else if (userAgent.match(/edg/i)) {
    browserName = "edge";
  } else {
    browserName = "No browser detection";
  }

  if (browserName !== "chrome") {
    showToast("please use google chrome browser for better experience");
  }
  //document.querySelector("h1").innerText="You are using "+ browserName +" browser";
}

var username = document.getElementById("email");
var password = document.getElementById("password");
var buttonClick = document.getElementById("rememberMe");
//console.log("localStorage.RadioButtonValue : ",localStorage.RadioButtonValue);

username.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    password.focus();
  }
});

password.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    submit();
  }
});

if (localStorage.username !== undefined && localStorage.password !== undefined) {
  username.value = localStorage.username;
  password.value = localStorage.password;
  buttonClick.checked = username.value == "" && password.value == "" ? (buttonClick.checked = false) : (buttonClick.checked = true);
}
const element1 = document.getElementById("submit_button");
element1.addEventListener("click", submit);

/* var enter = document.getElementById("loginform"); */
/* enter.addEventListener("keypress", function(event) {
    
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  }); */

function submit() {
  var emailInput = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  const rmCheck = document.getElementById("rememberMe");
  console.log("remember me check?", rmCheck);

  if (rmCheck.checked == true) {
    localStorage.username = emailInput;
    localStorage.password = password;
    localStorage.RadioButtonValue = rmCheck.checked;
  } else if (rmCheck.checked == false) {
    localStorage.username = "";
    localStorage.password = "";
  }
  //location.reload();
  if (internetConnectionStatus == "Online") {
    if (emailInput == "" && password == "") {
      showToast("Please enter email and password");
    } else if (emailInput == "" && password !== "") {
      showToast("Please enter the email");
    } else if (emailInput !== "" && password == "") {
      showToast("Please enter the password");
    } else if (emailInput !== "" && password !== "") {
      firebase
        .auth()
        .signInWithEmailAndPassword(emailInput, password)
        .then((userCredential) => {
          // Signed in
          //var user = userCredential.user;
          const user = firebase.auth().currentUser;
          console.log("login is successfull", user.uid);
          //localStorage.setItem('doctor_id',user.uid);
          var doctor = fb.database().ref().child("roles").child(user.uid);
          doctor.once("value", function (snapshot) {
            let doctor_data = JSON.stringify(snapshot.val(), null, 2);
            let doctor_data1 = JSON.parse(doctor_data);
            var role = doctor_data1.role;
            if (role == "Doctor") {
              localStorage.setItem("doctor_id", user.uid);
              var doctordetails = fb.database().ref().child("doctors").child(user.uid);
              doctordetails.once("value", function (snapshot) {
                let details = JSON.stringify(snapshot.val(), null, 2);
                let docname = JSON.parse(details);
                console.log("docname", docname);
                localStorage.setItem("docname", docname.username);
                history.pushState({ page: "dashboard" }, "Title", "../production/dashboard.html");

                location.replace("dashboard.html");
              });

              //console.log("user role:", role);
            } else {
              showToast("Permits only Doctor Account");
              //console.log("user role:", role);
            }
          });
        })
        .catch((error) => {
          console.log("login is failed");
          var errorCode = error.code;
          var errorMessage = error.message;
          showToast("Please enter valid email or password");
        });
    } else {
      showToast("Please enter valid email and password");
    }
  } else {
    showToast("No Internet connection..!! Check your internet connectivity or try again later");
  }
}
