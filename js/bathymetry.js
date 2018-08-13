// Main

(function($, window, document) {

  'use strict';

  BATHYMETRY = (function(bathymetry) {

    // Config
    bathymetry.data = [];
    bathymetry.z = [];
    bathymetry.gridWidth = 0;
    bathymetry.gridLength = 0;
    bathymetry.density = 3;
    bathymetry.densityLat = BATHYMETRY.round(bathymetry.density / 100000, 6);
    bathymetry.densityLng = BATHYMETRY.round(bathymetry.density / 50000, 6);
    bathymetry.latMin = 0;
    bathymetry.latMax = 0;
    bathymetry.lngMin = 0;
    bathymetry.lngMax = 0;
    bathymetry.depthMin = 0;
    bathymetry.depthMax = 0;
    bathymetry.depthAvg = 0;
    bathymetry.date = null;

    // Draw bathymetry on the map
    bathymetry.drawPolygons = function() {
      var data = bathymetry.data;
      var gridLength = bathymetry.gridLength;
      var gridWidth = bathymetry.gridWidth;
      var densityLat = bathymetry.densityLat;
      var densityLng = bathymetry.densityLng;
      var z = bathymetry.z;
      var depthMin = bathymetry.stats.depthMinMaxSr().depthMin;
      var depthMax = bathymetry.stats.depthMinMaxSr().depthMax;
      var depthDiff = depthMax - depthMin;
      depthDiff = depthDiff / 6;
      for(var i = 0; i < gridWidth; i++) {
        for(var j = 0; j < gridLength; j++) {
          if(z[i][j] === 0) {
            continue;
          }
          var index = i * gridLength + j;
          var glebokosc = z[i][j];
          var color = '#f44542';
          if(glebokosc >= depthDiff) {
            color = '#f49541';
          }
          if(glebokosc >= depthDiff * 2) {
            color = '#f4f141';
          }
          if(glebokosc >= depthDiff * 3) {
            color = '#64f441';
          }
          if(glebokosc >= depthDiff * 4) {
            color = '#41f4be';
          }
          if(glebokosc >= depthDiff * 5) {
            color = '#4194f4';
          }
          if(glebokosc >= depthDiff * 6) {
            color = '#4c41f4';
          }
          var path = [
            [data[index][0] - bathymetry.round(densityLat / 2, 6), data[index][1] - bathymetry.round(densityLng / 2, 6)],
            [data[index][0] + bathymetry.round(densityLat / 2, 6), data[index][1] - bathymetry.round(densityLng / 2, 6)],
            [data[index][0] + bathymetry.round(densityLat / 2, 6), data[index][1] + bathymetry.round(densityLng / 2, 6)],
            [data[index][0] - bathymetry.round(densityLat / 2, 6), data[index][1] + bathymetry.round(densityLng / 2, 6)]
          ];
          bathymetry.map.drawPolygon({
            paths: path,
            strokeColor: false,
            fillColor: color,
            fillOpacity: 0.6,
            strokeOpacity: 0,
            strokeWeight: 0
          });
        }
      }
    };

    // Remove bathymetry from the map
    bathymetry.removePolygons = function() {
      var polygonsLength = bathymetry.map.polygons.length;
      for(var i = 0; i < polygonsLength; i++) {
        bathymetry.map.polygons[i].setMap(null);
      }
    };

    // Stats
    bathymetry.stats = {
      init: function() {
        $('.depth-min').text(this.depthMinMaxSr().depthMin + 'm');
        $('.depth-max').text(this.depthMinMaxSr().depthMax + 'm');
        $('.depth-avg').text(this.depthMinMaxSr().depthAvg + 'm');
        $('.depth-date').text(bathymetry.date);
      },
      depthMinMaxSr: function() {
        var depthMin = 0;
        var gridData = bathymetry.data;
        var depths = [];
        var sum = 0;
        var n = 0;
        var data = {
          depthMin: 0,
          depthMax: 0,
          depthAvg: 0
        }
        for(var i = 0; i < gridData.length; i++) {
          if(gridData[i][2] !== 0 && gridData[i][2] !== 'l') {
            depths.push(gridData[i][2]);
            sum += gridData[i][2];
            n++;
          }
        }
        if(depths.length === 0) {
          return data;
        }
        data.depthMin = depths.min();
        data.depthMax = depths.max();
        data.depthAvg = bathymetry.round(sum / n, 1);
        bathymetry.depthMin = data.depthMin;
        bathymetry.depthMax = data.depthMax;
        bathymetry.depthAvg = data.depthAvg;
        return data;
      }
    };

    // Calculate average depths
    bathymetry.calculateAverages = function() {
      bathymetry.avgCounter = 0;
      var m = 8;
      while(m) {
        m = bathymetry.calculateAveragesA(m);
      }
      bathymetry.hideLoader();
      bathymetry.stats.init();
    };

    bathymetry.calculateAveragesA = function(m) {
      var numberOfPoints = 0;
      var data = bathymetry.data;
      var z = bathymetry.z;
      var gridWidth = bathymetry.gridWidth;
      var gridLength = bathymetry.gridLength;
      for(var i = 0; i < gridWidth; i++) {
        for(var j = 0; j < gridLength; j++) {
          if(z[i][j] !== 0 || z[i][j] === 'l') {
            continue;
          }
          var n = 0;
          var avg = 0;
          var top = false;
          var bottom = false;
          var left = false;
          var right = false;
          var leftTop = false;
          var rightBottom = false;
          var leftBottom = false;
          var rightTop = false;
          if(z[i] && z[i][j+1] && z[i][j+1] !== 0) {
            avg += z[i][j+1];
            top = true;
            n++;
          }
          if(z[i] && z[i][j-1] && z[i][j-1] !== 0) {
            avg += z[i][j-1];
            bottom = true;
            n++;
          }
          if(z[i-1] && z[i-1][j] && z[i-1][j] !== 0) {
            avg += z[i-1][j];
            left = true;
            n++;
          }
          if(z[i+1] && z[i+1][j] && z[i+1][j] !== 0) {
            avg += z[i+1][j];
            right = true;
            n++;
          }
          if(z[i-1] && z[i-1][j+1] && z[i-1][j+1] !== 0) {
            avg += z[i-1][j+1];
            leftTop = true;
            n++;
          }
          if(z[i+1] && z[i+1][j-1] && z[i+1][j-1] !== 0) {
            avg += z[i+1][j-1];
            rightBottom = true;
            n++;
          }
          if(z[i-1] && z[i-1][j-1] && z[i-1][j-1] !== 0) {
            avg += z[i-1][j-1];
            leftBottom = true;
            n++;
          }
          if(z[i+1] && z[i+1][j+1] && z[i+1][j+1] !== 0) {
            avg += z[i+1][j+1];
            rightTop = true;
            n++;
          }
          if(n >= m) {
            if(top && bottom || left && right || leftTop && rightBottom || leftBottom && rightTop) {
              z[i][j] = bathymetry.round(avg / n, 1);
              data[i * gridLength + j][2] = bathymetry.round(avg / n, 1);
              data[i * gridLength + j][4] = 's';
              numberOfPoints++;
              bathymetry.avgCounter++;
              if(m !== 8) {
                i = 0;
                j = 0;
                break;
              }
            }
          }
        }
      }
      if(m === 2 && numberOfPoints === 0) {
        return bathymetry.calculateAveragesB();
      }
      if(m === 8 || numberOfPoints === 0) {
        m--;
        return m;
      }
      if(m < 8 && numberOfPoints !== 0) {
        m++;
        return m;
      }
    };

    bathymetry.calculateAveragesB = function() {
      var gridWidth = bathymetry.gridWidth;
      var gridLength = bathymetry.gridLength;
      var data = bathymetry.data;
      var z = bathymetry.z;
      for(var i = 0; i < gridWidth; i++) {
        for(var j = 0; j < gridLength; j++) {
          if(z[i][j] !== 0 || z[i][j] === 'l') {
            continue;
          }
          var top = false;
          var bottom = false;
          var bottomBottom = false;
          var topTop = false;
          var left = false;
          var right = false;
          var leftLeft = false;
          var rightRight = false;
          var leftTop = false;
          var leftBottom = false;
          var rightBottom = false;
          var rightTop = false;
          var lewoleftTop = false;
          var lewoleftBottom = false;
          var praworightBottom = false;
          var praworightTop = false;
          if(z[i] && z[i][j+1] && z[i][j+1] !== 0) {
            top = z[i][j+1];
          }
          if(z[i] && z[i][j-1] && z[i][j-1] !== 0) {
            bottom = z[i][j-1];
          }
          if(z[i] && z[i][j+2] && z[i][j+2] !== 0) {
            topTop = z[i][j+2];
          }
          if(z[i] && z[i][j-2] && z[i][j-2] !== 0) {
            bottomBottom = z[i][j-2];
          }
          if(z[i-1] && z[i-1][j] && z[i-1][j] !== 0) {
            left = z[i-1][j];
          }
          if(z[i+1] && z[i+1][j] && z[i+1][j] !== 0) {
            right = z[i+1][j];
          }
          if(z[i-2] && z[i-2][j] && z[i-2][j] !== 0) {
            leftLeft = z[i-2][j];
          }
          if(z[i+2] && z[i+2][j] && z[i+2][j] !== 0) {
            rightRight = z[i+2][j];
          }
          if(z[i-1] && z[i-1][j+1] && z[i-1][j+1] !== 0) {
            leftTop = z[i-1][j+1];
          }
          if(z[i+1] && z[i+1][j-1] && z[i+1][j-1] !== 0) {
            rightBottom = z[i+1][j-1];
          }
          if(z[i-1] && z[i-1][j-1] && z[i-1][j-1] !== 0) {
            leftBottom = z[i-1][j-1];
          }
          if(z[i+1] && z[i+1][j+1] && z[i+1][j+1] !== 0) {
            rightTop = z[i+1][j+1];
          }
          if(z[i-2] && z[i-2][j+2] && z[i-2][j+2] !== 0) {
            lewoleftTop = z[i-2][j+2];
          }
          if(z[i+2] && z[i+2][j-2] && z[i+2][j-2] !== 0) {
            praworightBottom = z[i+2][j-2];
          }
          if(z[i-2] && z[i-2][j-2] && z[i-2][j-2] !== 0) {
            lewoleftBottom = z[i-2][j-2];
          }
          if(z[i+2] && z[i+2][j+2] && z[i+2][j+2] !== 0) {
            praworightTop = z[i+2][j+2];
          }
          var avg = 0;
          var n = 0;
          if(top !== false && bottomBottom !== false) {
            avg += bathymetry.round((top * 2 + bottomBottom) / 3, 1);
            n++;
          }
          if(bottom !== false && topTop !== false) {
            avg += bathymetry.round((bottom * 2 + topTop) / 3, 1);
            n++;
          }
          if(left !== false && rightRight !== false) {
            avg += bathymetry.round((left * 2 + rightRight) / 3, 1);
            n++;
          }
          if(right !== false && leftLeft !== false) {
            avg += bathymetry.round((right * 2 + leftLeft) / 3, 1);
            n++;
          }
          if(leftTop !== false && praworightBottom !== false) {
            avg += bathymetry.round((leftTop * 2 + praworightBottom) / 3, 1);
            n++;
          }
          if(leftBottom !== false && praworightTop !== false) {
            avg += bathymetry.round((leftBottom * 2 + praworightTop) / 3, 1);
            n++;
          }
          if(rightTop !== false && lewoleftBottom !== false) {
            avg += bathymetry.round((rightTop * 2 + lewoleftBottom) / 3, 1);
            n++;
          }
          if(rightBottom !== false && lewoleftTop !== false) {
            avg += bathymetry.round((rightBottom * 2 + lewoleftTop) / 3, 1);
            n++;
          }
          if(n !== 0) {
            z[i][j] = bathymetry.round(avg / n, 1);
            data[i * gridLength + j][2] = bathymetry.round(avg / n, 1);
            data[i * gridLength + j][4] = 's';
            bathymetry.avgCounter++;
            return 8;
          }
        }
      }
      return false;
    };

    // Remove average depths
    bathymetry.removeAverages = function() {
      var data = bathymetry.data;
      var gridLength = bathymetry.gridLength;
      var gridWidth = bathymetry.gridWidth;
      var z = bathymetry.z;
      for(var i = 0; i < gridWidth; i++) {
        for(var j = 0; j < gridLength; j++) {
          if(data[i * gridLength + j][4] === 's') {
            z[i][j] = 0;
          }
        }
      }
      for(var i = 0; i < data.length; i++) {
        if(data[i][4] === 's') {
          data[i][2] = 0;
          data[i][4] = undefined;
        }
      }
      bathymetry.stats.init();
      bathymetry.hideLoader();
      bathymetry.removePolygons();
      bathymetry.drawPolygons();
    };

    return bathymetry;

  }(BATHYMETRY || {}));

}(jQuery, window, document));
