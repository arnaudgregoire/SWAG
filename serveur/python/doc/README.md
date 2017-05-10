# Documentation programmeur Script Python

Ici sont documentées les différentes fonctions qui composent le script python

- fun_basics
- fun_diameter
- fun_radius
- fun_number_connected_component
- fun_density
- fun_index_alpha_beta_gamma
- fun_index_pi_eta
- fun_degree_centrality
- fun_closeness_centrality
- fun_betweenness_centrality
- fun_eigenvector_centrality
- fun_katz_centrality
- fun_clustering_coefficient
- fun_average_clustering_coefficient
- fun_average_shortest_path_length
- fun_all
- set_shp
- main


## fun_basics

Paramètre :


- G {graph} : graphe


Retour :


- {string} : Le résultat au format JSON


Description :

Calcule le nombre de noeuds, d'arcs et la longueur totale du réseau.


## fun_diameter

Paramètre :


- G {graph} : graphe


Retour :


- {string} : Le résultat au format JSON


Description :

Calcule le diamètre du graphe.



## fun_radius

Paramètre :


- G {graph} : graphe


Retour :


- {string} : Le résultat au format JSON


Description :

Calcule le rayon du graphe.



## fun_number_connected_component

Paramètre :


- G {graph} : graphe


Retour :


- {string} : Le résultat au format JSON


Description :

Calcule le nombre de composantes connexes du graphe.



## fun_density

Paramètre :


- G {graph} : graphe


Retour :


- {string} : Le résultat au format JSON


Description :

Calcule la densité du graphe.



## fun_index_pi_eta

Paramètre :


- G {graph} : graphe


Retour :


- {string} : Le résultat au format JSON


Description :

Calcule les indices pi et eta du graphe.



## fun_cyclomatic_number

Paramètre :


- G {graph} : graphe


Retour :


- {string} : Le résultat au format JSON


Description :

Calcule le nombre cyclomatique du graphe.



## fun_index_alpha_beta_gamma

Paramètre :


- G {graph} : graphe


Retour :


- {string} : Le résultat au format JSON


Description :

Calcule les indices alpha, beta et gamma du graphe.



## fun_degree_centrality

Paramètre :


- G {graph} : graphe


Retour :


- {string} : Le résultat au format JSON


Description :

Calcule les centralités de degré pour chaque noeud du graphe.



## fun_closeness_centrality

Paramètres :


- G {graph} : graphe
- weight {string} : nom du poids des arcs


Retour :


- {string} : Le résultat au format JSON


Description :

Calcule les centralités de proximité pour chaque noeud du graphe.



## fun_betweenness_centrality

Paramètres :


- G {graph} : graphe
- weight {string} : nom du poids des arcs


Retour :


- {string} : Le résultat au format JSON


Description :

Calcule les centralités d'intermédiarité pour chaque noeud du graphe.



## fun_eigenvector_centrality

Paramètres :


- G {graph} : graphe
- weight {string} : nom du poids des arcs


Retour :


- {string} : Le résultat au format JSON


Description :

Calcule les centralités de vecteur propres pour chaque noeud du graphe.



## fun_katz_centrality

Paramètres :


- G {graph} : graphe
- weight {string} : nom du poids des arcs


Retour :


- {string} : Le résultat au format JSON


Description :

Calcule les centralités de Katz pour chaque noeud du graphe.



## fun_clustering_coefficient

Paramètres :


- G {graph} : graphe
- weight {string} : nom du poids des arcs


Retour :


- {string} : Le résultat au format JSON


Description :

Calcule les coefficients de clustering pour chaque noeud du graphe.



## fun_average_clustering_coefficient

Paramètres :


- G {graph} : graphe
- weight {string} : nom du poids des arcs


Retour :


- {string} : Le résultat au format JSON


Description :

Calcule la moyenne des coefficients de clustering du graphe.



## fun_average_shortest_path_length

Paramètres :


- G {graph} : graphe
- weight {string} : nom du poids des arcs


Retour :


- {string} : Le résultat au format JSON


Description :

Calcule la moyenne des plus courts chemins du graphe.



## fun_all

Paramètres :


- G {graph} : graphe
- weight {string} : nom du poids des arcs


Retour :


- {string} : Le résultat au format JSON


Description :

Calcule tout les indicateurs généraux du graphe.



## set_shp

Paramètre :


- shapefile {string} : chemin du shapefile à traiter


Description :

Calcule les longueurs des éléments du shapefile afin de créer un nouvel attribut qui sera ensuite le poids des arcs du graphe.



## main

Paramètres :


- shapefile {string} : chemin du shapefile à traiter
- nomMethode {string} : nom de l'attribut à calculer


Retour :


- {string} : Le résultat au format JSON


Description :

Fonction permettant de calculer un attribut particulier à un shp en utilisant la théorie des graphes.
