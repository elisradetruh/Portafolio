// backend/utils/dataFormatter.js

// const COLOR_PALETTE = [
//     // Par 1: Azul/Cian
//     { c1: "#005CB3", c2: "#00B3CC" }, 
//     // Par 2: Verde Esmeralda
//     { c1: "#008060", c2: "#00CC99" },
//     // Par 3: Púrpura/Magenta
//     { c1: "#600080", c2: "#9900CC" },
//     // Par 4: Amarillo/Dorado
//     { c1: "#B39500", c2: "#FFCC00" }, 
//     // Par 5: Rojo/Naranja
//     { c1: "#C71F00", c2: "#ED2500" },
//     // Par 6: Azul Marino/Claro
//     { c1: "#E600BF", c2: "#8F0075" },
//     // Par 7: Gris
//     { c1: "#8f8e8eff", c2: "#706f6fff" },
//   ];

function formatDataForChartJS(datosRaw) {
  // Extraer las etiquetas (eje X) y los valores (eje Y)
  const labels = datosRaw.map(item => item.nombre_electrodomestico);
  const values = datosRaw.map(item => item.consumo_total_kwh);
  // const backgroundColors = values.map((value, index) => {
  //       const colorIndex = index % COLOR_PALETTE.length;
  //       return COLOR_PALETTE[colorIndex].c1; // Usamos solo el color principal (c1)
  //   });

  return {
    labels: labels, //
    datasets: [
      {
        label: 'Consumo kWh',
        data: values, // [40, 60, 35, 75]
      }
    ]
  };
}

function formatDataForCardList(datosRaw) {

    if (!Array.isArray(datosRaw) || datosRaw.length === 0) {
        return []; 
    }

    // Mapeamos los datos de la DB al formato que espera el componente Card
    return datosRaw.map((item, index) => {
        // La operación de módulo (%) garantiza que el índice siempre esté dentro del rango de COLOR_PALETTE
        // const colorIndex = index % COLOR_PALETTE.length;
        // const colorPair = COLOR_PALETTE[colorIndex];

        return {
            id: item.id,
            title: item.nombre_electrodomestico, 
            description: `Modelo: ${item.id_modelo} | Potencia: ${item.potencia}W | ${item.descripcion || 'Sin descripción'}`, 
             // Asigna el primer color del par
        };
    });
}
module.exports = { formatDataForChartJS,formatDataForCardList };