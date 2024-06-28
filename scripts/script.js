
/* red pin icon */
var RedPinIcon = L.icon({
    iconUrl: 'red_pin.png',
    iconSize: [25, 25],

});


/* The following values came from the database */

var time = [];
var band = [];
var rx_sign = [];
var rx_lat = [];
var rx_lon = [];
var rx_loc = [];
var tx_sign = [];
var tx_lat = [];
var tx_lon = [];
var tx_loc = [];
var distance = [];
var tx_azimuth = [];
var rx_azimuth = [];
var frequency = [];
var power = [];
var snr = [];
var drift = [];
var version = [];
var code = [];

/* Altitude is a calculated value */
var altitude = []
var data_count;

/* Create the Power Table to Calculate the Altitude */
/* Contains Power dBm, Power Watt, Altitude (min), Altitude (max), Altitude (avg), Altitude (ft) */
var powerTable = []
powerTable.push([0,	 0.001,	0,      900     ,0,0]);
powerTable.push([3,	 0.002,	900,	2100    ,0,0]);
powerTable.push([7,  0.005,	2100,	3000    ,0,0]);
powerTable.push([10, 0.01,	3000,	3900    ,0,0]);
powerTable.push([13, 0.02,	3900,	5100    ,0,0]);
powerTable.push([17, 0.05,	5100,	6000    ,0,0]);
powerTable.push([20, 0.1,	6000,	6900    ,0,0]);
powerTable.push([23, 0.2,	6900,	8100    ,0,0]);
powerTable.push([27, 0.5,	8100,	9000    ,0,0]);
powerTable.push([30, 1,	    9000,	9900    ,0,0]);
powerTable.push([33, 2,	    9900,	11190   ,0,0]);
powerTable.push([37, 5,	    11190,	12000   ,0,0]);
powerTable.push([40, 10,	12000,	12900   ,0,0]);
powerTable.push([43, 20,	12900,	14100   ,0,0]);
powerTable.push([47, 50,	14100,	15000   ,0,0]);
powerTable.push([50, 100,	15000,	15900   ,0,0]);
powerTable.push([53, 200,	15900,	17100   ,0,0]);
powerTable.push([57, 500,	17100,	18000   ,0,0]);
powerTable.push([60, 1000,	18000,	18000   ,0,0]);

for (var i = 0; i < powerTable.length; i++) {
    powerTable[i][4] = Math.round((powerTable[i][2] + powerTable[i][3]) / 2)
    powerTable[i][5] = Math.round(powerTable[i][4] * 3.28084)
}


async function GetWSPRData() {
    "use strict";

    // Get a reference to the form - Use the ID of the form
    var form = $("#myform");
    
      // If all of the form elements are valid, the get the form values
    if (form.valid()) {
        
        var Reporter = document.getElementById("Reporter").value;
        var FromDate = document.getElementById("FromDate").value;
        var ToDate = document.getElementById("ToDate").value;

        /* URL for AJAX Call */
        var myURL1 = "https://db1.wspr.live/?query=SELECT * FROM wspr.rx where tx_sign = '" + Reporter + "' and time >= '" + FromDate + "' and time <= '" + ToDate + "' ORDER BY time ASC FORMAT JSON"
        /* Make the AJAX call */
        var msg1Object = await fetch(myURL1);
        /* Check the status */
        if (msg1Object.status == 200) {            
            var msg1JSONText = await msg1Object.text();

            // Parse the JSON string into an object
            var msg1 = JSON.parse(msg1JSONText);

            /* Pull the data from the message object and place it in local variables */
            data_count = msg1.data.length;
            for (var i = 0; i < data_count; i++) {
                time[i] = msg1.data[i].time;
                band[i] = msg1.data[i].band;
                rx_sign[i] = msg1.data[i].rx_sign;
                rx_lat[i] = msg1.data[i].rx_lat;
                rx_lon[i] = msg1.data[i].rx_lon;
                rx_loc[i] = msg1.data[i].rx_loc;
                tx_sign[i] = msg1.data[i].tx_sign;
                tx_lat[i] = msg1.data[i].tx_lat;
                tx_lon[i] = msg1.data[i].tx_lon;
                tx_loc[i] = msg1.data[i].tx_loc;
                distance[i] = msg1.data[i].distance;
                tx_azimuth[i] = msg1.data[i].azimuth;
                rx_azimuth[i] = msg1.data[i].rx_azimuth;
                frequency[i] = msg1.data[i].frequency;
                power[i] = msg1.data[i].power;
                snr[i] = msg1.data[i].snr;
                drift[i] = msg1.data[i].drift;
                version[i] = msg1.data[i].version;
                code[i] = msg1.data[i].code;
                altitude[i] = calcAltitude(power[i]);
            }
            
            showMap();            
            showData();
            download_csv_file();

        }
        else {
            /* AJAX complete with error */
            alert("Error Detected - Status: " + msg1Object.status)
            return;
        }        
    }
}

function calcAltitude(power) {
    if (power == 0) {
        return 0
    }
    for (var i = 0; i < powerTable.length; i++) {
        if (power < powerTable[i][1]) {
            return powerTable[i-1][5]
        }
    }
    return 0
}

function showData() {

    /* Display the table header */
    var table = "<table>";
    table = table + "<tr>"
    table = table + "<th>Date/Time</th>";
    table = table + "<th>Band</th>";
    table = table + "<th>RX Sign</th>";
    table = table + "<th>RX Lat</th>";
    table = table + "<th>RX Long</th>";
    table = table + "<th>RX Loc</th>";
    table = table + "<th>TX Sign</th>";
    table = table + "<th>TX Lat</th>";
    table = table + "<th>TX Long</th>";
    table = table + "<th>TX Loc</th>";
    table = table + "<th>Dist</th>";
    table = table + "<th>TX Azm</th>";
    table = table + "<th>RX Azm</th>";
    table = table + "<th>Freq</th>";
    table = table + "<th>Pwr</th>";
    table = table + "<th>SNR</th>";
    table = table + "<th>Drift</th>";
    table = table + "<th>Version</th>";
    table = table + "<th>Code</th>";
    table = table + "<th>Altitude</th>";
    table = table + "</tr>";
            
    /* Display the table data */
    for (var i = 0; i < data_count; i++) {
        table = table + "<tr>";
        table = table + "<td>" + time[i] + "</td>";
        table = table + "<td>" + band[i] + "</td>";
        table = table + "<td>" + rx_sign[i] + "</td>";
        table = table + "<td>" + rx_lat[i] + "</td>";
        table = table + "<td>" + rx_lon[i] + "</td>";
        table = table + "<td>" + rx_loc[i] + "</td>";
        table = table + "<td>" + tx_sign[i] + "</td>";
        table = table + "<td>" + tx_lat[i] + "</td>";
        table = table + "<td>" + tx_lon[i] + "</td>";
        table = table + "<td>" + tx_loc[i] + "</td>";
        table = table + "<td>" + distance[i] + "</td>";
        table = table + "<td>" + tx_azimuth[i] + "</td>";
        table = table + "<td>" + rx_azimuth[i] + "</td>";
        table = table + "<td>" + frequency[i] + "</td>";
        table = table + "<td>" + power[i] + "</td>";
        table = table + "<td>" + snr[i] + "</td>";
        table = table + "<td>" + drift[i] + "</td>";
        table = table + "<td>" + version[i] + "</td>";
        table = table + "<td>" + code[i] + "</td>";
        table = table + "<td>" + altitude[i] + "</td>";
        table = table + "</tr>";
    }
    table = table + "</table>";
            
    /* Display Table Data */
    document.getElementById("tabledata").innerHTML = table;
}


function showMap() {

    /* Create a map and set the center of the map to the first data point, probably the launch point */
    const map = L.map('map').setView([tx_lat[0], tx_lon[0]], 13);

    /* Add streets and copyright */
	const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map);
    
    /* Marker is and array of pins on the map */
    var marker = [];

    /* Balloon track drops a once each time a balloon is heard.  Only one pin is dropped even when there are multiple listners */
    var current_time = "";

    /* Array of lat lon for each pin - used to draw polyline */
    var balloon_latlon = [];

    /* Arrays of listener callsigns - each time a pin is dropped, it is added to this array. 
    The array is check so that multiple pins for the same location are not dropped.*/
    var listeners = [];

    for (var i = 0; i < data_count; i++) {

        /* Only place a marker if we have encountered a new time */
        if (current_time != time[i]) {
            marker.push(L.marker([tx_lat[i], tx_lon[i]]).addTo(map).bindTooltip("Date:" + time[i] + ' - Altitude: ' + altitude[i]));
            current_time = time[i];

            /* add lat and lon to array for later polyline display */
            balloon_latlon.push([tx_lat[i], tx_lon[i]]);

            /* if the call sign exists in listeners then we have already dropped a pin for the listener */
            if (!listeners.includes(rx_sign[i])) {
                marker.push(L.marker([rx_lat[i], rx_lon[i]],{icon: RedPinIcon}).addTo(map).bindTooltip(rx_sign[i]));
                listeners.push(rx_sign[i])
            } 
        }
    }

    /* display lines connecting markers */
    var balloonpolyline = L.polyline(balloon_latlon, {color: 'red'}).addTo(map);

    /* zoom the map to the polyline */
    map.fitBounds(balloonpolyline.getBounds());

    /* if the user clicks on the map - display the lat/lon coordinates */
    var popup = L.popup();
    function onMapClick(e) {
	    popup
		    .setLatLng(e.latlng)
		    .setContent(`You clicked the map at ${e.latlng.toString()}`)
		    .openOn(map);
    }
    map.on('click', onMapClick);
    
}

function download_csv_file() {
    // https://www.javatpoint.com/oprweb/test.jsp?filename=javascript-create-and-download-csv-file1
    //define the heading for each row of the data
  
    var csv = "Lat" + "," + "Lon" + "\n";
    var row;
    for (var i = 0; i < data_count; i++) {
        row = tx_lat[i] + "," + tx_lon[i] + "\n";
        csv += row;
    }

    //display the created CSV data on the web browser 
//    document.write(csv);

   
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    
    //provide the name for the CSV file to be downloaded
    hiddenElement.download = 'LatLon.csv';
    hiddenElement.click();
}

function ClearForm() {
    document.getElementById("ReporterError").innerHTML = "";
    document.getElementById("FromDateError").innerHTML = "";
    document.getElementById("ToDateError").innerHTML = "";
    document.getElementById("tabledata").innerHTML = "";    
}