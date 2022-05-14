var noTrackActivity;
var carIllustrationPaths = [];
var headshotPaths = [];
var carEndplatePaths = [];
var flagPaths = [];
var filcarIllustrationPaths = [];
var filheadshotPaths = [];
var filcarEndplatePaths = [];
var filFlagPaths = [];
var redirectURL;
var refreshURL;
var timedRace = false;
var indycarDriversLoaded = false;
var filDriversLoaded = false;
var rain_delay = false;
var forced_warm = false;
var configLoaded = false;
var showRadio = false;
var showVideo = false;
var showTrackMap = false;
var showAd = false;
var videosource = "";
var radiosource = "";
var adsource = "";
var adimagesource = "";
var configRefreshInterval;
var trapSpeedColumn = "";
var lastTrapSpeedColumn = "";

// The current application coordinates were pre-registered in a B2C tenant.
var applicationConfig = {
    clientID: 'b40aa513-3ae8-4390-a085-94aac9d60ef1',
    authority: "https://indycar.b2clogin.com/indycar.onmicrosoft.com/b2c_1_signupin/",
    b2cScopes: ["https://indycar.onmicrosoft.com/webapi/read_policies"],
    forgotPasswordAuthority: "https://indycar.b2clogin.com/indycar.onmicrosoft.com/b2c_1_passreset/",
};

//"use strict";
//var clientApplication = new Msal.UserAgentApplication(applicationConfig.clientID, applicationConfig.authority, function (errorDesc, token, error, 
tokenType) {
// Called after loginRedirect or acquireTokenPopup
//});

$(document).ready(function () {
    if (window.location.href.indexOf('localhost') == -1 && location.protocol != 'https:') {
        location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
    }
    //if (window.location.href.indexOf('localhost') > -1) {
    //    updateUI();
    //}
    //var errorDesc = sessionStorage.getItem("error_description");
    ////console.log('err=' + errorDesc);
    //if (errorDesc !=null && errorDesc.indexOf("AADB2C90118") > -1) {
    //    //console.log("forgot password");
    //     //Set the authority to the forgot password
    //    clientApplication.authority = applicationConfig.forgotPasswordAuthority;
    //     //and head there.
    //    login();
    //    return false;
    //}

    //var user = clientApplication.getUser();
    //if (user !=null) {
    //    updateUI();
    //}
    //else {
    //    if (getCookie('rc-auth') !='') {
    //        updateUI();
    //    } else {
    //        $('#loginDiv').css('display', 'block');
    //    }
    //}
    updateUI();
});

//function login() {
//   clientApplication.loginRedirect(applicationConfig.b2cScopes).then(function (idToken) {
//        clientApplication.acquireTokenSilent(applicationConfig.b2cScopes).then(function (accessToken) {
//            updateUI();
//        }, function (error) {
//            clientApplication.acquireTokenRedirect(applicationConfig.b2cScopes).then(function (accessToken) {
//                updateUI();
//            }, function (error) {
//                logMessage("Error acquiring the popup:\n" + error);
//            });
//        });
//    }, function (error) {
//        logMessage("Error during login:\n" + error);
//    });
//}

function logMessage(s) {
    console.log(s);
}

function updateUI() {
    window.scrollTo(0, 0);
    $('#loginDiv').css('display', 'none');

    //if (getCookie('rc-auth') == '') {
    //    setCookie('rc-auth', clientApplication.getUser().name, 180);
    //}

    checkConfig();

    var date = new Date();
    var driverUrl = 'https://feeds.indycar.com/driversfeed.json?' + date.getMilliseconds();

    $.ajax({
        type: 'GET',
        url: driverUrl,
        async: false,
        jsonpCallback: 'driverCallback',
        contentType: "application/json",
        dataType: 'jsonp',
        success: parseDriverJSON
    });

    var driverFILUrl = 'https://feeds.indycar.com/driversfeed_fil.json?' + date.getMilliseconds();

    $.ajax({
        type: 'GET',
        url: driverFILUrl,
        async: false,
        jsonpCallback: 'driverFILCallback',
        contentType: "application/json",
        dataType: 'jsonp',
        success: parseDriverFILJSON
    });
}
function checkConfig() {

    var date = new Date();
    //var configUrl = 'https://racecontrol.indycar.com/xml/TSConfig.json?' + date.getMilliseconds();
    //var configUrl = 'https://local.ims.com/xml/TSConfig.json';
    var configUrl = 'https://indycarsso.blob.core.windows.net/racecontrol/tsconfig.json?' + date.getMilliseconds();

    $.ajax({
        type: 'GET',
        url: configUrl,
        async: false,
        jsonpCallback: 'tsconfigCallback',
        contentType: "application/json",
        dataType: 'jsonp',
        success: parseTSConfigJSON
    });
}

function parseTSConfigJSON(configData) {
    if (configData.refresh != "" && configData.refresh != document.location) {
        refreshURL = configData.refresh;
        if (refreshURL != null && refreshURL != "") {
            document.location = refreshURL;
        }
    }

    if (configData.no_track_activity == "TRUE") {
        noTrackActivity = true;
    }
    else {
        noTrackActivity = false;
    }

    if (configData.rain_delay == "TRUE") {
        rain_delay = true;
    }
    else {
        rain_delay = false;
    }

    if (configData.trap_speed_name != null) {
        trapSpeedColumn = configData.trap_speed_name;
    }

    if (configData.last_trap_speed_name != null) {
        lastTrapSpeedColumn = configData.last_trap_speed_name;
    }

    if (noTrackActivity) {
        $('#noTrackActivityDiv').css('display', 'block');
    }
    else {
        $('#noTrackActivityDiv').css('display', 'none');
    }

    if (rain_delay) {
        $('#rainDelayDiv').css('display', 'block');
    }
    else {
        $('#rainDelayDiv').css('display', 'none');
    }

    if (rain_delay || noTrackActivity) {
        $('#hiddenNoTrackActivity').val("TRUE");
        $('#RaceControlContentDiv').css('display', 'none');
    }
    else {
        $('#hiddenNoTrackActivity').val("FALSE");
        $('#RaceControlContentDiv').css('display', 'block');
    }

    if (!noTrackActivity && !rain_delay) {
        if (configData.redirect_url != "") {
            redirectURL = configData.redirect_url;
            if (redirectURL != null && redirectURL != "") {
                //document.location = redirectURL;
            }
        }

        if (configData.timed_race == "TRUE") {
            timedRace = true;
        }
        else {
            timedRace = false;
        }

        if (configData.show_radio == "TRUE") {
            if (showRadio != true) {
                showRadio = true;
                $('#radioContainer').css('display', 'block');
                radiosource = "https://www.youtube.com/embed/" + configData.radio_source + "?autoplay=0";
                $('#RadioPlayer').attr('src', radiosource);
            } else {
                if (radiosource != "https://www.youtube.com/embed/" + configData.radio_source + "?autoplay=0") {
                    radiosource = "https://www.youtube.com/embed/" + configData.radio_source + "?autoplay=0";
                    $('#RadioPlayer').attr('src', radiosource);
                }
            }
        }
        else {
            if (showRadio != false) {
                showRadio = false;

                $('#RadioPlayer').src = "";
                $('#RadioPlayer').attr('src', $('#RadioPlayer').attr('src'));
            }
            $('#radioContainer').css('display', 'none');
        }

        var videoDisplay = $('#VideoDiv').css('display');
        if ($('#VideoDiv').css('display') == 'none') {
            showVideo = false;
        }
        else {
            showVideo = true;
        }

        if (configData.show_video == "TRUE" || $("body").hasClass("global")) {
            //Size Twiter Control
            //$('#twitterDiv').css('height', '220px');
            //$('#videoAd').css('display', 'block');

            if (showVideo != true) {
                showVideo = true;
                $('#VideoDiv').css('display', 'block');
                //if (!$("body").hasClass("global")) {
                //    videosource = configData.video_source + '?enablejsapi=1&rel=0&showinfo=0';
                //    $('#VideoPlayer').attr('src', videosource);
                //}
                if (!$("body").hasClass("global")) {
                    videosource = configData.video_source;
                    $('#VideoPlayer').attr('src', videosource);
                }
            }
            else {
                videosource = $('#VideoPlayer').attr('src');
                //if (videosource !=configData.video_source + '?enablejsapi=1&rel=0&showinfo=0' && !$("body").hasClass("global")) {
                //    videosource = configData.video_source + '?enablejsapi=1&rel=0&showinfo=0';
                //    $('#VideoPlayer').attr('src', videosource);
                //}
                if (videosource != configData.video_source && !$("body").hasClass("global")) {
                    videosource = configData.video_source;
                    $('#VideoPlayer').attr('src', videosource);
                }
            }
        }
        else {
            //Size Twiter Control
            //$('#twitterDiv').css('height', '230px');
            $('#videoAd').css('display', 'none');

            if (showVideo != false) {
                showVideo = false;
                $('#VideoDiv').css('display', 'none');
                $('#VideoPlayer').src = "";
                $('#VideoPlayer').attr('src', $('#VideoPlayer').attr('src'));
            }
        }

        $('#trackMapImage').attr('src', configData.track_map_url);

        if (configData.show_ad == "TRUE") {
            if (showAd != true) {
                showAd = true;
                $('#AdDiv').css('display', 'block');
                adsource = configData.ad_url;
                $('#AdLink').attr('href', adsource);
                videoAdSource = configData.video_ad_url;
                $('#VideoAdLink').attr('href', videoAdSource);
                adimagesource = configData.ad_image_url;
                $('#radioAd').css('background-image', 'url(\'' + adimagesource + '\')');
                videoAdImageSrc = configData.video_ad_image_url;
                $('#VideoAdImage').attr('src', videoAdImageSrc);
                //mobileAdSource = configData.video_ad_url;
                //$('#MobileAdLink').attr('href', mobileAdSource);
                //mobileAdImageSrc = configData.video_ad_image_url;
                //$('#MobileAdImage').attr('src', mobileAdImageSrc);
            } else {
                adsource = configData.ad_url;
                $('#AdLink').attr('src', adsource);
                videoAdSource = configData.video_ad_url;
                $('#VideoAdLink').attr('href', videoAdSource);
                adimagesource = configData.ad_image_url;
                $('#AdImage').attr('src', adimagesource);
                videoAdImageSrc = configData.video_ad_image_url;
                $('#VideoAdImage').attr('src', videoAdImageSrc);
                //mobileAdSource = configData.video_ad_url;
                //$('#MobileAdLink').attr('href', mobileAdSource);
                //mobileAdImageSrc = configData.video_ad_image_url;
                //$('#MobileAdImage').attr('src', mobileAdImageSrc);
            }
        }
        else {
            if (showAd != false) {
                showAd = false;
                $('#AdDiv').css('display', 'none');
                $('#videoAd').css('display', 'none');
                $('#twitterDiv').css('height', '585px');
                //$('#mobileAd').css('display', 'none');
            }
        }

        if (!showAd && !showRadio && !showVideo) {
            $('#twitterDiv').css('display', 'none');
        }

        if (configData.large_video_player == "TRUE") {
            $('#FullTrackFeedDiv').css('height', '420px');
            $('#FullTrackFeedDiv').css('width', '670px');
            $('#SmallTrackFeedDiv').css('height', '1');
            $('#SmallTrackFeedDiv').css('width', '1');
        }
        else if (configData.large_video_player == "FALSE") {
            $('#FullTrackFeedDiv').css('height', '1');
            $('#FullTrackFeedDiv').css('width', '1');
            $('#SmallTrackFeedDiv').css('height', '190px');
            $('#SmallTrackFeedDiv').css('width', '275px');
        }
        else if (configData.large_video_player == "HIDE") {
            $('#FullTrackFeedDiv').css('height', '1');
            $('#FullTrackFeedDiv').css('width', '1');
            $('#SmallTrackFeedDiv').css('height', '1');
            $('#SmallTrackFeedDiv').css('width', '1');
        }
    }
}

function parseDriverJSON(driverData) {
    $.each(driverData.drivers.driver, function (i, item) {
        var driverID = item.rc_driver_id;
        var number = item.number;
        var endplate = item.endplatelarge;
        var carillustration = item.carillustration;
        var headShot = item.headshot;
        var flag = item.flag;
        carIllustrationPaths[number] = carillustration;
        headshotPaths[driverID] = headShot;
        carEndplatePaths[number] = endplate;
        flagPaths[driverID] = flag;
    });
    indycarDriversLoaded = true;
    initialDataLoad();
}

function parseDriverFILJSON(driverFILData) {
    $.each(driverFILData.drivers.driver, function (i, item) {
        var driverID = item.rc_driver_id;
        var number = item.number;
        var endplate = item.endplatelarge;
        var carillustration = item.carillustration;
        var headShot = item.headshot;
        var flag = item.flag;
        filcarIllustrationPaths[number] = carillustration;
        filheadshotPaths[driverID] = headShot;
        filcarEndplatePaths[number] = endplate;
        filFlagPaths[driverID] = flag;
    });
    filDriversLoaded = true;
    initialDataLoad();
}

function initialDataLoad() {
    if (indycarDriversLoaded && filDriversLoaded) {
        LoadAndRefresh();
    }
}

function LoadAndRefresh() {
    window.clearInterval(configRefreshInterval);
    checkConfig();
    if (noTrackActivity == false) {
        fetchJSON();
    }
    configRefreshInterval = window.setInterval(LoadAndRefresh, 5000);
}

function fetchJSON() {

    //var url = 'https://racecontrol.indycar.com/xml/timingscoring.json';
    //var url = 'https://local.ims.com/xml/timingscoring.json';
    var url = 'https://indycarsso.blob.core.windows.net/racecontrol/timingscoring.json'

    $.ajax({
        type: 'GET',
        url: url,
        async: false,
        jsonpCallback: 'jsonCallback',
        contentType: "application/json",
        dataType: 'jsonp',
        success: parseJSON
    });
}

function toggleDisplay() {
    fetchJSON();
}

function hideTiming() {
    $('.container').empty();
    $('#NoActivityDiv').css('display', 'block');
    $('#TimingScoringTable').css('display', 'none');
}

function parseJSON(data) {
    //Define Track and Session Variables
    var sessionType = data.timing_results.heartbeat.preamble.substring(0, 1);

    var series = data.timing_results.heartbeat.preamble.substring(data.timing_results.heartbeat.preamble.length - 1);

    var trackType = data.timing_results.heartbeat.trackType;

    $('#MobileTimeRemainingLabel').text('');
    $('#MobileLapsLabel').text('');
    $('#MobileSessionNameLabel').text('');
    $('#MobileSessionCommentLabel').text('');

    if (series == "F") {
        $('#MobileSeriesHeaderImage').css('display', 'block');
        $('#MobileSeriesLogoImage').attr("src", 'https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/2019/2000_logo.png');
    }
    else if (series == "P") {
        $('#MobileSeriesHeaderImage').css('display', 'block');
        $('#MobileSeriesLogoImage').attr("src", 'https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/2019/pro_logo.png');
    }
    else if (series == "L") {
        $('#MobileSeriesHeaderImage').css('display', 'block');
        $('#MobileSeriesLogoImage').attr("src", 'https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/2019/il_logo.png');
    }
    else if (series == "I") {
        $('#MobileSeriesHeaderImage').css('display', 'block');
        $('#MobileSeriesLogoImage').attr("src", 'https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/2019/indycar_logo.png');
    }
    else {
        $('#MobileSeriesHeaderImage').css('display', 'none');
        $('#MobileSeriesHeaderImage').src = "";
        $('#MobileSeriesLogoImage').attr("src", '');
    }

    if (sessionType == "P" && data.timing_results.heartbeat.currentFlag != "UNFLAGGED") {

        if (data.timing_results.heartbeat.overallTimeToGo != null) {
            $('#MobileTimeRemainingLabel').text('Time Remaining in Session: ' + data.timing_results.heartbeat.overallTimeToGo);
        }
        else {
            $('#MobileTimeRemainingLabel').text('');
        }

        if (data.timing_results.heartbeat.preamble.substring(1, 2).toUpperCase() == "F") {
            $('#MobileSessionNameLabel').text("Practice for the " + data.timing_results.heartbeat.eventName + " at " + 
data.timing_results.heartbeat.trackName);
        }
        else {
            $('#MobileSessionNameLabel').text("Practice " + data.timing_results.heartbeat.preamble.substring(1, 2) + " for the " + 
data.timing_results.heartbeat.eventName + " at " + data.timing_results.heartbeat.trackName);
        }
    }
    else if (sessionType == "R") {
        if (timedRace) {
            $('#MobileTimeRemainingLabel').text('Time Remaining in Race: ' + data.timing_results.heartbeat.overallTimeToGo);
        }
        else {
            var lapNumber = parseInt(data.timing_results.heartbeat.lapNumber);
            lapNumber = lapNumber + 1;
            $('#MobileLapsLabel').text('Lap ' + lapNumber + ' of ' + data.timing_results.heartbeat.totalLaps);
        }

        if (data.timing_results.heartbeat.preamble.length > 3) {
            var session = data.timing_results.heartbeat.preamble.substring(2, 1);

            $('#MobileSessionNameLabel').text(data.timing_results.heartbeat.eventName + " at " + data.timing_results.heartbeat.trackName);
        }
        else {

            $('#MobileSessionNameLabel').text(data.timing_results.heartbeat.eventName + " at " + data.timing_results.heartbeat.trackName);
        }
    }
    else if (sessionType == "Q" && data.timing_results.heartbeat.currentFlag != "UNFLAGGED") {
        if (trackType != "O") {

            if (data.timing_results.heartbeat.overallTimeToGo != null) {
                $('#MobileTimeRemainingLabel').text('Time Remaining in Session: ' + data.timing_results.heartbeat.overallTimeToGo);
            }
            else {
                $('#MobileTimeRemainingLabel').text('');
            }
        }

        if (data.timing_results.heartbeat.preamble.substring(data.timing_results.heartbeat.preamble.indexOf('.') + 1, 
data.timing_results.heartbeat.preamble.indexOf('.') + 2) == "I" || data.timing_results.heartbeat.preamble == 'Q4') {

            if (data.timing_results.heartbeat.preamble == 'Q4') {
                series = "I";
            }

            if (data.timing_results.heartbeat.trackType == "O" || data.timing_results.heartbeat.trackType == "I") {
                $('#MobileSessionNameLabel').text("Qualifying for the " + data.timing_results.heartbeat.eventName + " at " + 
data.timing_results.heartbeat.trackName);
            }
            else if (data.timing_results.heartbeat.preamble.substring(1, 2) == "3") {
                $('#MobileSessionNameLabel').text("Qualifying - Round 2 for the " + data.timing_results.heartbeat.eventName + " at " + 
data.timing_results.heartbeat.trackName);
            }
            else if (data.timing_results.heartbeat.preamble.substring(1, 2) == "4") {
                $('#MobileSessionNameLabel').text("Firestone Fast Six Qualifying for the " + data.timing_results.heartbeat.eventName);
            }
            else {
                $('#MobileSessionNameLabel').text("Qualifying - Group " + data.timing_results.heartbeat.preamble.substring(1, 2) + " for the " + 
data.timing_results.heartbeat.eventName + " at " + data.timing_results.heartbeat.trackName);
            }
        }
        else {
            $('#MobileSessionNameLabel').text("Qualifying for the " + data.timing_results.heartbeat.eventName + " at " + 
data.timing_results.heartbeat.trackName);
        }
    }
    else if (sessionType == "I") {
        if (data.timing_results.heartbeat.overallTimeToGo != null) {
            $('#MobileTimeRemainingLabel').text('Time Remaining in Session: ' + data.timing_results.heartbeat.overallTimeToGo);
        }
        else {
            $('#MobileTimeRemainingLabel').text('');
        }

        if (data.timing_results.heartbeat.preamble.substring(1, 2) == "3") {
            $('#MobileSessionNameLabel').text("Qualifications - Fast 9 at the " + data.timing_results.heartbeat.trackName);
        }
        else if (data.timing_results.heartbeat.preamble.substring(1, 2) == "2") {
            $('#MobileSessionNameLabel').text("Qualifications - Last Chance Qualifier at the " + data.timing_results.heartbeat.trackName);
        }
        else {
            $('#MobileSessionNameLabel').text("Qualifications - Day 1 at the " + data.timing_results.heartbeat.trackName);
        }
    }

    $('#MobileSessionCommentLabel').text(data.timing_results.heartbeat.Comment);

    $('#MobileStatusDiv').css('background-color', '#fcff00');
    $('#MobileStatusDiv').css('background-image', '');
    $('#MobileStatusDiv').css('background-position', '');
    $('#MobileStatusDiv').css('background-repeat', '');
    $('#MobileStatusLabel').css('display', 'none');
    $('#MobileTimeRemainingDiv').css('display', 'none');
    $('#MobileLapsDiv').css('display', 'none');
    $('#NoActivityDiv').css('display', 'none');

    //checkConfig();

    //if (redirectURL !=null && redirectURL !="") {
    //    document.location = redirectURL;
    //}

    $('#MobileStatusDiv').css('display', 'block');

    $('#MobileHeaderDiv').css('background-image', 'none');

    //Flag Condition
    if (sessionType == 'R' && (lapNumber == data.timing_results.heartbeat.totalLaps)) {
        $('#SessionInformationDiv').css("background", "top right no-repeat 
url('https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/2018/img_flag_white.jpg')");
        $('#MobileTimeRemainingDiv').css('display', 'block');
        $('#MobileLapsDiv').css('display', 'block');
    }
    else if (data.timing_results.heartbeat.currentFlag == "GREEN") {
        $('#SessionInformationDiv').css("background", "top right no-repeat 
url('https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/2018/img_flag_green.jpg')");
        $('#MobileTimeRemainingDiv').css('display', 'block');
        $('#MobileLapsDiv').css('display', 'block');
    }
    else if (data.timing_results.heartbeat.currentFlag == "YELLOW") {
        $('#SessionInformationDiv').css("background", "top right no-repeat 
url('https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/2018/img_flag_yellow.jpg')");
        $('#MobileTimeRemainingDiv').css('display', 'block');
        $('#MobileLapsDiv').css('display', 'block');
    }
    else if (data.timing_results.heartbeat.currentFlag == "COLD") {
        $('#SessionInformationDiv').css("background", "top right no-repeat 
url('https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/2018/img_flag_checkered.jpg')");
        $('#MobileTimeRemainingDiv').css('display', 'block');
        $('#MobileLapsDiv').css('display', 'block');
    }
    else if (data.timing_results.heartbeat.currentFlag == "RED") {
        $('#SessionInformationDiv').css("background", "top right no-repeat 
url('https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/2018/img_flag_red.jpg')");
        $('#MobileTimeRemainingDiv').css('display', 'block');
        $('#MobileLapsDiv').css('display', 'block');
    }
    else if (data.timing_results.heartbeat.currentFlag == "CHECKERED") {
        $('#SessionInformationDiv').css("background", "top right no-repeat 
url('https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/2018/img_flag_checkered.jpg')");
        $('#MobileTimeRemainingDiv').css('display', 'none');
        $('#MobileLapsDiv').css('display', 'none');
    }
    else if (data.timing_results.heartbeat.currentFlag == "WARM" || data.timing_results.heartbeat.currentFlag == "UNFLAGGED" || 
data.timing_results.heartbeat.currentFlag == "COLD") {
        $('#SessionInformationDiv').css("background", "top right no-repeat 
url('https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/2018/img_flag_yellow.jpg')");
        $('#MobileTimeRemainingDiv').css('display', 'none');
        $('#MobileLapsDiv').css('display', 'none');
    }

    //var noTowDrivers = [];

    //Define Column Containing Divs
    var differenceColumn = '';
    var gapColumn = '';
    var movementColumn = '';
    var engineColumn = '';
    var bestLapTimeColumn = '';
    var bestLapSpeedColumn = '';
    var lastLapTimeColumn = '';
    var lastLapSpeedColumn = '';
    var averageSpeedColumn = '';
    var totalTimeColumn = '';
    var tireColumn = '';
    var startedColumn = '';
    var p2pColumn = '';
    var lspColumn = '';
    var totalLapsColumn = '';
    var statusColumn = '';
    var warmupSpeedColumn = '';
    var warmupTimeColumn = '';
    var lap1SpeedColumn = '';
    var lap2SpeedColumn = '';
    var lap3SpeedColumn = '';
    var lap4SpeedColumn = '';
    var lap1TimeColumn = '';
    var lap2TimeColumn = '';
    var lap3TimeColumn = '';
    var lap4TimeColumn = '';
    var section1Column = '';
    var section2Column = '';
    var section3Column = '';
    var bestSection1Column = '';
    var bestSection2Column = '';
    var bestSection3Column = '';
    var totalPitStopsColumn = '';
    var totalPassesColumn = '';
    var commentColumn = '';
    var bestLapNumberColumn = '';
    var noTowBestSpeedColumn = '';
    var noTowBestTimeColumn = '';
    var noTowRankColumn = '';
    var noTowLapNumberColumn = '';
    var bestT1TrapSpeedDisplayColumn = '';
    var lastT1TrapSpeedDisplayColumn = '';
    var bestT2TrapSpeedDisplayColumn = '';
    var lastT2TrapSpeedDisplayColumn = '';
    var bestT3TrapSpeedDisplayColumn = '';
    var lastT3TrapSpeedDisplayColumn = '';
    var qStatusColumn = '';
    //var noTowTimeColumn = '';
    //var noTowSpeedColumn = '';
    //var noTowLapNumberColumn = '';
    //var noTowRankColumn = '';

    //Create Header Row
    var tableData = '<div style="clear: both; background-color: black; height: 30px; min-height: 30px; line-height: 30px; float: left; margin-left: 
1%;" class=\"mobileHeaderRow\"></div>';

    if (sessionType == 'R') {
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"mobileNormalColumn\">Diff.</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"expandedMobileColumns\">Gap</div>";
        if (trackType == 'O' || trackType == 'I') {
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"expandedMobileColumns\">BLS</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"expandedMobileColumns\">LLS</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">BLT</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">LLT</div>";
        }
        else {
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"expandedMobileColumns\">BLT</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"expandedMobileColumns\">LLT</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">BLS</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">LLS</div>";
        }
        if (series == 'I' && (trackType == 'RC' || trackType == 'SC')) {
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"extraExpandedMobileColumnsHalf\">Tire</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">Total Laps</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"extraExpandedMobileColumnsHalf\">Start</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"extraExpandedMobileColumnsHalf\">OSR</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">Pitstops</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"extraExpandedMobileColumnsHalf\">LSP</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">Passes</div>";
            //tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: left;\" class=\"desktopExpandedColumns\">S1</div>";
            //tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: left;\" class=\"desktopExpandedColumns\">S2</div>";
            //tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: left;\" class=\"desktopExpandedColumns\">S3</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopCommentColumn\">Comment</div>";
        }
        else if (series == 'I') {
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">Total Laps</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"extraExpandedMobileColumnsHalf\">Start</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"extraExpandedMobileColumnsHalf\">Pitstops</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"extraExpandedMobileColumnsHalf\">LSP</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">Passes</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">BT1TS</div>";
            //tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">BT2TS</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">BT3TS</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopCommentColumn\">Comment</div>";
        }
        else if (trackType == 'RC' || trackType == 'SC') {
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">Total Laps</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"extraExpandedMobileColumnsHalf\">Start</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"extraExpandedMobileColumns\">Passes</div>";
            if (series == 'L') {
                tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"extraExpandedMobileColumnsHalf\">OSR</div>";
            } else {
                tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"extraExpandedMobileColumnsHalf\"></div>";
            }
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopCommentRTIColumn\">Comment</div>";
        }
        else {
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">Total Laps</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"extraExpandedMobileColumnsHalf\">Start</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">Passes</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">BT1TS</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">LT1TS</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">BT3TS</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">LT3TS</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopCommentColumn\">Comment</div>";
        }
    }
    else if ((sessionType == 'Q' && trackType == 'O') || (sessionType == 'Q' && trackType == 'I')) {
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"mobileNormalColumn\">Avg Spd</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"extraExpandedMobileColumns\">WS</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"expandedMobileColumns\">L1S</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"expandedMobileColumns\">L2S</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">WT</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">L1T</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">L2T</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"expandedMobileColumns\">Total Time</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"extraExpandedMobileColumns\">Diff</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">Gap</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">BT1TS</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">LT1TS</div>";
        //tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">BT2TS</div>";
        //tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">LT2TS</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">BT3TS</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">LT3TS</div>";
    }
    else if (sessionType == 'I') {
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"mobileNormalColumn\">Avg Spd</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"extraExpandedMobileColumns\">WS</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"expandedMobileColumns\">L1S</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"expandedMobileColumns\">L2S</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"expandedMobileColumns\">L3S</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"expandedMobileColumns\">L4S</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">L1T</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">L2T</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">L3T</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">L4T</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">Total Time</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">BT1TS</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopDoubleExpandedColumn\">Status</div>";
    }
    else if (trackType == 'O' || trackType == 'I') {
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"expandedMobileColumns\">Diff.</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"expandedMobileColumns\">Gap</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"mobileNormalColumn\">BLS</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">BLT</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"expandedMobileColumns\">LLS</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">LLT</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">Laps</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">BLN</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"extraExpandedMobileColumns\">NTR</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"extraExpandedMobileColumns\">NTS</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">BT1TS</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">LT1TS</div>";
        //tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">BT2TS</div>";
        //tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">LT2TS</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">BT3TS</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">LT3TS</div>";
    }
    else {
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"expandedMobileColumns\">Diff.</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"expandedMobileColumns\">Gap</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"mobileNormalColumn\">BLT</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"expandedMobileColumns\">LLT</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">BLS</div>";
        tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">LLS</div>";
        if (series == 'I' && (trackType == 'RC' || trackType == 'SC')) {
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"extraExpandedMobileColumns\">Tire</div>";
            //tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: left;\" class=\"desktopExpandedColumns\">Best Lap #</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"extraExpandedMobileColumns\">Laps</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">S1</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">S2</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">S3</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">BS1</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">BS2</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">BS3</div>";
        }
        else if (series == 'I') {
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"extraExpandedMobileColumns\">Start</div>";
            tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"extraExpandedMobileColumns\">LSP</div>";
        }
        else {
            if (trackType == 'RC' || trackType == 'SC') {
                tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"extraExpandedMobileColumns\">BLN</div>";
                tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"extraExpandedMobileColumns\">Laps</div>";
                tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">S1</div>";
                tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">S2</div>";
                tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">S3</div>";
                tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">BS1</div>";
                tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">BS2</div>";
                tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"desktopExpandedColumns\">BS3</div>";
            }
            else {
                tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"extraExpandedMobileColumns\">BLT</div>";
                tableData = tableData + "<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right;\" class=\"extraExpandedMobileColumns\">LLT</div>";
            }
        }
    }

    //if (series == 'I' && trackType == 'I') {
    //    noTowTimeColumn += '<div style="min-height: 30px; height: 30px; !PADDING! background-color: Black; color: White;"><div style="margin-top: 
5px; width: 65px;">NTT</div></div>';
    //    noTowSpeedColumn += '<div style="min-height: 30px; height: 30px; !PADDING! background-color: Black; color: White;"><div style="margin-top: 
5px; width: 65px;">NTS</div></div>';
    //    noTowLapNumberColumn += '<div style="min-height: 30px; height: 30px; !PADDING! background-color: Black; color: White;"><div 
style="margin-top: 5px; width: 30px;">NTL</div></div>';
    //    noTowRankColumn += '<div style="min-height: 30px; height: 30px; !PADDING! background-color: Black; color: White;"><div style="margin-top: 
5px; width: 30px;">NTR</div></div>';
    //}

    var haveTCars = false;
    var legendData = '';

    var ovalQualifyingCarOnTrack = false;
    $.each(data.timing_results.Item, function (i, subItem) {
        if (subItem.onTrack == "TRUE" && subItem.status == "Active" && (trackType == 'I' || trackType == 'O') && (sessionType == 'Q' || sessionType 
== 'I') && subItem.QStatus == 'Qualifying') {
            ovalQualifyingCarOnTrack == true;
        }
    });

    //Populate Data for each Driver Item
    var count = 0;

    //var cars = data.timing_results.Item;
    //var sortByColumn = '';
    //var selectedSort = $('#dataSortSelect').find(":selected").text();
    //var sortDirection = '';

    //if (selectedSort == 'No Tow Rank') {
    //    sortByColumn = 'NTRank';
    //    sortDirection = 'asc';
    //}
    //else if (selectedSort == 'Best Trap Speed')
    //{
    //    sortByColumn = 'Best_T1_SPD';
    //    sortDirection = 'dsc';
    //}

    //var sortedCars = cars;
    //if (sortByColumn !='') {
    //    sortedCars = sortJSON(cars, sortByColumn, sortDirection);
    //}

    $.each(data.timing_results.Item, function (i, item) {
        var diffToLeader = '';
        tableData += '<div style="width: 100%; clear: both; font-size: 14px;">';
        var driverRow = '';
        var ntEndplate;

        var skipDisplay = false;
        if (sessionType == 'I') {
            //Fast 9
            if (data.timing_results.heartbeat.preamble.substring(1, 2) == "3"
                && (parseInt(item.rank) > 9 ||
                    item.QStatus == 'Qualified - Day 1')) {
                skipDisplay = true;
            }
            //Last Row
            else if (data.timing_results.heartbeat.preamble.substring(1, 2) == "2"
                && parseInt(item.rank) < 31) {
                skipDisplay = true;
            }
            else if (item.QStatus == 'UNKNOWN') {
                skipDisplay = true;
            }
            //if ((item.QStatus.indexOf('Qualified') != -1
            //    || item.QStatus.indexOf('Qualifying') != -1)
            //    || (data.timing_results.heartbeat.preamble.substring(1, 2) == "4"
            //        && parseInt(item.rank) <= 9
            //        && parseInt(item.rank) > 0
            //        && item.QStatus != 'Qualified - Day 1')) {
            //    skipDisplay = false;
            //}
            //else if (data.timing_results.heartbeat.preamble.substring(1, 2) == "4"
            //            && (parseInt(item.rank) > 9
            //                || parseInt(item.rank) <= 0
            //                || item.QStatus == 'Qualified - Day 1'))
            //{
            //    skipDisplay = true;
            //}
            //else if (item.period.toString() == data.timing_results.heartbeat.preamble.substring(1, 2)) {
            //    skipDisplay = false;
            //}
            //else if (item.QStatus == 'UNKNOWN') {
            //    skipDisplay = true;
            //}
        }
        //else if (sessionType == 'Q' && item.rank == 0)
        //{
        //    skipDisplay = true;
        //}

        //if (sortByColumn !='') {
        //    var sortedColumnValue = item[sortByColumn];
        //    if (sortedColumnValue == '0' || sortedColumnValue == null) {
        //        skipDisplay = true;
        //    }
        //}
        //var onTrackValue = $('#onTrackSelect').find(":selected").text();
        //if (onTrackValue == 'True' && item.onTrack !='True')
        //{
        //    skipDisplay = true;
        //}

        if (!skipDisplay) {
            var rowStyle = '';
            if (item.onBubble == "True") {
                rowStyle = ' background-color: #f75607; color: White;';
            }
            else if (item.OverTake_Active == "1" || item.OverTake_Active == "True") {
                rowStyle = ' background-color: #16c0ef; color: Black;';
            }
            else if ((item.onTrack == "True" && (sessionType == 'Q' || sessionType == 'I') && (data.timing_results.heartbeat.trackType == "O" || 
data.timing_results.heartbeat.trackType == "I") && item.flagStatus == "Green" && item.status == "Active" && item.QStatus == 'Qualifying')
                || (item.onTrack == "True" && sessionType == 'Q' && data.timing_results.heartbeat.trackType == "O" && item.flagStatus == "Green" && 
item.status == "Qualifying")) {
                rowStyle = ' background-color: #2e70f7; color: White;';
            }
            else if (item.bestLap == item.laps && item.bestLap != 0 && item.onTrack == 'True' && sessionType != 'I' && !(sessionType == 'Q' && 
trackType == 'O') && !(sessionType == 'Q' && trackType == 'I')) {
                rowStyle = ' background-color: Purple; color: White;';
            }
            else if (count % 2 == 0) {
                rowStyle = ' background-color: #aaaaaa; color: Black;';
            }
            else {
                rowStyle = ' background-color: White; color: Black;';
            }

            if (sessionType == 'I') {
                if (data.timing_results.heartbeat.preamble.substring(1, 2) == "2"
                    && parseInt(item.rank) > 30
                    && parseInt(item.rank) < 34) {
                    driverRow += '<div style="float: left; min-height: 30px; margin-left: 1%; line-height: 30px;' + rowStyle + '" 
class=\"mobileRank\">' + item.overallRank + '</div>';
                }
                else if (data.timing_results.heartbeat.preamble.substring(1, 2) == "2"
                    && parseInt(item.rank) > 33) {
                    driverRow += '<div style="float: left; min-height: 30px; margin-left: 1%; line-height: 30px;' + rowStyle + '" 
class=\"mobileRank\"></div>';
                }
                else if (data.timing_results.heartbeat.preamble.substring(1, 2) == "3"
                    && parseInt(item.rank) > 0
                    && parseInt(item.rank) < 10) {
                    driverRow += '<div style="float: left; min-height: 30px; margin-left: 1%; line-height: 30px;' + rowStyle + '" 
class=\"mobileRank\">' + item.overallRank + '</div>';
                }
                else if ((item.QStatus.indexOf('Qualified') != -1 || item.QStatus.indexOf('Qualifying') != -1 || item.QStatus.indexOf('Retired 
Attempt') != -1) || (data.timing_results.heartbeat.preamble.substring(1, 2) == "4" && parseInt(item.rank) <= 9 && parseInt(item.rank) > 0)) {
                    driverRow += '<div style="float: left; min-height: 30px; margin-left: 1%; line-height: 30px;' + rowStyle + '" 
class=\"mobileRank\">' + item.rank + '</div>';
                }
                else {
                    driverRow += '<div style="float: left; min-height: 30px; margin-left: 1%; line-height: 30px;' + rowStyle + '" 
class=\"mobileRank\"></div>';
                }
            }
            else if ((trackType == 'RC' || trackType == 'SC') && sessionType == 'Q') {
                driverRow += '<div style="float: left; min-height: 30px; margin-left: 1%; line-height: 30px;' + rowStyle + '" class=\"mobileRank\">' 
+ item.rank + '</div>';
            }
            else {
                driverRow += '<div style="float: left; min-height: 30px; margin-left: 1%; line-height: 30px;' + rowStyle + '" class=\"mobileRank\">' 
+ item.rank + '</div>';
            }

            if (item.marker == '7') {
                driverRow += '<div style="float: left; min-height: 30px; height: 30px;' + rowStyle + '" class="movementColumn"><div style="width: 
25px; text-align: center;"><img src=\"https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/img_pit.png\" width=\"25px\" alt=\"Car In Pit\" 
style=\"padding-top: 3px;\"/></div></div>'
            }
            else if (item.marker == '4') {
                driverRow += '<div style="float: left; min-height: 30px; height: 30px;' + rowStyle + '" class="movementColumn"><div style="width: 
25px; text-align: center;"><img src=\"https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/img_position_up.png\" width=\"25px\" alt=\"Moved Up Position\" 
style=\"padding-top: 3px;\" /></div></div>'
            }
            else if (item.marker == '5') {
                driverRow += '<div style="float: left; min-height: 30px; height: 30px;' + rowStyle + '" class="movementColumn"><div style="width: 
25px; text-align: center;"><img src=\"https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/img_position_down.png\" width=\"25px\" alt=\"Moved Down 
Position\" style=\"padding-top: 3px;\" /></div></div>'
            }
            else {
                driverRow += '<div style="float: left; min-height: 30px; height: 30px;' + rowStyle + '" class="movementColumn"><div style="width: 
25px; text-align: center;"></div></div>';
            }

            var isTCar = false;
            var carNum = 0;
            if (item.no.indexOf('T') != -1) {
                isTCar = true;
                haveTCars = true;
                carNum = item.no.substring(0, item.no.length - 1);
            }
            else {
                carNum = item.no;
                isTCar = false;
            }
            if (series == 'I' && carEndplatePaths[carNum] != null) {
                if (isTCar) {
                    driverRow += '<div style="padding-right: 1%; float: left; min-height: 30px; line-height: 30px; text-align: center;' + rowStyle + 
' background-image: url(https://d2i8ejbvsgsqtt.cloudfront.net/INDYCAR/LiveSessionOverlay/Images/img_t_car_bkg.png); background-repeat: no-repeat; 
background-position: center right;" class=\"mobileCarNumber\"><img src="' + carEndplatePaths[carNum] + '?h=25" alt="Endplate for Car Number ' + 
item.no + '" height=\"25\" style=\"padding-top: 5px;\" /></div>';
                    //ntEndplate = '<div style="min-height: 30px; height: 30px; float:left; !PADDING! !ROWSTYLE! text-align: center; 
background-image: url(https://www.imscdn.com/INDYCAR/LiveSessionOverlay/Images/img_t_car_bkg.png); background-repeat: no-repeat; 
background-position: center right;"><div style="width: 40px;"><img src="' + carEndplatePaths[carNum] + '?h=25" alt="Endplate for Car Number ' + 
item.no + '" height=\"25px\" /></div></div>';
                }
                else {
                    driverRow += '<div style="float: left; min-height: 30px; line-height: 30px; text-align: center;' + rowStyle + '" 
class=\"mobileCarNumber\"><img src="' + carEndplatePaths[carNum] + '?h=25" alt="Endplate for Car Number ' + item.no + '" height=\"25\" 
style=\"padding-top: 5px;\" /></div>';
                    //ntEndplate = '<div style="min-height: 30px; height: 30px; float:left; !PADDING! !ROWSTYLE! text-align: center;"><div 
style="width: 40px;"><img src="' + carEndplatePaths[carNum] + '?h=25" alt="Endplate for Car Number ' + item.no + '" height=\"25px\" /></div></div>';
                }
            }
            else if (series == 'L' && filcarEndplatePaths[carNum] != null) {
                driverRow += '<div style="float: left; min-height: 30px; line-height: 30px; text-align: center;' + rowStyle + '" 
class=\"mobileCarNumber\"><img src="' + filcarEndplatePaths[carNum] + '?h=25" alt="Endplate for Car Number ' + item.no + '" height=\"25\" 
style=\"padding-top: 5px;\" /></div>';
            }
            else {
                driverRow += '<div style="float: left; min-height: 30px; line-height: 30px; text-align: center;' + rowStyle + '" 
class=\"mobileCarNumber\">' + item.no + '</div>';
            }

            if ((item.lastName.length + item.firstName.length) > 17) {
                item.firstName = item.firstName.substring(0, 1) + '.';
            }

            if (series == 'I') {
                driverRow += '<div style="float: left; min-height: 30px; line-height: 30px;' + rowStyle + '" class=\"mobileDriverName\">' + 
item.firstName + ' ' + item.lastName + '</div>';
            }
            else {
                driverRow += '<div style="float: left; min-height: 30px; line-height: 30px;' + rowStyle + '" class=\"mobileRTIDriverName\">' + 
item.firstName + ' ' + item.lastName + '</div>';
            }

            if (item.rank == '1') {
                differenceColumn = '<div style="float: left; min-height: 30px; line-height: 30px; text-align: right;' + rowStyle + '" 
class=\"!CLASS_NAME!\">--</div>';
            }
            else {
                if (item.diff == null || item.diff.substring(0, 1) == '-') {
                    differenceColumn = '<div style="float: left; min-height: 30px; line-height: 30px;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
                }
                else {
                    differenceColumn = '<div style="float: left; min-height: 30px; line-height: 30px; text-align: right;' + rowStyle + '" 
class=\"!CLASS_NAME!\">' + item.diff + '</div>';
                }
            }

            if (item.rank == '1') {
                gapColumn = '<div style="float: left; min-height: 30px;line-height: 30px; text-align: right;' + rowStyle + '" 
class=\"!CLASS_NAME!\">--</div>';
            }
            else {
                if (item.gap <= 0) {
                    gapColumn = '<div style="float: left; min-height: 30px; line-height: 30px;' + rowStyle + '" class=\"!CLASS_NAME!\"></div>';
                }
                else {
                    gapColumn = '<div style="float: left; min-height: 30px; line-height: 30px; text-align: right;' + rowStyle + '" 
class=\"!CLASS_NAME!\">' + item.gap + '</div>';
                }
            }

            if (item.equipment != null) {
                if (item.equipment.substring(2, 3) == 'C') {
                    engineColumn = '<div style="float: left; min-height: 30px;' + rowStyle + '" class=\"mobileEngine\"><img 
src="https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/img_chevy_logo.png" alt="Chevy Logo" height=\"20px\" style=\"padding-top: 5px;\" /></div>';
                }
                else if (item.equipment.substring(2, 3) == 'H') {
                    engineColumn = '<div style="float: left; min-height: 30px;' + rowStyle + '" class=\"mobileEngine\"><img 
src="https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/img_honda_logo.png" alt="Honda Logo" height=\"20px\" style=\"padding-top: 5px;\" /></div>';
                }
                else {
                    engineColumn = '<div style="float: left; min-height: 30px; min-width: 10%;' + rowStyle + '" class=\"mobileEngine\"></div>';
                }
            }

            if (item.bestLapTime != null && item.bestLapTime != '0.0000') {
                bestLapTimeColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ '" class=\"!CLASS_NAME!\">' + item.bestLapTime + '</div>';
            }
            else {
                bestLapTimeColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.BestSpeed != null) {
                bestLapSpeedColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ '" class=\"!CLASS_NAME!\">' + item.BestSpeed + '</div>';
            }
            else {
                bestLapSpeedColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.lastLapTime != null && item.lastLapTime != '0.0000') {
                lastLapTimeColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ '" class=\"!CLASS_NAME!\">' + item.lastLapTime + '</div>';
            }
            else {
                lastLapTimeColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.LastSpeed != null) {
                lastLapSpeedColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ '" class=\"!CLASS_NAME!\">' + item.LastSpeed + '</div>';
            }
            else {
                lastLapSpeedColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.AverageSpeed != null) {
                averageSpeedColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ '" class=\"!CLASS_NAME!\">' + item.AverageSpeed + '</div>';
            }
            else {
                averageSpeedColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.lastWarmUpQualSpeed != null) {
                warmupSpeedColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ '" class=\"!CLASS_NAME!\">' + item.lastWarmUpQualSpeed + '</div>';
            }
            else {
                warmupSpeedColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.lastWarmUpQualTime != null) {
                warmupTimeColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle + 
'" class=\"!CLASS_NAME!\">' + item.lastWarmUpQualTime + '</div>';
            }
            else {
                warmupTimeColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.lap1QualSpeed != null) {
                lap1SpeedColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle + 
'" class=\"!CLASS_NAME!\">' + item.lap1QualSpeed + '</div>';
            }
            else {
                lap1SpeedColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.lap2QualSpeed != null) {
                lap2SpeedColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle + 
'" class=\"!CLASS_NAME!\">' + item.lap2QualSpeed + '</div>';
            }
            else {
                lap2SpeedColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.lap3QualSpeed != null) {
                lap3SpeedColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle + 
'" class=\"!CLASS_NAME!\">' + item.lap3QualSpeed + '</div>';
            }
            else {
                lap3SpeedColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.lap4QualSpeed != null) {
                lap4SpeedColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle + 
'" class=\"!CLASS_NAME!\">' + item.lap4QualSpeed + '</div>';
            }
            else {
                lap4SpeedColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.lap1QualTime != null) {
                lap1TimeColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle + 
'" class=\"!CLASS_NAME!\">' + item.lap1QualTime + '</div>';
            }
            else {
                lap1TimeColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.lap2QualTime != null) {
                lap2TimeColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle + 
'" class=\"!CLASS_NAME!\">' + item.lap2QualTime + '</div>';
            }
            else {
                lap2TimeColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.lap3QualTime != null) {
                lap3TimeColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle + 
'" class=\"!CLASS_NAME!\">' + item.lap3QualTime + '</div>';
            }
            else {
                lap3TimeColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.lap4QualTime != null) {
                lap4TimeColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle + 
'" class=\"!CLASS_NAME!\">' + item.lap4QualTime + '</div>';
            }
            else {
                lap4TimeColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.totalQualTime != null) {
                totalTimeColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle + 
'" class=\"!CLASS_NAME!\">' + item.totalQualTime + '</div>';
            }
            else {
                totalTimeColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.Tire != null) {
                if (item.Tire == 'P') {
                    tireColumn = '<div style="float: left; min-height: 30px; text-align: right;' + rowStyle + '" class=\"!CLASS_NAME!\"><img 
src="https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/img_black_tire.png" alt="Primary Tire" height=\"20px\" style=\"padding-top: 5px;\" /></div>';;
                }
                else if (item.Tire == 'A') {
                    tireColumn = '<div style="float: left; min-height: 30px; text-align: right;' + rowStyle + '" class=\"!CLASS_NAME!\"><img 
src="https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/img_red_tire.png" alt="Red Tire" height=\"20px\" style=\"padding-top: 5px;\" /></div>';;
                }
                else if (item.Tire == 'W' || item.Tire == 'WX') {
                    tireColumn = '<div style="float: left; min-height: 30px; text-align: right;' + rowStyle + '" class=\"!CLASS_NAME!\"><img 
src="https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/img_wet_tire.png" alt="Rain Tire" height=\"20px\" style=\"padding-top: 5px;\" /></div>';;
                }
                else {
                    tireColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
                }
            }
            else {
                tireColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.startPosition != null) {
                startedColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle + '" 
class=\"!CLASS_NAME!\">' + item.startPosition + '</div>';
            }
            else {
                startedColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.OverTake_Remain != null && (series == 'I' || series == 'L')) {
                p2pColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle + '" 
class=\"!CLASS_NAME!\">' + item.OverTake_Remain + '</div>';
            }
            else {
                p2pColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.sincePitLap != null) {
                lspColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle + '" 
class=\"!CLASS_NAME!\">' + item.sincePitLap + '</div>';
            }
            else {
                lspColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.laps != null) {
                totalLapsColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle + 
'" class=\"!CLASS_NAME!\">' + item.laps + '</div>';
            }
            else {
                totalLapsColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.status != null) {
                statusColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle + '" 
class=\"!CLASS_NAME!\">' + item.status + '</div>';
            }
            else {
                statusColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.I1 != null && item.I1 != '') {
                if (item.I1 <= item.Best_I1 && item.marker != '7') {
                    section1Column = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ ' -webkit-animation-name: example; -webkit-animation-duration: 3s; animation-name: example; animation-duration: 3s;" class=\"!CLASS_NAME!\">' + 
item.I1 + '</div>';
                }
                else {
                    section1Column = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ '" class=\"!CLASS_NAME!\">' + item.I1 + '</div>';
                }
            }
            else {
                section1Column = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.I2 != null && item.I2 != '') {
                if (item.I2 <= item.Best_I2 && item.marker != '7') {
                    section2Column = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ ' -webkit-animation-name: example; -webkit-animation-duration: 3s; animation-name: example; animation-duration: 3s;" class=\"!CLASS_NAME!\">' + 
item.I2 + '</div>';
                }
                else {
                    section2Column = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ '" class=\"!CLASS_NAME!\">' + item.I2 + '</div>';
                }
            }
            else {
                section2Column = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.I3 != null && item.I3 != '') {
                if (item.I3 <= item.Best_I3 && item.marker != '7') {
                    section3Column = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ ' -webkit-animation-name: example; -webkit-animation-duration: 3s; animation-name: example; animation-duration: 3s;" class=\"!CLASS_NAME!\">' + 
item.I3 + '</div>';
                }
                else {
                    section3Column = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ '" class=\"!CLASS_NAME!\">' + item.I3 + '</div>';
                }
            }
            else {
                section3Column = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.Best_I1 != null && item.Best_I1 != '') {
                bestSection1Column = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ '" class=\"!CLASS_NAME!\">' + item.Best_I1 + '</div>';
            }
            else {
                bestSection1Column = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.Best_I2 != null && item.Best_I2 != '') {
                bestSection2Column = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ '" class=\"!CLASS_NAME!\">' + item.Best_I2 + '</div>';
            }
            else {
                bestSection2Column = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.Best_I3 != null && item.Best_I3 != '') {
                bestSection3Column = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ '" class=\"!CLASS_NAME!\">' + item.Best_I3 + '</div>';
            }
            else {
                bestSection3Column = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.Passes != null && item.Passes != '') {
                totalPassesColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ '" class=\"!CLASS_NAME!\">' + item.Passes + '</div>';
            }
            else {
                totalPassesColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ '" class=\"!CLASS_NAME!\">0</div>';
            }

            if (item.pitStops != null && item.pitStops != '') {
                totalPitStopsColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + 
rowStyle + '" class=\"!CLASS_NAME!\">' + item.pitStops + '</div>';
            }
            else {
                totalPitStopsColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + 
rowStyle + '" class=\"!CLASS_NAME!\"></div>';
            }

            if (item.comment != null && item.comment != '') {
                commentColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; font-size: 9px; text-align: right;' 
+ rowStyle + '" class=\"!CLASS_NAME!\">' + item.comment + '</div>';
            }
            else {
                commentColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.bestLap != null && item.bestLap != '') {
                bestLapNumberColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + 
rowStyle + '" class=\"!CLASS_NAME!\">' + item.bestLap + '</div>';
            }
            else {
                bestLapNumberColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.NTRank != null && item.NTRank != '' && item.NTRank != '0') {
                noTowRankColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle + 
'" class=\"!CLASS_NAME!\">' + item.NTRank + '</div>';
            }
            else {
                noTowRankColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle + 
'" class=\"!CLASS_NAME!\"></div>';
            }

            if (item.NTBestTime != null && item.NTBestTime != '' && item.NTBestTime != '-0.0001') {
                var speed = (data.timing_results.heartbeat.trackLength / (0.000277778 * item.NTBestTime)).toFixed(3);
                noTowBestTimeColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + 
rowStyle + '" class=\"!CLASS_NAME!\">' + item.NTBestTime + '</div>';
                noTowBestSpeedColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + 
rowStyle + '" class=\"!CLASS_NAME!\">' + speed + '</div>';
            }
            else {
                noTowBestTimeColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
                noTowBestSpeedColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.NTLap != null && item.NTLap != '' && item.NTLap != '0') {
                noTowLapNumberColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + 
rowStyle + '" class=\"!CLASS_NAME!\">' + item.NTLap + '</div>';
            }
            else {
                noTowLapNumberColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.Best_T1_SPD != null && item.Best_T1_SPD != '' && item.Best_T1_SPD != '0') {
                bestT1TrapSpeedDisplayColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' 
+ rowStyle + '" class=\"!CLASS_NAME!\">' + item.Best_T1_SPD + '</div>';
            }
            else {
                bestT1TrapSpeedDisplayColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.T1_SPD != null && item.T1_SPD != '' && item.T1_SPD != '0') {
                var lastTrapSpeed = item[lastTrapSpeedColumn];
                lastT1TrapSpeedDisplayColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' 
+ rowStyle + '" class=\"!CLASS_NAME!\">' + item.T1_SPD + '</div>';
            }
            else {
                lastT1TrapSpeedDisplayColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.Best_T2_SPD != null && item.Best_T2_SPD != '' && item.Best_T2_SPD != '0') {
                bestT2TrapSpeedDisplayColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' 
+ rowStyle + '" class=\"!CLASS_NAME!\">' + item.Best_T2_SPD + '</div>';
            }
            else {
                bestT2TrapSpeedDisplayColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.T2_SPD != null && item.T2_SPD != '' && item.T2_SPD != '0') {
                lastT2TrapSpeedDisplayColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' 
+ rowStyle + '" class=\"!CLASS_NAME!\">' + item.T2_SPD + '</div>';
            }
            else {
                lastT2TrapSpeedDisplayColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.Best_T3_SPD != null && item.Best_T3_SPD != '' && item.Best_T3_SPD != '0') {
                bestT3TrapSpeedDisplayColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' 
+ rowStyle + '" class=\"!CLASS_NAME!\">' + item.Best_T3_SPD + '</div>';
            }
            else {
                bestT3TrapSpeedDisplayColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.T3_SPD != null && item.T3_SPD != '' && item.T3_SPD != '0') {
                lastT3TrapSpeedDisplayColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' 
+ rowStyle + '" class=\"!CLASS_NAME!\">' + item.T3_SPD + '</div>';
            }
            else {
                lastT3TrapSpeedDisplayColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (item.QStatus != null) {
                if (item.QStatus.indexOf('No Attempt') != -1) {
                    qStatusColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ '" class=\"!CLASS_NAME!\">No Attempt</div>';
                }
                else if (item.QStatus.indexOf('Qualified - Opening Day') != -1) {
                    qStatusColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ '" class=\"!CLASS_NAME!\">Qualified - Day 1</div>';
                }
                else if (item.QStatus.indexOf('Qualified - Last Chance') != -1) {
                    qStatusColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ '" class=\"!CLASS_NAME!\">Qualified - Day 2</div>';
                }
                else if (item.QStatus.indexOf('Qualified - Last Chance Qualifier') != -1) {
                    qStatusColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ '" class=\"!CLASS_NAME!\">Qualified</div>';
                }
                else if (item.QStatus.indexOf('Failed - Last Chance Qualifier') != -1) {
                    qStatusColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ '" class=\"!CLASS_NAME!\">Failed - Day 2</div>';
                }
                else if (item.QStatus.indexOf('Withdrawn - Last Chance Qualifier') != -1) {
                    qStatusColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ '" class=\"!CLASS_NAME!\">Withdrawn- Day 2</div>';
                }
                else if (item.QStatus.indexOf(' ') != -1) {
                    qStatusColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ '" class=\"!CLASS_NAME!\">' + item.QStatus + '</div>';
                }
                else {
                    qStatusColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle 
+ '" class=\"!CLASS_NAME!\">' + item.QStatus + '</div>';
                }
            }
            else {
                qStatusColumn = '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right;' + rowStyle + '" 
class=\"!CLASS_NAME!\"></div>';
            }

            if (series == 'I') {
                driverRow = driverRow + engineColumn;
            }

            if (sessionType == 'R') {
                if (trackType == 'O' || trackType == 'I') {
                    if (series == 'I') {
                        driverRow = driverRow + differenceColumn.replace('!CLASS_NAME!', 'mobileNormalColumn') + gapColumn.replace('!CLASS_NAME!', 
'expandedMobileColumns') + bestLapSpeedColumn.replace('!CLASS_NAME!', 'expandedMobileColumns') + lastLapSpeedColumn.replace('!CLASS_NAME!', 
'expandedMobileColumns') + bestLapTimeColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns') + lastLapTimeColumn.replace('!CLASS_NAME!', 
'desktopExpandedColumns') + totalLapsColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns') + startedColumn.replace('!CLASS_NAME!', 
'extraExpandedMobileColumnsHalf') + totalPitStopsColumn.replace('!CLASS_NAME!', 'extraExpandedMobileColumnsHalf') + 
lspColumn.replace('!CLASS_NAME!', 'extraExpandedMobileColumnsHalf') + totalPassesColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns') + 
bestT1TrapSpeedDisplayColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns') + bestT3TrapSpeedDisplayColumn.replace('!CLASS_NAME!', 
'desktopExpandedColumns') + commentColumn.replace('!CLASS_NAME!', 'desktopCommentColumn');
                    }
                    else {
                        driverRow = driverRow + differenceColumn.replace('!CLASS_NAME!', 'mobileNormalColumn') + gapColumn.replace('!CLASS_NAME!', 
'expandedMobileColumns') + bestLapSpeedColumn.replace('!CLASS_NAME!', 'expandedMobileColumns') + lastLapSpeedColumn.replace('!CLASS_NAME!', 
'expandedMobileColumns') + bestLapTimeColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns') + lastLapTimeColumn.replace('!CLASS_NAME!', 
'desktopExpandedColumns') + totalLapsColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns') + startedColumn.replace('!CLASS_NAME!', 
'extraExpandedMobileColumnsHalf') + totalPassesColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns') + 
bestT2TrapSpeedDisplayColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns') + lastT2TrapSpeedDisplayColumn.replace('!CLASS_NAME!', 
'desktopExpandedColumns') + bestT3TrapSpeedDisplayColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns') + 
lastT3TrapSpeedDisplayColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns') + commentColumn.replace('!CLASS_NAME!', 'desktopCommentColumn');
                    }
                }
                else {
                    if (series == 'I') {
                        driverRow = driverRow + differenceColumn.replace('!CLASS_NAME!', 'mobileNormalColumn') + gapColumn.replace('!CLASS_NAME!', 
'expandedMobileColumns') + bestLapTimeColumn.replace('!CLASS_NAME!', 'expandedMobileColumns') + lastLapTimeColumn.replace('!CLASS_NAME!', 
'expandedMobileColumns') + bestLapSpeedColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns') + lastLapSpeedColumn.replace('!CLASS_NAME!', 
'desktopExpandedColumns') + tireColumn.replace('!CLASS_NAME!', 'extraExpandedMobileColumnsHalf') + totalLapsColumn.replace('!CLASS_NAME!', 
'desktopExpandedColumns') + startedColumn.replace('!CLASS_NAME!', 'extraExpandedMobileColumnsHalf') + p2pColumn.replace('!CLASS_NAME!', 
'extraExpandedMobileColumnsHalf') + totalPitStopsColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns') + lspColumn.replace('!CLASS_NAME!', 
'extraExpandedMobileColumnsHalf') + totalPassesColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns') + commentColumn.replace('!CLASS_NAME!', 
'desktopCommentColumn');
                        //driverRow = driverRow + differenceColumn.replace('!CLASS_NAME!', 'mobileNormalColumn') + gapColumn.replace('!CLASS_NAME!', 
'expandedMobileColumns') + bestLapTimeColumn.replace('!CLASS_NAME!', 'expandedMobileColumns') + lastLapTimeColumn.replace('!CLASS_NAME!', 
'desktopExpandedColumns') + tireColumn.replace('!CLASS_NAME!', 'extraExpandedMobileColumnsHalf') + startedColumn.replace('!CLASS_NAME!', 
'extraExpandedMobileColumnsHalf') + p2pColumn.replace('!CLASS_NAME!', 'extraExpandedMobileColumnsHalf') + 
totalPitStopsColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns') + lspColumn.replace('!CLASS_NAME!', 'extraExpandedMobileColumnsHalf') + 
totalPassesColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns') + section1Column.replace('!CLASS_NAME!', 'desktopExpandedColumns') + 
section2Column.replace('!CLASS_NAME!', 'desktopExpandedColumns') + section3Column.replace('!CLASS_NAME!', 'desktopExpandedColumns') + 
commentColumn.replace('!CLASS_NAME!', 'desktopCommentColumn');
                    }
                    else {
                        driverRow = driverRow + differenceColumn.replace('!CLASS_NAME!', 'mobileNormalColumn') + gapColumn.replace('!CLASS_NAME!', 
'expandedMobileColumns') + bestLapTimeColumn.replace('!CLASS_NAME!', 'expandedMobileColumns') + lastLapTimeColumn.replace('!CLASS_NAME!', 
'expandedMobileColumns') + bestLapSpeedColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns') + lastLapSpeedColumn.replace('!CLASS_NAME!', 
'desktopExpandedColumns') + totalLapsColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns') + startedColumn.replace('!CLASS_NAME!', 
'extraExpandedMobileColumnsHalf') + totalPassesColumn.replace('!CLASS_NAME!', 'extraExpandedMobileColumns') + p2pColumn.replace('!CLASS_NAME!', 
'extraExpandedMobileColumnsHalf') + commentColumn.replace('!CLASS_NAME!', 'desktopCommentRTIColumn');
                    }
                }
            }
            else if (sessionType == 'I') {
                driverRow = driverRow
                    + averageSpeedColumn.replace('!CLASS_NAME!', 'mobileNormalColumn')
                    + warmupSpeedColumn.replace('!CLASS_NAME!', 'extraExpandedMobileColumns')
                    + lap1SpeedColumn.replace('!CLASS_NAME!', 'expandedMobileColumns')
                    + lap2SpeedColumn.replace('!CLASS_NAME!', 'expandedMobileColumns')
                    + lap3SpeedColumn.replace('!CLASS_NAME!', 'expandedMobileColumns')
                    + lap4SpeedColumn.replace('!CLASS_NAME!', 'expandedMobileColumns')
                    + lap1TimeColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns')
                    + lap2TimeColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns')
                    + lap3TimeColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns')
                    + lap4TimeColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns')
                    + totalTimeColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns')
                    + bestT1TrapSpeedDisplayColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns')
                    + qStatusColumn.replace('!CLASS_NAME!', 'desktopDoubleExpandedColumn');
            }
            else if ((sessionType == 'Q' && trackType == 'O') || (sessionType == 'Q' && trackType == 'I')) {
                driverRow = driverRow
                    + averageSpeedColumn.replace('!CLASS_NAME!', 'mobileNormalColumn')
                    + warmupSpeedColumn.replace('!CLASS_NAME!', 'extraExpandedMobileColumns')
                    + lap1SpeedColumn.replace('!CLASS_NAME!', 'expandedMobileColumns')
                    + lap2SpeedColumn.replace('!CLASS_NAME!', 'expandedMobileColumns')
                    + warmupTimeColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns')
                    + lap1TimeColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns')
                    + lap2TimeColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns')
                    + totalTimeColumn.replace('!CLASS_NAME!', 'expandedMobileColumns')
                    + differenceColumn.replace('!CLASS_NAME!', 'extraExpandedMobileColumns')
                    + gapColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns')
                    + bestT1TrapSpeedDisplayColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns')
                    + lastT1TrapSpeedDisplayColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns')
                    + bestT3TrapSpeedDisplayColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns')
                    + lastT3TrapSpeedDisplayColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns');
            }
            else if (trackType == 'O' || trackType == 'I') {
                driverRow = driverRow
                    + differenceColumn.replace('!CLASS_NAME!', 'expandedMobileColumns')
                    + gapColumn.replace('!CLASS_NAME!', 'expandedMobileColumns')
                    + bestLapSpeedColumn.replace('!CLASS_NAME!', 'mobileNormalColumn')
                    + bestLapTimeColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns')
                    + lastLapSpeedColumn.replace('!CLASS_NAME!', 'expandedMobileColumns')
                    + lastLapTimeColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns')
                    + totalLapsColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns')
                    + bestLapNumberColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns')
                    + noTowRankColumn.replace('!CLASS_NAME!', 'extraExpandedMobileColumns')
                    + noTowBestSpeedColumn.replace('!CLASS_NAME!', 'extraExpandedMobileColumns')
                    + bestT1TrapSpeedDisplayColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns')
                    + lastT1TrapSpeedDisplayColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns')
                    + bestT3TrapSpeedDisplayColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns')
                    + lastT3TrapSpeedDisplayColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns');
            }
            else if (series == 'I') {
                driverRow = driverRow + differenceColumn.replace('!CLASS_NAME!', 'expandedMobileColumns') + gapColumn.replace('!CLASS_NAME!', 
'expandedMobileColumns') + bestLapTimeColumn.replace('!CLASS_NAME!', 'mobileNormalColumn') + lastLapTimeColumn.replace('!CLASS_NAME!', 
'expandedMobileColumns') + bestLapSpeedColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns') + lastLapSpeedColumn.replace('!CLASS_NAME!', 
'desktopExpandedColumns') + tireColumn.replace('!CLASS_NAME!', 'extraExpandedMobileColumns') + totalLapsColumn.replace('!CLASS_NAME!', 
'extraExpandedMobileColumns') + section1Column.replace('!CLASS_NAME!', 'desktopExpandedColumns') + section2Column.replace('!CLASS_NAME!', 
'desktopExpandedColumns') + section3Column.replace('!CLASS_NAME!', 'desktopExpandedColumns') + bestSection1Column.replace('!CLASS_NAME!', 
'desktopExpandedColumns') + bestSection2Column.replace('!CLASS_NAME!', 'desktopExpandedColumns') + bestSection3Column.replace('!CLASS_NAME!', 
'desktopExpandedColumns');
            }
            else {
                if (trackType == 'RC' || trackType == 'SC') {
                    driverRow = driverRow + differenceColumn.replace('!CLASS_NAME!', 'expandedMobileColumns') + gapColumn.replace('!CLASS_NAME!', 
'expandedMobileColumns') + bestLapTimeColumn.replace('!CLASS_NAME!', 'mobileNormalColumn') + lastLapTimeColumn.replace('!CLASS_NAME!', 
'expandedMobileColumns') + bestLapSpeedColumn.replace('!CLASS_NAME!', 'desktopExpandedColumns') + lastLapSpeedColumn.replace('!CLASS_NAME!', 
'desktopExpandedColumns') + bestLapNumberColumn.replace('!CLASS_NAME!', 'extraExpandedMobileColumns') + totalLapsColumn.replace('!CLASS_NAME!', 
'extraExpandedMobileColumns') + section1Column.replace('!CLASS_NAME!', 'desktopExpandedColumns') + section2Column.replace('!CLASS_NAME!', 
'desktopExpandedColumns') + section3Column.replace('!CLASS_NAME!', 'desktopExpandedColumns') + bestSection1Column.replace('!CLASS_NAME!', 
'desktopExpandedColumns') + bestSection2Column.replace('!CLASS_NAME!', 'desktopExpandedColumns') + bestSection3Column.replace('!CLASS_NAME!', 
'desktopExpandedColumns');
                }
                else {
                    driverRow = driverRow + bestLapSpeedColumn.replace('!CLASS_NAME!', 'mobileNormalColumn') + 
lastLapSpeedColumn.replace('!CLASS_NAME!', 'expandedMobileColumns') + differenceColumn.replace('!CLASS_NAME!', 'expandedMobileColumns') + 
gapColumn.replace('!CLASS_NAME!', 'expandedMobileColumns') + bestLapTimeColumn.replace('!CLASS_NAME!', 'extraExpandedMobileColumns') + 
lastLapTimeColumn.replace('!CLASS_NAME!', 'extraExpandedMobileColumns');
                }
            }

            //Featured Driver
            if (((trackType == 'O' || trackType == 'I') && (sessionType == 'Q' || sessionType == 'I') && item.onTrack == "True" && item.status == 
"Active" && item.flagStatus == "Green" && item.QStatus == 'Qualifying')
                || (trackType == 'O' && sessionType == 'Q' && item.onTrack == "True" && item.status == "Qualifying" && item.flagStatus == "Green")) 
{
                $('#fd_Line1').text('');
                $('#fd_Line2').text('');
                $('#fd_Line3').text('');
                $('#fd_Line4').text('');

                var driverID = item.DriverID;

                $('#fd_DriverFirstName').text(item.firstName);
                $('#fd_DriverLastName').text(item.lastName);

                if (item.equipment.substring(2, 3) == 'C') {
                    $('#fd_EngineIcon').css("display", 'inline-block');
                    $('#fd_EngineIcon').attr("src", 'https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/img_chevy_logo.png' + '?w=30');
                }
                else if (item.equipment.substring(2, 3) == 'H') {
                    $('#fd_EngineIcon').css("display", 'inline-block');
                    $('#fd_EngineIcon').attr("src", 'https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/img_honda_logo.png' + '?w=30');
                }
                else {
                    $('#fd_EngineIcon').css("display", 'none');
                }

                $('#fd_FeatureTitle').text('CURRENT QUALIFIER');
                if (item.lastWarmUpQualSpeed != null) {
                    $('#fd_Line1').text('WARMUP SPEED: ' + item.lastWarmUpQualSpeed);
                }
                else {
                    $('#fd_Line1').text('WARMUP SPEED: -----------');
                }
                if (trackType == 'I' && sessionType == 'I') {
                    var line2 = '';
                    if (item.lap1QualSpeed != null) {
                        line2 += 'LAP 1: ' + item.lap1QualSpeed;
                    }
                    else {
                        line2 += 'LAP 1: -----------';
                    }
                    if (item.lap2QualSpeed != null) {
                        line2 += '    LAP 2: ' + item.lap2QualSpeed;
                    }
                    else {
                        line2 += '    LAP 2: -----------';
                    }
                    $('#fd_Line2').text(line2);
                    var line3 = '';
                    if (item.lap3QualSpeed != null) {
                        line3 += 'LAP 3: ' + item.lap3QualSpeed;
                    }
                    else {
                        line3 += 'LAP 3: -----------';
                    }
                    if (item.lap4QualSpeed != null) {
                        line3 += '    LAP 4: ' + item.lap4QualSpeed;
                    }
                    else {
                        line3 += '    LAP 4: -----------';
                    }
                    $('#fd_Line3').text(line3);
                    if (item.AverageSpeed != null) {
                        $('#fd_Line4').text('FOUR LAP AVERAGE: ' + item.AverageSpeed);
                    }
                    else {
                        $('#fd_Line4').text('FOUR LAP AVERAGE: -----------');
                    }
                }
                else {
                    if (item.lap1QualSpeed != null) {
                        $('#fd_Line2').text('LAP 1: ' + item.lap1QualSpeed);
                    }
                    else {
                        $('#fd_Line2').text('LAP 1: -----------');
                    }
                    if (item.lap2QualSpeed != null) {
                        $('#fd_Line3').text('LAP 2: ' + item.lap2QualSpeed);
                    }
                    else {
                        $('#fd_Line3').text('LAP 2: -----------');
                    }
                    if (item.AverageSpeed != null) {
                        $('#fd_Line4').text('TWO LAP AVERAGE: ' + item.AverageSpeed);
                    }
                    else {
                        $('#fd_Line4').text('TWO LAP AVERAGE: -----------');
                    }
                }

                if (series == 'I') {
                    $('#fd_CarIllustration').attr("src", carIllustrationPaths[carNum] + '&w=290');
                    $('#fd_DriverHeadShot').attr("src", headshotPaths[driverID] + '&w=115');
                    $('#fd_CarNumber').attr("src", carEndplatePaths[carNum] + '&w=30');
                    $('#fd_DriverFlag').attr("src", flagPaths[driverID] + '&w=30');
                }
                else {
                    $('#fd_CarIllustration').attr("src", filcarIllustrationPaths[carNum] + '&w=290');
                    $('#fd_DriverHeadShot').attr("src", filheadshotPaths[driverID] + '&w=115');
                    $('#fd_CarNumber').attr("src", filcarEndplatePaths[carNum] + '&w=30');
                    $('#fd_DriverFlag').attr("src", filFlagPaths[driverID] + '&w=30');
                }


            }
            else if ((trackType == 'O' || trackType == 'I') && (sessionType == 'Q' || sessionType == 'I') && !ovalQualifyingCarOnTrack && count == 
0) {
                $('#fd_Line1').text('');
                $('#fd_Line2').text('');
                $('#fd_Line3').text('');
                $('#fd_Line4').text('');

                driverID = item.DriverID;

                if (item.lastName == 'Castroneves') {
                    driverID = 254;
                }

                $('#fd_DriverFirstName').text(item.firstName);
                $('#fd_DriverLastName').text(item.lastName);

                if (item.equipment.substring(2, 3) == 'C') {
                    $('#fd_EngineIcon').css("display", 'inline-block');
                    $('#fd_EngineIcon').attr("src", 'https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/img_chevy_logo.png' + '?w=30');
                }
                else if (item.equipment.substring(2, 3) == 'H') {
                    $('#fd_EngineIcon').css("display", 'inline-block');
                    $('#fd_EngineIcon').attr("src", 'https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/img_honda_logo.png' + '?w=30');
                }
                else {
                    $('#fd_EngineIcon').css("display", 'none');
                }

                $('#fd_FeatureTitle').text('FASTEST IN SESSION');

                if (trackType == 'I' && sessionType == 'I') {
                    line2 = '';
                    if (item.lap1QualSpeed != null) {
                        line2 += 'LAP 1: ' + item.lap1QualSpeed;
                    }
                    else {
                        line2 += 'LAP 1: -----------';
                    }
                    if (item.lap2QualSpeed != null) {
                        line2 += '    LAP 2: ' + item.lap2QualSpeed;
                    }
                    else {
                        line2 += '    LAP 2: -----------';
                    }
                    $('#fd_Line2').text(line2);
                    line3 = '';
                    if (item.lap3QualSpeed != null) {
                        line3 += 'LAP 3: ' + item.lap3QualSpeed;
                    }
                    else {
                        line3 += 'LAP 3: -----------';
                    }
                    if (item.lap4QualSpeed != null) {
                        line3 += '    LAP 4: ' + item.lap4QualSpeed;
                    }
                    else {
                        line3 += '    LAP 4: -----------';
                    }
                    $('#fd_Line3').text(line3);
                    if (item.AverageSpeed != null) {
                        $('#fd_Line4').text('FOUR LAP AVERAGE: ' + item.AverageSpeed);
                    }
                    else {
                        $('#fd_Line4').text('FOUR LAP AVERAGE: -----------');
                    }
                }
                else {
                    if (item.lastWarmUpQualSpeed != null) {
                        $('#fd_Line1').text('WARMUP SPEED: ' + item.lastWarmUpQualSpeed);
                    }
                    else {
                        $('#fd_Line1').text('WARMUP SPEED: -----------');
                    }
                    if (item.lap1QualSpeed != null) {
                        $('#fd_Line2').text('LAP 1: ' + item.lap1QualSpeed);
                    }
                    else {
                        $('#fd_Line2').text('LAP 1: -----------');
                    }
                    if (item.lap2QualSpeed != null) {
                        $('#fd_Line3').text('LAP 2: ' + item.lap2QualSpeed);
                    }
                    else {
                        $('#fd_Line3').text('LAP 2: -----------');
                    }
                    if (item.AverageSpeed != null) {
                        $('#fd_Line4').text('TWO LAP AVERAGE: ' + item.AverageSpeed);
                    }
                    else {
                        $('#fd_Line4').text('TWO LAP AVERAGE: -----------');
                    }
                }

                if (series == 'I') {
                    $('#fd_CarIllustration').attr("src", carIllustrationPaths[carNum] + '&w=290');
                    $('#fd_DriverHeadShot').attr("src", headshotPaths[driverID] + '&w=115');
                    $('#fd_CarNumber').attr("src", carEndplatePaths[carNum] + '&w=30');
                    $('#fd_DriverFlag').attr("src", flagPaths[driverID] + '&w=30');
                }
                else {
                    $('#fd_CarIllustration').attr("src", filcarIllustrationPaths[carNum] + '&w=290');
                    $('#fd_DriverHeadShot').attr("src", filheadshotPaths[driverID] + '&w=115');
                    $('#fd_CarNumber').attr("src", filcarEndplatePaths[carNum] + '&w=30');
                    $('#fd_DriverFlag').attr("src", filFlagPaths[driverID] + '&w=30');
                }
            }
            else if (count == 0 && !ovalQualifyingCarOnTrack) {
                $('#fd_Line1').text('');
                $('#fd_Line2').text('');
                $('#fd_Line3').text('');
                $('#fd_Line4').text('');

                driverID = item.DriverID;

                $('#fd_DriverFirstName').text(item.firstName);
                $('#fd_DriverLastName').text(item.lastName);

                if (item.equipment.substring(2, 3) == 'C') {
                    $('#fd_EngineIcon').css("display", 'inline-block');
                    $('#fd_EngineIcon').attr("src", 'https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/img_chevy_logo.png' + '?w=30');
                }
                else if (item.equipment.substring(2, 3) == 'H') {
                    $('#fd_EngineIcon').css("display", 'inline-block');
                    $('#fd_EngineIcon').attr("src", 'https://d2i8ejbvsgsqtt.cloudfront.net/TSImages/img_honda_logo.png' + '?w=30');
                }
                else {
                    $('#fd_EngineIcon').css("display", 'none');
                }

                if (sessionType == 'R') {
                    $('#fd_FeatureTitle').text('RACE LEADER');
                    if (trackType == 'O' || trackType == 'I') {
                        $('#fd_Line4').text('TOTAL LAPS: ' + item.laps);
                    }
                    else {
                        if (series == 'L') {
                            $('#fd_Line4').text('OVERTAKE REMAINING: ' + item.OverTake_Remain);
                        }
                        else {
                            $('#fd_Line4').text('LAPS SINCE PIT: ' + item.sincePitLap);
                        }
                    }
                }
                else {
                    $('#fd_FeatureTitle').text('FASTEST IN SESSION');
                    $('#fd_Line4').text('TOTAL LAPS: ' + item.laps);
                }
                if (trackType == 'RC' || trackType == 'SC') {
                    $('#fd_Line1').text('BEST LAP TIME: ' + item.bestLapTime);
                    $('#fd_Line2').text('LAST LAP TIME: ' + item.lastLapTime);
                }
                else {
                    if (item.BestSpeed != null) {
                        $('#fd_Line1').text('BEST LAP SPEED: ' + item.BestSpeed + ' MPH');
                    }
                    else {
                        $('#fd_Line1').text('BEST LAP SPEED: -----------');
                    }
                    if (((trackType == 'I' || trackType == 'O') && series == 'I') && sessionType != 'R') {
                        if (item.Best_T1_SPD > item.Best_T3_SPD) {
                            $('#fd_Line2').text('T1 TRAP SPEED: ' + item.Best_T1_SPD + ' MPH');
                        }
                        else {
                            $('#fd_Line2').text('T3 TRAP SPEED: ' + item.Best_T3_SPD + ' MPH');
                        }
                    }
                    else {
                        if (item.LastSpeed != null) {
                            $('#fd_Line2').text('LAST LAP SPEED: ' + item.LastSpeed + ' MPH');
                        }
                        else {
                            $('#fd_Line2').text('LAST LAP SPEED: -----------');
                        }
                    }
                }

                if (series == 'I') {
                    $('#fd_CarIllustration').attr("src", carIllustrationPaths[carNum] + '&w=290');
                    $('#fd_DriverHeadShot').attr("src", headshotPaths[driverID] + '&w=115');
                    $('#fd_CarNumber').attr("src", carEndplatePaths[carNum] + '&w=30');
                    $('#fd_DriverFlag').attr("src", flagPaths[driverID] + '&w=30');
                }
                else if (series == "L") {
                    $('#fd_CarIllustration').attr("src", filcarIllustrationPaths[carNum] + '&w=290');
                    $('#fd_DriverHeadShot').attr("src", filheadshotPaths[driverID] + '&w=115');
                    $('#fd_CarNumber').attr("src", filcarEndplatePaths[carNum] + '&w=30');
                    $('#fd_DriverFlag').attr("src", filFlagPaths[driverID] + '&w=30');
                }
            }

            if (series != 'I' && series != 'L') {
                $("#FeatureDriverDiv").removeClass("featuredDriverScrolled");
                $("#FeatureDriverDiv").addClass("featuredDriverHidden");
            }

            //if (series == 'I' && trackType == 'I') {
            //    if (item.NTLap !='0') {
            //        noTowDrivers[noTowDrivers.length] = [item.NTRank,
            //            ntEndplate,
            //            '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right; !ROWSTYLE!" 
class=\"!CLASS_NAME!\">' + item.firstName + ' ' + item.lastName + '</div>',
            //            '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right; !ROWSTYLE!" 
class=\"!CLASS_NAME!\">' + item.NTBestSpeed + '</div>',
            //            '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right; !ROWSTYLE!" 
class=\"!CLASS_NAME!\">' + item.NTBestTime + '</div>',
            //            '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right; !ROWSTYLE!" 
class=\"!CLASS_NAME!\">' + item.NTLap + '</div>',
            //            '<div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; text-align: right; !ROWSTYLE!" 
class=\"!CLASS_NAME!\">' + item.rank + '</div>'];
            //    }
            //}

            tableData += driverRow + "</div>";
            count = count + 1;

            if (count == 2 && (trackType == 'O' || trackType == 'I') && (sessionType == 'Q' || sessionType == 'R')) {
                $('#fd_Line3').text('MARGIN: ' + item.diff);
            }

            //if ((sessionType == 'Q') && (trackType == 'RC' || trackType == 'SC') && (data.timing_results.heartbeat.preamble.substring(1, 2) != "4" 
&& data.timing_results.heartbeat.preamble.substring(1, 2) != "A" && data.timing_results.heartbeat.preamble.substring(1, 2) != "B") && series == 'I' 
&& item.rank == '6') {
            //    var dividerRow = '<div style="width: 100%; clear: both; font-size: 14px;"><div style="float: left; min-height: 30px; margin-left: 
1%; line-height: 30px; background-color: Yellow; color: Black;" class="mobileRank">&uarr;</div><div style="float: left; min-height: 30px; height: 
30px; background-color: Yellow; color: Black;" class="movementColumn"><div style="width: 25px; text-align: center;"></div></div><div style="float: 
left; min-height: 30px; line-height: 30px; text-align: center; background-color: Yellow; color: Black;" class="mobileCarNumber">&uarr;</div><div 
style="float: left; min-height: 30px; line-height: 30px; background-color: Yellow; color: Black;" class="mobileDriverName">TRANSFER CUTOFF</div><div 
style="float: left; min-height: 30px; background-color: Yellow; color: Black;" class="mobileEngine"></div><div style="float: left; min-height: 30px; 
line-height: 30px; background-color: Yellow; color: Black;" class="expandedMobileColumns">&uarr;</div><div style="float: left; min-height: 30px; 
line-height: 30px; background-color: Yellow; color: Black;" class="expandedMobileColumns">&uarr;</div><div style="float: left; min-height: 30px; 
line-height: 30px; overflow: hidden; background-color: Yellow; color: Black;" class="mobileNormalColumn">&uarr;</div><div style="float: left; 
min-height: 30px; line-height: 30px; overflow: hidden; background-color: Yellow; color: Black;" class="expandedMobileColumns">&uarr;</div><div 
style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: Yellow; color: Black;" 
class="desktopExpandedColumns">&uarr;</div><div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: Yellow; 
color: Black;" class="desktopExpandedColumns">&uarr;</div><div style="float: left; min-height: 30px; background-color: Yellow; color: Black;" 
class="extraExpandedMobileColumns"></div><div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: Yellow; 
color: Black;" class="extraExpandedMobileColumns">&uarr;</div><div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; 
background-color: Yellow; color: Black;" class="desktopExpandedColumns">&uarr;</div><div style="float: left; min-height: 30px; line-height: 30px; 
overflow: hidden; background-color: Yellow; color: Black;" class="desktopExpandedColumns">&uarr;</div><div style="float: left; min-height: 30px; 
line-height: 30px; overflow: hidden; background-color: Yellow; color: Black;" class="desktopExpandedColumns">&uarr;</div><div style="float: left; 
min-height: 30px; line-height: 30px; overflow: hidden; background-color: Yellow; color: Black;" class="desktopExpandedColumns">&uarr;</div><div 
style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: Yellow; color: Black;" 
class="desktopExpandedColumns">&uarr;</div><div style="float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: Yellow; 
color: Black;" class="desktopExpandedColumns">&uarr;</div></div>';
            //    tableData += dividerRow;
            //}
        }


    });

    tableData += "</div>";

    $('#hiddenSeries').val(series);
    //if (showVideo) {
    $('#hiddenOffset').val(50);
    //}
    //else {
    //    $('#hiddenOffset').val(50);
    //}

    //Row Colors for Legend
    if (sessionType != 'I' && !(sessionType == 'Q' && trackType == 'O') && !(sessionType == 'Q' && trackType == 'I')) {
        legendData = legendData + '<div class=\"legendItem\" style=\"background-color: Purple; color: White;\">Driver\'s Fastest Lap in 
Session</div>';
    }
    else if (sessionType == 'I' && (data.timing_results.heartbeat.preamble.substring(1, 2) == "1" || 
data.timing_results.heartbeat.preamble.substring(1, 2) == "2")) {
        legendData = legendData + '<div class=\"legendItem\" style=\"background-color: #f75607; color: White;\">Driver "On the Bubble"</div>';
    }
    //if (sessionType == 'R' && (series == 'I' || series == 'L') && (trackType == 'RC' || trackType == 'SC')) {
    //    legendData = legendData + '<div class=\"legendItem\" style=\"background-color: #16c0ef; color: Black;\">Overtake Active</div>';
    //}
    if ((sessionType == 'P' || sessionType == 'Q') && (trackType == 'RC' || trackType == 'SC')) {
        legendData = legendData + '<div class=\"legendItemDesktop\" style=\"background-color: green; color: White;\">Driver\'s Best Time in 
Highlighted Sector</div>';
    }
    if ((sessionType == 'Q' || sessionType == 'I') && (trackType == 'O' || trackType == 'I')) {
        legendData = legendData + '<div class=\"legendItem\" style=\"background-color: #2e70f7; color: White;\">Current Qualifier</div>';
    }
    legendData = legendData + '<div class=\"legendItem\">Diff = Difference</div>';
    if (trackType == 'O') {
        if (sessionType == 'P') {
            legendData = legendData + '<div class=\"legendItemDesktop\">BLS = Best Lap Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">LLS = Last Lap Speed</div>';
            legendData = legendData + '<div class=\"legendItem\">BLT = Best Lap Time</div>';
            legendData = legendData + '<div class=\"legendItem\">LLT = Last Lap Time</div>';
            legendData = legendData + '<div class=\"legendItem\">BLN = Best Lap Number</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">BT1TS = Best Turn 1 Trap Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">LT1TS = Last Lap Turn 1 Trap Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">BT3TS = Best Turn 3 Trap Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">LT3TS = Last Lap Turn 3 Trap Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">NTS = Best No-Tow Lap Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">NTT = Best No-Tow Lap Time</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">NTR = Rank by No-Tow Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">NTLN = Best No-Tow Lap Number</div>';
        }
        else if (sessionType == 'Q') {
            legendData = legendData + '<div class=\"legendItem\">WS = Warmup Speed</div>';
            legendData = legendData + '<div class=\"legendItem\">L1S = Lap 1 Speed</div>';
            legendData = legendData + '<div class=\"legendItem\">L2S = Lap 2 Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">WT = Warmup Time</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">L1T = Lap 1 Time</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">L2T = Lap 2 Time</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">BT1TS = Best Turn 1 Trap Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">LT1TS = Last Lap Turn 1 Trap Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">BT3TS = Best Turn 3 Trap Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">LT3TS = Last Lap Turn 3 Trap Speed</div>';
        }
        else if (sessionType == 'R') {
            legendData = legendData + '<div class=\"legendItemDesktop\">BLS = Best Lap Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">LLS = Last Lap Speed</div>';
            legendData = legendData + '<div class=\"legendItem\">BLT = Best Lap Time</div>';
            legendData = legendData + '<div class=\"legendItem\">LLT = Last Lap Time</div>';
            if (series == 'I') {
                legendData = legendData + '<div class=\"legendItem\">LSP = Laps Since Pit</div>';
            }
            legendData = legendData + '<div class=\"legendItemDesktop\">BT1Ts = Best Turn 1 Trap Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">BT3Ts = Best Turn 3 Trap Speed</div>';
        }
    }
    else if (trackType == 'I') {
        if (sessionType == 'P') {
            legendData = legendData + '<div class=\"legendItemDesktop\">BLS = Best Lap Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">LLS = Last Lap Speed</div>';
            legendData = legendData + '<div class=\"legendItem\">BLT = Best Lap Time</div>';
            legendData = legendData + '<div class=\"legendItem\">LLT = Last Lap Time</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">BLN = Best Lap Number</div>';
            legendData = legendData + '<div class=\"legendItem\">NTR = Rank by No-Tow Speed</div>';
            legendData = legendData + '<div class=\"legendItem\">NTS = Best No-Tow Lap Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">BT1TS = Best Turn 1 Trap Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">LT1TS = Last Lap Turn 1 Trap Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">BT3TS = Best Turn 3 Trap Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">LT3TS = Last Lap Turn 3 Trap Speed</div>';
        }
        else if (sessionType == 'I') {
            legendData = legendData + '<div class=\"legendItemDesktop\">WS = Warmup Speed</div>';
            legendData = legendData + '<div class=\"legendItem\">L1S = Lap 1 Speed</div>';
            legendData = legendData + '<div class=\"legendItem\">L2S = Lap 2 Speed</div>';
            legendData = legendData + '<div class=\"legendItem\">L3S = Lap 3 Speed</div>';
            legendData = legendData + '<div class=\"legendItem\">L4S = Lap 4 Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">L1T = Lap 1 Time</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">L2T = Lap 2 Time</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">L3T = Lap 3 Time</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">L4T = Lap 4 Time</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">BT3TS = Best Turn 3 Trap Speed</div>';
        }
        else if (sessionType == 'Q') {
            legendData = legendData + '<div class=\"legendItem\">WS = Warmup Speed</div>';
            legendData = legendData + '<div class=\"legendItem\">L1S = Lap 1 Speed</div>';
            legendData = legendData + '<div class=\"legendItem\">L2S = Lap 2 Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">WT = Warmup Time</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">L1T = Lap 1 Time</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">L2T = Lap 2 Time</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">BT1TS = Best Turn 1 Trap Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">LT1TS = Last Lap Turn 1 Trap Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">BT3TS = Best Turn 3 Trap Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">LT3TS = Last Lap Turn 3 Trap Speed</div>';
        }
        else if (sessionType == 'R') {
            legendData = legendData + '<div class=\"legendItemDesktop\">BLS = Best Lap Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">LLS = Last Lap Speed</div>';
            legendData = legendData + '<div class=\"legendItem\">BLT = Best Lap Time</div>';
            legendData = legendData + '<div class=\"legendItem\">LLT = Last Lap Time</div>';
            if (series == 'I') {
                legendData = legendData + '<div class=\"legendItem\">LSP = Laps Since Pit</div>';
            }
            legendData = legendData + '<div class=\"legendItemDesktop\">BT1TS = Best Turn 1 Trap Speed</div>';
            if (series != 'I') {
                legendData = legendData + '<div class=\"legendItemDesktop\">LT1TS = Last Lap Turn 1 Trap Speed</div>';
            }
            legendData = legendData + '<div class=\"legendItemDesktop\">BT3TS = Best Turn 3 Trap Speed</div>';
            if (series != 'I') {
                legendData = legendData + '<div class=\"legendItemDesktop\">LT3TS = Last Lap Turn 3 Trap Speed</div>';
            }
        }
    }
    else {
        if (sessionType == 'R') {
            legendData = legendData + '<div class=\"legendItem\">BLT = Best Lap Time</div>';
            legendData = legendData + '<div class=\"legendItem\">LLT = Last Lap Time</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">BLS = Best Lap Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">LLS = Last Lap Speed</div>';
            if (series == 'I' || series == 'L') {
                legendData = legendData + '<div class=\"legendItem\">OSR = Overtake Seconds Remaining</div>';
            }
            if (series == 'I') {
                legendData = legendData + '<div class=\"legendItem\">LSP = Laps Since Pit</div>';
            }
        }
        else if (sessionType == 'Q' || sessionType == 'P') {
            legendData = legendData + '<div class=\"legendItem\">BLT = Best Lap Time</div>';
            legendData = legendData + '<div class=\"legendItem\">LLT = Last Lap Time</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">BLS = Best Lap Speed</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">LLS = Last Lap Speed</div>';
            if (series != 'I') {
                legendData = legendData + '<div class=\"legendItemDesktop\">BLN = Best Lap Number</div>';
            }
            legendData = legendData + '<div class=\"legendItemDesktop\">S1 = Sector 1 Time</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">S2 = Sector 2 Time</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">S3 = Sector 3 Time</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">BS1 = Best Sector 1 Time</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">BS2 = Best Sector 2 Time</div>';
            legendData = legendData + '<div class=\"legendItemDesktop\">BS3 = Best Sector 3 Time</div>';
        }
    }

    $('#LegendDiv').empty();
    $('#LegendDiv').append(legendData);

    $('.mobile-timing-container').empty();
    $('.mobile-timing-container').append(tableData);

    //if (series == 'I' && trackType == 'I') {
    //    noTowTimeColumn += '</div>';
    //    noTowTimeColumn = noTowTimeColumn.replace(/undefined/g, "");
    //    noTowSpeedColumn += '</div>';
    //    noTowSpeedColumn = noTowSpeedColumn.replace(/undefined/g, "");
    //    noTowRankColumn += '</div>';
    //    noTowRankColumn = noTowRankColumn.replace(/undefined/g, "");
    //    noTowLapNumberColumn += '</div>';
    //    noTowLapNumberColumn = noTowLapNumberColumn.replace(/undefined/g, "");

    //    $('.notowcontainer').css('display', 'block');
    //    //No Tow Data Table
    //    var noTowDriverTable = '<div style="clear: both; background-color: black; height: 30px; min-height: 30px; line-height: 30px; float: left; 
margin-left: 1%;" class=\"mobileHeaderRow\"></div>';
    //    noTowDriverTable += '<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"mobileNormalColumn\">No Tow Rank</div>';
    //    noTowDriverTable += '<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"mobileNormalColumn\"></div>';
    //    noTowDriverTable += '<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"mobileNormalColumn\"></div>';
    //    noTowDriverTable += '<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"mobileNormalColumn\">No Tow Speed</div>';
    //    noTowDriverTable += '<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"expandedMobileColumns\">No Tow Time</div>';
    //    noTowDriverTable += '<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"expandedMobileColumns\">No Tow Lap #</div>';
    //    noTowDriverTable += '<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; color: 
White; float: left; text-align: right;\" class=\"expandedMobileColumns\">Overall Rank</div>';
    //    noTowDriverTable += '</div>';

    //    noTowDrivers.sort(function (a, b) {
    //        return a[0] - b[0];
    //    });
    //    var index, entry;
    //    for (index = 0; index < noTowDrivers.length; ++index) {
    //        entry = noTowDrivers[index];
    //        if (index % 2 == 0) {
    //            ntRowStyle = ' background-color: #aaaaaa; color: Black;';
    //        }
    //        else {
    //            ntRowStyle = ' background-color: White; color: Black;';
    //        }
    //        //noTowDriverTable += '<div style=\"float: left; min-height: 30px; line-height: 30px; overflow: hidden; background-color: black; 
color: White; float: left; text-align: right; !ROWSTYLE!\" class=\"mobileNormalColumn\">'.replace(/!ROWSTYLE!/g, ntRowStyle) + entry[0] + 
'</div></div>' + entry[1].replace(/!ROWSTYLE!/g, ntRowStyle) + entry[2].replace(/!ROWSTYLE!/g, ntRowStyle) + entry[3].replace(/!ROWSTYLE!/g, 
ntRowStyle) + entry[4].replace(/!ROWSTYLE!/g, ntRowStyle) + entry[5].replace(/!ROWSTYLE!/g, ntRowStyle) + entry[6].replace(/!ROWSTYLE!/g, 
ntRowStyle);
    //    }
    //    noTowDriverTable += '</div>';

    //    var ntPadding = 'padding: 2.5px 33.14285714285714px 2.5px 33.14285714285714px;';
    //    noTowDriverTable = noTowDriverTable.replace(/!PADDING!/g, ntPadding);

    //    $('.notowcontainer').empty();
    //    $('.notowcontainer').append(noTowDriverTable);
    //}
}

function sortJSON(data, key, way) {
    return data.sort(function (a, b) {
        var x = parseFloat(a[key]);
        if (isNaN(x)) {
            x = 0.000;
        }
        var y = parseFloat(b[key]);
        if (isNaN(y)) {
            y = 0.000;
        }
        if (way == 'asc') { return ((x < y) ? -1 : ((x > y) ? 1 : 0)); }
        if (way == 'dsc') { return ((x > y) ? -1 : ((x < y) ? 1 : 0)); }
    });
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

