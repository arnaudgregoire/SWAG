/**
* @fileOverview Script côté client pour gérer l'upload des shp, et l'interface utilisateur
* @author Augustin Gagnon <augustin.gagnon@ensg.eu>
* @requires Leaflet {@link http://leafletjs.com/}
* @requires JSZip {@link https://stuk.github.io/jszip/}
* @requires shapefile-js {@link https://github.com/calvinmetcalf/shapefile-js}
*/
window.onload = function(){
  var  zip_file, shp_file;
  var busy = true;

  var map, map_raster, map_vector;

  var file_types = ['shp', 'shx', 'dbf', '.prj'];

  var upload_button = document.getElementById("upload_button");
  var file_name = document.getElementById("file_name");
  var map_button = document.getElementById("map_button");

/**
* @function
* @name init_listener
* @description Initialise les écouteurs d'évènements de la page
*/
  function init_listener(){
    busy = false;
    zip = new JSZip();
    console.log("JSZip support:");
    console.log(JSZip.support);

    document.addEventListener('drop', document_drop, false);
    var e_prevent_default = function(e){ e.preventDefault(); };
    document.addEventListener('dragover', e_prevent_default, false);
    document.addEventListener('dragleave', e_prevent_default, false);

    upload_button.addEventListener('change', document_select, false);
    map_button.addEventListener("change", set_background, false);
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
    handle_file(file);
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
    JSZip.loadAsync(file).then(function(zip){
      var type, idx, file_types = ['shp', 'dbf', 'prj'];

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
        <p class='name'>"+file.name.split(".")[0]+"</p>\
        <p class='close'>X</p>\
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
          upload_zip(content);
        }, function error(e) {
          throw e;
        });

      }
      else{
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
    // console.log(data);
    // console.log(data.length);
    var form = new FormData();
    form.append('zip',data);
    form.append('option',123456);
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
        console.log(xhr.responseText);
      }
    };

    xhr.send(form);
  }

/**
* @function
* @name reset_file
* @description Réinitialise les éléments suivants sur la page Web:
* - la couche vecteur affiché sur la carte Leaflet
* - Le dossier ZIP enregistré dans une variable
* - Le texte indiquant le dossier ZIP chargé
*/
  function reset_file(){
    map.removeLayer(map_vector);
    zip_file = undefined;
    shp_file = undefined;
    upload_button.value = "";
    document.querySelector("#file_wrap .content").innerHTML = "<p class='file_name'>No file uploaded</p>";
  }

/**
* @function
* @name alert
* @description Affiche un texte d'alerte au premier plan
* @param {String} text - Le texte à afficher à l'écran
* @param {Integer} timeout - La durée d'affichage de l'alerte
*/
  function alert(text,timeout){
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
