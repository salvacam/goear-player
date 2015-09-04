var normalize = (function() {
  var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç", 
      to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
      mapping = {};
 
  for(var i = 0, j = from.length; i < j; i++ )
      mapping[ from.charAt( i ) ] = to.charAt( i );
 
  return function( str ) {
      var ret = [];
      for( var i = 0, j = str.length; i < j; i++ ) {
          var c = str.charAt( i );
          if( mapping.hasOwnProperty( str.charAt( i ) ) )
              ret.push( mapping[ c ] );
          else
              ret.push( c );
      }      
      return ret.join( '' );
  }
 
})();

function tiempoToSeg(tiempo) {
    var minutos = Math.floor(tiempo / 60);
    var segundos = Math.floor(tiempo - (minutos * 60));
    if (segundos < 10) {
        segundos = "0" + segundos;
    }
    return minutos + ":" + segundos;
}

function segToTiempo(tiempo) {
    var puntos = tiempo.indexOf(":");
    return ((parseInt(tiempo.substr(0, puntos)) * 60) + parseInt(tiempo.substr(puntos + 1)));
}

function porcentaje(tiempo, total) {
    var salida = Math.floor((100 * tiempo) / total);
    if (isNaN(salida)) {
        salida = 0;
    }
    return salida;
}

function guardar_archivo(name, contador, contenido){
	name = normalize(name);
	var sdcard = navigator.getDeviceStorage("sdcard");
	var file   = new Blob([contenido], {type: "audio/mpeg"});		
	if (contador == "000" ) {
		var save = sdcard.addNamed(file, "goear/"+name+".mp3");
	} else {
		var save = sdcard.addNamed(file, "goear/"+name+"_"+contador+".mp3");							
	}						
	save.onsuccess = function () {};
	save.onerror = function () {
		contador = parseInt(contador, 10) + 1;
		guardar_archivo(name, contador);
	}
}
