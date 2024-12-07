// src/sanityClient.js
const sanityClient = require('@sanity/client');

const client = sanityClient({
  projectId: process.env.SANITY_PROJECT_ID,  
  dataset: process.env.SANITY_DATASET,
  useCdn: true,
});

module.exports = { client };

// Push