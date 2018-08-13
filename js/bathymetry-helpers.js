// Helpers

var BATHYMETRY = BATHYMETRY || {};

Array.prototype.max = function() {
  return Math.max.apply(null, this);
};
Array.prototype.min = function() {
  return Math.min.apply(null, this);
};

BATHYMETRY.round = function(number, precision) {
  var pair = (number + 'e').split('e');
  var value = Math.round(pair[0] + 'e' + (+pair[1] + precision));
  pair = (value + 'e').split('e');
  return +(pair[0] + 'e' + (+pair[1] - precision));
};

BATHYMETRY.showLoader = function() {
  $('.loader').addClass('active');
};

BATHYMETRY.hideLoader = function() {
  $('.loader').removeClass('active');
};

BATHYMETRY.closeChart = function() {
  $('.chart-wrapper').removeClass('active');
}

function initMap() {
  BATHYMETRY.map = new GMaps({
    el: '#map',
    lat: 50,
    lng: 10,
    zoom: 6,
    mapType: 'hybrid'
  });
}