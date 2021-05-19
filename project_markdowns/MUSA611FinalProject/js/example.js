// /* =====================
//   Global Variables
// ===================== */

// var zipcodeData
// var zipcodePopData
// var barchart
// var piechart
// var baseHexStyle = { stroke: false }
var bikeshare;
//var groupbyid;
var filterbikeshare;
var groupStation;
var countStation;
var stndotw;
var stnpass;
var dotwall;
var countrec;
var labelrec;
var datafl;
var targetName;

var countStnHours;
var countStnDotw;
var countStnPass;
var markerData;

var linechart;
var piechart;

var marker;
var markers = [];
var markersLayer = new L.LayerGroup();


/* =====================
  Map Setup
===================== */
// Notice that we've been using an options object since week 1 without realizing it
var mapOpts = {
  center: [39.95185892663005, -75.16502380371094],
  zoom: 13,
};
var map = L.map('map', mapOpts);

// Another options object
var tileOpts = {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
};
var Stamen_TonerLite = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', tileOpts).addTo(map);

////////////////////////////////////////read in data

$.ajax('https://raw.githubusercontent.com/BCCghspace/data/main/2018w44.json?token=AQ2OW55RCWLAFPB3VUVAW2TAVVK5S').done(function(data) {
  bikeshare = JSON.parse(data);
  console.log(bikeshare)
  filterbikeshare = bikeshare
  getStnDotw(filterbikeshare)
  getStnPass(filterbikeshare)
  groupStation = _.groupBy(filterbikeshare, function(rec){return rec.name});
  dotwall = true;
  mapData(groupStation)
  markers = _.mapObject(markerData, function(record){
    var pathOpts = {'radius': record.count / 20};
      marker = L.circleMarker([record.lat, record.lng], pathOpts)
      .bindPopup(record.name + " has " + record.count + " riders.")
      .on('click', function (e) {
        // var popUp = e.sourceTarget._popup._content;
        // var stnname1 = popUp.split(" has")[0]
        // stnname1 = String(stnname1)
        // console.log(stnname1)
        console.log("first name", record.name)
        console.log(countStnPass)
        //document.getElementById('myPieChart').getContext('2d').clearRect(0, 0, document.getElementById('myPieChart').width, document.getElementById('myPieChart').height);
        if (linechart){
          updateLineChart(record.name)
        } else {
          createLineChart(record.name)
        }
        //set up bar chart
        if (piechart){
          //piechart.destroy()
          //document.getElementById('myPieChart').getContext('2d').clearRect(0, 0, document.getElementById('myPieChart').width, document.getElementById('myPieChart').height);
          updatePieChart(record.name)
        } else {
          createPieChart(record.name)
          //document.getElementById('myPieChart').getContext('2d').clearRect(0, 0, document.getElementById('myPieChart').width, document.getElementById('myPieChart').height);
        }
      })
      markersLayer.addLayer(marker);
//       .on('click', function(e) {
//     console.log(e.latlng);
// })
})
markersLayer.addTo(map);
});


var getDotwFilter = function(){
  dotw = $("#dotw").val()
  if (dotw == "All"){
    dotwall = true
    return function(rec){
      return true
    }
  } else {
    dotwall = false
    return function(rec){
      return rec.dotw == dotw
    }
  }
}

var getServiceFilter = function(){
  service = $("#service").val()
  if (service == "All"){
    return function(rec){
      return true
    }
  } else {
    return function(rec){
      return rec.passholder_type == service
    }
  }
}

var chopkey = function(o){
  var chopob = _.mapObject(o, function(response){
    for (var key in response) {
      if (response.hasOwnProperty(key)) {
       // creating substring from key name
        var x = key.substring(11, 19);
        // in same object creating a new key & value using the
        // substring and previous value
        response[x] = response[key];
        // deleting the old key
        delete response[key];
      }
    }
    return response;
  })
  return chopob
}


var getStnHours = function(bikeShareTrips){
  groupStation = _.groupBy(bikeShareTrips, function(rec){return rec.name});
  //console.log(groupStation)
  countStnHours = _.mapObject(groupStation, function(recgroup){
    return _.countBy(recgroup,function(rec){
      return rec.interval60
    })
  });
  countStnHours = chopkey(countStnHours);
  console.log("countstnhours",countStnHours)
}

var getStnDotw = function(bikeShareTrips){
  groupStation = _.groupBy(bikeShareTrips, function(rec){return rec.name});
  //console.log(groupStation)
  countStnDotw = _.mapObject(groupStation, function(recgroup){
    return _.countBy(recgroup,function(rec){
      return rec.dotw
    })
  });
  console.log("countstndotw",countStnDotw)
}

var getStnPass = function(bikeShareTrips){
  groupStation = _.groupBy(bikeShareTrips, function(rec){return rec.name});
  //console.log(groupStation)
  countStnPass = _.mapObject(groupStation, function(recgroup){
    return _.countBy(recgroup,function(rec){
      return rec.passholder_type
    })
  });
  console.log("countstnpass",countStnPass)
}
///not working?
var mapData = function (groupStn){
  markerData = _.mapObject(groupStn, function(arrOfObj){
    return {
      'name':arrOfObj[0].name, 'lat':arrOfObj[0].start_lat, 'lng':arrOfObj[0].start_lon, 'count':arrOfObj.length
    }
  })
  return markerData
}

var fallBackZero = function(ref){return ref? ref:0}

$(".record-filters").on("change", function() {
  dotwall = false;
  markersLayer.clearLayers();
  dotwfilter = getDotwFilter()
  servicefilter = getServiceFilter()
  filterbikeshare = bikeshare.filter(function(rec){
    return dotwfilter(rec) && servicefilter(rec)
  })
  if(dotwall == true){
    getStnDotw(filterbikeshare)
  } else {
    getStnHours(filterbikeshare)
  }
  getStnPass(filterbikeshare)
  mapData(groupStation)
  markers = _.mapObject(markerData, function(record){
    var pathOpts = {'radius': record.count / 20};
      marker = L.circleMarker([record.lat, record.lng], pathOpts)
      .bindPopup(record.name + " has " + record.count + " riders.")
      .on('click', function (e) {
        // var popUp = e.sourceTarget._popup._content;
        // var stnname1 = popUp.split(" has")[0]
        // stnname1 = String(stnname1)
        // console.log(stnname1)
        console.log(countStnPass)
        if (linechart){
          updateLineChart(record.name)//give recor.name to access
        } else {
          createLineChart(record.name)
        }
        //set up bar chart
        if (piechart){
          updatePieChart(record.name)
        } else {
          createPieChart(record.name)
        }
      })

  markersLayer.addLayer(marker);
  })
  markersLayer.addTo(map);
  // }
});


var datarec = function(stnname){//station name
  if(dotwall == true){
    datafl = [fallBackZero(countStnDotw[stnname].Mon), fallBackZero(countStnDotw[stnname].Tue),fallBackZero(countStnDotw[stnname].Wed), fallBackZero(countStnDotw[stnname].Thu), fallBackZero(countStnDotw[stnname].Fri), fallBackZero(countStnDotw[stnname].Sat), fallBackZero(countStnDotw[stnname].Sun)]
    return datafl
  } else {
    datafl = [fallBackZero(countStnHours[stnname]['00:00:00']), fallBackZero(countStnHours[stnname]['01:00:00']), fallBackZero(countStnHours[stnname]['02:00:00']), fallBackZero(countStnHours[stnname]['03:00:00']),
              fallBackZero(countStnHours[stnname]['04:00:00']), fallBackZero(countStnHours[stnname]['05:00:00']), fallBackZero(countStnHours[stnname]['06:00:00']), fallBackZero(countStnHours[stnname]['07:00:00']),
              fallBackZero(countStnHours[stnname]['08:00:00']), fallBackZero(countStnHours[stnname]['09:00:00']), fallBackZero(countStnHours[stnname]['10:00:00']), fallBackZero(countStnHours[stnname]['11:00:00']),
              fallBackZero(countStnHours[stnname]['12:00:00']), fallBackZero(countStnHours[stnname]['13:00:00']), fallBackZero(countStnHours[stnname]['14:00:00']), fallBackZero(countStnHours[stnname]['15:00:00']),
              fallBackZero(countStnHours[stnname]['16:00:00']), fallBackZero(countStnHours[stnname]['17:00:00']), fallBackZero(countStnHours[stnname]['18:00:00']), fallBackZero(countStnHours[stnname]['19:00:00']),
              fallBackZero(countStnHours[stnname]['20:00:00']), fallBackZero(countStnHours[stnname]['21:00:00']), fallBackZero(countStnHours[stnname]['22:00:00']), fallBackZero(countStnHours[stnname]['23:00:00'])]
    return datafl
  }
}

var linelabel = function(){
  if(dotwall == true){
    labelrec = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return labelrec
  } else {
    labelrec = ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23']
    return labelrec
  }
}

////////////////////////////////////////create charts
var createLineChart = function(stationName) {
  var ctx = document.getElementById('myLineChart').getContext('2d');
  console.log("name", stationName)
  console.log("data", datarec(stationName))
  linechart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: linelabel(),
          datasets: [{
              label: ['biking demand'],
              data: datarec(stationName),
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)'
                  // 'rgba(54, 162, 235, 0.2)',
                  // 'rgba(255, 206, 86, 0.2)',
                  // 'rgba(75, 192, 192, 0.2)',
                  // 'rgba(153, 102, 255, 0.2)',
                  // 'rgba(255, 159, 64, 0.2)',
                  // 'rgba(194, 48, 213, 0.2)'
              ],
              borderColor: [
                  'rgba(255, 99, 132, 1)'
                  // 'rgba(54, 162, 235, 1)',
                  // 'rgba(255, 206, 86, 1)',
                  // 'rgba(75, 192, 192, 1)',
                  // 'rgba(153, 102, 255, 1)',
                  // 'rgba(255, 159, 64, 1)',
                  // 'rgba(194, 48, 213, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
  })
};
//https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
var updateLineChart = function(stationName){
  linechart.data.datasets[0].data= datarec(stationName);
  console.log("updateline", datarec(stationName), linechart.data.datasets);
  linechart.data.labels = linelabel();
  linechart.update();
}

var createPieChart = function(stationName){
  var ctx = document.getElementById('myPieChart').getContext('2d');
  piechart = new Chart(ctx, {
      type: 'doughnut',
      data: {
          labels: ['Indego30','Indego365', 'Day Pass', 'Walk In'],
          datasets: [{
              label: 'Passes',
              data: [fallBackZero(countStnPass[stationName].Indego30), fallBackZero(countStnPass[stationName].Indego365), fallBackZero(countStnPass[stationName].DayPass), fallBackZero(countStnPass[stationName].Walkin)],
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)'
                  // 'rgba(153, 102, 255, 0.2)',
                  // 'rgba(255, 159, 64, 0.2)'
              ],
              // borderColor: [
              //     'rgba(255, 99, 132, 1)',
              //     'rgba(54, 162, 235, 1)',
              //     'rgba(255, 206, 86, 1)'
              //     // 'rgba(75, 192, 192, 1)',
              //     // 'rgba(153, 102, 255, 1)',
              //     // 'rgba(255, 159, 64, 1)'
              // ],
              //borderWidth: 1
              hoverOffset: 4
          }]
      },
      // options: {
      //     scales: {
      //         y: {
      //             beginAtZero: true
      //         }
      //     }
      // }
  })
}

// var updatePieChart = function(stationName){
//   piechart.data.datasets[0].data[0]=countStnPass[stationName].Indego30
//   piechart.data.datasets[0].data[1]=countStnPass[stationName].Indego365
//   piechart.data.datasets[0].data[2]=countStnPass[stationName].DayPass
//   piechart.data.datasets[0].data[3]=countStnPass[stationName].Walkin
//   piechart.update()
// }

var updatePieChart = function(stationName){
  console.log(countStnPass)
  // document.getElementById('myPieChart')
  //         .getContext('2d')
  //         .clearRect(0, 0, document.getElementById('myPieChart').width, document.getElementById('myPieChart').height);
  piechart.data.datasets[0].data= [fallBackZero(countStnPass[stationName].Indego30), fallBackZero(countStnPass[stationName].Indego365), fallBackZero(countStnPass[stationName].DayPass), fallBackZero(countStnPass[stationName].Walkin)]
  piechart.update();
}
// $.when($.ajax(zipcodeURL), $.ajax(zipcodeVaccURL), $.ajax(zipcodePopURL)).then(function(zipcodeRes, zipcodeVaccRes, zipcodePopRes) {
//   zipcodeData = JSON.parse(zipcodeRes[0])
//   zipcodeVaccData = JSON.parse(zipcodeVaccRes[0])
//   zipcodePopData = JSON.parse(zipcodePopRes[0])
// console.log(markersLayer)
// marker.on("click", markerOnClick);



//   L.geoJSON(zipcodeData, {
//     onEachFeature: function(feat, layer){
//       layer.on('click', function(e){
//         var zipcode = feat.properties.CODE
//         var vaccinationData = zipcodeVaccData[zipcode]
//         var populationData = zipcodePopData.filter(function(datum){
//           return datum.zip === Number(zipcode)
//         })[0]
//
//         //set uup for the bar chart
//         if (barchart){
//           updateBarChart(vaccinationData)
//         } else {
//           createBarChart(vaccinationData)
//         }
//
//         //set up bar chart
//         if (piechart){
//           updatePieChart(populationData, vaccinationData)
//         } else {
//           createPieChart(populationData, vaccinationData)
//         }
//       })
//     }
//   }).addTo(map)
// })

// $.ajax(zipcodes).done(function(res){
//   $.ajax("https://raw.githubusercontent.com/CPLN692-MUSA611-Open-Source-GIS/OSGIS-week9/master/assignment/vaccination_by_zip.json").done(function(pipZipData){
//     $.ajax().done(function(){
//     })
//     L.geojson(zipcodeData).addTo(map)
// })
//
//   dataset.on('click', function() {
//     console.log(feature.properties.CODE)
//   })





// $.ajax('https://raw.githubusercontent.com/CPLN692-MUSA611-Open-Source-GIS/datasets/master/geojson/philadelphia-crime-points.geojson').done(function(data) {
//   crimeData = JSON.parse(data);
//   // Fixing an AWFUL bug caused by BAD data: Features *NEED* to have geometries...
//   crimeData.features = _.filter(crimeData.features, function(f) { return f.geometry; });
//
//   // The data includes some strange outliers - let's limit it to the area with lots of data
//   // The spatial filter produced here was produced on geojson.io (which uses leaflet draw!)
//   var spatialFilter = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[-75.22218704223633,39.885108787598114],[-75.22218704223633,39.9380402756277],[-75.13412475585938,39.9380402756277],[-75.13412475585938,39.885108787598114],[-75.22218704223633,39.885108787598114]]]}}]};
//   crimeData = turf.within(crimeData, spatialFilter);

  // Fit map to data bounds
//   var mapBoundary = L.geoJson(turf.envelope(crimeData)).getBounds();
//   map.fitBounds(mapBoundary);
//
//   // We'll place a hexagonal grid over the entire mapped area (hexagons are better than
//   // squares because square east/west and north/south distance is less than diagonal distance
//   var turfFriendlyBoundary = [mapBoundary.getWest(), mapBoundary.getSouth(), mapBoundary.getEast(), mapBoundary.getNorth()];
//   hexGrid = turf.hexGrid(turfFriendlyBoundary, 0.15, 'miles');
//
//   // Update the HTML DOM to reflect all the unique crime types
//   // Map over crimeData features for 'properties.text_general_code' and get the unique results
//   var uniqueCrimeTypes = _.unique(_.map(crimeData.features, function(f) { return f.properties.text_general_code; }));
//
//   // For each unique text, create a  checkbox
//   _.each(uniqueCrimeTypes, function(crimeText, index) {
//     $('#checkboxes').append('<label><input type="checkbox" />' + crimeText + '</label></br>');
//   });
//
//   $('#doFilter').click(function() {
//     // Here, we're using jQuery's `map` function; it works very much like underscore's
//     // We want true if checked, false if not
//     var checkboxValues = $('input[type=checkbox]').map(function(_, element) {
//           return $(element).prop('checked');
//     }).get();
//
//     // Let's "zip" checkbox values and checkbox text up together so that we can see values next to text
//     // Zipping takes two arrays (e.g. ['a', 'b', 'c'] and [1, 2, 3]) and produces an output
//     // (for this example, that output would be [['a', 1], ['b', 2], ['c', 3]])
//     // This is a nifty trick for functionally manipulating data
//     var zippedCrimeTypes = _.zip(checkboxValues, uniqueCrimeTypes);
//
//     // Our data, at this point, looks something like this: [[true, 'aCrimeType], [false, 'unwantedCrimeType']]
//     // Now, we want to return all and only crime types whose "zipped" values are true
//     // This involves filtering for true values at index 0 and getting the text at index 1
//     crimeFilters = _.chain(zippedCrimeTypes)
//       .filter(function(zip) { return zip[0]; })
//       .map(function(zip) { return zip[1]; })
//       .value();
//
//     // Carry out filter
//     var filteredCrimeData = _.clone(crimeData); // Cloning here so we don't overwrite data on the original object
//     filteredCrimeData.features = _.filter(filteredCrimeData.features, function(f) {
//       return _.contains(crimeFilters, f.properties.text_general_code);
//     });
//
//     // Remove any outdated data
//     if (mappedGrid) { map.removeLayer(mappedGrid); }
//     mappedGrid = L.geoJson(turf.count(hexGrid, filteredCrimeData, 'captured'), {
//       style: function(feature) {
//         return {
//           stroke: false,
//           fillColor: '#ff0000',
//           fillOpacity: (feature.properties.captured * 0.05)
//         };
//       },
//       onEachFeature: function(feature, layer) {
//         layer.bindPopup("Crimes reported: " + feature.properties.captured);
//       }
//     }).addTo(map);
//   });
// });
