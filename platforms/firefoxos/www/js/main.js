//alert("1");
var lista = [];
var nombre_busqueda = "";
var reproducir_mas_canciones = false;
var reproducir_menos_canciones = false;
var reproduce_radio = false;
var reproduce_playlist = false;
var posicion = 0;
var pause = 1;
var pagina = 0;
var intervalo;
var audio = document.getElementById('audio');

function eventos_canciones() {
    $(".lista").each(function () {
        $(this).off();
        $(this).on('click', function () {
            escuchar([$(this).data("src"), $(this).data("duration"), $(this).data("name")], $(this).data("list"));
        });
    });
    $("#pagina_mas").off();
    if (!$("#pagina_mas").hasClass("disabled")) {
        $("#pagina_mas").on('click', function () {
            pagina++;
            buscar_canciones($(this).data('nombre'), pagina, false);
        });
    }
    $("#pagina_menos").off();
    if (!$("#pagina_menos").hasClass("disabled")) {
        $("#pagina_menos").on('click', function () {
            pagina--;
            buscar_canciones($(this).data('nombre'), pagina, false);
        });
    }
    
    $("#descargar_todas").off();
	$("#descargar_todas").on( "click", function() {
		console.log("descargar");
		guardar_listado();
	});
}

function eventos_playlist() {
    $(".playlist").each(function () {
        $(this).off();
        $(this).on('click', function () {
            listar($(this).data("src"), $(this).data("nombre"), $(this).data("numero_canciones"), $(this).data("duracion"));
        });
    });

    $("#pagina_mas").off();
    if (!$("#pagina_mas").hasClass("disabled")) {
        $("#pagina_mas").on('click', function () {
            pagina++;
            buscar_playlist($(this).data('nombre'), pagina);
        });
    }
    $("#pagina_menos").off();
    if (!$("#pagina_menos").hasClass("disabled")) {
        $("#pagina_menos").on('click', function () {
            pagina--;
            buscar_playlist($(this).data('nombre'), pagina);
        });
    }
}

function desactivar_eventos() {
    //~ console.log("desactivar eventos");
    $("#audio").off();
    $("#play").off();
    $("#atras").off();
    $("#adelante").off();
    audio.pause();
    pause = 1;
    pause_headphone = 0;
    pause_orientation = 0;
    next_orientation = 0;
    $("#paso").css("width", "0");
    $("#slider").off();
    
    if (window.DeviceMotionEvent) {
        window.removeEventListener('devicemotion', function() {});
    }
}

function adelante() {
    if (posicion < lista.length - 1) {
        //~ console.log("adelante: siguiente");
        posicion++;
        window.location.hash = '#' + lista[posicion][0];
        escuchar(lista[posicion], posicion);
    } else {
        if (reproduce_radio) {
            //~ console.log("adelante: radio");	
            pagina++;
            buscar_radio(nombre_busqueda, pagina);
        } else if (reproduce_playlist) {
            //~ console.log("adelante: playlist");	
            posicion = 0;
            window.location.hash = '#' + lista[posicion][0];
            escuchar(lista[posicion], posicion);
        } else {
            if (reproducir_mas_canciones) {
                //~ console.log("adelante: mas canciones");	
                pagina++;
                buscar_canciones(nombre_busqueda, pagina, false);
            } else {
                if (pagina > 0) {
                    //console.log("adelante: se acabaron las canciones");	
                    pagina = 0;
                    buscar_canciones(nombre_busqueda, pagina, false);
                } else {
                    //console.log("adelante: solo hay una pagina de canciones");	
                    posicion = 0;
                    window.location.hash = '#' + lista[posicion][0];
                    escuchar(lista[posicion], posicion);
                }
            }
        }
    }
}

$("#buscar_canciones").on("click", function (e) {
    e.preventDefault();
    if ($("#nombre").val() == "" || $("#nombre").val() == "Search Name") {
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
    if ($("#nombre").val() == "" || $("#nombre").val() == "Search Name") {
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
    if ($("#nombre").val() == "" || $("#nombre").val() == "Search Name") {
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
    if (navigator.onLine) {
        actualizar_notificacion("Play Songs: " + nombre);
        nombre_busqueda = nombre;
        desactivar_eventos();
        reproducir_mas_canciones = false;
        reproducir_menos_canciones = false;
        reproduce_playlist = false;
        reproduce_radio = false;
        posicion = 0;
        $("#listado").empty();
        $("#listado").append("<h5>Search songs: </h5><h3>" + nombre + "</h3>");
        $("#cargando").css("display", "block");

        var xhr = new XMLHttpRequest({
            mozSystem: true
        });
        //xhr.open("GET", "http://salvacam.x10.mx/radio/index.php?type=songs&url=" + encodeURI(nombre)+"&p="+pagina, true);
        xhr.open("GET", "http://www.goear.com/apps/android/search_songs_json.php?q=" + encodeURI(nombre) + "&p=" + pagina, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                $("#listado").empty();
                $("#cargando").css("display", "none");
                var data = JSON.parse(xhr.responseText);
                if (data != 0) {
                    lista = [];
                    var incluir = '<table class="pure-table pure-table-horizontal">' +
                        '<thead><tr><th>Artist</th><th>Title</th></tr></thead><tbody>';
                    for (var i = 0; i < data.length; i++) {
                        var timeSong = segToTiempo(data[i].songtime);
                        lista.push([data[i].id, timeSong, data[i].artist+"_"+data[i].title]);
                        if (i % 2 == 0) {
                            incluir += "<tr class='lista' id='" + data[i].id + "' data-duration='" + timeSong + "' data-list='" + i + "' data-src='" + data[i].id + "' data-name='" + data[i].artist + "_" + data[i].title + "'>" +
                                "<td>" + data[i].artist + "</td><td>" + data[i].title + "</td></tr>";
                        } else {
                            incluir += "<tr class='lista pure-table-odd' id='" + data[i].id + "' data-duration='" + timeSong + "' data-list='" + i + "' data-src='" + data[i].id + "' data-name='"+data[i].artist+"_"+data[i].title + "'>" +
                                "<td>" + data[i].artist + "</td><td>" + data[i].title + "</td></tr>";
                        }
                    }
                    incluir += "</tbody></table>";
                    $("#listado").append(incluir);
                    var xhr1 = new XMLHttpRequest({
                        mozSystem: true
                    });
                    //xhr1.open("GET", "http://salvacam.x10.mx/radio/index.php?type=songs&url=" + encodeURI(nombre)+"&p="+ (pagina+1), false);
                    xhr1.open("GET", "http://www.goear.com/apps/android/search_songs_json.php?q=" + encodeURI(nombre) + "&p=" + (pagina + 1), false);
                    xhr1.onreadystatechange = function () {
                        if (xhr1.readyState == 4) {
                            var data1 = JSON.parse(xhr1.responseText);
                            if (pagina == 0) {
                                if (data1 != 0) {
                                    reproducir_mas_canciones = true;
                                    $("#listado").append("<br/><button id='pagina_menos' class='topcoat-button disabled' disabled>&larr;</button>");
                                    $("#listado").append("&nbsp;<span class='topcoat-notification' disabled> " + (pagina + 1) + " </span>&nbsp;");
                                    $("#listado").append("<button id='pagina_mas' class='topcoat-button' data-nombre='" + nombre + "'>&rarr;</button>");
                                }
                            } else {
                                reproducir_menos_canciones = true;
                                $("#listado").append("<br/><button id='pagina_menos' class='topcoat-button' data-nombre='" + nombre + "'>&larr;</button>");
                                $("#listado").append("&nbsp;<span class='topcoat-notification' disabled> " + (pagina + 1) + " </span>&nbsp;");
                                if (data1 != 0) {
                                    reproducir_mas_canciones = true;
                                    $("#listado").append("<button id='pagina_mas' class='topcoat-button' data-nombre='" + nombre + "'>&rarr;</button>");
                                } else {
                                    $("#listado").append("<button id='pagina_mas' class='topcoat-button disabled' disabled>&rarr;</button>");
                                }
                            }
                        }
                        //cargar los eventos 					
                        eventos_canciones();
                        if (!vuelve_atras) {
                            posicion = 0;
                            console.log("mal");
                            escuchar(lista[posicion], posicion);
                            window.location.hash = '#' + lista[posicion][0];
                        } else {
                            posicion = lista.length - 1;
                            escuchar(lista[posicion], posicion);
                            window.location.hash = '#' + lista[posicion][0];
                        }
                    };
                    xhr1.send();
                } else {
                    //~ console.log("sin canciones");
                    $("#listado").append("<h5>Not songs: </h5><h3>" + nombre + "</h3>");
                }
            }
        };
        xhr.send();
    } else {
        $("#listado").empty();
        $("#listado").append("<h5>No connection</h5>");
        $("#listado").prepend("<br/>");
    }
}

function buscar_playlist(nombre, pag) {
    if (navigator.onLine) {
        actualizar_notificacion("Search Playlist: " + nombre);
        nombre_busqueda = nombre;
        desactivar_eventos();
        reproducir_mas_canciones = false;
        reproducir_menos_canciones = false;
        reproduce_playlist = false;
        reproduce_radio = false;
        posicion = 0;
        $("#listado").empty();
        $("#listado").append("<h5>Search playlist: </h5><h3>" + nombre + "</h3>");
        $("#cargando").css("display", "block");

        var xhr = new XMLHttpRequest({
            mozSystem: true
        });
        //xhr.open("GET", "http://salvacam.x10.mx/radio/index.php?type=playlist&url=" + encodeURI(nombre)+"&p="+pagina, true);
        xhr.open("GET", "http://www.goear.com/apps/android/search_playlist_json.php?q=" + encodeURI(nombre) + "&p=" + pagina, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                $("#listado").empty();
                $("#cargando").css("display", "none");
                var data = JSON.parse(xhr.responseText);
                if (data != 0) {
                    lista = [];
                    var incluir = '<table class="pure-table pure-table-horizontal">' +
                        '<thead><tr><th>Title</th><th>Songs</th><th>Time</th></tr></thead><tbody>';
                    for (var i = 0; i < data.length; i++) {
                        console.log(data[i]);
                        console.log(data[i].plsongs);
                        lista.push(data[i].id);
                        if (i % 2 == 0) {
                            incluir += "<tr class='playlist' data-list='" + i + "' data-src='" +
                                data[i].id + "' data-nombre='" + data[i].title + "' data-numero_canciones='" + data[i].plsongs +
                                "' data-duracion='" + data[i].songtime + "'>" +
                                "<td>" + data[i].title + "</td><td>" + data[i].plsongs + "</td><td class='right'>" +
                                data[i].songtime + "</td></tr>";
                        } else {
                            incluir += "<tr class='playlist pure-table-odd' data-list='" + i + "' data-src='" +
                                data[i].id + "' data-nombre='" + data[i].title + "' data-numero_canciones='" + data[i].plsongs +
                                "' data-duracion='" + data[i].songtime + "'>" +
                                "<td>" + data[i].title + "</td><td>" + data[i].plsongs + "</td><td class='right'>" +
                                data[i].songtime + "</td></tr>";
                        }
                    }
                    incluir += "</tbody></table>";
                    $("#listado").append(incluir);
                    var xhr1 = new XMLHttpRequest({
                        mozSystem: true
                    });
                    //xhr1.open("GET", "http://salvacam.x10.mx/radio/index.php?type=playlist&url=" + encodeURI(nombre)+"&p="+(pagina+1), false);
                    xhr1.open("GET", "http://www.goear.com/apps/android/search_playlist_json.php?q=" + encodeURI(nombre) + "&p=" + (pagina + 1), false);
                    xhr1.onreadystatechange = function () {
                        if (xhr1.readyState == 4) {
                            var data1 = JSON.parse(xhr1.responseText);
                            if (pagina == 0) {
                                if (data1 != 0) {
                                    $("#listado").append("<br/><button id='pagina_menos' class='topcoat-button disabled' disabled>&larr;</button>");
                                    $("#listado").append("&nbsp;<span class='topcoat-notification'> " + (pagina + 1) + " </span>&nbsp;");
                                    $("#listado").append("<button id='pagina_mas' class='topcoat-button' data-nombre='" + nombre + "'>&rarr;</button>");
                                }
                            } else {
                                $("#listado").append("<br/><button id='pagina_menos' class='topcoat-button' data-nombre='" + nombre + "'>&larr;</button>");
                                $("#listado").append("&nbsp;<span class='topcoat-notification'> " + (pagina + 1) + " </span>&nbsp;");
                                if (data1 != 0) {
                                    $("#listado").append("<button id='pagina_mas' class='topcoat-button' data-nombre='" + nombre + "'>&rarr;</button>");
                                } else {
                                    $("#listado").append("<button id='pagina_mas' class='topcoat-button disabled' disabled>&rarr;</button>");
                                }
                            }
                            eventos_playlist();
                        }
                    }
                    xhr1.send();
                } else {
                    //~ console.log("no hay listas");
                    $("#listado").append("<h5>Not playlist: </h5><h3>" + nombre + "</h3>");
                }
            }
        }
        xhr.send();
    } else {
        $("#listado").empty();
        $("#listado").append("<h5>No connection</h5>");
        $("#listado").prepend("<br/>");
    }
}

function listar(radio, nombre, numero_canciones, duracion) {
    if (navigator.onLine) {
        actualizar_notificacion("Play Playlist: " + nombre);
        //~ console.log("lista canciones");
        desactivar_eventos();
        reproducir_mas_canciones = false;
        reproducir_menos_canciones = false;
        reproduce_playlist = true;
        reproduce_radio = false;
        posicion = 0;
        $("#listado").empty();
        $("#listado").append("<h5>Loading: </h5><h3>" + nombre + "&nbsp" + numero_canciones + "&nbsp" + duracion + "</h3>");
        $("#cargando").css("display", "block");

        var xhr = new XMLHttpRequest({
            mozSystem: true
        });
        //xhr.open("GET", "http://salvacam.x10.mx/radio/index.php?type=list&url=" + encodeURI(nombre)+"&p="+pagina, true);
        xhr.open("GET", "http://www.goear.com/apps/android/playlist_songs_json.php?v=" + encodeURI(radio), true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                $("#listado").empty();
                $("#cargando").css("display", "none");
                var data = JSON.parse(xhr.responseText);
                if (data != 0) {
                    $("#listado").append("<button class='topcoat-button' id='volver'>&crarr; Back</button>");
                    lista = [];
                    var incluir = '<table class="pure-table pure-table-horizontal">' +
                        '<thead><tr><th>Artist</th><th>Title</th></tr></thead><tbody>';
                    for (var i = 0; i < data.length; i++) {
                        console.log(data[i]);
                        var timeSong = segToTiempo(data[i].songtime);
                        lista.push([data[i].id, timeSong, data[i].artist+"_"+data[i].title]);
                        if (i % 2 == 0) {
                            incluir += "<tr class='lista' id='" + data[i].id + "' data-duration='" + timeSong + "' data-list='" + i + "' data-src='" + data[i].id + "' data-name='" + data[i].artist + "_" + data[i].title + "'>" +
                                "<td>" + data[i].artist + "</td><td>" + data[i].title + "</td></tr>";
                        } else {
                            incluir += "<tr class='lista pure-table-odd' id='" + data[i].id + "' data-duration='" + timeSong + "' data-list='" + i + "' data-src='" + data[i].id + "' data-name='" + data[i].artist + "_" + data[i].title + "'>" +
                                "<td>" + data[i].artist + "</td><td>" + data[i].title + "</td></tr>";
                        }
                    }
                    incluir += "</tbody></table>";
                    $("#listado").append(incluir);
                    //cargar los eventos                    
                    eventos_canciones();
                    escuchar(lista[posicion], posicion);
                    $("#volver").off();
                    $("#volver").on("click", function () {
                        buscar_playlist(nombre_busqueda, pagina);
                    });
                } else {
                    //~ console.log("no hay listas");
                    $("#listado").append("<h5>Not playlist: </h5><h3>" + nombre + "&nbsp" + numero_canciones + "&nbsp" + duracion + "</h3>");
                }
            }
        }
        xhr.send();
    } else {
        $("#listado").empty();
        $("#listado").append("<h5>No connection</h5>");
        $("#listado").prepend("<br/>");
    }
}

function buscar_radio(nombre, pagina) {
    if (navigator.onLine) {
        actualizar_notificacion("Play Radio: " + nombre);
        nombre_busqueda = nombre;
        desactivar_eventos();
        reproducir_mas_canciones = false;
        reproducir_menos_canciones = false;
        reproduce_playlist = false;
        reproduce_radio = true;
        posicion = 0;
        $("#listado").empty();
        $("#listado").append("<h5>Search radio: </h5><h3>" + nombre + "</h3>");
        $("#cargando").css("display", "block");

        var xhr = new XMLHttpRequest({
            mozSystem: true
        });
        xhr.open("POST", "http://www.goear.com/action/bands/getrelatedband", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                console.log(xhr.responseText);
                var respuesta = xhr.responseText;
                if (respuesta[0] != "<") {
                    var xhr1 = new XMLHttpRequest({
                        mozSystem: true
                    });
                    xhr1.open("POST", "http://www.goear.com/action/bands/getrelatedbandsounds", true);
                    xhr1.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

                    xhr1.onreadystatechange = function () {
                        if (xhr1.readyState == 4) {
                            console.log("bien");
                            $("#listado").empty();
                            $("#cargando").css("display", "none");

                            var data = JSON.parse(xhr1.responseText);
                            lista = [];
                            var incluir = '<table class="pure-table pure-table-horizontal">' +
                                '<thead><tr><th>Artist</th><th>Title</th></tr></thead><tbody>';
                            for (var i = 0; i < data.length; i++) {
                                console.log("bien");
                                lista.push([data[i][9], data[i][5], data[i].artist+"_"+data[i].title]);
                                if (i % 2 == 0) {
                                    incluir += "<tr class='lista' id='" + data[i][9] + "' data-duration='" + data[i][5] +
                                        "' data-list='" + i + "' data-src='" + data[i][9] + "' data-name='" + data[i].artist + "_" + data[i].title + "'>" +
                                        "<td>" + data[i].artist + "</td><td>" + data[i].title + "</td></tr>";
                                } else {
                                    incluir += "<tr class='lista pure-table-odd' id='" + data[i][9] + "' data-duration='" + data[i][5] + "' data-list='" + i + "' data-src='" + data[i][9] + "' data-name='" + data[i].artist + "_" + data[i].title + "'>" +
                                        "<td>" + data[i].artist + "</td><td>" + data[i].title + "</td></tr>";
                                }
                            }
                            incluir += "</tbody></table>";
                            $("#listado").append(incluir);   

                            posicion = 0;
                            escuchar(lista[posicion], posicion);
                            eventos_canciones();
                        }
                    }
                    var post =
                        "band=" + encodeURIComponent(unescape(xhr.responseText)) +
                        "&p=" + encodeURIComponent(unescape(pagina));
                    xhr1.send(post);
                } else {
                    $("#listado").empty();
                    $("#cargando").css("display", "none");
                    $("#listado").append("<h5>Not radio: </h5><h3>" + nombre + "</h3>");
                }
            }
        }
        xhr.send("band=" + encodeURI(nombre));
    } else {
        $("#listado").empty();
        $("#listado").append("<h5>No connection</h5>");
        $("#listado").prepend("<br/>");
    }
}

//alert("escuchar");

function escuchar(id, pos) {
	/*
	if ( navigator.network.connection.type != "wifi" ) {
		navigator.notification.alert('The version of this app only plays songs with Wi-Fi', null, 'Not connected to wifi.', 'Ok');			
	} else {
		*/
		posicion = pos;
		desactivar_eventos();
		$("#audioDiv").css("display", "block");
		//$("#audio").attr("src", "http://localhost/radio/index.php?type=listen&url=" + encodeURI(id[0]));
		//$("#audio").attr("src", "http://www.goear.com/action/sound/get/" + encodeURI(id[0]));
		$("#audio").attr("src", 'http://goear.com/plimiter.php?f=' + encodeURI(id[0]));
		$("#audio").attr("autoplay", "");

		$(".lista").each(function () {
			$(this).removeClass("activo");
			if ($(this).data("list") == posicion) {
				console.log($(this).data("list"));
				$(this).addClass("activo");
			}
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
			if (posicion > 0) {
				//~ console.log("atras: una menos");
				posicion--;
				window.location.hash = '#' + lista[posicion][0];
				escuchar(lista[posicion], posicion);
			} else {
				if (reproducir_menos_canciones) {
					//~ console.log("atras: buscar pagina canciones atras");
					pagina--;
					buscar_canciones(nombre_busqueda, pagina, true);
				} else {
					if (reproduce_radio && pagina > 0) {
						//~ console.log("atras: radio");	
						pagina--;
						buscar_radio(nombre_busqueda, pagina);
					} else {
						//~ console.log("atras: pongo al final");
						posicion = lista.length - 1;
						window.location.hash = '#' + lista[posicion][0];
						escuchar(lista[posicion], posicion);
					}
				}
			}
		});
		$("#adelante").on("click", function () {
			adelante();
		});

        var last_time = new Date().getTime();

        if (window.DeviceMotionEvent) {
            //alert('devicemotion supported');
            window.addEventListener('devicemotion', function(ev) {                
                
                var curr_time = new Date().getTime();
                if (curr_time < last_time + 500) {
                    return;
                } else {
                    last_time = curr_time;
                    var acc = ev.accelerationIncludingGravity;

                    ax = acc.x;
                    ay = acc.y;
                    az = acc.z;

                    aax = ax ? ax.toFixed(3) : '';
                    aay = ay ? ay.toFixed(3) : '';
                    aaz = az ? az.toFixed(3) : '';

                    $('#aX').text(aax);
                    $('#aY').text(aay);
                    $('#aZ').text(aaz);                    

                    //if ( (aax < 3 && aax > -3) && ( aay < -6 ) && (aaz < 3 && aaz > -3) ) {  
                    if ( aax > 7 && aay < 3 && aay > -3 ){ //} && aaz < 3 && aaz > -3 ) {  
                        if ( pause_orientation > 2 ) {                         
                            if ( pause == 0 ) {
                                console.log("pause. orientacion");
                                $('#play').html("&gt;");
                                audio.pause();
                                pause = 1;
                                pause_orientation = 0;
                            } else if ( pause == 1 ) {                                
                                console.log("play. orientacion");
                                $('#play').html("||");
                                audio.play();
                                pause = 0;
                                pause_orientation = 0;
                            }
                        } else {
                            pause_orientation += 1;                        
                        }
                    } else {
                        pause_orientation = 0;
                    }

                     if ( aax < -7 && aay < 3 && aay > -3 ){ //} && aaz < 3 && aaz > -3 ) {  
                        if ( next_orientation > 5 ) {                         
                            adelante();
                        } else {
                            next_orientation += 1;
                        }
                    } else {                        
                        next_orientation = 0;
                    }
                }
            }, false);
        }

        audio.play();

		$("#duration").html(tiempoToSeg(id[1]));
		$("#audio").on('play', function () {
			clearInterval(intervalo);
			intervalo = setInterval(function () {
				$("#time").html(tiempoToSeg(audio.currentTime));
				$("#paso").css("width", porcentaje(audio.currentTime, id[1]) + "%");

                //pausar si no estan conectados los cascos
                /*
                window.plugins.headsetdetection.detect(function(detected) {
                    //alert(detected +" - cascos");
                    if (!detected) {
                        if (pause == 0 && pause_headphone == 1) {                            
                            console.log("pause. se ha quitado los cascos");
                            $('#play').html("&gt;");
                            audio.pause();
                            pause = 1;
                            pause_headphone = 0;
                            clearInterval(intervalo);
                            //alert("pause. se ha quitado los cascos");
                        }
                    } else {
                        pause_headphone = 1;
                    }
                });
                */
			}, 500);

			$("#duration").html(tiempoToSeg(id[1]));
			pause = 0;
			$('#play').html("||");
		});

		audio.oncanplay = function () {
			$("#time").html(tiempoToSeg(audio.currentTime));
			$("#duration").html(tiempoToSeg(id[1]));
            audio.play();
		}
		
		audio.onerror = function () {
			//~ console.log("oh no error");
			if (navigator.onLine) {
				adelante();
			} else {
				$("#listado").empty();
				$("#listado").append("<h5>No connection</h5>");
				$("#listado").prepend("<br/>");
				desactivar_eventos();
				posicion = 0;
				audio.oncanplay = function () {};
			}
		};

		//alert(id[1]);
		$("#slider").on("click", function (e) {
			//alert(id[1]);
			var pulsacion = (parseInt(id[1], 10) * (((e.pageX - $(this).offset().left) / $(this).offset().width) * 100)) / 100
			//alert(pulsacion);
			audio.currentTime = pulsacion;
		});
		
		
		$("#descargar_una").off();
		$("#descargar_una").on( "click", function() {
			guardar(id[0], id[2]);
		});
			
		$("#audio").on("ended", function () {
			if (navigator.onLine) {
				adelante();
			} else {
				$("#listado").empty();
				$("#listado").append("<h5>No connection</h5>");
				$("#listado").prepend("<br/>");
				desactivar_eventos();
				posicion = 0;
				audio.oncanplay = function () {};
			}
		});
	//}
}


//NOTIFICACION PHONEGAP
document.addEventListener('deviceready', function () {

   

    //alert(navigator.network.connection.type);
    //alert(device.platform);
    if (device.platform == "firefoxos") {
        notifyMe('Play goear.com');
    } else if (device.platform == "Android") {
        cordova.plugins.notification.local.schedule({
            id: 1,
            text: "Play goear.com",
            title: 'Goear Player',
            sound: 'file://silence_notification.mp3',
            smallIcon: "icon",
            ongoing: true
        });
    }

    if (navigator.onLine) {
        if (navigator.network.connection.type != "wifi") {
            if (device.platform == "Android") {
                navigator.notification.alert('Using this app generates traffic data', null, 'Not connected to wifi.', 'Ok');
            } else {
                alert('Using this app generates traffic data');
            }
        }
    } else {
        if (device.platform == "Android") {
            navigator.notification.alert('This app needs connection', null, 'Not connection.', 'Ok');
        } else {
            alert('Not connection. This app needs connection.');
        }
    }

    //Estilos plataforma
    if (device.platform == "firefoxos") {
        $("#encabezado").css("height", "100px");
    }

    $("#nombre").on("focus", function () {
        if ($("#nombre").val() == "Search Name") {
            $("#nombre").val("");
        }
    });
    document.addEventListener("backbutton", onBackKeyDown, false);   
	
	$("#salir").on("click", function(e){
		onBackKeyDown(e);
	});
	


}, false);




//alert("3");
//NOTIFICACION FIREFOX OS
function notifyMe(cuerpo) {
    console.log("notificacion");
    var img = "https://github.com/salvacam/goear-player/blob/master/img/icono32.png?raw=true";
    var mp3 = "https://raw.githubusercontent.com/salvacam/goear-player/master/silence_notification.mp3";

    if (!('Notification' in window)) {
        //alert('This browser does not support desktop notification');
    } else if (Notification.permission === 'granted') {
        var notification = new Notification('Goear Player', {
            'body': cuerpo,
            icon: img,
            sound: mp3,
            silent: true,
            tag: 'goer'
        });
        notification.onclick = function () {
            navigator.mozApps.getSelf().onsuccess = function () {
                this.result.launch();
            }
        }
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
            if (permission === 'granted') {
                var notification = new Notification('Goear Player', {
                    'body': cuerpo,
                    icon: img,
                    sound: mp3,
                    silent: true,
                    tag: 'goear'
                });
                notification.onclick = function () {
                    navigator.mozApps.getSelf().onsuccess = function () {
                        this.result.launch();
                    }
                }
            }
        });
    }
}

function actualizar_notificacion(texto) {
    if (device.platform == "firefoxos") {
        //NOTIFICACION FIREFOX OS
        notifyMe(texto);
    } else if (device.platform == "Android") {
        //NOTIFICACION PHONEGAP
        cordova.plugins.notification.local.update({
            id: 1,
            text: texto
        });
    }
}

window.addEventListener('unload', function () {
    // For stop playing on app closed
    audio.pause();
    audio.src = '';
    audio = null;

    if (device.platform == "Android") {
        cordova.plugins.notification.local.cancelAll();
    }

});

function guardar(id, name){			
	/*
	if ( navigator.network.connection.type != "wifi" ) {
		navigator.notification.alert('The version of this app only plays songs with Wi-Fi', null, 'Not connected to wifi.', 'Ok');			
	} else {
		*/
		navigator.notification.confirm(
				'Downloading the current song?', // message
				function(buttonIndex){
					download_one(buttonIndex, id, name);
				},
				'Download', // title
				['Yes', 'Cancel'] // buttonLabels
		);
	//}
}

function download_one(buttonIndex, id, name) {
    if (buttonIndex == 1) {		
		name = normalize(name);
		existe_archivo(name, "000", id, 1);
    }
}

function existe_archivo(nombre, contador, id, mostrar_mensaje){
	file = "goear/"+nombre+".mp3";
	if (parseInt(contador,10) > 0 ) {
		file = "goear/"+nombre+"_"+contador+".mp3";
	}						
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
        fileSystem.root.getFile(file, { create: false },  
        function() {
			contador = parseInt(contador, 10) + 1;
			existe_archivo(nombre, contador, id, mostrar_mensaje);
		}, function() { 
			fileURL = "cdvfile://localhost/persistent/goear/"+nombre+".mp3";
			if (contador > 0 ) {
				fileURL = "cdvfile://localhost/persistent/goear/"+nombre+"_"+contador+".mp3";
			}	
			var fileTransfer = new FileTransfer();
			//url = "http://www.goear.com/action/sound/get/" + encodeURI(id);
			url = 'http://goear.com/plimiter.php?f=' + encodeURI(id);
			
			fileTransfer.download(
				url,
				fileURL,
				function(entry) {
					if (mostrar_mensaje == 1) {
						navigator.notification.alert('Song saved correctly!!', null, 'Download', 'Ok');
					}
					if (mostrar_mensaje == 2) {
						navigator.notification.alert('List saved correctly!!', null, 'Download', 'Ok');
					}
				},
				function(error) {			
				}
			);
		});    
    }); 
}
function guardar_listado() { 	
	/*
	if ( navigator.network.connection.type != "wifi" ) {
		navigator.notification.alert('The version of this app only plays songs with Wi-Fi', null, 'Not connected to wifi.', 'Ok');			
	} else {
		*/
		navigator.notification.confirm(
				'Downloading the list of song?', // message
				download_all,
				'Download', // title
				['Yes', 'Cancel'] // buttonLabels
		);
	//}
}
function download_all(buttonIndex) {
    if (buttonIndex == 1) {		
		function guardar1(i) {
			if (i == (lista.length - 1) ) {
				existe_archivo(lista[i][2], 0, lista[i][0], 2);
			} else {
				existe_archivo(lista[i][2], 0, lista[i][0], 0);
			}
			i++;
			if ( i < lista.length ) {
				guardar1(i);
			} 
		}
		var num = 0; 
		guardar1(num);
    }
}
