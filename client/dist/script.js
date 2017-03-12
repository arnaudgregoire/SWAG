window.onload = function(){
  var  zip_file, shp_file;
  var busy = true;

  var map, map_raster, map_vector;

  var file_types = ['shp', 'shx', 'dbf', '.prj'];

  var upload_button = document.getElementById("upload_button");
  var file_name = document.getElementById("file_name");
  var map_button = document.getElementById("map_button");

  // initialize all event listener
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

  function init_map(){
    map = L.map('shp_preview').setView([48.853, 2.345], 9);
    map_raster = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 20,
      minZoom: 2
    });
    set_background();
  }


  function set_background(){
    if(map_button.checked){
      map.addLayer(map_raster);
    }
    else{
      map.removeLayer(map_raster);
    }
  }

  function document_drop(e){
    if(busy){ return; }
    e.preventDefault();

    var file = e.dataTransfer.files[0];
    handle_file(file);
  }

  function document_select(e){
    if(busy){ return; }

    var file = upload_button.files[0];
    handle_file(file);
  }

  function handle_file(file){
    JSZip.loadAsync(file).then(function(zip){
      var type, idx, file_types = ['shp', 'dbf', 'prj'];

      // check up and clean the zip file
      zip.forEach(function(relativePath, zipEntry) {
        type = zipEntry.name.split(".").pop().toLowerCase();
        idx = file_types.indexOf(type);

        if(idx > -1){ file_types.splice(idx,1); }
        else{ zip.remove(relativePath); }
      });

      // zip file has correct files in it
      if(file_types.length < 1 || (file_types.length == 1 && file_types[0] == 'prj')){
        var div = document.querySelector("#file_wrap .content");
        div.innerHTML = "<div class='file_name'>\
        <p class='name'>"+file.name.split(".")[0]+"</p>\
        <p class='close'>X</p>\
        </div>";
        document.getElementsByClassName("close")[0].addEventListener('click', reset_file);

        zip_file = zip;
        shp_file = zip.file(/.shp$/i)[0];

        // shp_file.async("arraybuffer")
        // .then(function success(content) {
        //   upload_file(content);
        // }, function error(e) {
        //   throw e;
        // });

        // read zip as array buffer to display it
        zip_file.generateAsync({type:"arraybuffer"})
        .then(function success(content) {
          display_zip(content);
        }, function error(e) {
          throw e;
        });

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

  function display_zip(buffer){
    shp(buffer).then(function(geojson){
      if(map_vector){ map.removeLayer(map_vector) }
      map_vector = L.geoJSON(geojson);
      map.addLayer(map_vector);
      map.fitBounds(map_vector.getBounds());
    });
  }

  function upload_zip(data){
    var form = new FormData();
    form.append('zip',data);
    form.append('option',123456);
    console.log(form);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1/edsa-swag/server.php", true);

    // keep track of progression for progress bar
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
  

  function reset_file(){    // reset file
    map.removeLayer(map_vector);
    zip_file = undefined;
    shp_file = undefined;
    upload_button.value = "";
    document.querySelector("#file_wrap .content").innerHTML = "<p class='file_name'>No file uploaded</p>";
  }

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
  // reset_file();
};
