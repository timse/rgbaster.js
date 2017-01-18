;(function(window, undefined){

  "use strict";

  // Helper functions.
  var getContext = function(){
    return document.createElement("canvas").getContext('2d');
  };

  var getImageData = function(img, loaded){

    var imgObj = new Image();
    var imgSrc = img.src || img;

    // Can't set cross origin to be anonymous for data url's
    // https://github.com/mrdoob/three.js/issues/1305
    if ( imgSrc.substring(0,5) !== 'data:' )
      imgObj.crossOrigin = "Anonymous";

    imgObj.onload = function(){
      var context = getContext('2d');
      context.drawImage(imgObj, 0, 0);

      var imageData = context.getImageData(0, 0, imgObj.width, imgObj.height);
      loaded && loaded(imageData.data);
    };

    imgObj.src = imgSrc;

  };

  var makeRGB = function(name){
    return ['rgb(', name, ')'].join('');
  };

  var mapPalette = function(palette){
    var arr = [];
    for (var prop in palette) {
      arr.push( {name: makeRGB(prop), count: palette[prop]} )
    }
    arr.sort(function(a, b) { return (b.count - a.count) });
    return arr;
  }; 


  // RGBaster Object
  // ---------------
  //
  var PALETTESIZE = 10;

  var RGBaster = {};

  RGBaster.colors = function(img, opts){

    opts = opts || {};
    var exclude = opts.exclude || [ ], // for example, to exlude white and black:  [ '0,0,0', '255,255,255' ]
        paletteSize = opts.paletteSize || PALETTESIZE;

    getImageData(img, function(data){

              var length        = data.length,
                  colorCounts   = {},
                  rgbString     = '',
                  rgb           = [],
                  colors        = {
                    dominant: { name: '', count: 0 },
                    palette:  []
                  };
              var i = 0;
              for (; i < length; i += 4) {
                // dont count transparent pixels
                if (data[i+3] === 0) {
                    continue;
                }

                rgb[0] = data[i];
                rgb[1] = data[i+1];
                rgb[2] = data[i+2];
                rgbString = rgb.join(",");

                // Keep track of counts ignoring the colors in the exclude list
                if ( exclude.indexOf( makeRGB(rgbString) ) === -1 ) {
                  if ( rgbString in colorCounts ) {
                    colorCounts[rgbString] = colorCounts[rgbString] + 1;
                  }
                  else{
                    colorCounts[rgbString] = 1;
                  }
                }

              }

              if ( opts.success ) {
                var palette = mapPalette(colorCounts);
                palette.length = paletteSize;
                opts.success({
                  dominant: palette[0].name,
                  secondary: palette[1].name,
                  palette:  palette.map(function(c){ return c.name; })
                });
              }
    });
  };

  window.RGBaster = window.RGBaster || RGBaster;

})(window);
