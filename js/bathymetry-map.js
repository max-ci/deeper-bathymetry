// Map

function initMap() {
  BATHYMETRY.map = new GMaps({
    el: '#map',
    lat: 50,
    lng: 10,
    zoom: 6,
    mapType: 'hybrid'
  });
  $('.map-panel').addClass('active');
}