Application: Svasthya Playstore Respiration (CMC)

Company: TANTRAGYAAN — Unit of TANTROTTOLAN SOLUTIONS LLP.

Link: https://bharathsindhe2003.github.io/Svasthya-CMC/production/login.html

<hr>

# Folder Structure:

| .gitignore
| .nojekyll                                        # Required for GitHub Pages hosting
| index.html                                       # Entry file for GitHub Pages hosting
| LICENSE
| README.md
|
|-- build/
| |-- assests/
| | |-- aduio2.mp3                                 # Audio file for threshold notification sound
| |
| |-- css/
| | |-- context_assment_LeftandTopNavigation.css   
| | |-- context_assment_LiveRightColomn.css        # Styles for the context component in context_assment.html 
| | |-- custom.min.css
| | |-- DashbordRightColomn.css                    # Styles for the dashboard in dashboard.html
| | |-- HistoryRightColomn.css                     # Styles for the History component in index.html
| | |-- incomingDialogbox.css                      
| | |-- LeftandTopNavigation.css                   # Styles for the top navigation in dashboard.html and top navigation and left taskbar in index.html
| | |-- lightbox.css                               
| | |-- LiveRightColomn.css                        # Styles for the live component in index.html
| | |-- login-custom.css                           # Styles for login.html
| | |-- vital.css                                  # Styles for the threshold configuration component in index.html
| |
| |-- js/
| | |-- backend/
| | | |-- toastmsg.js                              # Displays toast messages
| | |
| | |-- context_assessment/
| | | |-- context_assessment_UI.js                 # Fetches and plots ECG, PPG, RR, EWS score, and five vitals in the history view
| | |
| | |-- context_ecg/
| | | |-- context_ecg.js                           # Fetches and plots the ECG graph in the history view
| | |
| | |-- dashboard/
| | | |-- dashboard-custom.js                      # Fetches and updates ECG, PPG, RR, EWS score, and five vitals on the dashboard
| | | |-- Dashboard-UI.js                          # Renders patient cards on the dashboard
| | |
| | |-- history/
| | | |-- Ecg_line_chart.js
| | | |-- history_fb_module.js                     # Fetches data and calculates values for the history charts
| | | |-- history_UI_module.js                     # Renders charts on the history page
| | | |-- option-module.js                         # Sets Hour, Day, Week, and custom options for the History component
| | |
| | |-- LeftandTopNavigation/
| | | |-- LeftandTopNavigation.js                  # Displays patient details in the left taskbar and the doctor name in the navbar
| | |
| | |-- livepage/
| | | |-- database_function.js                     # Calculates live data and falls back to the last valid reading when a device is not connected
| | | |-- EchartGraphs.js                          # Defines placeholder states such as no ECG, PPG, RR, or other live data
| | | |-- live-custom.js                           # Displays ECG, PPG, RR, EWS score, and five vitals on the live page and plots five vitals in context assessment
| | |
| | |-- login/
| | | |-- login.js                                 # Handles login logic
| | |
| | |-- utils/
| | | |-- echarts-auto-resize.js                   # Resizes charts based on the app zoom level
| | | |-- Threshold_triggers.js                    # Listens for threshold triggers used in dashboard.html and index.html
| | |
| | |-- vitals/
| | | |-- vitals_module.js                         # Handles threshold configuration logic
|
|-- production/
| |-- context_assment.html                         # Popup view showing ECG, PPG, RR, EWS score, and five vitals
| |-- context_ecg.html                             # Popup view showing only the patient's ECG in history
| |-- dashboard.html                               # Dashboard page showing all patient cards
| |-- index.html                                   # Main page containing the Live, History, and Threshold Configuration components
| |-- login.html                                   # Login page
| |
| |-- css/
| | |-- maps/
| | | |-- jquery-jvectormap-2.0.3.css
| |
| |-- images/
| | |-- Female.jpg                                # Left taskbar profile image
| | |-- Male.jpg                                  # Left taskbar profile image
| | |-- user.png                                  # Navbar profile image
| | |-- ... (other image assets)
|
|-- vendors/
| |-- animate.css/
| |-- autosize/
| |-- bootstrap/
| |-- bootstrap-daterangepicker/
| |-- ... (other vendor libraries)

<hr>

# Version Control

1. Version Update: 0.1.0

   Features:
   - Used the Svasthya Playstore Respiration as base Version
   - Added blinking effect and sound effect for a patients card if his/her vital cross threshold values
   - Redsigned the Congiration tab

RELEASE DATE: 17-03-2026

<hr>

2. Version Update: 0.1.1

   Features:
   - Removed double click for all charts in HIstory tab
   - Rounded the Tempratuere to 2 digit after decimal in History Tab
   - Resolved the issue for flickring in dashborad page
   - Resolved issue with battery icon not showing.
   - Redsigned the patient card in dashborad page
   - Redsigned the history tab

RELEASE DATE: 18-03-2026

<hr>

3. Version Update: 0.1.5

Features:

- Fixed issue with SPO2 not beening displayed in History
- Resolved 2 UI Changes

RELEASE DATE: 23-03-2026

<hr>

4. Version Update: 0.1.7

Features:

- Removed activity from history.
- Remove notification and video files and code from codebase

RELEASE DATE: 23-03-2026

<hr>

5. Version Update: 0.1.8

Features:

- Added Listerns to both dashborad page and live page.
- Added empty string handling for threshold_trigers
- Added CSS to fit it in TV Screen
- Resolved Issue with EWS Score
- undefined getting displayed in dashboard for new created patients - Issue resolved
- no chart getting ploted for Alert threshold - Issue resolved

RELEASE DATE: 24-03-2026

<hr>

6. Version Update: 0.1.10

Features:

- Resolved issue related EWS score

RELEASE DATE: 24-03-2026

<hr>

7. Version Update: 0.1.11

Features:

- Update UI in dashborad and patient cards, Live page and Login page

RELEASE DATE: 30-03-2026
