#import numpy as np
#import matplotlib
import networkx as nx
import sys
from osgeo import ogr

import time


shapefile = sys.argv[1]

#shapefile = "D://pc//Documents//ENSG//IT2//Projet Développement//donnees//1854_emprise.shp"
#shapefile = "D://pc//Documents//ENSG//IT2//Projet Développement//donnees//1871_L93_utf8_emprise.shp"
#shapefile = "D://pc//Documents//ENSG//IT2//Projet Développement//donnees//andriveau_l93_utf8_corr.shp"
#shapefile = "D://pc//Documents//ENSG//IT2//Projet Développement//donnees//jacoubet_l93_utf8.shp"


nomMethode = sys.argv[2]

#nomMethode = "closeness_centrality"



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


#/////////////////////////////////////////////////////////////////////
# Organisation du réseau
#/////////////////////////////////////////////////////////////////////


def fun_density(G) :

    # Densité (Longueur du graphe rapporté à la surface de l'espace étudié)
    density = nx.density(G)
    s = '{"density" : ' + str(density) + '}'
    print(s)

def fun_index_pi_eta(G) :
    
    e = nx.number_of_edges(G)
    
    d = nx.diameter(G)
    
    total_length = 0
    list_edges = G.edges(data=True)
    for edge in list_edges:
        total_length += edge[-1]["LENGTH"]
        
    # Indice "pi" (Longueur du graphe rapportée à la longueur du diamètre)
    pi = total_length / d
    
    # Indice "eta" (Longueur du graphe rapportée au nombre d'arcs)
    eta = total_length / e
    
    s = '{"index_pi_eta":{"pi" : ' + str(pi) + ', "eta" : ' + str(eta) + '}}'
    print(s)
    
    
#/////////////////////////////////////////////////////////////////////
# Mesures de la structure (Théorie des Graphes)
#/////////////////////////////////////////////////////////////////////


def fun_cyclomatic_number(G):
    
    # Nombre cyclomatique (nombre maximum de cycles indépendants)
    v = nx.number_of_nodes(G)
    e = nx.number_of_edges(G)
    p = nx.number_connected_components(G)
    
    u = e - v + p
    
    s = '{"cyclomatic_number":' + str(u) + '}'
    print(s)

def fun_index_alpha_beta_gamma(G) :
    
    v = nx.number_of_nodes(G)
    e = nx.number_of_edges(G)
    p = nx.number_connected_components(G)
    
    u = e - v + p
    
    # Indice alpha (nombre de cycles sur le nombre de cycles maximum)
    alpha = u / (2*v - 5)
    
    # Indice beta (nombre d'arcs sur nombre de sommets)
    beta = e / v
    
    # Indice gamma (nombre d'arcs sur nombre maximum d'arcs possible)
    gamma = e / (v - 2) / 3
    
    s = '{"index_alpha_beta_gamma":{"alpha" : ' + str(alpha) + ', "beta" : ' + str(beta) + ', "gamma" : ' + str(gamma) + '}}'
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


#/////////////////////////////////////////////////////////////////////
#/////////////////////////////////////////////////////////////////////

# Main

#/////////////////////////////////////////////////////////////////////
#/////////////////////////////////////////////////////////////////////


def main(shapefile, nomMethode):
    """
    Fonction permettant de calculer un attribut particulier à un shp en utilisant la théorie des graphes.
    
    Les attributs sont :
        
        - basics
        
        - diameter
        - radius
        - number_connected_component
        
        - density
        - index_alpha_beta_gamma
        - index_pi_eta_theta
        
        - degree_centrality
        - closeness_centrality
        - betweenness_centrality
        - eigenvector_centrality
        - katz_centrality
        
        - average_shortest_path_length
        - clustering_coefficient
        - average_clustering_coefficient
    """
    
    try:
        
    
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
    
        elif nomMethode == "index_alpha_beta_gamma":
            fun_index_alpha_beta_gamma(G)
            
        elif nomMethode == "index_pi_eta_theta":
            fun_index_pi_eta(G)
            
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
            
        elif nomMethode == "clustering_coefficient":
            fun_clustering_coefficient(G,"LENGTH")
            
        elif nomMethode == "average_clustering_coefficient":
            fun_average_clustering_coefficient(G,"LENGTH")
            
        elif nomMethode == "cyclomatic_number":
            fun_cyclomatic_number(G)
        
        elif nomMethode == "average_shortest_path_length":
            fun_average_shortest_path_length(G,"LENGTH")
            
        else :
            print("nom de méthode non défini")
    
    except:
        print("erreur")


#/////////////////////////////////////////////////////////////////////
#/////////////////////////////////////////////////////////////////////
#/////////////////////////////////////////////////////////////////////
#/////////////////////////////////////////////////////////////////////


toc = time.time()

main(shapefile, nomMethode)

tic = time.time()
#print("time" + str(tic-toc))
