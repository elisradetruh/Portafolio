import pandas as pd

# Diccionario para mapear nombre_categoria a id_categoria según tu imagen
categoria_ids = {
    'cocina': 'C01',
    'limpieza': 'C02',
    'entretenimiento': 'C03',
    'climatizacion': 'C04',
    'cuidado': 'C05'
}

# Leer el CSV
df = pd.read_csv('tabla_electrodomesticos.csv', encoding='utf-8')

# Normalizar nombres para evitar errores de mayúsculas/minúsculas
df['nombre_categoria'] = df['nombre_categoria'].str.lower().str.strip()

# Crear la columna id_categoria usando el diccionario
df['id_categoria'] = df['nombre_categoria'].map(categoria_ids)

# Reordenar columnas: poner id_categoria antes de nombre_categoria
cols = df.columns.tolist()
cols.insert(cols.index('nombre_categoria'), cols.pop(cols.index('id_categoria')))
df = df[cols]

# Guardar el nuevo CSV
df.to_csv('tabla_electrodomesticos.csv', index=False)