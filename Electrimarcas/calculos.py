#Calculos de los voltajes con la carga y el voltaje nominal en flask para mi aplicacion web

def calcular_voltaje_con_carga(Vn, R, I):
    Vc = Vn - (R * I)
    return Vc