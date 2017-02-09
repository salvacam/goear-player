var URL_PROXY = 'https://featherbrained-exec.000webhostapp.com/goear/servidor.php';
var lista = [];
var nombre_busqueda = "";
var reproducir_mas_canciones = false;
var reproducir_menos_canciones = false;
var reproduce_radio = false;
var pos = 0;
var pause = 1;
var pagina = 0;
var audio = document.getElementById('audio');

function tiempoToSeg(tiempo) {
    var minutos = Math.floor(tiempo / 60);
    var segundos = Math.floor(tiempo - (minutos * 60));
    if (segundos < 10) {
        segundos = "0" + segundos;
    }
    return minutos + ":" + segundos;
}

function porcentaje(currentTime, duration) {
    var salida = Math.floor((100 * currentTime) / duration);    
    if (isNaN(salida)) {
		salida = 0;
	}
	$("#slider").css('background', 'linear-gradient(to right, #57c3ec, #57c3ec ' + salida + '%, #777 ' + salida + '%, #777)');    
    return salida;
}

function eventos_canciones(){
	$(".lista").each(function () {
		$(this).off();
		$(this).on('click', function(){
			escuchar($(this).data("src"), $(this).data("list") );
		});
	});
	$("#pagina_mas").off();
	if ( !$("#pagina_mas").hasClass("disabled") ) {
		$("#pagina_mas").on( 'click', function(){
			pagina++;
			buscar_canciones($(this).data('nombre'), pagina, false);
		});	
	}
	$("#pagina_menos").off();
	if ( !$("#pagina_menos").hasClass("disabled") ) {
		$("#pagina_menos").on( 'click', function(){
			pagina--;
			buscar_canciones($(this).data('nombre'), pagina, false);
		});	
	}
}

function eventos_playlist(){
	$(".playlist").each(function () {
		$(this).off();
		$(this).on('click', function(){
			listar($(this).data("src"), $(this).data("nombre"), $(this).data("numero_canciones"), $(this).data("duracion"));
		});
	});
	
	$("#pagina_mas").off();
	if ( !$("#pagina_mas").hasClass("disabled") ) {
		$("#pagina_mas").on( 'click', function(){
			pagina++;
			buscar_playlist($(this).data('nombre'), pagina);
		});	
	}
	$("#pagina_menos").off();
	if ( !$("#pagina_menos").hasClass("disabled") ) {
		$("#pagina_menos").on( 'click', function(){
			pagina--;
			buscar_playlist($(this).data('nombre'), pagina);
		});	
	}
}

function desactivar_eventos(){
	console.log("desactivar eventos");
    $("#audio").off();
    $("#play").off();
    $("#atras").off();
    $("#adelante").off();
    audio.pause();
    pause = 1;
	$("#slider").attr("value", porcentaje(1, 100));
}

$("#buscar_canciones").on("click", function (e) {
    e.preventDefault();
    if ($("#nombre").val() == "") {
        $("#listado").empty();
        $("#listado").text("Enter search area");
		$("#listado").prepend("<br/>");
    } else {
		pagina = 0;
		desactivar_eventos();
        buscar_canciones($("#nombre").val(), pagina);
    }
});

$("#buscar_playlist").on("click", function (e) {
    e.preventDefault();
    if ($("#nombre").val() == "") {
        $("#listado").empty();
        $("#listado").text("Enter search area");
		$("#listado").prepend("<br/>");
    } else {
		pagina = 0;
		desactivar_eventos();
        buscar_playlist($("#nombre").val(), pagina);
    }
});

$("#buscar_radio").on("click", function (e) {
    e.preventDefault();
    if ($("#nombre").val() == "") {
        $("#listado").empty();
        $("#listado").text("Enter search area");
		$("#listado").prepend("<br/>");
    } else {
		pagina = 0;
		desactivar_eventos();
        buscar_radio($("#nombre").val(), pagina);
    }
});

function buscar_canciones(nombre, pagina, vuelve_atras) {	
	nombre_busqueda = nombre;
	desactivar_eventos();  	
    reproducir_mas_canciones = false;
    reproducir_menos_canciones = false;    
    reproduce_radio = false;  
    $("#listado").empty();
    $("#listado").append("<h5>Serach songs: " + nombre + "</h5>");
    $("#listado").append('<div id="cargando" class="clear-loading loading-effect-3"><div><span></span></div></div>');
    
	var xhr = new XMLHttpRequest({mozSystem: true});
	//si se usa en navegador usar esta url 
	xhr.open("GET", URL_PROXY + "?type=songs&url=" + encodeURI(nombre)+"&p="+pagina, true);
	//xhr.open("GET", "http://www.goear.com/apps/android/search_songs_json.php?q=" + encodeURI(nombre) + "&p=" + pagina, false);	
	xhr.onreadystatechange = function() {				
		if (xhr.readyState == 4) {
			$("#listado").empty(); 
			var data = JSON.parse(xhr.responseText);    
			console.log(data);       
			lista = [];
			var incluir = '<table class="table">'+
				'<thead><tr><th>Artist</th><th>Title</th></tr></thead><tbody>';
			for (var i = 0; i < data.length; i++) {
				lista.push(data[i].id);
				if ( i % 2 == 0  ) {
					incluir += "<tr class='lista' id='"+data[i].id+"' data-list='" + i + "' data-src='"+ data[i].id +"'>" +
						"<td>"+data[i].artist + "</td><td>" + data[i].title + "</td></tr>";
				} else {
					incluir +="<tr class='lista' id='"+data[i].id+"' data-list='" + i + "' data-src='"+ data[i].id +"'>" +
						"<td>"+data[i].artist + "</td><td>" + data[i].title + "</td></tr>";
				}
			}
			incluir += "</tbody></table>";
			$("#listado").append(incluir);
			var xhr1 = new XMLHttpRequest({mozSystem: true});
			xhr1.open("GET", URL_PROXY + "?type=songs&url=" + encodeURI(nombre)+"&p="+(pagina+1), true);
			console.log(URL_PROXY + "?type=songs&url=" + encodeURI(nombre)+"&p="+(pagina+1));
			//xhr1.open("GET", "http://www.goear.com/apps/android/search_songs_json.php?q=" + encodeURI(nombre) + "&p=" + (pagina+1), false);
			xhr1.onreadystatechange = function() {				
				if (xhr1.readyState == 4) {				
					
					console.log('ultima pagina');
						console.log(data1);
					var data1 = JSON.parse(xhr1.responseText);  
					if (pagina == 0) {
						if (data1 != 0) { 
							reproducir_mas_canciones = true;
							$("#listado").append("<br/><button id='pagina_menos' class='btn btn-sm smooth disabled' disabled>&larr;</button>");
							$("#listado").append("&nbsp;<span> " + ( pagina +1 ) +" </span>&nbsp;");
							$("#listado").append("<button id='pagina_mas' class='btn btn-sm smooth' data-nombre='"+ nombre +"'>&rarr;</button>");
						}
					} else {				
						reproducir_menos_canciones = true;		
						$("#listado").append("<br/><button id='pagina_menos' class='btn btn-sm smooth' data-nombre='"+ nombre +"'>&larr;</button>");
						$("#listado").append("&nbsp;<span> " + ( pagina +1 ) +" </span>&nbsp;");
						
						if (data1 != 0) {
							reproducir_mas_canciones = true;
							$("#listado").append("<button id='pagina_mas' class='btn btn-sm smooth' data-nombre='"+ nombre +"'>&rarr;</button>");
						} else {
							$("#listado").append("<button id='pagina_mas' class='btn btn-sm smooth disabled' disabled>&rarr;</button>");
						}
					}   
				}
                //cargar los eventos 
				eventos_canciones(); 
			}
			xhr1.send();
			if ( !vuelve_atras ) {
				escuchar(lista[0],0);
			} else {
				escuchar(lista[lista.length-1], lista.length-1);
			}                    
		}
	}
	xhr.send();
}

function buscar_playlist(nombre, pag) {
	nombre_busqueda = nombre;
	desactivar_eventos();
    reproducir_mas_canciones = false;
    reproducir_menos_canciones = false;
    reproduce_radio = false;
    $("#listado").empty();
    $("#listado").append("<h5>Serach playlist: " + nombre + "</h5>");
    $("#listado").append('<div id="cargando" class="clear-loading loading-effect-3"><div><span></span></div></div>');	

    var xhr = new XMLHttpRequest({mozSystem: true});
    //si se usa en navegador usar esta url 
    xhr.open("GET", URL_PROXY + "?type=playlist&url=" + encodeURI(nombre) +"&p="+pag, true);
    //xhr.open("GET", "http://www.goear.com/apps/android/search_playlist_json.php?q=" + encodeURI(nombre) +"&p="+pag, false);
	xhr.onreadystatechange = function() {				
		if (xhr.readyState == 4) {
			$("#listado").empty(); 
			var data = JSON.parse(xhr.responseText);   
			console.log(data);  
			if ( data != 0 ) {
				lista = [];
				var incluir = '<table class="table">'+
					'<thead><tr><th>Title</th><th>Songs</th><th>Time</th></tr></thead><tbody>';
				for (var i = 0; i < data.length; i++) {
					lista.push(data[i].id);	
					if ( i % 2 == 0  ) {
						incluir += "<tr class='playlist' data-list='" + i + "' data-src='"+ 
							data[i].id + "' data-nombre='" + data[i].title + "' data-numero_canciones='" + data[i].plsongs +
							"' data-duracion='" + data[i].songtime + "'>" + 
							"<td>"+data[i].title + "</td><td>" + data[i].plsongs + "</td><td class='right'>" +
							data[i].songtime + "</td></tr>";
					} else {
						incluir += "<tr class='playlist' data-list='" + i + "' data-src='"+ 
							data[i].id + "' data-nombre='" + data[i].title + "' data-numero_canciones='" + data[i].plsongs +
							"' data-duracion='" + data[i].songtime + "'>" + 
							"<td>"+data[i].title + "</td><td>" + data[i].plsongs + "</td><td class='right'>" + 
							data[i].songtime + "</td></tr>";
					}
				}
				incluir += "</tbody></table>";			
				$("#listado").append(incluir);
				var xhr1 = new XMLHttpRequest({mozSystem: true});
				xhr1.open("GET", URL_PROXY + "?type=playlist&url=" + encodeURI(nombre) +"&p="+(pag+1), false);
				//xhr1.open("GET", "http://www.goear.com/apps/android/search_playlist_json.php?q=" + encodeURI(nombre) +"&p="+(pag+1), false);
				xhr1.onreadystatechange = function() {				
					if (xhr1.readyState == 4) {				
						var data1 = JSON.parse(xhr1.responseText);  
						if (pagina == 0) {
							if (data1 != 0) { 
								$("#listado").append("<br/><button id='pagina_menos' class='btn btn-sm smooth disabled' disabled>&larr;</button>");
								$("#listado").append("&nbsp;<span> " + ( pagina +1 ) +" </span>&nbsp;");
								$("#listado").append("<button id='pagina_mas' class='btn btn-sm smooth' data-nombre='"+ nombre +"'>&rarr;</button>");
							}
						} else {						
							$("#listado").append("<br/><button id='pagina_menos' class='btn btn-sm smooth' data-nombre='"+ nombre +"'>&larr;</button>");
							$("#listado").append("&nbsp;<span> " + ( pagina +1 ) +" </span>&nbsp;");
							if (data1 != 0) {
								$("#listado").append("<button id='pagina_mas' class='btn btn-sm smooth' data-nombre='"+ nombre +"'>&rarr;</button>");
							} else {
								$("#listado").append("<button id='pagina_mas' class='btn btn-sm smooth disabled' disabled>&rarr;</button>");
							}
						}
						eventos_playlist();       
					}
				}
				xhr1.send();
			}
		}
	}
	xhr.send();
}

function listar(radio, nombre, numero_canciones, duracion) {
	desactivar_eventos();
    reproducir_mas_canciones = false;
    reproducir_menos_canciones = false;
    reproduce_radio = false;
    console.log("lista canciones");
    $("#listado").empty();
    $("#listado").append("<h5>Loading: " + nombre + "&nbsp" + numero_canciones + "&nbsp" + duracion + "</h5>");
    $("#listado").append('<div id="cargando" class="clear-loading loading-effect-3"><div><span></span></div></div>');
				
	var xhr = new XMLHttpRequest({mozSystem: true});
	//xhr.open("GET", "http://www.goear.com/apps/android/playlist_songs_json.php?v=" + encodeURI(radio), false);
	//si se usa en navegador usar esta url 
	xhr.open("GET", URL_PROXY + "?type=list&url=" + encodeURI(radio), true);
	xhr.onreadystatechange = function() {				
		if (xhr.readyState == 4) {
			$("#listado").empty(); 
			var tmpkk = xhr.responseText;
			var data = JSON.parse(xhr.responseText);           
			$("#listado").append("<button id='volver' class='btn btn-sm smooth'>&crarr; Back</button>");
			$("#listado").append("<h3>" + nombre + "</h3>");
			lista = [];  
			var incluir = '<table class="table">'+
				'<thead><tr><th>Artist</th><th>Title</th></tr></thead><tbody>';
			for (var i = 0; i < data.length; i++) {
				lista.push(data[i].id);
				if ( i % 2 == 0  ) {
					incluir += "<tr class='lista' id='"+data[i].id+"' data-list='" + i + "' data-src='"+ data[i].id + "'>"+
						"<td>"+data[i].artist+"</td><td>"+data[i].title+"</td></tr>";	
				} else {
					incluir += "<tr class='lista' id='"+data[i].id+"' data-list='" + i + "' data-src='"+ data[i].id + "'>"+
						"<td>"+data[i].artist+"</td><td>"+data[i].title+"</td></tr>";
				}
			}
			incluir += "</tbody></table>";
			$("#listado").append(incluir);
			//cargar los eventos                    
			eventos_canciones();
			escuchar(lista[0],0);
			$("#volver").off();
			$("#volver").on( "click", function(){
				buscar_playlist(nombre_busqueda, pagina);
			});
		}
	}
	xhr.send();
}

function buscar_radio1(nombre, pagina) {	
	nombre_busqueda = nombre;
	desactivar_eventos();  	
    reproducir_mas_canciones = false;
    reproducir_menos_canciones = false; 
    reproduce_radio = true;     
    $("#listado").empty();
    $("#listado").append("<h5>Serach songs: " + nombre + "</h5>");
    $("#listado").append('<div id="cargando" class="clear-loading loading-effect-3"><div><span></span></div></div>');

	var xhr = new XMLHttpRequest({mozSystem: true});
	xhr.open("POST", "http://www.goear.com/action/bands/getrelatedband", false);	
	xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	
	xhr.onreadystatechange = function() {				
		if (xhr.readyState == 4) { 			
			var xhr1 = new XMLHttpRequest({mozSystem: true});
			xhr1.open("POST", "http://www.goear.com/action/bands/getrelatedbandsounds", false);	
			xhr1.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			
			xhr1.onreadystatechange = function() {				
				if (xhr1.readyState == 4) { 
					$("#listado").empty(); 
					var data = JSON.parse(xhr1.responseText); 					
					lista = [];
					var incluir =  '<table class="table">'+
						'<thead><tr><th>Artist</th><th>Title</th></tr></thead><tbody>';
					for (var i = 0; i < data.length; i++) {
						lista.push(data[i][9]);
						if ( i % 2 == 0  ) {
							incluir += "<tr class='lista' id='"+data[i][9]+"' data-list='" + i + "' data-src='"+ data[i][9] + "'>"+
								"<td>"+data[i].artist+"</td><td>"+data[i].title+"</td></tr>";
						} else {
							incluir += "<tr class='lista' id='"+data[i][9]+"' data-list='" + i + "' data-src='"+ data[i][9] + "'>"+
								"<td>"+data[i].artist+"</td><td>"+data[i].title+"</td></tr>";
						}
					}
					incluir += "</tbody></table>";
					$("#listado").append(incluir);
            
					escuchar(lista[0], 0);
					eventos_canciones();    
				}
			}
			var post =
				"band=" + encodeURIComponent(unescape(xhr.responseText)) +
				"&p=" + encodeURIComponent(unescape(pagina));
			xhr1.send(post);
		}
	}
	xhr.send("band="+nombre);
}

//usar esta funcion si se usa en el navegador
function buscar_radio(nombre, pagina) {	
	nombre_busqueda = nombre;
	desactivar_eventos();  	
    reproducir_mas_canciones = false;
    reproducir_menos_canciones = false; 
    reproduce_radio = true;     
    $("#listado").empty();
    $("#listado").append("<h5>Serach songs: " + nombre + "</h5>");

    var contentType = "application/x-www-form-urlencoded; charset=utf-8";
    $.ajax({
        type: 'GET',
        url: URL_PROXY + "?type=radio&url=" + encodeURI(nombre) +"&p="+pagina,
        dataType: 'json',
        success: function (data) {
            $("#listado").empty();
            lista = [];
            var incluir =  '<table class="table">'+
							'<thead><tr><th>Artist</th><th>Title</th></tr></thead><tbody>';
            for (var i = 0; i < data.length; i++) {
				lista.push(data[i][9]);
				if ( i % 2 == 0  ) {
					incluir += "<tr class='lista' id='"+data[i][9]+"' data-list='" + i + "' data-src='"+ data[i][9] + "'>"+
						"<td>"+data[i].artist+"</td><td>"+data[i].title+"</td></tr>";
				} else {
					incluir += "<tr class='lista' id='"+data[i][9]+"' data-list='" + i + "' data-src='"+ data[i][9] + "'>"+
						"<td>"+data[i].artist+"</td><td>"+data[i].title+"</td></tr>";
				}
			}
			incluir += "</tbody></table>";
            $("#listado").append(incluir);
            
            escuchar(lista[0], 0);
            //$("#listado").append("<span>"+lista[0][1] +"&nbsp;"+ lista[0][2]+"</span>");
            //cargar los eventos
            eventos_canciones();           
        },
        beforeSend: function () {
            $("#listado").append('<div id="cargando" class="clear-loading loading-effect-3"><div><span></span></div></div>');
        },
        error: function (jqXHR, textStatus, ex) {
            $("#listado").empty();
            $("#listado").append("<h5>No radio</h5>");
        }
    });
}

function escuchar(id, pos) {
	desactivar_eventos();
    var audio = document.getElementById('audio');
    $("#audioDiv").css("display", "block");
    $("#audio").attr("src", "http://www.goear.com/action/sound/get/" + encodeURI(id));
    $("#audio").attr("autoplay", "");

    audio.oncanplay = function () {
        console.log(audio.duration);
        $("#time").html(tiempoToSeg(audio.currentTime));
        $("#duration").html(tiempoToSeg(audio.duration));
    }
    audio.onerror = function() {
		console.log("oh no error");
		if (pos < lista.length - 1) {
            pos++;            
			escuchar(lista[pos], pos);
        } else {
            if ( reproducir_mas_canciones ) {
				pagina++;
                buscar_canciones(nombre_busqueda, pagina, false);
                //pos = 0;
            } else {
                pos = 0;
				escuchar(lista[pos], pos);	
            }
        }
	};

    
    $(".lista").each(function () {
        $(this).removeClass("activo");
        if ($(this).data("list") == pos) {
            console.log($(this).data("list"));
            $(this).addClass("activo");
        }
    });

    $("#audio").on("ended", function () {
        console.log("end");
        console.log(pos);
        console.log(lista.length - 1);
        if (pos < lista.length - 1) {
            pos++;
        } else {                     
            if ( reproducir_mas_canciones ) {
				pagina++;
                buscar_canciones(nombre_busqueda, pagina, false);
            }  else if ( reproduce_radio ) {				
				pagina++;
                buscar_radio(nombre_busqueda, pagina);
            } else {
                pos = 0;
            }
        }
        window.location.hash = '#'+lista[pos];
        escuchar(lista[pos], pos);
    });
    $("#play").on("click", function () {
		console.log("Play/Pause");
		if (pause == 0) {
			console.log("pause");
			$('#play').html("&gt;");
			audio.pause();
			pause = 1;
		} else if (pause == 1) {
			console.log("play");
			$('#play').html("||");
			audio.play();
			pause = 0;
		}
	});
    $("#atras").on("click", function () {
        if (pos > 0) {
            pos--;            
			window.location.hash = '#'+lista[pos];
			escuchar(lista[pos], pos);
        } else {
            if ( reproducir_menos_canciones ) {
				pagina--;
                buscar_canciones(nombre_busqueda, pagina, true);
            } else {
                pos = lista.length - 1;                
				window.location.hash = '#'+lista[pos];
				escuchar(lista[pos], pos);
            }            
        }
    });
    $("#adelante").on("click", function () {
        if (pos < lista.length - 1) {
            pos++;            
			window.location.hash = '#'+lista[pos];
			escuchar(lista[pos], pos);
        } else {
            if ( reproducir_mas_canciones ) {
				pagina++;
                buscar_canciones(nombre_busqueda, pagina, false);
            }  else if ( reproduce_radio ) {				
				pagina++;
                buscar_radio(nombre_busqueda, pagina);
            } else {
                pos = 0;
				window.location.hash = '#'+lista[pos];
				escuchar(lista[pos], pos);	
            }
        }
    });
    //$("#audio").on('playing', function () {
    $("#audio").on('play', function () {
		//console.log("play");
        setInterval(function () {
            $("#time").html(tiempoToSeg(audio.currentTime));
            $("#slider").attr("value", porcentaje(audio.currentTime, audio.duration));
        }, 500);
        pause = 0;
        $('#play').html("||");
    });	



		$("#slider").on("click", function (e) {
			//alert('pulsar');
			console.log(audio.duration);
			console.log('donde se pulsa');
			var pulsacion = (parseInt(audio.duration, 10) * (((e.pageX - $(this).offset().left) / $(this).offset().width) * 100)) / 100
			console.log(pulsacion);
			audio.currentTime = pulsacion;
		});
}


var altavoz = 1;
//Evento click en altavoz
$("#altavoz").on("click", function () {
	if ( altavoz == 0 ) {
		altavoz = 1;
		console.log('activar sonido');
		$("#altavoz").html('&vltri;');
		audio.muted = false;
	} else {
		altavoz = 0;
		console.log('quitar sonido');
		$("#altavoz").html('&nltri;');
		audio.muted = true;
	}
});

$('#volumen').mousemove( function(){
    audio.volume = ($("#volumen").val())/100;   
});
