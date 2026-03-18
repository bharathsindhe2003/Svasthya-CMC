<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <!-- Meta, title, CSS, favicons, etc. -->
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
	<!--<link rel="icon" href="images/favicon.ico" type="image/ico" />-->
  <link rel="icon" href="images/svasthyaicon2.ico" type="image/ico" />
  
    <title>Svasthya | ContextAssesment</title>

    <!-- Bootstrap -->
    <link href="../vendors/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link href="../vendors/font-awesome/css/font-awesome.min.css" rel="stylesheet">
    <!-- NProgress -->
    <link href="../vendors/nprogress/nprogress.css" rel="stylesheet">
    <!-- iCheck -->
    <link href="../vendors/iCheck/skins/flat/green.css" rel="stylesheet">
	    <link href="../build/css/lightbox.css" rel="stylesheet">
    <!-- bootstrap-progressbar -->
    <link href="../vendors/bootstrap-progressbar/css/bootstrap-progressbar-3.3.4.min.css" rel="stylesheet">
    <!-- JQVMap -->
    <link href="../vendors/jqvmap/dist/jqvmap.min.css" rel="stylesheet"/>
    <!-- bootstrap-daterangepicker -->
    <link href="../vendors/bootstrap-daterangepicker/daterangepicker.css" rel="stylesheet">

    <!-- Custom Theme Style -->
    
  <link href="../build/css/LeftandTopNavigation.css" rel="stylesheet">
  <link href="../build/css/LiveRightColomn.css" rel="stylesheet">
  <!-- Final unified layout overrides to eliminate gap between sidebar and content and keep content below fixed top nav -->
  <link href="../build/css/layout-fix.css" rel="stylesheet" />
  </head>

     
  

  <body class="nav-md" >
    <div class="container body">
     <div class="main_container">
        <div class="col-md-3 left_col">
          <div class="left_col scroll-view">
            <div class="nav_title" style="border: 0;">
              <a class="site_title"><img src="images/svasthyaicon.png" width="55" height="55"> 
                <span id="SvasthyaTitle">SVASTHYA &trade;</span></a>
            </div>
            <div id=loader></div>
            <div class="clearfix"></div>

            <!-- menu profile quick info -->
            <div id="left_colomn_details" class="left_colomn_details">
              <div class="profile clearfix">
                <div class="profile_pic">
                  <!-- <img src="images/${gender}.jpg" alt="..." width="50" height="70" class="img-circle profile_img"> -->
                  <img id="PatientImg" alt="..." class="img-circle profile_img">
                </div>
                <div id="profile_info" class="profile_info">
                  <h2 id="PatientName"></h2>
                  <h2 id="PatientGender"></h2>
                  <h2 id="PatientAge"></h2>
                  <h2 id="PatientHeight"></h2>
                  <h2 id="PatientWeight"></h2>
                                   
                  </div>
                  <div  class="profile_info2">
                      <h2 id="PatientAilments"></h2>
                      <h2 id="PatientMob"></h2>
                      <h2 id="PatientEmail" ></h2>
                   </div>
              </div>
                
            </div>
            <!-- menu profile quick info -->
            
              <!-- /menu profile quick info -->
            <!-- /menu profile quick info -->

            <br />

            <!-- sidebar menu -->
            <div id="sidebar-menu" class="main_menu_side hidden-print main_menu">
              <div class="menu_section">
               <!--  <h3>General</h3> -->
                <ul class="nav side-menu">
                <!--   <li><a href="dashboard.html"><i class="fa fa-home"></i> Dashboard <span class="fa fa-chevron-down"></span></a>
                  
                  </li>
                  <li><a href="index.html"><i class="fa fa-desktop"></i> Live<span class="fa fa-chevron-down"></span></a>
                  
                  </li>
                  <li><a href="history.html"><i class="fa fa-bar-chart-o"></i>History<span class="fa fa-chevron-down"></span></a>
                  </li>
                  <li><a href="Configuration.html"><i class="fa fa-gear"></i>Configuration<span class="fa fa-chevron-down"></span></a>
                  </li>
                  <li><a href="Location.html"><i class="fa fa-map-marker"></i>Location<span class="fa fa-chevron-down"></span></a>
                  </li> -->
                  <!--<li><a href="location.html"><i class="fa fa-table"></i> Location<span class="fa fa-chevron-down"></span></a>  
                </li>-->
               <!--   <li><a><i class="fa fa-bar-chart-o"></i> Data Presentation <span class="fa fa-chevron-down"></span></a>
                  </li>
                  <li><a><i class="fa fa-clone"></i>Layouts <span class="fa fa-chevron-down"></span></a>
                  </li>-->
				  
                </ul>
              </div>
              <!--<div class="menu_section">
                <h3>Live On</h3>
                <ul class="nav side-menu">
                  <li><a><i class="fa fa-bug"></i> Additional Pages <span class="fa fa-chevron-down"></span></a>
               
                  </li>
                  <li><a><i class="fa fa-windows"></i> Extras <span class="fa fa-chevron-down"></span></a>
                  
                  </li>
                  <li><a><i class="fa fa-sitemap"></i> Multilevel Menu <span class="fa fa-chevron-down"></span></a>
             
                  </li>                  
                  <li><a href="javascript:void(0)"><i class="fa fa-laptop"></i> Landing Page <span class="label label-success pull-right">Coming Soon</span></a></li>
                </ul>
              </div>-->

            </div>
            <!-- /sidebar menu -->

            <!-- /menu footer buttons -->
           <!-- <div class="sidebar-footer hidden-small">
              <a data-toggle="tooltip" data-placement="top" title="Settings">
                <span class="glyphicon glyphicon-cog" aria-hidden="true"></span>
              </a>
              <a data-toggle="tooltip" data-placement="top" title="FullScreen">
                <span class="glyphicon glyphicon-fullscreen" aria-hidden="true"></span>
              </a>
             <a data-toggle="tooltip" data-placement="top" title="Lock">
                <span class="glyphicon glyphicon-eye-close" aria-hidden="true"></span>
              </a>
              <a data-toggle="tooltip" data-placement="top" title="Logout" href="login.html">
                <span class="glyphicon glyphicon-off" aria-hidden="true"></span>
              </a>
            </div> -->
            <!-- /menu footer buttons -->
          </div>
        </div>

        <!-- top navigation -->
        <div class="top_nav">
          <div class="nav_menu">
  
            <!-- <div  class="Righthand">
              <span id="closebtn" style="color:#ffffff;cursor: pointer;" onclick=""><i class="fa fa-close" ></i> Close</a></span>
            </div> -->

            <div class="Lefthand">
              <p id="DoctorName"></p>
             </div>           
          
           </div>
         </div>		
				
              </ul>
            </nav>
         <!-- </div>-->
      
      
        </div>
        
        <!-- /top navigation -->


				
        
		 <div  class="right_col" role="main">

      

		 <!-- Pie chart for data set 1-->
        <div class="LiveSpecification">


           <!--  context assessment symptom-->
        <!-- <div class="col-md-12 col-sm-8  "> -->
          <div class="Live_context_assessment" >
              <!-- <div class="context_assessment_bar" >   -->
            <p id="ContextSymptomName" ></p>
          <!-- </div> -->
          <!-- </div> -->
        </div>
          
        <!-- / context assessment symptom-->


    <!-- Ews card -->
          <div id="ews_id" class="ews_card_js">  
            <div class="ews_card">  
             
              </div>
          </div>
     <!-- /Ews card -->          
        
     <!-- ECG-->
     <div class="row">

     <div class="col-md-9 col-sm-9 col-xs-9">
      <!-- <div class="form-group row" style="margin-right: 11px;margin-left: 1px;"> -->
          <div><span>Date:<label id="contextecgdate"></label></span> <span style="text-align:right"></span> <span>Time:<label id="contextecgtime"></label></span></div>
                        <div class="x_panel">
                          <div class="x_title">
                            <h2>Electrocardiogram(ECG)</h2>
                            <div class="clearfix"></div>
                          </div>
                          <div class="x_content">

                            <div id="context_ecg" style="width: 100%; height: 280px"></div>

                          </div>
                        </div>
                      
      <!-- /ECG -->            
      
      
       <!-- PPG-->
       <div class="x_panel">
        <div class="x_title">
          <h2>Photoplethysmogram (PPG)</h2>
          <div class="clearfix"></div>
        </div>
        <div class="x_content">
          <div id="context_ppg" style="width: 100%; height: 280px"></div>
        </div>
      </div>
    </div>

    <!-- </div> -->
      <!-- /PPG -->  
            



    
         
            <br>

         <!--------------  Heartrate -------------------->
           <div class="col-md-3">
         <!-- <div class="col-md-4 col-sm-4 widget widget_tally_box"> -->
          <div class="x_panel ui-ribbon-container fixed_height_310">
                <!-- <div class="x_title">
                    <h2>User Mail</h2>
                    <div class="clearfix"></div>
                  </div>-->
                  <div class="x_content">

                  <img src="images/Heartrate.jpg"  
                  style="position: absolute; border-radius: 8px;margin-left: 4px;margin-top: 4px;" width="30px"height="25px">
                      <div id="ContextHeartRateId"  class="echartsgauges1"></div>
                    </div>

                    <h4 class="name_title">Heart Rate</h4>
                </div>

              <!-- </div> -->
        <!--------------  EOF of Heartrate -------------------->



        <!------------------- BloodOxygen---------------------->
  
        <!-- <div class="col-md-4 col-sm-4 widget widget_tally_box"> -->
          <div class="x_panel ui-ribbon-container fixed_height_310">
                <!-- <div class="x_title">
                    <h2>User Mail</h2>
                    <div class="clearfix"></div>
                  </div>-->
                  <!--<div class="x_content">-->
                    <div class="x_content">
                      <img src="images/BloodOxygen.jpg" 
                       style="position: absolute; border-radius: 8px;margin-left: 4px;margin-top: 4px;" width="30px";height="25px">
                      <div id="ContextBloodOxygenId" class="echartsgauges1"></div>
                    </div>

                    <h4 class="name_title">Blood Oxygen</h4>
                </div>
              <!-- </div> -->
        
        <!--------- ------ EOF of BloodOxygen------------------>
        


        <!-------------------- Temperature---------------->
        <!-- <div class="col-md-4 col-sm-4 widget widget_tally_box"> -->
          <div class="x_panel ui-ribbon-container fixed_height_310">
                  <div class="x_content">
                      <img src="images/Temperature.jpg" 
                      style="position: absolute; border-radius: 8px;margin-left: 4px;margin-top: 4px;" width="30px";height="25px">
                      <div id="ContextTemperatureId" class="echartsgauges1"></div>
                    </div>
                    <h4 class="name_title">Temperature</h4>
                  </div>
                <!-- </div> -->
        <!------------------EOF of Temperature---------------->

        



        <!------------------- Activity Monitor / Accelration----------------------->
        <!-- <div class="col-md-4 col-sm-4 widget widget_tally_box"> -->
          <!-- <div class="x_panel ui-ribbon-container fixed_height_310">
            <div class="x_content">
                <img src="images/Accelerometer.png" style="position: absolute;  border-radius: 8px;margin-left: 4px;margin-top: 4px;" width="30px";height="25px">
                <div id="ContextAccelrationId" class="echartsgauges1"></div>
              </div>
              <h4 class="name_title">Activity Monitor</h4>
            </div> -->
          <!-- </div> -->
        <!-----------------EOF of Activity Monitor / Accelration----------------->



        
        <!------------------- BloodPressure----------------------->
        <!-- <div class="col-md-4 col-sm-4 widget widget_tally_box"> -->
          <div class="x_panel ui-ribbon-container fixed_height_310">
                <!-- <div class="x_title">
                    <h2>User Mail</h2>
                    <div class="clearfix"></div>
                  </div>-->
                  <div class="x_content">
                    <img src="images/BloodPressure.jpg" style="position: absolute;  border-radius: 8px;margin-left: 4px;margin-top: 4px;" width="30px";height="25px">
                    <div id="ContextBloodPressureId" class="echartsgauges1"></div>
                    </div>

                    <h4 class="name_title">Blood Pressure</h4>
                </div>
              <!-- </div> -->
         <!----------------EOF of  BloodPressure------------------->

          

        <!------------------- RespirationRate----------------------->
        <!-- <div class="col-md-4 col-sm-4 widget widget_tally_box"> -->
          <div class="x_panel ui-ribbon-container fixed_height_310">
        <!-- <div class="x_title">
            <h2>User Mail</h2>
            <div class="clearfix"></div>
          </div>-->
          <!--<div class="x_content">-->
            <div class="x_content">
              <img src="images/RespirationRate.jpg" style="position: absolute;  border-radius: 8px;margin-left: 4px;margin-top: 4px;" width="30px";height="25px">
              <div id="ContextRespirationRateId" class="echartsgauges1"></div>
            </div>

            <h4 class="name_title">Respiration Rate</h4>
          </div>
        <!-- </div> -->
        <!-------------------EOF of  RespirationRate----------------->


        </div>
      </div>
      <div style="position: absolute; top: 10px; right: 50px;">
        <span>Date:<label id="contextsensordate"></label></span>
        <span style="text-align: justify; margin-right: 10px;"></span>
        <span>Time:<label id="contextsensortime"></label></span>
      </div>
    </div>
   
    
  </div>
  


</div>

<div id="lightboxcontext">
  <div id="lightboxcontainercontext"></div>
  <div id="closebuttoncontext">&times;</div>
</div>
    <!-- jQuery -->
    <script src="../vendors/jquery/dist/jquery.min.js"></script>
    <!-- Bootstrap -->
    <script src="../vendors/bootstrap/dist/js/bootstrap.min.js"></script>
    <!-- FastClick -->
    <script src="../vendors/fastclick/lib/fastclick.js"></script>
    <!-- NProgress -->
    <script src="../vendors/nprogress/nprogress.js"></script>
    <!-- Chart.js -->
    <script src="../vendors/Chart.js/dist/Chart.min.js"></script>
    <!-- gauge.js -->
    <script src="../vendors/gauge.js/dist/gauge.min.js"></script>
    <!-- bootstrap-progressbar -->
    <script src="../vendors/bootstrap-progressbar/bootstrap-progressbar.min.js"></script>
    <!-- iCheck -->
    <script src="../vendors/iCheck/icheck.min.js"></script>
    <!-- Skycons -->
    <script src="../vendors/skycons/skycons.js"></script>
    <!-- Flot -->
    <script src="../vendors/Flot/jquery.flot.js"></script>
    <script src="../vendors/Flot/jquery.flot.pie.js"></script>
    <script src="../vendors/Flot/jquery.flot.time.js"></script>
    <script src="../vendors/Flot/jquery.flot.stack.js"></script>
    <script src="../vendors/Flot/jquery.flot.resize.js"></script>
    <!-- Flot plugins -->
    <script src="../vendors/flot.orderbars/js/jquery.flot.orderBars.js"></script>
    <script src="../vendors/flot-spline/js/jquery.flot.spline.min.js"></script>
    <script src="../vendors/flot.curvedlines/curvedLines.js"></script>
    <!-- DateJS -->
    <script src="../vendors/DateJS/build/date.js"></script>
    <!-- JQVMap -->
    <script src="../vendors/jqvmap/dist/jquery.vmap.js"></script>
    <!-- <script src="../vendors/jqvmap/dist/maps/jquery.vmap.world.js"></script> -->
    <script src="../vendors/jqvmap/examples/js/jquery.vmap.sampledata.js"></script>
    <!-- bootstrap-daterangepicker -->
    <script src="../vendors/moment/min/moment.min.js"></script>
    <script src="../vendors/bootstrap-daterangepicker/daterangepicker.js"></script>
	<script src="../vendors/echarts/dist/echarts.min.js"></script>
    <!-- <script src="../vendors/echarts/map/js/world.js"></script> -->
    <script src="../vendors/jquery-sparkline/dist/jquery.sparkline.min.js"></script>
    <!-- Custom Theme Scripts -->
    <script type="module" src="../build/js/context_assessment/context_assessment_UI.js" ></script>
    <script type="module" src="../build/js/LeftandTopNavigation/LeftandTopNavigation.js" ></script>
	 
	 <!-- easy-pie-chart -->
    <script src="../vendors/jquery.easy-pie-chart/dist/jquery.easypiechart.min.js"></script>
	
	
	
	  <!-- TODO: Add SDKs for Firebase products that you want to use
	  https://firebase.google.com/docs/web/setup#available-libraries -->
      <script src="https://www.gstatic.com/firebasejs/8.6.2/firebase-app.js"></script>
      <script src="https://www.gstatic.com/firebasejs/8.6.2/firebase-database.js"></script>
      <script src="https://www.gstatic.com/firebasejs/8.6.2/firebase-auth.js"></script>
      <script src="https://www.gstatic.com/firebasejs/8.6.2/firebase-analytics.js"></script>
	
  </body>
</html>

