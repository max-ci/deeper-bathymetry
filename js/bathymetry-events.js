// Events

BATHYMETRY.charts.chart3d();
BATHYMETRY.charts.chart2d();

$('.chart-close').on('click', function() {
  BATHYMETRY.closeChart();
});

$('#calculate-averages').on('click', function() {
  var $this = $(this);
  if($this.attr('data-active')) {
    BATHYMETRY.showLoader();
    setTimeout(function() {
      BATHYMETRY.removeAverages();
      $('.generate-charts').attr('hidden', true);
    }, 200);
    $this.removeAttr('data-active');
    $this.text('Calculate averages');
    $this.removeClass('btn-danger');
  } else {
    BATHYMETRY.showLoader();
    setTimeout(function() {
      BATHYMETRY.calculateAverages();
      BATHYMETRY.removePolygons();
      BATHYMETRY.drawPolygons();
      $('.generate-charts').removeAttr('hidden');
    }, 200);
    $this.attr('data-active', true);
    $this.text('Remove averages');
    $this.addClass('btn-danger');
  }
});

$('#generate-3d-chart').on('click', function() {
  BATHYMETRY.showLoader();
  setTimeout(function() {
    var max = Math.round(BATHYMETRY.depthMax + 1);
    BATHYMETRY.charts.chart3dUpdate(false, max + 5);
  }, 200);
});

$('#generate-2d-chart').on('click', function() {
  BATHYMETRY.showLoader();
  setTimeout(function() {
    var max = Math.round(BATHYMETRY.depthMax + 1);
    BATHYMETRY.charts.chart2dUpdate(max);
  }, 200);
});

$('#bathymetry-fileinput').on('change', function() {
  var that = this;
  BATHYMETRY.showLoader();
  setTimeout(function() {
    BATHYMETRY.file.handleFile(that.files);
  }, 200);
});
