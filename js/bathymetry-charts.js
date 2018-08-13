// Charts

(function($, window, document) {

  'use strict';

  BATHYMETRY = (function(bathymetry) {

    bathymetry.charts = {

      // 2D chart
      chart2d: function() {
        var trace1 = {
          z: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
          type: 'contour'
        };
        var data = [trace1];
        var layout = {
          width: 700,
          height: 700
        };
        Plotly.newPlot('chart-2d', data, layout);
      },

      chart2dUpdate: function(max) {
        var gridWidth = bathymetry.gridWidth;
        var gridLength = bathymetry.gridLength;
        var data = bathymetry.data;
        var x = [];
        for(var i = 0; i < gridWidth; i++) {
          x[i] = data[i * gridLength][1];
        }
        var y = [];
        for(var i = 0; i < gridLength; i++) {
          y[i] = data[i][0];
        }
        var z = [];
        for(var i = 0; i < gridLength; i++) {
          z[i] = [];
          for(var j = 0; j < gridWidth; j++) {
            if(data[j * gridLength + i][2] === 0) {
              z[i][j] = 'None';
            } else {
              z[i][j] = data[j * gridLength + i][2] * (-1);
            }
          }
        }
        var trace1 = {
          x: x,
          y: y,
          z: z,
          type: 'contour',
          contours: {
            coloring: 'heatmap',
            showlabels: true,
            labelfont: {
              family: 'Nunito',
              size: 12,
              color: '#fff',
            }
          }
        };
        var data = [trace1];
        var layout = {
          title: '2D Chart',
          autosize: false,
          width: 700,
          height: 700,
          zaxis: {
            range: [1, max * (-1)]
          }
        };
        Plotly.newPlot('chart-2d', data, layout);
        $('.chart-wrapper-2d').addClass('active');
        BATHYMETRY.hideLoader();
      },

      // 3D chart
      chart3d: function() {
        var trace1 = {
          z: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
          type: 'surface'
        }
        var data = [trace1];
        var layout = {
          width: 700,
          height: 700
        };
        Plotly.newPlot('chart-3d', data, layout);
      },

      chart3dUpdate: function(max) {
        var gridWidth = bathymetry.gridWidth;
        var gridLength = bathymetry.gridLength;
        var data = bathymetry.data;
        var x = [];
        for(var i = 0; i < gridWidth; i++) {
          x[i] = data[i * gridLength][1];
        }
        var y = [];
        for(var i = 0; i < gridLength; i++) {
          y[i] = data[i][0];
        }
        var z = [];
        for(var i = 0; i < gridLength; i++) {
          z[i] = [];
          for(var j = 0; j < gridWidth; j++) {
            if(data[j * gridLength + i][2] === 0) {
              z[i][j] = 'None';
            } else {
              z[i][j] = data[j * gridLength + i][2] * (-1);
            }
          }
        }
        var trace1 = {
          x: x,
          y: y,
          z: z,
          type: 'surface',
        };
        var data = [trace1];
        var layout = {
          title: '3D Chart',
          autosize: false,
          width: 700,
          height: 700,
          zaxis: {
            range: [1, max * (-1)],
            title: 'Depth (m)'
          },
          scene: {
            xaxis: {
              title: 'Longitude'
            },
            yaxis: {
              title: 'Latitude'
            },
            zaxis: {
              title: 'Depth'
            },
            camera: {
              eye: {
                x: -0.05,
                y: -0.7,
                z: 1.7
              }
            }
          }
        };
        Plotly.newPlot('chart-3d', data, layout);
        $('.chart-wrapper-3d').addClass('active');
        BATHYMETRY.hideLoader();
      }

    }

    return bathymetry;

  }(BATHYMETRY || {}));

}(jQuery, window, document));