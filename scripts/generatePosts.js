// scripts/generatePosts.js
const fs = require('fs')
const path = require('path')
const client = require('./sanity') // El cliente de Sanity que configuramos

// Ruta donde se generarán los archivos Markdown
const postsDir = path.join(__dirname, '../src/posts')

// Consulta para obtener los posts desde Sanity
const query = `*[_type == "post"]{
  title,
  author,
  publishedAt,
  content,
  "imageUrl": mainImage.asset->url
}`

async function fetchPosts() {
  try {
    const posts = await client.fetch(query)

    // Ver si la consulta devuelve posts
    console.log('Posts obtenidos:', posts)

    if (posts.length === 0) {
      console.log('No hay posts para generar.')
      return
    }

    // Por cada post obtenido, generamos un archivo Markdown
    posts.forEach((post) => {
      const fileName = `${post.title.toLowerCase().replace(/ /g, '-')}.md` // Usamos el título como nombre de archivo, con minúsculas y guiones
      const filePath = path.join(postsDir, fileName)

      // Crear el Front Matter para el archivo Markdown
      const frontMatter = 
`---
title: "${post.title}" 
author: "${post.author || 'Unknown'}" 
date: "${new Date(post.publishedAt).toISOString()}" 
image: "${post.imageUrl}"
---`

      const markdownContent = `${frontMatter}${post.content || 'No content available'}`

      // Escribir el archivo Markdown en la carpeta de posts
      fs.writeFileSync(filePath, markdownContent)
      console.log(`Post generado: ${filePath}`)
    })
  } catch (error) {
    console.error('Error al obtener posts:', error)
  }
}

// Ejecutamos la función para generar los archivos Markdown
fetchPosts()
