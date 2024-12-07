// Importamos el cliente de Sanity usando el named export
const { createClient } = require('@sanity/client');

// Creamos el cliente de Sanity usando las variables de entorno
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,  // Tu ID de proyecto de Sanity
  dataset: process.env.SANITY_DATASET,       // El dataset de Sanity
  useCdn: true,  // Usar la CDN de Sanity para obtener los datos más rápido (ideal para producción)
  apiVersion: '2024-01-01',  // Definir la versión de la API de Sanity (ajusta la fecha si lo prefieres)
});

module.exports = { client };
