// File input

(function($, window, document) {

  'use strict';

  BATHYMETRY = (function(bathymetry) {

    bathymetry.file = {

      // Process file
      handleFile: function(files) {
        var file = files[0];
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = function(event) {
          var database = new SQL.Database(new Int8Array(event.target.result));
          bathymetry.file.dataMinMax('SELECT MIN(latitude) AS minlat, MAX(latitude) AS maxlat, MIN(longitude) AS minlng, MAX(longitude) AS maxlng, MIN(depth) AS mindepth, MAX(depth) AS maxdepth FROM Measurement', database);
          bathymetry.file.date('SELECT time FROM Location LIMIT 1', database);
          bathymetry.file.createGrid('SELECT latitude, longitude, depth FROM Measurement ORDER BY longitude, latitude', database);
        }
      },

      // Get date
      date: function(commands, database) {
        commands = commands.replace(/\n/g, '; ');
        var data = database.exec(commands);
        var timestamp = data[0].values[0][0];
        bathymetry.date = moment(timestamp).format('MMM Do YYYY');
      },

      // Get basic data
      dataMinMax: function(commands, database) {
        commands = commands.replace(/\n/g, '; ');
        var data = database.exec(commands);
        var values = data[0].values[0];
        bathymetry.latMin = values[0];
        bathymetry.latMax = values[1];
        bathymetry.lngMin = values[2];
        bathymetry.lngMax = values[3];
      },

      // Create points grid
      createGrid: function(commands, database) {
        commands = commands.replace(/\n/g, '; ');
        try {
          var data = database.exec(commands);
          var fileData = data[0].values;
          for(var i = 0; i < fileData.length; i++) {
            bathymetry.data.push([fileData[i][0], fileData[i][1], BATHYMETRY.round(fileData[i][2], 1)]);
            fileData[i][2] = BATHYMETRY.round(fileData[i][2], 1);
          }
          bathymetry.data.length = 0;
          bathymetry.z.length = 0;
          var latMin = bathymetry.latMin;
          var latMax = bathymetry.latMax;
          var lngMin = bathymetry.lngMin;
          var lngMax = bathymetry.lngMax;
          bathymetry.gridWidth = Math.round((lngMax - lngMin) / bathymetry.densityLng) + 1;
          bathymetry.gridLength = Math.round((latMax - latMin) / bathymetry.densityLat) + 1;
          var gridWidth = bathymetry.gridWidth;
          var gridLength = bathymetry.gridLength;
          var latIncrement = 0;
          var lngIncrement = 0;
          var index = 0;
          var z = bathymetry.z;
          for(var i = 0; i < gridWidth; i++) {
            for(var j = 0; j < gridLength; j++) {
              var lat = BATHYMETRY.round(latMin + latIncrement, 5);
              var lng = BATHYMETRY.round(lngMin + lngIncrement, 5);
              bathymetry.data.push([lat, lng, 0]);
              latIncrement += bathymetry.densityLat;
              index++;
            }
            latIncrement = 0;
            lngIncrement += bathymetry.densityLng;
          }
          var fileDataLength = fileData.length;
          var start = 0;
          var end = bathymetry.data.length;
          var sr = 0;
          for(var i = 0; i < fileDataLength; i++) {
            start = 0;
            end = bathymetry.data.length - 1;
            while(start <= end) {
              sr = Math.floor((start + end) / 2);
              if(fileData[i][1] - 0.00003 > bathymetry.data[sr][1]) {
                start = sr + 1;
              } else if(fileData[i][1] + 0.00003 < bathymetry.data[sr][1]) {
                end = sr - 1;
              } else {
                break;
              }
            }
            for(var j = start; j <= end; j++) {
              if(Math.abs(fileData[i][0] - bathymetry.data[j][0]) <= 0.000015 && Math.abs(fileData[i][1] - bathymetry.data[j][1]) <= 0.00003) {
                if(bathymetry.data[j][3]) {
                  bathymetry.data[j][3]++;
                  bathymetry.data[j][2] = BATHYMETRY.round(bathymetry.data[j][2] + ((fileData[i][2] - bathymetry.data[j][2]) / bathymetry.data[j][3]), 1);
                } else {
                  bathymetry.data[j][2] = fileData[i][2];
                  bathymetry.data[j][3] = 1;
                }
                break;
              }
            }
          }
          for(var i = 0; i < gridWidth; i++) {
            z[i] = [];
            for(var j = 0; j < gridLength; j++) {
              z[i].push(bathymetry.data[i * gridLength + j][2]);
            }
          }
          BATHYMETRY.map.setCenter(fileData[0][0], fileData[0][1]);
          BATHYMETRY.map.setZoom(16);
          bathymetry.stats.init();
          BATHYMETRY.hideLoader();
          $('.step-1').attr('hidden', true);
          $('.step-2').removeAttr('hidden');
          BATHYMETRY.drawPolygons();
        } catch(e) {
          console.log(e);
        }
      }

    };

    return bathymetry;

  }(BATHYMETRY || {}));

}(jQuery, window, document));