#import numpy as np
#import matplotlib
import networkx as nx
import sys
from osgeo import ogr

import time


#shapefile = sys.argv[1]
shapefile = "D://pc//Documents//ENSG//IT2//Projet Développement//donnees//1854_emprise.shp"
#shapefile = "D://pc//Documents//ENSG//IT2//Projet Développement//donnees//1871_L93_utf8_emprise.shp"
#shapefile = "D://pc//Documents//ENSG//IT2//Projet Développement//donnees//andriveau_l93_utf8_corr.shp"
#shapefile = "D://pc//Documents//ENSG//IT2//Projet Développement//donnees//jacoubet_l93_utf8.shp"


#nomMethode = sys.argv[2]
nomMethode = "rich_club_coefficient"



def set_shp(shapefile):
    
    #Ouvre un shp et récupère ses noms d'attributs
    source = ogr.Open(shapefile, update=True)
    layer = source.GetLayer()
    layer_defn = layer.GetLayerDefn()
    field_names = [layer_defn.GetFieldDefn(i).GetName() for i in range(layer_defn.GetFieldCount())]
    
    #Ajoute un nouvel attribut
    if not("LENGTH" in field_names):
        new_field = ogr.FieldDefn("LENGTH", ogr.OFTReal)
        layer.CreateField(new_field)
    
        #Remplir le nouvel attribut
        for feature in layer:
            geom = feature.GetGeometryRef()
            length = geom.Length()
            layer.SetFeature(feature)
            feature.SetField("LENGTH",length)
            layer.SetFeature(feature)

    #Fermer le shp
    source = None



def main(shapefile, nomMethode):
    """
    Fonction permettant de calculer un attribut particulier à un shp en utilisant la théorie des graphes.
    Les attributs sont :
        - basics
        - diameter
        - radius
        - number_connected_component
        - density
        - average_shortest_path_length
        - index_beta_gamma
        - index_pi_eta_theta
    """
    
    # Prétraitement du shp (création et calcul de la colonne LENGTH)
    set_shp(shapefile)
    
    # Transformation du shapefile en graphe
    G2 = nx.read_shp(shapefile)

    # On rend le graphe non-orienté
    G = G2.to_undirected()
    # print("coool",G.is_directed())

    #nx.draw_networkx(G)
    
    #print(G.edges(data=True)[0])

    if nomMethode == "basics":
        fun_basics(G)

    elif nomMethode == "diameter":
        fun_diameter(G)

    elif nomMethode == "radius":
        fun_radius(G)

    elif nomMethode == "number_connected_component":
        fun_number_connected_component(G)

    elif nomMethode == "density":
        fun_density(G)

    elif nomMethode == "average_shortest_path_length":
        fun_average_shortest_path_length(G,"LENGTH")
        
    elif nomMethode == "index_beta_gamma":
        fun_index_beta_gamma(G)
        
    elif nomMethode == "index_pi_eta_theta":
        fun_index_pi_eta_theta(G)
        
    elif nomMethode == "degree_centrality":
        fun_degree_centrality(G)
    
    elif nomMethode == "closeness_centrality":
        fun_closeness_centrality(G,"LENGTH")
    
    elif nomMethode == "betweenness_centrality":
        fun_betweenness_centrality(G,"LENGTH")
        
    elif nomMethode == "eigenvector_centrality":
        fun_eigenvector_centrality(G,"LENGTH")
        
    elif nomMethode == "katz_centrality":
        fun_katz_centrality(G,"LENGTH")
        
    elif nomMethode == "flow_hierarchy":
        fun_flow_hierarchy(G,"LENGTH")
        
    elif nomMethode == "clustering_coefficient":
        fun_clustering_coefficient(G,"LENGTH")
        
    elif nomMethode == "average_clustering_coefficient":
        fun_average_clustering_coefficient(G,"LENGTH")
    
    elif nomMethode == "rich_club_coefficient":
        fun_rich_club_coefficient(G)
        
    else :
        print("nom de méthode non défini")


#/////////////////////////////////////////////////////////////////////
# Taille du réseau
#/////////////////////////////////////////////////////////////////////


def fun_basics(G) :

    # Nombres de sommets
    nb_nodes = nx.number_of_nodes(G)
    
    # Nombres d'arcs
    nb_edges = nx.number_of_edges(G)
    
    # Longueur totale (somme des longueurs des arcs)
    total_length = 0
    list_edges = G.edges(data=True)
    for edge in list_edges:
        total_length += edge[-1]["LENGTH"]

    s = '{"basics":{"nb_nodes" : ' + str(nb_nodes) + ', "nb_edges" : ' + str(nb_edges) + ', "total_length" : ' + str(round(total_length)) + '}}'
    print(s)

def fun_diameter(G) :

    # Diamètre
    diameter = nx.diameter(G)

    s = '{"diameter" : ' + str(diameter) + '}'
    print(s)

def fun_radius(G) :

    # Rayon
    radius = nx.radius(G)

    s = '{"radius" : ' + str(radius) + '}'
    print(s)

def fun_number_connected_component(G) :

    # Nombres de composants connexes
    number_connected_components = nx.number_connected_components(G)

    s = '{"number_connected_components" : ' + str(number_connected_components) + '}'
    print(s)


# Trafic total (somme des trafics/poids des arcs)


#/////////////////////////////////////////////////////////////////////
# Organisation du réseau
#/////////////////////////////////////////////////////////////////////


# Indice de détour (Longueur du graphe rapportée à la longueur du réseau)

def fun_density(G) :

    # Densité (Longueur du graphe rapporté à la surface de l'espace étudié)
    density = nx.density(G)
    s = '{"density" : ' + str(density) + '}'
    print(s)

def fun_index_pi_eta_theta(G) :
    
    # Indice "pi" (Longueur du graphe rapportée à la longueur du diamètre)
    pi = 0
    
    # Indice "eta" (Longueur du graphe rapportée au nombre d'arcs)
    total_length = 0
    nb_edges = 0
    list_edges = G.edges(data=True)
    for edge in list_edges:
        total_length += edge[-1]["LENGTH"]
        nb_edges += 1
    eta = total_length / nb_edges
    
    # Indice "theta" (Traffic total rapporté au nombre de sommets)
    theta = 0
    
    s = '{"index_pi_eta_theta":{"pi" : ' + str(pi) + ', "eta" : ' + str(eta) + ', "theta" : ' + str(theta) + '}}'
    print(s)
    
#/////////////////////////////////////////////////////////////////////
# Mesures de la structure (Théorie des Graphes)
#/////////////////////////////////////////////////////////////////////


# Nombre cyclomatique (nombre maximum de cycles indépendants)

def fun_index_beta_gamma(G) :
    
    # Indice beta (nombre d'arcs sur nombre de sommets)
    beta = nx.number_of_edges(G) / nx.number_of_nodes(G)
    
    # Indice gamma (nombre d'arcs sur nombre maximum d'arcs possible)
    gamma = nx.number_of_edges(G) / (nx.number_of_nodes(G) - 2) * 3
    
    s = '{"index_beta_gamma":{"beta" : ' + str(beta) + ', "gamma" : ' + str(gamma) + '}}'
    print(s)
    
def fun_degree_centrality(G) :
         
    # Centralité de degré
    s = nx.degree_centrality(G)
    print(s)
 
def fun_closeness_centrality(G,weight) :
    
    # Centralité de proximité avec la prise en compte des distances
    s = nx.current_flow_closeness_centrality(G,weight)
    print(s)

def fun_betweenness_centrality(G,weight) :
    
    # Centralité d'intermédiarité
    s = nx.current_flow_betweenness_centrality(G,weight)
    print(s)

def fun_eigenvector_centrality(G,weight) :
    
    # Centralité de vecteur propre
    s = nx.eigenvector_centrality_numpy(G,weight)
    print(s)

def fun_katz_centrality(G,weight) :
    
    # Centralité de Katz
    s = nx.katz_centrality_numpy(G,0.1,1.0,True,weight)
    print(s)


#/////////////////////////////////////////////////////////////////////
# Mesures de la structure (complexité)
#/////////////////////////////////////////////////////////////////////


def fun_flow_hierarchy(G,weight):
    
    # Indice de hiérarchie (Scale-free)
    flow_hierarchy = nx.flow_hierarchy(G,weight)
    s = '{"flow_hierarchy" : ' + str(flow_hierarchy) + '}'
    print(s)

def fun_clustering_coefficient(G,weight) :
    
    # Transitivité (Clustering coefficient)
    clustering_coefficient = nx.clustering(G,None,weight)
    s = clustering_coefficient
    print(s)
    
def fun_average_clustering_coefficient(G,weight):
    
    # Transitivité (average clustering coefficient)
    average_clustering_coefficient = nx.average_clustering(G,None,weight)
    s = average_clustering_coefficient
    print(s)

def fun_average_shortest_path_length(G,weight=None) :
    # Longueur moyenne des plus courts chemin
    average_shortest_path_length = nx.average_shortest_path_length(G,weight)
    s = '{"average_shortest_path_length" : ' + str(average_shortest_path_length) + '}'
    print(s)

def fun_rich_club_coefficient(G):
    # Indice oligopolistique (Rich-club coefficient)
    rich_club_coefficient = nx.rich_club_coefficient(G)
    print(rich_club_coefficient)

toc = time.time()

main(shapefile, nomMethode)

tic = time.time()
print(tic-toc)
