var lista = [];
var playlist = "";
var pos = 0;
var pause = 1;
var pagina = 0;

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
			buscar_canciones($(this).data('nombre'), pagina);
		});	
	}
	$("#pagina_menos").off();
	if ( !$("#pagina_menos").hasClass("disabled") ) {
		$("#pagina_menos").on( 'click', function(){
			pagina--;
			buscar_canciones($(this).data('nombre'), pagina);
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
    $("#audio").off();
    $("#play").off();
    $("#atras").off();
    $("#adelante").off();
    audio.src="";
	$("#slider").attr("value", porcentaje(1, 100));
}


$("#buscar_playlist").on("click", function (e) {
    e.preventDefault();
    if ($("#nombre").val() == "") {
        $("#listado").empty();
        $("#listado").text("Introduce nombre playlist");
    } else {
		pagina = 0;
        buscar_playlist($("#nombre").val(), pagina);
    }
});

$("#buscar_canciones").on("click", function (e) {
    e.preventDefault();
    if ($("#nombre").val() == "") {
        $("#listado").empty();
        $("#listado").text("Introduce nombre busqueda");
    } else {
		pagina = 0;
        buscar_canciones($("#nombre").val(), pagina);
    }
});

function buscar_canciones(nombre, pagina) {
	desactivar_eventos();
    $("#listado").empty();
    $("#listado").append("<h5>Serach songs: " + nombre + "</h5>");

    var contentType = "application/x-www-form-urlencoded; charset=utf-8";
    $.ajax({
        type: 'GET',
        url: "http://salvacam.x10.mx/radio/index.php?type=songs&url=" + encodeURI(nombre) +"&p="+pagina,
        dataType: 'json',
        success: function (data) {
            $("#listado").empty();
            /*
            {"id":"afbf45e","title":"Jimmy Jazz","artist":"kortatu","mp3path":"http:\/\/www.goear.com\/plimiter.php?f=afbf45e","imgpath":"http:\/\/www.goear.com\/band\/soundpicture\/afbf45e","songtime":"2:07"}
            */
            if (data.r != 0) {
                $("#listado").append("<h5>No songs</h5>");
            } else {
                if (data.info.length < 1) {
                    $("#listado").append("<h5>No songs</h5>");
                } else {
                    $("#listado").append("<h5>Songs</h5>");
                    lista = [];
                    for (var i = 0; i < data.info.length; i++) {
                        console.log(data.info[i]);
                        lista.push(data.info[i].id);
                        $("#listado").append("<a class='lista' data-list='" + i + "' data-src='"+ data.info[i].id +"'>" + /* "' onclick='escuchar(data.info[i][0])'>" +*/
                            data.info[i].artist + "&nbsp;&nbsp;" + data.info[i].title + "</a>");
                        $("#listado").append("<br/>");
                    }
                    if (pagina == 0) {
						if (data.mas != undefined) {
							$("#listado").append("<br/><button id='pagina_menos' class='disabled' disabled>&larr;</button>");
							$("#listado").append("&nbsp;<span> " + ( pagina +1 ) +" </span>&nbsp;");
							$("#listado").append("<button id='pagina_mas' data-nombre='"+ nombre +"'>&rarr;</button>");
						}
					} else {						
						$("#listado").append("<br/><button id='pagina_menos' data-nombre='"+ nombre +"'>&larr;</button>");
						$("#listado").append("&nbsp;<span> " + ( pagina +1 ) +" </span>&nbsp;");
						if (data.mas != undefined) {
							$("#listado").append("<button id='pagina_mas' data-nombre='"+ nombre +"'>&rarr;</button>");
						} else {
							$("#listado").append("<button id='pagina_mas' class='disabled' disabled>&rarr;</button>");
						}
					}
                    escuchar(lista[0],pos);
                    //cargar los eventos
                    eventos_canciones();
                }

            }
        },
        beforeSend: function () {
            $("#listado").append('<div id="cargando" class="clear-loading loading-effect-3"><div><span></span></div></div>');
        },
        error: function (jqXHR, textStatus, ex) {
            $("#listado").empty();
            $("#listado").append("<h5>No se ha podido buscar</h5>");
        }
    });
}

function buscar_playlist(nombre, pag) {
	playlist = nombre;
	desactivar_eventos();
    $("#listado").empty();
    $("#listado").append("<h5> Search playlist: " + nombre + "</h5>");
    var contentType = "application/x-www-form-urlencoded; charset=utf-8";
    $.ajax({
        type: 'GET',
        url: "http://salvacam.x10.mx/radio/index.php?type=playlist&url=" + encodeURI(nombre) +"&p="+pag,
        dataType: 'json',
        success: function (data) {
            $('#listado').empty();
            if (data.r != 0) {
                $("#listado").append("<h5>No playlist</h5>");
            } else {
                if (data.info.length < 1) {
                    $("#listado").append("<h5>No playlist</h5>");
                } else {
                    $("#listado").append("<h5>Playlist: " + nombre + "</h5>");                    
                    for (var i = 0; i < data.info.length; i++) {						
                        var t = $('<button class="playlist" data-list= "' + i + '" data-src="'+ data.info[i].id +'" ' + 
							'data-nombre="' + data.info[i].title + '" data-numero_canciones="' + data.info[i].plsongs + 							
							'" data-duracion="' + data.info[i].songtime + '">' +
							data.info[i].title + "&nbsp/&nbsp" + data.info[i].plsongs + '&nbsp/&nbsp' + 
							data.info[i].songtime + '</button>');
                        $("#listado").append(t);
                    }
                    if (pagina == 0) {
						if (data.mas != undefined) {
							$("#listado").append("<br/><button id='pagina_menos' class='disabled' disabled>&larr;</button>");
							$("#listado").append("&nbsp;<span> " + ( pagina +1 ) +" </span>&nbsp;");
							$("#listado").append("<button id='pagina_mas' data-nombre='"+ nombre +"'>&rarr;</button>");
						}
					} else {						
						$("#listado").append("<br/><button id='pagina_menos' data-nombre='"+ nombre +"'>&larr;</button>");
						$("#listado").append("&nbsp;<span> " + ( pagina +1 ) +" </span>&nbsp;");
						if (data.mas != undefined) {
							$("#listado").append("<button id='pagina_mas' data-nombre='"+ nombre +"'>&rarr;</button>");
						} else {
							$("#listado").append("<button id='pagina_mas' class='disabled' disabled>&rarr;</button>");
						}
					}
                    eventos_playlist();                
                }
            }
        },
        beforeSend: function () {
            $("#listado").append('<div id="cargando" class="clear-loading loading-effect-3"><div><span></span></div></div>');
        },
        error: function (jqXHR, textStatus, ex) {
            $("#listado").append("<h5>No se ha podido buscar</h5>");
        }
    });
}




function listar(radio, nombre, numero_canciones, duracion) {
	desactivar_eventos();
    console.log("lista canciones");
    $("#listado").empty();
    $("#listado").append("<h5>Loading: " + nombre + "&nbsp" + numero_canciones + "&nbsp" + duracion + "</h5>");
    //$("#listado").append("<h5>"+ nombre + "</h5>");

    var contentType = "application/x-www-form-urlencoded; charset=utf-8";
    $.ajax({
        type: 'GET',        
        //url: "http://localhost/radio/index.php?type=list&url=" + encodeURI(radio),
        url: "http://salvacam.x10.mx/radio/index.php?type=list&url=" + encodeURI(radio),
        dataType: 'json',
        success: function (data) {
            console.log(data);
            $("#listado").empty(); //mejorar la eliminacion
            
            $("#listado").append("<button id='volver'>&crarr; Back</button>");
            /*
            {"id":"afbf45e","title":"Jimmy Jazz","artist":"kortatu","mp3path":"http:\/\/www.goear.com\/plimiter.php?f=afbf45e","imgpath":"http:\/\/www.goear.com\/band\/soundpicture\/afbf45e","songtime":"2:07"}
            */
            if (data.r != 0) {
                $("#listado").append("<h5>No songs</h5>");
            } else {
                if (data.info.length < 1) {
                    $("#listado").append("<h5>No songs</h5>");
                } else {
                    //$("#listado").append("<h5>Songs</h5>");
                    
					$("#listado").append("<h5>Playlist: " + nombre + "&nbsp" + numero_canciones + "&nbsp" + duracion + "</h5>");
                    lista = [];
                    for (var i = 0; i < data.info.length; i++) {
                        console.log(data.info[i]);
                        lista.push(data.info[i].id);
                        $("#listado").append("<a class='lista' data-list='" + i + "' data-src='"+ data.info[i].id +"'>" +/* onclick='escuchar(data.info[i].id)'>" + */
                            /* data.info[i].id + */
                            data.info[i].title + "&nbsp/&nbsp" +
                            data.info[i].artist + "&nbsp/&nbsp" + data.info[i].songtime +
                            "</a>");
                        $("#listado").append("<br/>");
                    }
                    //cargar los eventos                    
                    eventos_canciones();
                    escuchar(lista[0],0);
                    $("#volver").off();
                    $("#volver").on( "click", function(){
						console.log(playlist);
						console.log(pagina);
						buscar_playlist(playlist, pagina);
					});
                }

            }
        },
        beforeSend: function () {
            $("#listado").append('<div id="cargando" class="clear-loading loading-effect-3"><div><span></span></div></div>');
        },
        error: function (jqXHR, textStatus, ex) {
            $("#listado").append("<h5>No se ha podido buscar</h5>");
        }
    });
}
//lista = ["agua.mp3", "final.mp3", "hundido.mp3", "tocado.mp3"];
//escuchar(0);

function escuchar(id, pos) {
	desactivar_eventos();
    var audio = document.getElementById('audio');
    //console.log("reproduce cancion");
    $("#audioDiv").css("display", "block");
    $("#audio").attr("src", "http://www.goear.com/action/sound/get/" + encodeURI(id));
    //console.log(lista[id]);
    //$("#audio").attr("src", lista[id]);
    $("#audio").attr("autoplay", "");

    audio.oncanplay = function () {
        console.log(audio.duration);
        $("#time").html(tiempoToSeg(audio.currentTime));
        $("#duration").html(tiempoToSeg(audio.duration));
    }
    $("#audio").on('playing', function () {
        //console.log("playing");
        setInterval(function () {
            $("#time").html(tiempoToSeg(audio.currentTime));
            $("#slider").attr("value", porcentaje(audio.currentTime, audio.duration));
            //porcentaje(audio.currentTime, audio.duration);
        }, 500);

        //console.log(audio.readyState);
        pause = 0;
        $('#play').html("||");
        //audio.currentTime= 120;
    });
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
            //if ( autoloop )
            pos = 0;
        }
        //console.log(pos);
        //escuchar(pos);
        escuchar(lista[pos], pos);
    });
    $("#play").on("click", function () {
		console.log("play/pause");
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
        } else {
            pos = lista.length - 1;
        }
        //escuchar(pos);
        escuchar(lista[pos], pos);
    });
    $("#adelante").on("click", function () {
        if (pos < lista.length - 1) {
            pos++;
        } else {
            pos = 0;
        }
        //escuchar(pos);
        escuchar(lista[pos], pos);
    })
}



