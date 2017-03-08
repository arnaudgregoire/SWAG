import networkx as nx

shapefile = 'D://SWAG-master//SWAG-master//donnees//1854_emprise.shp'

def test(shapefile):
    G = nx.read_shp(shapefile)
    print(nx.number_of_nodes(G))

def main(shapefile):

    G = nx.read_shp(shapefile)
    
    # Taille du réseau
    
    # Nombres de sommets
    nb_nodes = nx.number_of_nodes(G)
    print(nb_nodes)
    # Nombres d'arcs
    nb_edges = nx.number_of_edges(G)
    print(nb_edges)
    # Centre
    center = nx.center(G)
    print(center)
    # Diamètre
    diameter = nx.diameter(G)
    print(diameter)
    # Eccentricité
    eccentricity = nx.eccentricity(G)
    print(eccentricity)
    # Périphérie
    periphery = nx.periphery(G)
    print(periphery)
    # Rayon
    radius = nx.radius(G)
    print(radius)
    # Nombres de composants connexes
    number_connected_components = nx.number_connected_components(G)
    print(number_connected_components)
    # Longueur totale (somme des longueurs des arcs)
    # Trafic total (somme des trafics/poids des arcs)
    
    # Organisation du réseau
    
    # Indice de détour (Longueur du graphe rapportée à la longueur du réseau)
    # Densité (Longueur du graphe rapporté à la surface de l'espace étudié)
    density = nx.density(G)
    print(density)
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
    average_shortest_path_length = nx.average_shortest_path_length(G)
    print(average_shortest_path_length)
    # Indice oligopolistique (Rich-club coefficient)
    rich_club_coefficient = nx.rich_club_coefficient(G)
    print(rich_club_coefficient)
    
test(shapefile)
