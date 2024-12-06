// Importamos el cliente de Sanity usando el named export
const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');

// Inicializamos el cliente de Sanity
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,  // Asegúrate de que esta variable esté configurada correctamente en Netlify
  dataset: process.env.SANITY_DATASET,       // Asegúrate de que esta variable esté configurada correctamente en Netlify
  useCdn: true,  // Usar la CDN para obtener los datos más rápido (ideal para producción)
  apiVersion: '2024-01-01',  // Define la versión de la API de Sanity (asegúrate de usar la versión más reciente o la que prefieras)
});

// Ruta a la carpeta donde se guardarán los archivos de posts
const postsDir = path.join(__dirname, '../src/posts');

// Crear la carpeta si no existe
if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

// Función para obtener los posts desde Sanity
async function fetchPosts() {
  const query = `*[_type == "post"]{title, slug, mainImage, _createdAt, body}`;
  const posts = await client.fetch(query);
  return posts;
}

// Función para exportar cada post a un archivo Markdown
async function exportPosts() {
  const posts = await fetchPosts();
  
  posts.forEach((post) => {
    // Crea el front matter para cada post
    const frontMatter = `---
title: "${post.title}"
image: "${post.mainImage.asset.url}"
date: "${new Date(post._createdAt).toISOString()}"
slug: "${post.slug.current}"
---`;

    // Crear el contenido del archivo markdown
    const content = `${frontMatter}\n\n${post.body}`;

    // Guardar el archivo Markdown
    const filePath = path.join(postsDir, `${post.slug.current}.md`);
    fs.writeFileSync(filePath, content);
    console.log(`Archivo generado: ${filePath}`);
  });
}

// Ejecutar la función de exportación
exportPosts()
  .then(() => {
    console.log('Posts exportados exitosamente.');
  })
  .catch((error) => {
    console.error('Error al exportar los posts:', error);
  });
