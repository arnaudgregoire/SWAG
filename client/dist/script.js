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

  this.nb_nodes = "";
  this.nb_edges = "";
  this.total_length = "";

  this.diameter = "";
  this.radius = "";
  this.nb_connected_components = "";

  this.density = "";
  this.pi = "";
  this.eta = "";
  this.alpha = "";
  this.beta = "";
  this.gamma = "";

  this.degree_centrality = "";
  this.closeness_centrality = "";
  this.betweenness_centrality = "";
  this.eigenvector_centrality = "";
  this.katz_centrality = "";

  this.cyclomatic_number = "";
  this.clustering_coeff = "";
  this.average_clustering_coeff = "";
  this.shortest_path = "";
}

Graph.prototype.equalTo = function(graph){
  if(graph.name !== undefined && graph.name == this.name){
    return true;
  }
  return false;
}

Graph.prototype.isEmpty = function(operation){
  switch(operation){
    case "diameter":
      if(this.diameter == ""){ return true; }
      else{ return false; }

    case "radius":
      if(this.radius == ""){ return true; }
      else{ return false; }

    case "number_connected_component":
      if(this.nb_connected_components == ""){ return true; }
      else{ return false; }

    case "density":
      if(this.density == ""){ return true; }
      else{ return false; }

    case "index_pi_eta":
      if(this.pi == "" && this.eta == ""){ return true; }
      else{ return false; }

    case "index_alpha_beta_gamma":
      if(this.alpha == "" && this.beta == "" && this.gamma == ""){ return true; }
      else{ return false; }

    case "degree_centrality":
      if(this.degree_centrality == ""){ return true; }
      else{ return false; }

    case "closeness_centrality":
      if(this.closeness_centrality == ""){ return true; }
      else{ return false; }

    case "betweenness_centrality":
      if(this.betweenness_centrality == ""){ return true; }
      else{ return false; }

    case "eigenvector_centrality":
      if(this.eigenvector_centrality == ""){ return true; }
      else{ return false; }

    case "katz_centrality":
      if(this.katz_centrality == ""){ return true; }
      else{ return false; }

    case "cyclomatic_number":
      if(this.cyclomatic_number == ""){ return true; }
      else{ return false; }

    case "clustering_coefficient":
      if(this.clustering_coeff == ""){ return true; }
      else{ return false; }

    case "average_clustering_coefficient":
      if(this.average_clustering_coeff == ""){ return true; }
      else{ return false; }

    case "average_shortest_path_length":
      if(this.shortest_path == ""){ return true; }
      else{ return false; }
  }
}

window.onload = function(){
  var zip;
  var graph_list = [];
  var busy = true;
  var map, map_raster, map_vector;
  var music, end_music;

  var DOM_upload_button = document.getElementById("upload_button");
  var DOM_map_button = document.getElementById("map_button");
  var DOM_operation_list = document.getElementsByName("operation");
  var DOM_window_action = document.getElementsByClassName("window")[0];

  var DOM_result = document.getElementById("result_content");
  var DOM_result_tabs = document.getElementById("result_tabs");
  var DOM_link_result_main = document.getElementById("link_result_main");
  var DOM_link_result_centrality = document.getElementById("link_result_centrality");
  var DOM_link_result_clustering = document.getElementById("link_result_clustering");

  var loader = document.getElementById("loader");

/**
* @function
* @name init_listener
* @description Initialise les écouteurs d'évènements de la page
*/
  function init_listener(){
    zip = new JSZip();
    // console.log("JSZip support:"); console.log(JSZip.support);

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

    DOM_link_result_main.addEventListener('click', function(){
      DOM_link_result_main.classList.add('selected');
      DOM_link_result_centrality.classList.remove("selected");
      DOM_link_result_clustering.classList.remove("selected");
      DOM_result_tabs.style.marginLeft = "0";
    });
    DOM_link_result_centrality.addEventListener('click', function(){
      DOM_link_result_centrality.classList.add('selected');
      DOM_link_result_main.classList.remove("selected");
      DOM_link_result_clustering.classList.remove("selected");
      DOM_result_tabs.style.marginLeft = "-400px";
    });
    DOM_link_result_clustering.addEventListener('click', function(){
      DOM_link_result_clustering.classList.add('selected');
      DOM_link_result_main.classList.remove("selected");
      DOM_link_result_centrality.classList.remove("selected");
      DOM_result_tabs.style.marginLeft = "-800px";
    });

    music = new Audio("dist/audio1.mp3");
    music.loop = true;
    end_music = new Audio("dist/audio2.mp3");
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
      alert("ZIP non reconnu", 1500);
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
    e.dataTransfer = null;
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
    music.play();

    JSZip.loadAsync(file).then(function(zip){
      var type, idx, file_types = ['shp', 'dbf', 'shx', 'prj'];

      zip.forEach(function(relativePath, zipEntry) {    // parcours le ZIP pour vérifier chaque fichier
        type = zipEntry.name.split(".").pop().toLowerCase();
        idx = file_types.indexOf(type);

        if(idx > -1){ file_types.splice(idx,1); }
        else{ zip.remove(relativePath); }
      });

      if(file_types.length < 1 || (file_types.length == 1 && file_types[0] == 'prj')){    // si le ZIP contient tout les fichiers nécéssaires
        zip_file = zip;
        shp_file = zip.file(/.shp$/i)[0];
        var graph = new Graph(shp_file.name.split(".")[0]);

        for (var i = 0; i < graph_list.length; i++) {
          if(graph_list[i].equalTo(graph)){
            busy = false;
            loader.style.display = "none";
            music.pause();
            end_music.play();
            alert("Fichier déjà importé",1500);
            return;
          }
        }
        graph_list.push(graph);

        zip_file.generateAsync({type:"arraybuffer"})    // Lecture du ZIP au format ArrayBuffer pour l'affichage
        .then(function success(content) {
          graph.zip_array_buffer = content;
          display_graph(graph);
        }, function error(e) {
          throw e;
        });

        zip_file.generateAsync({type:"uint8array"})    // Lecture du ZIP au format UInt8Array pour l'envoi sur le serveur Node
        .then(function success(content) {
          graph.zip_uint8array = content;
          busy = false;
          upload_graph(graph);
        }, function error(e) {
          throw e;
        });

        set_file_window();
        document.getElementById("graph_radio_"+String(graph_list.length-1)).checked = true;
      }
      else{
        busy = false;
        loader.style.display = "none";
        music.pause();
        end_music.play();
        alert("ZIP incorrect. Manque: "+file_types.toString(), 2500);
      }
    });
  }

/**
* @function
* @name display_graph
* @description Convertit le fichier SHP au format Geojson, et l'affiche sur la carte. Cette fonction utilise le module shapefile-js pour la conversion
* @param {ArrayBuffer} buffer - Le buffer de données correspondant au fichier SHP
*/
  function display_graph(graph,zoom=true){
    shp(graph.zip_array_buffer).then(function(geojson){
      map.eachLayer(function(layer) {
        if(layer != map_raster){ map.removeLayer(layer); }
      });

      var layer = L.geoJSON(geojson);
      map.addLayer(layer);
      if(zoom){
        map.fitBounds(layer.getBounds());
      }
    });

    set_result_window(graph);
  }



/**
* @function
* @name upload_graph
* @description Envoi le ZIP contenant le fichier SHP au serveur avec une requete AJAX. Le dossier ZIP est encapsulé dans un objet FormData pour être récupéré par le serveur.
* @param {UInt8Array} data - Le chaîne encodé correspondant aux données du dossier ZIP
*/
  function upload_graph(graph){
    if(busy){ return; }
    busy = true;
    loader.style.display = "block";
    music.play();

    var optionAll = document.getElementById("import_opt").checked;
    var operation = optionAll ? 'all' : 'basics';

    var form = new FormData();
    form.append('zip',graph.zip_uint8array);
    form.append('name',graph.name);
    form.append('operation',operation);
    form.append('options', '');
    // console.log(form);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8080/", true);

    // Les écouteurs d'évènements permettent d'animer une barre de chargement
    // xhr.onprogress = function(e){
    //   if(e.lengthComputable){ }
    // };
    // xhr.onloadstart = function(e){ };
    // xhr.onloadend = function(e) { };

    xhr.onreadystatechange = function(){
      if(xhr.readyState == 4 && xhr.status == 200){
        console.log(xhr.responseText);
        if(xhr.responseText == "erreur"){
          alert("Erreur d'analyse", 2000);
        }
        else{
          var json = JSON.parse(xhr.responseText);

          if(optionAll){
            graph.nb_nodes = json.basics.nb_nodes;
            graph.nb_edges = json.basics.nb_edges;
            graph.total_length = json.basics.total_length;
            graph.diameter = json.diameter;
            graph.radius = json.radius;
            graph.nb_connected_components = json.number_connected_components;
            graph.density = parseFloat(json.density).toPrecision(5);
            graph.pi = parseFloat(json.index_pi_eta.pi).toPrecision(5);
            graph.eta = parseFloat(json.index_pi_eta.eta).toPrecision(5);
            graph.alpha = parseFloat(json.index_alpha_beta_gamma.alpha).toPrecision(5);
            graph.beta = parseFloat(json.index_alpha_beta_gamma.beta).toPrecision(5);
            graph.gamma = parseFloat(json.index_alpha_beta_gamma.gamma).toPrecision(5);
            graph.cyclomatic_number = json.cyclomatic_number;
            graph.shortest_path = parseFloat(json.average_shortest_path_length).toPrecision(8);
          }
          else{
            graph.nb_nodes = json.basics.nb_nodes;
            graph.nb_edges = json.basics.nb_edges;
            graph.total_length = json.basics.total_length;
          }

          set_result_window(graph);
          if(DOM_window_action.classList.contains("fa-window-maximize")){
            toggle_result_window();
          }
        }

        busy = false;
        loader.style.display = "none";
        music.pause();
        end_music.play();
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
      alert("Aucun fichier importé", 1500);
      return;
    }

    var operation = e.target.value;
    var empty = graph.isEmpty(operation);
    if(!empty){ return; }

    if(busy){ return; }
    busy = true;
    loader.style.display = "block";
    music.play();

    var callback = handle_operation(operation,graph);
    var form = new FormData();
    form.append('name', graph.name);
    form.append('operation', operation);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8080/", true);

    xhr.onreadystatechange = function(){
      if(xhr.readyState == 4 && xhr.status == 200){
        // console.log(xhr.responseText);
        if(xhr.responseText == "erreur"){
          alert("Erreur d'analyse", 2000);
        }
        else{
          callback(xhr.responseText);

          set_result_window(graph);
          if(DOM_window_action.classList.contains("fa-window-maximize")){
            toggle_result_window();
          }
        }

        busy = false;
        loader.style.display = "none";
        music.pause();
        end_music.play();
      }
      else if(xhr.readyState == 4 && xhr.status != 200){
        busy = false;
        loader.style.display = "none";
        music.pause();
        end_music.play();
        alert("Erreur serveur",2000);
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
        f = function(text){
          var j = JSON.parse(text);
          graph.diameter = j.diameter;
        }
        break;

      case "radius":
        f = function(text){
          var j = JSON.parse(text);
          graph.radius = j.radius;
        }
        break;

      case "number_connected_component":
        f = function(text){
          var j = JSON.parse(text);
          graph.nb_connected_components = j.number_connected_components;
        }
        break;

      case "density":
        f = function(text){
          var j = JSON.parse(text);
          graph.density = parseFloat(j.density).toPrecision(5);
        }
        break;

      case "index_pi_eta":
        f = function(text){
          var j = JSON.parse(text);
          graph.pi = parseFloat(j.index_pi_eta.pi).toPrecision(5);
          graph.eta = parseFloat(j.index_pi_eta.eta).toPrecision(5);
        }
        break;

      case "index_alpha_beta_gamma":
        f = function(text){
          var j = JSON.parse(text);
          graph.alpha = parseFloat(j.index_alpha_beta_gamma.alpha).toPrecision(5);
          graph.beta = parseFloat(j.index_alpha_beta_gamma.beta).toPrecision(5);
          graph.gamma = parseFloat(j.index_alpha_beta_gamma.gamma).toPrecision(5);
        }
        break;

      case "degree_centrality":
        f = function(text){
          t = text_to_json(text);
          graph.degree_centrality = JSON.parse(t);
        }
        break;

      case "closeness_centrality":
        f = function(text){
          t = text_to_json(text);
          graph.closeness_centrality = JSON.parse(t);
        }
        break;

      case "betweenness_centrality":
        f = function(text){
          t = text_to_json(text);
          graph.betweenness_centrality = JSON.parse(t);
        }
        break;

      case "eigenvector_centrality":
        f = function(text){
          t = text_to_json(text);
          graph.eigenvector_centrality = JSON.parse(t);
        }
        break;

      case "katz_centrality":
        f = function(text){
          t = text_to_json(text);
          graph.katz_centrality = JSON.parse(t);
        }
        break;

      case "cyclomatic_number":
        f = function(text){
          var j = JSON.parse(text);
          graph.cyclomatic_number = j.cyclomatic_number;
        }
        break;

      case "clustering_coefficient":
        f = function(text){
          t = text_to_json(text);
          graph.clustering_coeff = JSON.parse(t);
        }
        break;

      case "average_clustering_coefficient":
        f = function(text){
          var j = JSON.parse(text);
          graph.average_clustering_coeff = parseFloat(j).toPrecision(6);
        }
        break;

      case "average_shortest_path_length":
        f = function(text){
          var j = JSON.parse(text);
          graph.shortest_path = parseFloat(j.average_shortest_path_length).toPrecision(8);
        }
        break;
    }
    return f;
  }

  /**
  * @function
  * @name text_to_json
  * @description Convertit un dictionnaire de noeud python, au format texte, en String qui peut être parsé en objet json
  * @param {String} text - Le texte de retour d'une requête AJAX
  * @returns {String}
  */
  function text_to_json(text){
    var t = text.substring(1,text.length-2);
    var liste = t.split("(");

    // Recherche des valeurs max et min, ainsi que du nombre de valeurs différentes
    var node, value_list = [], value;
    var max = 0; var min = 9999;
    for(var i=1; i<liste.length; i++){
      node = liste[i].split(":");
      value = parseFloat(node[1]);
      value_list.push(value);

      if(value > max){ max = value; }
      if(value < min){ min = value; }
    }

    var true_color = true;
    var color_list = [];
    var unique = value_list.filter(function(v,i,self){ return self.indexOf(v) === i; });

    // Dans le cas d'un faible nombre de valeurs, ont créé une liste de couleur à appliquer pour plus de visibilité
    if(unique.length <= 5){
      unique = unique.map(function(x){ return (x-min)/(max-min); }); // normalisation des valeurs
      unique.sort();    // tris des valeurs
      true_color = false;

      var step, rgb;
      for(var i=0; i<unique.length; i++){
        step = i / (unique.length-1);
        rgb = color_map(step);
        color_list.push( "rgb("+String(rgb[0])+","+String(rgb[1])+","+String(rgb[2])+")" );    // création de la liste des couleurs disponible
      }
      console.log(color_list);
    }

    var result = '{"nodes": [';
    var coord, x, y, rgb, color;
    for(var i=1; i<liste.length; i++){
      node = liste[i].split(":");
      value = (parseFloat(node[1]) - min) / (max - min);

      if(true_color){
        rgb = color_map(value)
        color = "rgb("+String(rgb[0])+","+String(rgb[1])+","+String(rgb[2])+")";
      }
      else{
        color = color_list[unique.indexOf(value)];
      }

      coord = node[0].split(",");
      x = parseFloat(coord[0]);
      y = -parseFloat(coord[1]);

      result += '{"id": ' + String(i-1) + ', "x": ' + String(x) + ', "y": ' + String(y) + ', "color": "' + color + '"},';
    }

    result = result.substring(0,result.length-1) + "]}";
    return result;
  }

  function color_map(value){
    var r,g,b;
    if(value <= 0.2){   // bleu
      r = 0;
      g = 0;
      b = 255;
    }
    else if(value <= 0.4){   // cyan
      r = 0;
      g = 255;
      b = 255;
    }
    else if(value <= 0.6){   // vert
      r = 0;
      g = 255;
      b = 0;
    }
    else if(value <= 0.8){   // jaune
      r = 255;
      g = 255;
      b = 0;
    }
    else{   // rouge
      r = 255;
      g = 0;
      b = 0;
    }
    return [r,g,b];
  }




  function set_file_window(){
    var div = document.querySelector("#file_wrap .content");

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

      var close_list = document.getElementsByClassName("close");
      for(var i = 0; i < close_list.length; i++) {
        close_list[i].addEventListener('click', reset_file);
      }

      var g_list = document.getElementsByName("graph");
      for(var i = 0; i < g_list.length; i++) {
        g_list[i].addEventListener('click', function(e){
          document.getElementById(e.target.id).checked = true;
          var id =  e.target.id.slice(-1);
          display_graph(graph_list[id],false);
        });
      }
    }
    else{
      div.innerHTML = "<p class='no_file'>No file uploaded</p>";
      DOM_result_tabs.innerHTML = "";
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
    var graph_id = null;

    var form = document.querySelector("#file_wrap .content");
    for(var i = 0; i < form.children.length; i++) {    // boucle pour trouver le graphe selectionné
      if(form.children[i].id.length > 0){
        if(form.children[i].children[0].checked){
          graph_id = form.children[i].children[0].id.slice(-1);    // on stocke l'id du graphe actuellement sélectionné
          if(graph_id == id){ graph_id = null; }
          if(graph_id > id){ graph_id--; }
        }
      }
    }

    if(document.getElementById("graph_radio_"+String(id)).checked == true){
      map.eachLayer(function(layer) {
        if(layer != map_raster){ map.removeLayer(layer); }
      });
      DOM_result_tabs.innerHTML = "";
    }

    graph_list.splice(id,1);
    set_file_window();
    if(graph_id != null){   // on resélectionne le graphe précédemment sélectionné
      document.getElementById("graph_radio_"+String(graph_id)).checked = true;
    }
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

      DOM_result.style.height = "0";
    }
    else{
      DOM_window_action.classList.remove("fa-window-maximize");
      DOM_window_action.classList.add("fa-window-minimize");

      DOM_result.style.height = "380px";
    }
  }

  function set_result_window(graph){
    DOM_result_tabs.innerHTML = "<div><div class='result_section'> \
      <p><span>Noeuds:</span> "+graph.nb_nodes+"</p> \
      <p><span>Arcs:</span> "+graph.nb_edges+"</p> \
      <p><span>Longueur totale:</span> "+graph.total_length+"</p> \
    </div> \
    <div class='result_section'> \
      <p><span>Diamètre:</span> "+graph.diameter+"</p> \
      <p><span>Rayon:</span> "+graph.radius+"</p> \
      <p><span>Composantes connexes:</span> "+graph.nb_connected_components+"</p> \
    </div> \
    <div class='result_section'> \
      <p class='big_result'><span>Densité:</span> "+graph.density+"</p> \
      <p class='small_result'><span>&#960:</span> "+graph.pi+"</p> \
      <p><span>&#951:</span> "+graph.eta+"</p> \
      <p class='small_result'><span>&#945:</span> "+graph.alpha+"</p> \
      <p class='small_result'><span>&#946:</span> "+graph.beta+"</p> \
      <p class='small_result'><span>&#947:</span> "+graph.gamma+"</p> \
    </div> \
    <div class='result_section'> \
      <p><span>Nombre cylomatique:</span> "+graph.cyclomatic_number+"</p>\
      <p><span>Plus courts chemin moyen:</span> "+graph.shortest_path+"</p> \
    </div></div> \
    <div> \
      <div class='result_section'> <p><span>Degré</span></p> \
        <div class='graph_visu' id='result_degree_centrality'></div> </div> \
      <div class='result_section'> <p><span>Proximité</span></p> \
        <div class='graph_visu' id='result_closeness_centrality'></div> </div> \
      <div class='result_section'> <p><span>Intermédiaire</span></p> \
        <div class='graph_visu' id='result_betweenness_centrality'></div> </div> \
      <div class='result_section'> <p><span>Vecteur Propre</span></p> \
        <div class='graph_visu' id='result_eigenvector_centrality'></div> </div> \
      <div class='result_section'> <p><span>Katz</span></p> \
        <div class='graph_visu' id='result_katz_centrality'></div> </div> \
    </div> \
    <div> \
      <div class='result_section'> \
        <p><span>Clustering moyen:</span> "+graph.average_clustering_coeff+"</p> \
        <div class='graph_visu' id='result_clustering_coeff'></div> \
      </div> \
    </div>";

    set_graph_visualization(graph);
  }

  function set_graph_visualization(graph){
    var nodes, edges, container, data;
    var options = {physics: {enabled: false}, interaction: {dragNodes: false, hover: false, selectable: false}};

    if(graph.degree_centrality != ""){
      console.log(graph.degree_centrality);
      container = document.getElementById("result_degree_centrality");
      data = {nodes: new vis.DataSet(graph.degree_centrality.nodes), edges: new vis.DataSet([])};
      var network_degree = new vis.Network(container, data, options);
    }

    if(graph.closeness_centrality != ""){
      container = document.getElementById("result_closeness_centrality");
      data = {nodes: new vis.DataSet(graph.closeness_centrality.nodes), edges: new vis.DataSet([])};
      var network_centrality = new vis.Network(container, data, options);
    }

    if(graph.betweenness_centrality != ""){
      container = document.getElementById("result_betweenness_centrality");
      data = {nodes: new vis.DataSet(graph.betweenness_centrality.nodes), edges: new vis.DataSet([])};
      var network_betweenness = new vis.Network(container, data, options);
    }

    if(graph.eigenvector_centrality != ""){
      container = document.getElementById("result_eigenvector_centrality");
      data = {nodes: new vis.DataSet(graph.eigenvector_centrality.nodes), edges: new vis.DataSet([])};
      var network_eigenvector = new vis.Network(container, data, options);
    }

    if(graph.katz_centrality != ""){
      container = document.getElementById("result_katz_centrality");
      data = {nodes: new vis.DataSet(graph.katz_centrality.nodes), edges: new vis.DataSet([])};
      var network_katz_centrality = new vis.Network(container, data, options);
    }

    if(graph.clustering_coeff != ""){
      container = document.getElementById("result_clustering_coeff");
      data = {nodes: new vis.DataSet(graph.clustering_coeff.nodes), edges: new vis.DataSet([])};
      var network_clustering_coeff = new vis.Network(container, data, options);
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
