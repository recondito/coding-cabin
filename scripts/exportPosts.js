// scripts/exportPosts.js
const fs = require('fs');
const path = require('path');
const sanityClient = require('@sanity/client');

// Configura el cliente de Sanity
const client = sanityClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  useCdn: true,  // Usar la CDN para obtener los datos más rápido (ideal para producción)
});

// Consulta de posts desde Sanity
const query = '*[_type == "post"]';

async function exportPosts() {
  try {
    // Recuperar los posts de Sanity
    const posts = await client.fetch(query);

    // Crear la carpeta posts si no existe
    const postsDir = path.join(__dirname, '../src/posts');
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir);
    }

    // Iterar sobre los posts y crear archivos Markdown
    posts.forEach((post) => {
      const { title, mainImage, body, _createdAt, slug } = post;

      // Crear un front matter para el archivo Markdown
      const frontMatter = `---
title: "${title}"
image: "${mainImage?.asset?.url || ''}"
date: "${_createdAt}"
slug: "${slug?.current || ''}"
---
`;

      // Crear contenido Markdown (puedes convertir el contenido si lo necesitas)
      const markdownContent = `${body}`; // O aquí puedes hacer un proceso si necesitas convertir a Markdown

      // Crear el archivo Markdown
      const filePath = path.join(postsDir, `${slug.current}.md`);
      fs.writeFileSync(filePath, frontMatter + markdownContent);
      console.log(`Post exportado: ${filePath}`);
    });
  } catch (err) {
    console.error('Error al exportar los posts:', err);
  }
}

// Ejecutar el script
exportPosts();
