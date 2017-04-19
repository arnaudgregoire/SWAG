/**
* @fileOverview Script côté client pour gérer l'upload des shp, et l'interface utilisateur
* @author Augustin Gagnon <augustin.gagnon@ensg.eu>
* @requires Leaflet {@link http://leafletjs.com/}
* @requires JSZip {@link https://stuk.github.io/jszip/}
* @requires shapefile-js {@link https://github.com/calvinmetcalf/shapefile-js}
*/

function Graph(name){
  this.name = name;
  this.zip_array_buffer;
  this.zip_uint8array;

  this.nb_nodes;
  this.nb_edges;
  this.total_length;

  this.diameter;
  this.radius;
  this.nb_connected_components;

  this.density;
  this.pi;
  this.eta;
  this.theta;

  this.cyclomatic;
  this.alpha;
  this.beta;
  this.gamma;
  this.centrality;

  this.scale_free;
  this.cluster_coef;
  this.shortest_path;
  this.rich_club_coef;
}

Graph.prototype.equalTo = function(graph){
  if(graph.name !== undefined && graph.name == this.name){
    return true;
  }
  return false;
}

Graph.prototype.checkValues = function(operation){
  switch(operation){
    case "diameter":
      if(this.diameter){ return true; }
      else{ return false; }

    case "radius":
      f = function(j){
        DOM_result.innerHTML = "<p>Radius: "+j.radius+"</p>";
      }
      break;

    case "number_connected_component":
      f = function(j){
        DOM_result.innerHTML = "<p>Number of connected components: "+j.number_connected_components+"</p>";
      }
      break;

    case "density":
      f = function(j){
        DOM_result.innerHTML = "<p>Density: "+j.density+"</p>";
      }
      break;

    case "index_pi_eta_theta":
      f = function(j){
        DOM_result.innerHTML = "<p>Index &#960: "+j.pi+"</p>\
                                <p>Index &#951: "+j.eta+"</p>\
                                <p>Index &#952: "+j.theta+"</p>";
      }
      break;

    case "cyclo":
      f = function(j){
        DOM_result.innerHTML = "<p>Cyclomatic complexity: "+j.cyclomatic+"</p>";
      }
      break;

    case "index_alpha_beta_gamma":
      f = function(j){
        DOM_result.innerHTML = "<p>Index &#945: "+j.alpha+"</p>\
                                <p>Index &#946: "+j.beta+"</p>\
                                <p>Index &#967: "+j.gamma+"</p>";
      }
      break;

    case "centrality":
      f = function(j){

      }
      break;

    case "scale_free":
      f = function(j){

      }
      break;

    case "cluster":
      f = function(j){

      }
      break;

    case "average_shortest_path_length":
      f = function(j){

      }
      break;

    case "rich_club":
      f = function(j){

      }
      break;
  }
}

window.onload = function(){
  var zip;
  var graph_list = [];
  var busy = true;
  var map, map_raster, map_vector;

  var DOM_upload_button = document.getElementById("upload_button");
  var DOM_map_button = document.getElementById("map_button");
  var DOM_operation_list = document.getElementsByName("operation");
  var DOM_window_action = document.getElementsByClassName("window")[0];
  var DOM_result = document.getElementById("result");
  var loader = document.getElementById("loader");

/**
* @function
* @name init_listener
* @description Initialise les écouteurs d'évènements de la page
*/
  function init_listener(){
    zip = new JSZip();
    // console.log("JSZip support:");
    // console.log(JSZip.support);

    document.addEventListener('drop', document_drop, false);
    var e_prevent_default = function(e){ e.preventDefault(); };
    document.addEventListener('dragover', e_prevent_default, false);
    document.addEventListener('dragleave', e_prevent_default, false);

    DOM_upload_button.addEventListener('change', document_select, false);
    DOM_map_button.addEventListener("change", set_background, false);
    for(var i=0; i<DOM_operation_list.length; i++){
      DOM_operation_list[i].addEventListener("click", toolbox_listener, false);
    }
    DOM_window_action.addEventListener("click", toggle_result_window, false);
    busy = false;
  }

/**
* @function
* @name init_map
* @description Initialise la carte Leaflet
*/
  function init_map(){
    map = L.map('shp_preview').setView([48.853, 2.345], 9);
    map_raster = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 20,
      minZoom: 2
    });
    set_background();
  }

/**
* @function
* @name set_background
* @description Affiche ou cache la carte en fond de page
*/
  function set_background(){
    if(DOM_map_button.checked){ map.addLayer(map_raster); }
    else{ map.removeLayer(map_raster); }
  }

/**
* @function
* @name document_drop
* @description Écouteur d'évènement associé au glisser & déposer d'un fichier
* @listens document.drop
* @param e {event} e - l'évènement déclenché par le glisser & déposer
*/
  function document_drop(e){
    if(busy){ return; }
    e.preventDefault();

    var file = e.dataTransfer.files[0];
    var file_name = file.name.split(".").pop();
    DOM_upload_button.value = "";
    e.dataTransfer = null;
    if(file_name == "zip"){
      handle_file(file);
    }
    else{
      alert("ZIP file only", 1500);
    }
  }

/**
* @function
* @name document_select
* @description Écouteur d'évènement associé au clique sur le bouton de chargement d'un fichier
* @listens DOM_upload_button.change
* @param {event} e - l'évènement déclenché par le chargement d'un fichier
*/
  function document_select(e){
    if(busy){ return; }

    var file = DOM_upload_button.files[0];
    DOM_upload_button.value = "";
    handle_file(file);
  }

/**
* @function
* @name handle_file
* @description Vérifie le contenu du fichier ZIP, et supprime les fichiers supplémentaires
* @param {file} file - Le fichier chargé par l'utilisateur
*/
  function handle_file(file){
    // busy = true;
    // loader.style.display = "block";
    JSZip.loadAsync(file).then(function(zip){
      var type, idx, file_types = ['shp', 'dbf', 'shx', 'prj'];

      // parcours le ZIP pour vérifier chaque fichier
      zip.forEach(function(relativePath, zipEntry) {
        type = zipEntry.name.split(".").pop().toLowerCase();
        idx = file_types.indexOf(type);

        if(idx > -1){ file_types.splice(idx,1); }
        else{ zip.remove(relativePath); }
      });

      // si le ZIP contient tout les fichiers nécéssaires
      if(file_types.length < 1 || (file_types.length == 1 && file_types[0] == 'prj')){
        zip_file = zip;
        shp_file = zip.file(/.shp$/i)[0];
        var graph = new Graph(shp_file.name.split(".")[0]);

        for (var i = 0; i < graph_list.length; i++) {
          if(graph_list[i].equalTo(graph)){
            busy = false;
            loader.style.display = "none";
            alert("File already loaded",1500);
            return;
          }
        }
        graph_list.push(graph);

        // Lecture du ZIP au format ArrayBuffer pour l'affichage
        zip_file.generateAsync({type:"arraybuffer"})
        .then(function success(content) {
          graph.zip_array_buffer = content;
          display_zip(graph.zip_array_buffer);
        }, function error(e) {
          throw e;
        });

        // Lecture du ZIP au format UInt8Array pour l'envoi sur le serveur Node
        zip_file.generateAsync({type:"uint8array"})
        .then(function success(content) {
          graph.zip_uint8array = content;
          busy = false;
          upload_zip(graph);
        }, function error(e) {
          throw e;
        });

        set_file_window();
        document.getElementById("graph_radio_"+String(graph_list.length-1)).checked = true;
      }
      else{
        busy = false;
        loader.style.display = "none";
        alert("Zip file incorrect. Missing: "+file_types.toString(), 2500);
      }
    });
  }

/**
* @function
* @name display_zip
* @description Convertit le fichier SHP au format Geojson, et l'affiche sur la carte. Cette fonction utilise le module shapefile-js pour la conversion
* @param {ArrayBuffer} buffer - Le buffer de données correspondant au fichier SHP
*/
  function display_zip(buffer){
    shp(buffer).then(function(geojson){
      map.eachLayer(function(layer) {
        if(layer != map_raster){ map.removeLayer(layer); }
      });

      var layer = L.geoJSON(geojson);
      map.addLayer(layer);
      map.fitBounds(layer.getBounds());
    });
  }

/**
* @function
* @name upload_zip
* @description Envoi le ZIP contenant le fichier SHP au serveur avec une requete AJAX. Le dossier ZIP est encapsulé dans un objet FormData pour être récupéré par le serveur.
* @param {UInt8Array} data - Le chaîne encodé correspondant aux données du dossier ZIP
*/
  function upload_zip(graph){
    if(busy){ return; }
    busy = true;
    loader.style.display = "block";

    var form = new FormData();
    form.append('zip',graph.zip_uint8array);
    form.append('name',graph.name);
    form.append('operation','basics');
    form.append('options', '');
    // console.log(form);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8080/", true);

    // Les écouteurs d'évènements permettent d'animer une barre de chargement
    xhr.onprogress = function(e){
      if(e.lengthComputable){ }
    };
    xhr.onloadstart = function(e){ };
    xhr.onloadend = function(e) { };

    xhr.onreadystatechange = function(){
      if(xhr.readyState == 4 && xhr.status == 200){
        var json = JSON.parse(xhr.responseText);
        graph.nb_nodes = json.basics.nb_nodes;
        graph.nb_edges = json.basics.nb_edges;
        document.getElementById("basic_result").innerHTML = "<p>Nodes: "+json.basics.nb_nodes+"</p><p>Edges: "+json.basics.nb_edges+"</p>";

        busy = false;
        loader.style.display = "none";
      }
    };

    xhr.send(form);
  }

/**
* @function
* @name toolbox_listener
* @description Écouteur d'évènements des boutons radio de la boite à outil: réagis au clique souris, et envoie une requête AJAX
* vers le serveur pour obtenir le résultat de l'opération demandée
* @param {EventTarget} e - La cible du clique souris
*/
  function toolbox_listener(e){
    var graph = null;
    var div = document.querySelector("#file_wrap .content");

    for(var i = 0; i < div.children.length; i++) {    // boucle pour trouver le graphe selectionné
      if(div.children[i].id.length > 0){
        if(div.children[i].children[0].checked){
          var graph_id = div.children[i].children[0].id.slice(-1);
          graph = graph_list[graph_id];
        }
      }
    }

    if(graph == null){
      alert("No file uploaded", 1500);
      return;
    }

    var operation = e.target.value;
    var exist = graph.checkValues(operation);
    if(exist){
      return;
    }

    if(busy){ return; }
    busy = true;
    loader.style.display = "block";

    var callback = handle_operation(operation,graph);
    var form = new FormData();
    form.append('name', graph.name);
    form.append('operation', operation);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8080/", true);

    xhr.onreadystatechange = function(){
      if(xhr.readyState == 4 && xhr.status == 200){
        console.log(xhr.responseText);
        var json = JSON.parse(xhr.responseText);
        callback(json);

        busy = false;
        loader.style.display = "none";
      }
    };

    xhr.send(form);
  }

/**
* @function
* @name handle_operation
* @description Définis la fonction de retour (callback) pour la requête AJAX associé au clique sur une opération. La fonction de retour prend comme
* argument le JSON résultat de la requête
* @param {String} operation - La valeur du bouton radio qui a été cliqué
* @returns {Function}
*/
  function handle_operation(operation,graph){
    var f;
    switch(operation){
      case "diameter":
        f = function(j){
          DOM_result.innerHTML = "<p>Diameter: "+j.diameter+"</p>";
        }
        break;

      case "radius":
        f = function(j){
          DOM_result.innerHTML = "<p>Radius: "+j.radius+"</p>";
        }
        break;

      case "number_connected_component":
        f = function(j){
          DOM_result.innerHTML = "<p>Number of connected components: "+j.number_connected_components+"</p>";
        }
        break;

      case "density":
        f = function(j){
          DOM_result.innerHTML = "<p>Density: "+j.density+"</p>";
        }
        break;

      case "index_pi_eta_theta":
        f = function(j){
          DOM_result.innerHTML = "<p>Index &#960: "+j.pi+"</p>\
                                  <p>Index &#951: "+j.eta+"</p>\
                                  <p>Index &#952: "+j.theta+"</p>";
        }
        break;

      case "cyclo":
        f = function(j){
          DOM_result.innerHTML = "<p>Cyclomatic complexity: "+j.cyclomatic+"</p>";
        }
        break;

      case "index_alpha_beta_gamma":
        f = function(j){
          DOM_result.innerHTML = "<p>Index &#945: "+j.alpha+"</p>\
                                  <p>Index &#946: "+j.beta+"</p>\
                                  <p>Index &#967: "+j.gamma+"</p>";
        }
        break;

      case "centrality":
        f = function(j){

        }
        break;

      case "scale_free":
        f = function(j){

        }
        break;

      case "cluster":
        f = function(j){

        }
        break;

      case "average_shortest_path_length":
        f = function(j){

        }
        break;

      case "rich_club":
        f = function(j){

        }
        break;
    }
    return f;
  }

  function set_file_window(){
    var div = document.querySelector("#file_wrap .content");

    // var checked_id;
    // for (var i = 0; i < div.children.length; i++) {
    //   if(div.children[i].id.length > 0){
    //     if(div.children[i].children[0].checked){
    //       checked_id = div.children[i].children[0].id.slice(-1);
    //     }
    //   }
    // }

    div.innerHTML = "";
    if(graph_list.length > 0){
      var child_div;
      for (var i = 0; i < graph_list.length; i++) {
        child_div = document.createElement("div");
        child_div.id = "graph_id_"+String(i);
        child_div.classList.add("file_name");
        child_div.innerHTML = "<input type='radio' name='graph' id='graph_radio_"+String(i)+"'> \
                              <label for='graph_radio_"+i+"'>"+graph_list[i].name+"</label> \
				                      <p class='close fa fa-times'></p>"
        div.appendChild(child_div);
      }

      // if(checked_id != undefined){
      //   if(document.getElementById("graph_radio_"+String(checked_id)) != undefined){
      //     document.getElementById("graph_radio_"+String(checked_id)).checked = true;
      //   }
      //   else{
      //     document.getElementById("graph_radio_"+String(checked_id-1)).checked = true;
      //   }
      // }

      var close_list = document.getElementsByClassName("close");
      for(var i = 0; i < close_list.length; i++) {
        close_list[i].addEventListener('click', reset_file);
      }

      var g_list = document.getElementsByName("graph");
      for(var i = 0; i < g_list.length; i++) {
        g_list[i].addEventListener('click', function(e){
          console.log(e.target)
          document.getElementById(e.target.id).checked = true;
          var id =  e.target.id.slice(-1);
          display_zip(graph_list[id].zip_array_buffer);
        });
      }
    }
    else{
      div.innerHTML = "<p class='no_file'>No file uploaded</p>";
      document.getElementById("result").innerHTML = "";
    }


  }

/**
* @function
* @name reset_file
* @description Réinitialise les éléments suivants sur la page Web:
* <ul>
* <li>la couche vecteur affiché sur la carte Leaflet</li>
* <li>L'objet Graph enregistré correspondant</li>
* <li>Le texte indiquant le dossier graphe chargé</li>
* </ul>
*/
  function reset_file(e){
    var id = e.target.parentElement.id.slice(-1);

    if(document.getElementById("graph_radio_"+String(id)).checked == true){
      map.eachLayer(function(layer) {
        if(layer != map_raster){ map.removeLayer(layer); }
      });
    }

    graph_list.splice(id,1)
    // document.getElementById("graph_radio_"+String(graph_list.length-1)).checked = true;
    set_file_window();
  }

/**
* @function
* @name toggle_result_window
* @description Affiche ou réduit la fenêtre de résultat sur l'interface Web
*/
  function toggle_result_window(){
    if(DOM_window_action.classList.contains("fa-window-minimize")){
      DOM_window_action.classList.remove("fa-window-minimize");
      DOM_window_action.classList.add("fa-window-maximize");

      document.getElementById("result_content").style.maxHeight = "0";
    }
    else{
      DOM_window_action.classList.remove("fa-window-maximize");
      DOM_window_action.classList.add("fa-window-minimize");

      document.getElementById("result_content").style.maxHeight = "300px";
    }
  }

/**
* @function
* @name alert
* @description Affiche un texte d'alerte au premier plan
* @param {String} text - Le texte à afficher à l'écran
* @param {Integer} timeout - La durée d'affichage de l'alerte
*/
  function alert(text,timeout=1500){
    var div = document.createElement("div");
    div.innerHTML = "<p>"+text+"</p>";
    div.classList.add("alert");

    document.body.appendChild(div);
    window.setTimeout(function(){
      div.style.opacity = "0";
      window.setTimeout(function(){
        document.body.removeChild(div);
      }, 550);
    }, timeout);
  }

  init_map();
  init_listener();
};
