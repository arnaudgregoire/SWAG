# Script Python

## Présentatation
Le script python permet de calculer les différents indicateurs demandés du graphe associé au shapefile choisi.
Il réalise les opérations suivantes :

- basics
- diameter
- radius
- number_connected_component
- density
- index_alpha_beta_gamma
- index_pi_eta
- degree_centrality
- closeness_centrality
- betweenness_centrality
- eigenvector_centrality
- katz_centrality
- average_shortest_path_length
- clustering_coefficient
- average_clustering_coefficient

## Installation

Télécharger les shapefiles à :
https://drive.google.com/open?id=0B_Lzmv9s5Z3TVVBGd3NHUGdYbms

+ Sous Ubuntu

  Ouvrir un terminal :
  - Installer Git
  ```sh
  sudo apt-get install git
  ```
  - Installer Python3
  ```sh
  sudo apt-get install python3
  ```
  - Installer Networkx
  ```sh
  git clone https://github.com/networkx/networkx.git
  cd networkx
  sudo python3 setup.py install  
  ```
  - Installer GDAL
  ```sh
  sudo apt-get install python3-gdal
  ```
+ Sous Windows

  - Télécharger et installer Anaconda à :  
    https://repo.continuum.io/archive/Anaconda3-4.3.0.1-Windows-x86_64.exe
  - Télécharger GDAL à l'adresse suivante :  
    https://drive.google.com/open?id=0B_TFEvFxQAiHV1BqakxvTDJGSkE
  - Ouvrir un invite de commande :
  ```sh
  cd downloads
  pip install GDAL-2.1.3-cp36-cp36m-win_amd64.whl
  ```
