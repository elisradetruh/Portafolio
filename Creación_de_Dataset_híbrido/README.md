# Creacion de Dataset Hibrido - Reconocimiento Facial con CNN

Proyecto integral de reconocimiento facial por fases, desde la captura de imagenes hasta la demo en vivo con camara.

Incluye:
- Construccion de dataset por persona.
- Preprocesamiento y aumento de datos.
- Entrenamiento CNN (ResNet18 / EfficientNet-B0).
- Inferencia en imagen y video en tiempo real.
- Calibracion de umbral de confianza.
- Evaluacion final y reporte consolidado.

---

## 1. Objetivo del proyecto

Construir un sistema de reconocimiento facial capaz de:
- Identificar personas conocidas.
- Rechazar predicciones de baja confianza como `Desconocido`.
- Funcionar en imagen estatica y en camara en tiempo real.

---

## 2. Estructura del repositorio

```text
Creacion_de_Dataset_hÃ­brido/
Face-Recognition Proyect/
Dataset/                     # Fase 1 (capturas crudas por persona)
Dataset_procesado/           # Fase 2
Dataset_aumentado/           # Fase 3
splits/                      # Fase 4
 models/                      # Fase 5 (checkpoints y mÃ©tricas)
resultados/                  # Fases 6â€“9 y demo
logs/                        # logs auxiliares
Scripts/
1_Captura.py
2_Preprocesar.py
3_Aumentar.py
4_preparar_clasificacion.py
5_entrenar_cnn.py
6_inferencia.py
7_pipeline_camara.py
8_umbral.py
9_evaluacion.py
demo.py
requirements.txt
README.md
```

---

## 3. Requisitos e instalaciÃ³n

## 3.1 Requisitos mÃ­nimos sugeridos

- Python 3.10 o 3.11.
- Webcam para fases de camara.
- GPU CUDA opcional (acelera entrenamiento/inferencia).

## 3.2 Crear entorno virtual

### Windows (PowerShell)

```powershell
cd "C:\Users\joeyk\OneDrive\Desktop\CNN\Creacion_de_Dataset_hibrido"
python -m venv venv
.\venv\Scripts\Activate.ps1
```

## 3.3 Instalar dependencias

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

Dependencias principales del proyecto:
- `opencv-python`
- `numpy`
- `pandas`
- `scikit-learn`
- `tqdm`
- `Pillow`
- `torch`, `torchvision`
- `matplotlib`, `seaborn`
- `mtcnn`

Nota:
- Para deteccion facial avanzada en inferencia/camara tambien se usa `facenet_pytorch` cuando esta disponible. Si no esta, el sistema usa Haar Cascade como fallback.

---

## 4. Formato de dataset soportado

Estructura actual soportada por las fases:

```text
Dataset/
Persona_1/
img1.jpg
img2.jpg
...
Persona_2/
...
```

---

## 5. Flujo completo (Fases 1 a 9)

Primero entra al proyecto:

```powershell
cd "C:\Users\joeyk\OneDrive\Desktop\CNN\Creacion_de_Dataset_hibrido\Face-Recognition Proyect"
```

## Fase 1 - Captura de dataset (`1_Captura.py`)

Que hace:
- Captura rostros desde camara y guarda imagenes por persona en `Dataset/`.

Parametros:

| Parametro | Tipo | Default | Descripcion |
|---|---|---:|---|
| `--persona` | str | `Joey` | Nombre de la persona (carpeta destino). |
| `--meta` | int | `220` | Cantidad de fotos nuevas a capturar. |
| `--cooldown` | float | `0.65` | Segundos minimos entre fotos. |
| `--fuente` | int | `0` | indice de camara. |

Comando ejemplo:

```powershell
python Scripts/1_Captura.py --persona "Joey" --meta 300 --cooldown 0.8
```

## Fase 2 - Preprocesamiento (`2_Preprocesar.py`)

Que hace:
- Detecta rostro, alinea/recorta y normaliza tamaño a 160x160.
- Guarda en `Dataset_procesado/`.

Parametros:

| Parametro | Tipo | Default | Descripcion |
|---|---|---:|---|
| `--confianza` | float | `0.90` | Umbral de deteccion MTCNN. |

Comando:

```powershell
python Scripts/2_Preprocesar.py --confianza 0.90
```

## Fase 3 - Aumento de datos (`3_Aumentar.py`)

Que hace:
- Genera variaciones de cada imagen (rotacion, brillo, espejo, ruido, etc.).
- Guarda en `Dataset_aumentado/`.

Parametros:

| Parametro | Tipo | Default | Descripcion |
|---|---|---:|---|
| `--factor` | int | `6` | Multiplicador total por imagen. |
| `--solo_basicas` | flag | `False` | Solo rotacion/brillo/espejo. |

Comando:

```powershell
python Scripts/3_Aumentar.py --factor 4
```

## Fase 4 - Splits train/val/test (`4_preparar_clasificacion.py`)

Que hace:
- Genera `train.csv`, `val.csv`, `test.csv` en `splits/`.
- Split estratificado por clase.
- Incluye proteccion contra fuga de datos agrupando por imagen base (`_augXX` queda en el mismo split que su original).

Parametros:

| Parametro | Tipo | Default | Descripcion |
|---|---|---:|---|
| `--train` | float | `0.70` | Proporcion train. |
| `--val` | float | `0.15` | Proporcion validacion. |
| `--test` | float | `0.15` | Proporcion test. |

Comando:

```powershell
python Scripts/4_preparar_clasificacion.py --train 0.70 --val 0.15 --test 0.15
```

## Fase 5 - Entrenamiento CNN (`5_entrenar_cnn.py`)

Que hace:
- Ejecuta el ciclo de entrenamiento y guarda los pesos óptimos (best_model.pth) junto con métricas de convergencia.
- Guarda `best_model.pth`, `metrics_test.json`, `history.json`.

Parametros:

| Parametro | Tipo | Default | Descripcion |
|---|---|---:|---|
| `--epochs` | int | `50` | Maximo de Epocas. |
| `--batch_size` | int | `32` | Tamaño de batch. |
| `--lr` | float | `0.0003` | Learning rate inicial. |
| `--img_size` | int | `160` | Tamaño de entrada de imagen. |
| `--num_workers` | int | `2` | Workers de DataLoader. |
| `--model_name` | str | `resnet18` | `resnet18` o `efficientnet_b0`. |
| `--grupos` | lista str | `None` | Filtro opcional de grupos si aplica. |

Comando recomendado:

```powershell
python Scripts/5_entrenar_cnn.py --epochs 50 --batch_size 32 --model_name resnet18
```

## Fase 6 - Inferencia en imagen (`6_inferencia.py`)

Que hace:
- Carga modelo entrenado y predice sobre una imagen.
- Guarda imagen anotada en `resultados/`.

ParÃ¡metros:

| Parametro | Tipo | Default | Descripcion |
|---|---|---:|---|
| `--imagen` | str | `None` | Ruta de imagen a analizar. |
| `--modelo` | str | `models/best_model.pth` | Checkpoint a usar. |
| `--mostrar` | flag | `False` | Abre ventana con la imagen anotada. |

Comando:

```powershell
python Scripts/6_inferencia.py --imagen "C:\Users\joeyk\Downloads\foto.jpg" --mostrar
```

## Fase 7 - Pipeline camara en vivo (`7_pipeline_camara.py`)

Que hace:
- Ejecuta deteccion + clasificacion en tiempo real.
- Puede grabar sesion en `resultados/grabaciones/`.

Parametros:

| Parametro | Tipo | Default | Descripcion |
|---|---|---:|---|
| `--fuente` | int | `0` | indice de camara. |
| `--skip_frames` | int | `2` | Recalcular cada N frames. |
| `--resize_factor` | float | `0.5` | Escalado para deteccion. |
| `--grabar` | flag | `False` | Graba video procesado. |
| `--modelo` | str | `models/best_model.pth` | Checkpoint. |

Comando:

```powershell
python Scripts/7_pipeline_camara.py --fuente 0 --skip_frames 2 --resize_factor 0.5 --grabar
```

## Fase 8 - Calibracion de umbral (`8_umbral.py`)

Que hace:
- Busca threshold optimo de confianza.
- Opcionalmente actualiza el checkpoint.

ParÃ¡metros:

| Parametro | Tipo | Default | Descripcion |
|---|---|---:|---|
| `--modelo` | str | `models/best_model.pth` | Checkpoint. |
| `--grafica` | flag | `False` | Genera curva PR/F1. |
| `--aplicar` | flag | `False` | Escribe threshold Ã³ptimo al checkpoint. |

Comando recomendado:

```powershell
python Scripts/8_umbral.py --grafica --aplicar
```

## Fase 9 - Evaluacion final (`9_evaluacion.py`)

Que hace:
- Consolida metricas del entrenamiento, umbral y rendimiento.
- Genera graficas y reporte final en JSON.

Parametros:

| Parametro | Tipo | Default | Descripcion |
|---|---|---:|---|
| `--modelo` | str | `models/best_model.pth` | Checkpoint. |
| `--curvas` | flag | `False` | Guarda curvas de entrenamiento. |
| `--confusion` | flag | `False` | Guarda matriz de confusion. |
| `--camara` | flag | `False` | Mide rendimiento en vivo. |
| `--guardar` | flag | `False` | Guarda `reporte_final.json`. |
| `--fuente` | int | `0` | CÃ¡mara para `--camara`. |
| `--duracion` | int | `30` | Segundos para medicion de camara. |

Comando completo:

```powershell
python Scripts/9_evaluacion.py --curvas --confusion --camara --guardar
```

## Demo unificada (`demo.py`)

Que hace:
- Punto de entrada final para usuario.
- Usa logica ya implementada en fases 6 y 7.

ParÃ¡metros:

| Parametro | Tipo | Default | Descripcion |
|---|---|---:|---|
| `--camara` | flag | `False` | Modo camara en vivo. |
| `--imagen` | str | `None` | Modo imagen esta¡tica. |
| `--grabar` | flag | `False` | Grabar sesion de ca¡mara. |
| `--mostrar` | flag | `False` | Mostrar imagen anotada. |
| `--modelo` | str | ruta por defecto del checkpoint | Modelo alternativo. |
| `--fuente` | int | `0` | Indice de camara. |

Comandos:

```powershell
python Scripts/demo.py --camara
python Scripts/demo.py --camara --grabar
python Scripts/demo.py --imagen "C:\Users\joeyk\Downloads\foto.jpg" --mostrar
```

---

## 6. Comandos rapidos por escenario

## 6.1 Pipeline desde cero

```powershell
python Scripts/1_Captura.py --persona "Joey" --meta 300 --cooldown 0.8
python Scripts/2_Preprocesar.py --confianza 0.90
python Scripts/3_Aumentar.py --factor 4
python Scripts/4_preparar_clasificacion.py --train 0.70 --val 0.15 --test 0.15
python Scripts/5_entrenar_cnn.py --epochs 50 --batch_size 32 --model_name resnet18
python Scripts/8_umbral.py --grafica --aplicar
python Scripts/9_evaluacion.py --curvas --confusion --guardar
python Scripts/demo.py --camara
```

## 6.2 Rehacer solo splits (Fase 4)

```powershell
Remove-Item ".\splits" -Recurse -Force -ErrorAction SilentlyContinue
python Scripts/4_preparar_clasificacion.py --train 0.70 --val 0.15 --test 0.15
```

## 6.3 Reentrenar desde Fase 5

```powershell
Remove-Item ".\models\best_model.pth" -Force -ErrorAction SilentlyContinue
Remove-Item ".\models\last_model.pth" -Force -ErrorAction SilentlyContinue
Remove-Item ".\models\history.json" -Force -ErrorAction SilentlyContinue
Remove-Item ".\models\metrics_test.json" -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force ".\models" | Out-Null
python Scripts/5_entrenar_cnn.py --epochs 50 --batch_size 32 --model_name resnet18
python Scripts/8_umbral.py --grafica --aplicar
```

---

## 7. Integrantes

- Rodriguez Rojo Israel Josue - 22170799
- Samano Machado Kevin Jasiel - 22170815
- Quevedo Castellon Joey Kelvin - 22170777



