import sys

print(sys.argv)

fichier = open(sys.argv[1])
a = fichier.readlines()
print(a)
print("bonjour")