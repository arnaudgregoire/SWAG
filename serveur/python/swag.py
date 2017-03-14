import numpy as np
import matplotlib
import networkx as nx
import sys



shapefile = sys.argv[1]
#shapefile = "donnees//1854_emprise.shp"

nomMethode = sys.argv[2]
#bomMethode = "degree"

def main(shapefile, nomMethode):
    """
    Fonction permettant de calculer un attribut particulier à un shp en utilisant la théorie des graphes.
    Les attributs sont :
        - basics
    """
    print(sys.argv)

    # Transformation du shapefile en graphe
    G = nx.read_shp(shapefile)

    # On rend le graphe non-orienté
    G = G.to_undirected()

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
        fun_average_shortest_path_length(G)

    else :
        print("nom de méthode non défini")


# Taille du réseau


def fun_basics(G) :

    # Nombres de sommets
    nb_nodes = nx.number_of_nodes(G)
    print("nb_nodes", nb_nodes)
    # Nombres d'arcs
    nb_edges = nx.number_of_edges(G)

    s = '{"basics":{"nb_nodes" : ' + str(nb_nodes) + ', "nb_edges" : ' + str(nb_edges) + '}}'
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

# Longueur totale (somme des longueurs des arcs)
# Trafic total (somme des trafics/poids des arcs)


# Organisation du réseau


# Indice de détour (Longueur du graphe rapportée à la longueur du réseau)
def fun_density(G) :

    # Densité (Longueur du graphe rapporté à la surface de l'espace étudié)
    density = nx.density(G)
    s = '{"density" : ' + str(density) + '}'
    print(s)

# Indice "pi" (Longueur du graphe rapportée à la longueur du diamètre)
# Indice "eta" (Longueur du graphe rapportée au nombre d'arcs)
# Indice "theta" (Traffic total rapporté au nombre de sommets)

# Mesures de la structure (Théorie des Graphes)

# Nombre cyclomatique (nombre maximum de cycles indépendants)
# Indice alpha (nombre de cycles sur nombres maximums de cycle possible)
# Indice beta (nombre d'arcs sur nombre de sommets)
# Indice gamma (nombre d'arcs sur nombre maximum d'arcs possible)
# Centralité (Somme des centralités individuelles des noeuds)

# Mesures de la structure (complexité)

# Indice de hiérarchie (Scale-free)
# Transitivité (Clustering coefficient)
# Transitivité (average clustering coefficient)
# Longueur moyenne des plus courts chemin
def fun_average_shortest_path_length(G) :
    # Longueur moyenne des plus courts chemin
    average_shortest_path_length = nx.average_shortest_path_length(G)
    s = '{"average_shortest_path_length" : ' + str(average_shortest_path_length) + '}'
    print(s)

# Indice oligopolistique (Rich-club coefficient)
#rich_club_coefficient = nx.rich_club_coefficient(G)
#print(rich_club_coefficient)

main(shapefile, nomMethode)
