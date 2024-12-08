// scripts/sanity.js
const { createClient } = require('@sanity/client');

// Configura tu cliente de Sanity con tu ID de proyecto y dataset
const client = createClient({
  projectId: 'lxyz888x',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2023-10-01',
});

module.exports = client;
