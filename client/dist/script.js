/**
* @fileOverview Script côté client pour gérer l'upload des shp, et l'interface utilisateur
* @author Augustin Gagnon <augustin.gagnon@ensg.eu>
* @requires Leaflet {@link http://leafletjs.com/}
* @requires JSZip {@link https://stuk.github.io/jszip/}
* @requires shapefile-js {@link https://github.com/calvinmetcalf/shapefile-js}
*/
window.onload = function(){
  var zip_file, shp_file;
  var busy = true;
  var basic_result, result;

  var map, map_raster, map_vector;

  var upload_button = document.getElementById("upload_button");
  var file_name = document.getElementById("file_name");
  var map_button = document.getElementById("map_button");
  var button_list = document.getElementsByName("operation");
  var window_action = document.getElementsByClassName("window")[0];
  var DOM_result = document.getElementById("result");
  var loader = document.getElementById("loader");

/**
* @function
* @name init_listener
* @description Initialise les écouteurs d'évènements de la page
*/
  function init_listener(){
    zip = new JSZip();
    console.log("JSZip support:");
    console.log(JSZip.support);

    document.addEventListener('drop', document_drop, false);
    var e_prevent_default = function(e){ e.preventDefault(); };
    document.addEventListener('dragover', e_prevent_default, false);
    document.addEventListener('dragleave', e_prevent_default, false);

    upload_button.addEventListener('change', document_select, false);
    map_button.addEventListener("change", set_background, false);
    for(var i=0; i<button_list.length; i++){
      button_list[i].addEventListener("click", toolbox_listener, false);
    }
    window_action.addEventListener("click", set_result_window, false);
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
* @description Ajoute ou supprime la carte en fond de page
*/
  function set_background(){
    if(map_button.checked){
      map.addLayer(map_raster);
    }
    else{
      map.removeLayer(map_raster);
    }
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
* @listens upload_button.change
* @param {event} e - l'évènement déclenché par le chargement d'un fichier
*/
  function document_select(e){
    if(busy){ return; }

    var file = upload_button.files[0];
    handle_file(file);
  }

/**
* @function
* @name handle_file
* @description Vérifie le contenu du fichier ZIP, et supprime les fichiers supplémentaires
* @param {file} file - Le fichier chargé par l'utilisateur
*/
  function handle_file(file){
    busy = true;
    loader.style.display = "block";
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

        // affiche le nom à l'écran
        var div = document.querySelector("#file_wrap .content");
        div.innerHTML = "<div class='file_name'>\
        <p class='name'>"+shp_file.name.split(".")[0]+"</p>\
        <p class='close fa fa-times'></p>\
        </div>";
        document.getElementsByClassName("close")[0].addEventListener('click', reset_file);

        // Lecture du ZIP au format ArrayBuffer pour l'affichage
        zip_file.generateAsync({type:"arraybuffer"})
        .then(function success(content) {
          display_zip(content);
        }, function error(e) {
          throw e;
        });

        // Lecture du ZIP au format UInt8Array pour l'envoi sur le serveur Node
        zip_file.generateAsync({type:"uint8array"})
        .then(function success(content) {
          busy = false;
          upload_zip(content);
        }, function error(e) {
          throw e;
        });

      }
      else{
        busy = false;
        loader.style.display = "none";
        var str = "Zip file incorrect. Missing: "+file_types.toString();
        alert(str,2500);
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
      if(map_vector){ map.removeLayer(map_vector) }
      map_vector = L.geoJSON(geojson);

      map.addLayer(map_vector);
      map.fitBounds(map_vector.getBounds());
    });
  }

/**
* @function
* @name upload_zip
* @description Envoi le ZIP contenant le fichier SHP au serveur avec une requete AJAX. Le dossier ZIP est encapsulé dans un objet FormData pour être récupéré par le serveur.
* @param {UInt8Array} data - Le chaîne encodé correspondant aux données du dossier ZIP
*/
  function upload_zip(data){
    if(busy){ return; }
    busy = true;
    loader.style.display = "block";
    // console.log(data);
    // console.log(data.length);
    var form = new FormData();
    form.append('zip',data);
    form.append('name',shp_file.name.split(".")[0]);
    form.append('operation','basics');
    form.append('options', '');
    // console.log(form);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8080/", true);

    // Les écouteurs d'évènements permettent d'animer une barre de chargement
    xhr.onprogress = function(e){
      if(e.lengthComputable) { }
    };
    xhr.onloadstart = function(e){ };
    xhr.onloadend = function(e) { };

    xhr.onreadystatechange = function(){
      if(xhr.readyState == 4 && xhr.status == 200){
        var json = JSON.parse(xhr.responseText);
        document.getElementById("basic_result").innerHTML = "<p>Nodes: "+json.basics.nb_nodes+"</p><p>Edges: "+json.basics.nb_edges+"</p>";

        busy = false;
        loader.style.display = "none";
      }
    };

    xhr.send(form);
  }

/**
* @function
* @name reset_file
* @description Réinitialise les éléments suivants sur la page Web:
* <ul>
* <li>la couche vecteur affiché sur la carte Leaflet</li>
* <li>Le dossier ZIP enregistré dans une variable</li>
* <li>Le texte indiquant le dossier ZIP chargé</li>
* </ul>
*/
  function reset_file(){
    map.removeLayer(map_vector);
    zip_file = undefined;
    shp_file = undefined;
    upload_button.value = "";
    document.querySelector("#file_wrap .content").innerHTML = "<p class='file_name'>No file uploaded</p>";
    document.getElementById("result").innerHTML = "";
  }

/**
* @function
* @name toolbox_listener
* @description Écouteur d'évènements des boutons radio de la boite à outil: réagis au clique souris, et envoie une requête AJAX
* vers le serveur pour obtenir le résultat de l'opération demandé
* @param {EventTarget} e - La cible du clique souris
*/
  function toolbox_listener(e){
    if(shp_file == undefined){
      alert("No file uploaded", 1500);
      return;
    }

    if(busy){ return; }
    busy = true;
    loader.style.display = "block";

    var filename = shp_file.name.split(".")[0];
    var operation = e.target.value;
    var callback = handle_operation(operation);

    var form = new FormData();
    form.append('name', filename);
    form.append('operation', operation);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8080/", true);

    xhr.onreadystatechange = function(){
      if(xhr.readyState == 4 && xhr.status == 200){
        // console.log(xhr.responseText);
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
  function handle_operation(operation){
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

/**
* @function
* @name set_result_window
* @description Affiche ou réduit la fenêtre de résultat sur l'interface Web
*/
  function set_result_window(){
    if(window_action.classList.contains("fa-window-minimize")){
      window_action.classList.remove("fa-window-minimize");
      window_action.classList.add("fa-window-maximize");

      document.getElementById("result_content").style.maxHeight = "0";
    }
    else{
      window_action.classList.remove("fa-window-maximize");
      window_action.classList.add("fa-window-minimize");

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
