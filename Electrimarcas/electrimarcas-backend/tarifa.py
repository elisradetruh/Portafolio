import locale
import pandas as pd
import datetime
import unidecode

# Leer el CSV original (limpieza)
electrodomesticos = pd.read_csv(
    r'C:\Users\israe\OneDrive\Documentos\Universidad\Septimo Semestre\Taller de Inv 2\electrodomesticos_limpieza_200.csv',
    encoding='utf-8'
)

# Procesar limpieza
electrodomesticos['voltaje'] = electrodomesticos['voltaje'].astype(str).str.replace('V', '', regex=False).str.strip()
electrodomesticos['potencia'] = electrodomesticos['potencia'].astype(str).str.replace('W', '', regex=False).str.strip()
electrodomesticos['descripcion'] = electrodomesticos['descripcion'].astype(str).str.replace('"', '', regex=False).str.replace("'", '', regex=False)
electrodomesticos.insert(0, 'nombre_categoria', 'limpieza')

# Añadir IDs a limpieza
electrodomesticos.insert(0, 'id_categoria', 'C01')
electrodomesticos.insert(1, 'id_electrodomestico', ['E{:05d}'.format(i) for i in range(1, 1 + len(electrodomesticos))])
electrodomesticos.insert(2, 'id_marca', ['M{:05d}'.format(i) for i in range(1, 1 + len(electrodomesticos))])
electrodomesticos.insert(3, 'id_modelo', ['MD{:04d}'.format(i) for i in range(1, 1 + len(electrodomesticos))])

# Leer el CSV de cocina
cocina = pd.read_csv(
    r'C:\Users\israe\OneDrive\Documentos\Universidad\Septimo Semestre\Taller de Inv 2\electrodomesticos_cocina_200.csv',
    encoding='utf-8'
)

# Limpiar voltaje y potencia
cocina['voltaje'] = cocina['voltaje'].astype(str).str.replace('V', '', regex=False).str.strip()
cocina['potencia'] = cocina['potencia'].astype(str).str.replace('W', '', regex=False).str.strip()
cocina['descripcion'] = cocina['descripcion'].astype(str).str.replace('"', '', regex=False).str.replace("'", '', regex=False)
cocina.insert(0, 'nombre_categoria', 'cocina')

# Añadir IDs a cocina (continuando los existentes)
ultimo_id = len(electrodomesticos)
cocina.insert(1, 'id_electrodomestico', ['E{:05d}'.format(i) for i in range(ultimo_id + 1, ultimo_id + 1 + len(cocina))])
cocina.insert(3, 'id_marca', ['M{:05d}'.format(i) for i in range(ultimo_id + 1, ultimo_id + 1 + len(cocina))])
cocina.insert(5, 'id_modelo', ['MD{:04d}'.format(i) for i in range(ultimo_id + 1, ultimo_id + 1 + len(cocina))])

# Leer el CSV de entretenimiento
entretenimiento = pd.read_csv(
    r'C:\Users\israe\OneDrive\Documentos\Universidad\Septimo Semestre\Taller de Inv 2\electrodomesticos_entretenimiento_200.csv',
    encoding='utf-8'
)

# Limpiar voltaje y potencia de entretenimiento
entretenimiento['voltaje'] = entretenimiento['voltaje'].astype(str).str.replace('V', '', regex=False).str.strip()
entretenimiento['potencia'] = entretenimiento['potencia'].astype(str).str.replace('W', '', regex=False).str.strip()
entretenimiento['descripcion'] = entretenimiento['descripcion'].astype(str).str.replace('"', '', regex=False).str.replace("'", '', regex=False)
entretenimiento.insert(0, 'nombre_categoria', 'entretenimiento')

# Añadir IDs a entretenimiento (continuando los existentes)
ultimo_id = len(electrodomesticos) + len(cocina)
entretenimiento.insert(1, 'id_electrodomestico', ['E{:05d}'.format(i) for i in range(ultimo_id + 1, ultimo_id + 1 + len(entretenimiento))])
entretenimiento.insert(3, 'id_marca', ['M{:05d}'.format(i) for i in range(ultimo_id + 1, ultimo_id + 1 + len(entretenimiento))])
entretenimiento.insert(5, 'id_modelo', ['MD{:04d}'.format(i) for i in range(ultimo_id + 1, ultimo_id + 1 + len(entretenimiento))])

climatizacion = pd.read_csv(
    r'C:\Users\israe\OneDrive\Documentos\Universidad\Septimo Semestre\Taller de Inv 2\productos_climatizacion.csv',
    encoding='utf-8'
)
# Limpiar voltaje y potencia de entretenimiento
climatizacion['voltaje'] = climatizacion['voltaje'].astype(str).str.replace('V', '', regex=False).str.strip()
climatizacion['potencia'] = climatizacion['potencia'].astype(str).str.replace('W', '', regex=False).str.strip()
climatizacion['descripcion'] = climatizacion['descripcion'].astype(str).str.replace('"', '', regex=False).str.replace("'", '', regex=False)
climatizacion.insert(0, 'nombre_categoria', 'climatizacion')

# Añadir IDs a entretenimiento (continuando los existentes)
ultimo_id = len(electrodomesticos) + len(cocina) + len(entretenimiento)
climatizacion.insert(1, 'id_electrodomestico', ['E{:05d}'.format(i) for i in range(ultimo_id + 1, ultimo_id + 1 + len(climatizacion))])
climatizacion.insert(3, 'id_marca', ['M{:05d}'.format(i) for i in range(ultimo_id + 1, ultimo_id + 1 + len(climatizacion))])
climatizacion.insert(5, 'id_modelo', ['MD{:04d}'.format (i) for i in range(ultimo_id + 1, ultimo_id + 1 + len(climatizacion))])

cuidado = pd.read_csv(
    r'C:\Users\israe\OneDrive\Documentos\Universidad\Septimo Semestre\Taller de Inv 2\productos_cuidado_personal.csv',
    encoding='utf-8'
)

# Limpiar voltaje y potencia de cuidado
cuidado['voltaje'] = cuidado['voltaje'].astype(str).str.replace('V', '', regex=False).str.strip()
cuidado['potencia'] = cuidado['potencia'].astype(str).str.replace('W', '', regex=False).str.strip()
cuidado['descripcion'] = cuidado['descripcion'].astype(str).str.replace('"', '', regex=False).str.replace("'", '', regex=False)
cuidado.insert(0, 'nombre_categoria', 'cuidado')

# Añadir IDs a cuidado (continuando los existentes)
ultimo_id = len(electrodomesticos) + len(cocina) + len(entretenimiento) + len(climatizacion)
cuidado.insert(1, 'id_electrodomestico', ['E{:05d}'.format(i) for i in range(ultimo_id + 1, ultimo_id + 1 + len(cuidado))])
cuidado.insert(3, 'id_marca', ['M{:05d}'.format(i) for i in range(ultimo_id + 1, ultimo_id + 1 + len(cuidado))])
cuidado.insert(5, 'id_modelo', ['MD{:04d}'.format (i) for i in range(ultimo_id + 1, ultimo_id + 1 + len(cuidado))])

# Reordenar columnas para que coincidan
columnas_finales = [
    'nombre_categoria','id_electrodomestico', 'nombre_electrodomestico',
    'id_marca','nombre_marca','id_modelo','nombre_modelo','año_fabricacion',
    'descripcion','voltaje','potencia'
]
electrodomesticos = electrodomesticos[columnas_finales]
cocina = cocina[columnas_finales]
entretenimiento = entretenimiento[columnas_finales]
climatizacion = climatizacion[columnas_finales]
cuidado = cuidado[columnas_finales]

# Unir todos los DataFrames
tabla_final = pd.concat([electrodomesticos, cocina, entretenimiento, climatizacion, cuidado], ignore_index=True)

# Guardar el resultado
tabla_final.to_csv('tabla_electrodomesticos.csv', index=False)


