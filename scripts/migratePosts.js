// migratePosts.js

const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')
const client = require('./sanity')  
const sharp = require('sharp') 
const dayjs = require('dayjs')
const markdownIt = require('markdown-it')
const markdownItAttrs = require('markdown-it-attrs')


const postsDir = path.join(__dirname, '../posts')
const uploadsDir = path.join(__dirname, '../uploads')

function generateSlug(title, date) {
    const formattedDate = dayjs(date).format('YYYY-MM-DD')
    const slug = title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-áéíóúüñ]/g, '') // Permitir caracteres con tildes y ñ
    return `${formattedDate}-${slug}`
}

// Configurar Markdown-it con el plugin para atributos de imagen
const md = markdownIt().use(markdownItAttrs)

// Función para leer los archivos de la carpeta de posts
async function migratePosts() {
  const files = fs.readdirSync(postsDir)  // Obtén todos los archivos en la carpeta /posts

  // Filtrar los archivos para solo incluir los que son archivos Markdown (.md)
  const markdownFiles = files.filter(file => file.endsWith('.md'))

  for (const file of markdownFiles) {
    const filePath = path.join(postsDir, file)
    const fileContents = fs.readFileSync(filePath, 'utf8')

    // Parsear el Front Matter y el Body del post
    const { data, content } = matter(fileContents)
    // Convertir el cuerpo de Markdown a BlockContent usando markdown-it
    const blockContent = convertMarkdownToBlockContent(content)
    const publishDate = dayjs(data.publishDate).format('YYYY-MM-DD')

    // Verifica si el post tiene imagen destacada
    let featuredImageAsset = null
    if (data.featuredImage) {
      const imagePath = path.join(uploadsDir, path.basename(data.featuredImage))

      if (fs.existsSync(imagePath)) {
        try {
          let imageBuffer = fs.readFileSync(imagePath)

          // Si la imagen es .avif, la convertimos a .png
          if (imagePath.endsWith('.avif')) {
            imageBuffer = await sharp(imageBuffer)
              .toFormat('png')  // Convertir a PNG
              .toBuffer()
            console.log(`Imagen ${data.featuredImage} convertida a PNG`)
          }

          // Subir la imagen a Sanity
          const imageAsset = await client.assets.upload('image', imageBuffer, {
            filename: path.basename(imagePath),
          })

          featuredImageAsset = {
            _type: 'image',
            asset: {
              _ref: imageAsset._id,
            },
          }
          console.log(`Imagen '${data.featuredImage}' subida a Sanity`)
        } catch (err) {
          console.error(`Error al procesar o subir la imagen '${data.featuredImage}':`, err)
        }
      } else {
        console.warn(`La imagen '${data.featuredImage}' no se encuentra en '/uploads'`)
      }
    }

    // Crear el documento para Sanity
    const postDocument = {
      _type: 'post',  // El tipo de documento en Sanity (asegúrate de que "post" esté definido en tu esquema)
      featured: data.featured,
      title: data.title,
      description: data.description,
      publishDate,
      category: data.category,
      language: data.language,
      author: data.author,
      minRead: data.minRead,
      featuredImage: featuredImageAsset,  // Si la imagen fue subida, agregamos la referencia
      body: blockContent,  // El contenido del post
      slug: { _type: 'slug', current: generateSlug(data.title, data.publishDate) },
    }

    try {
      // Subir el documento a Sanity
      const result = await client.create(postDocument)
      console.log('Post creado:', result.title)
    } catch (error) {
      console.error('Error al crear el post:', error)
    }
  }
}

// Función para convertir Markdown a BlockContent
function convertMarkdownToBlockContent(markdown) {
  const tokens = md.parse(markdown, {})
  const blockContent = []
  let currentBlock = { _type: 'block', children: [] }

  tokens.forEach((token, index) => {
    // Encabezados (H1, H2, H3, etc.)
    if (token.type === 'heading_open') {
      // Si ya había contenido, lo agregamos
      if (currentBlock.children.length > 0) {
        blockContent.push(currentBlock)
      }

      // Empezamos un nuevo bloque de encabezado
      currentBlock = { _type: 'block', children: [] }

      // Mapeamos el encabezado al tipo correcto de estilo
      const headingLevel = token.tag[1] // 'h1', 'h2', etc.
      currentBlock.style = `h${headingLevel}`
    }

    // Párrafos
    if (token.type === 'paragraph_open') {
      // Si ya había contenido, lo agregamos
      if (currentBlock.children.length > 0) {
        blockContent.push(currentBlock)
      }
      currentBlock = { _type: 'block', children: [] }
      currentBlock.style = 'normal'
    }

    // Manejo de texto en negrita y cursiva dentro de los bloques
    if (token.type === 'inline' && token.content) {
      // Si es negrita, agregar el estilo correspondiente
      let inlineStyle = { _type: 'span', text: token.content }
      if (token.markups && token.markups.includes('strong')) {
        inlineStyle = { _type: 'span', text: token.content, marks: ['strong'] }
      }
      // Si es cursiva
      if (token.markups && token.markups.includes('em')) {
        inlineStyle = { _type: 'span', text: token.content, marks: ['em'] }
      }
      // Añadimos el texto con estilo al bloque
      currentBlock.children.push(inlineStyle)
    }

    // Listas: manejo de listas
    if (token.type === 'bullet_list_open' || token.type === 'ordered_list_open') {
      // Preparar para agregar los ítems de lista en el bloque de listas
      const listItems = []
      token.items && token.items.forEach((item, index) => {
        // Aseguramos que cada ítem de la lista tenga un _key único
        listItems.push({
          _key: `list-item-${Date.now()}-${index}`, // Asignamos una clave única para cada ítem
          _type: 'listItem',
          children: [{
            _type: 'span',
            text: item.content,
          }],
        })
      })
      // Añadimos los ítems de lista como bloques
      blockContent.push({
        _type: 'block',
        children: listItems,
      })
    }

    // Cerrar bloque si es necesario
    if (token.type === 'paragraph_close' || token.type === 'heading_close') {
      if (currentBlock.children.length > 0) {
        blockContent.push(currentBlock)
      }
      currentBlock = { _type: 'block', children: [] }
    }
  })

  // Agregar el último bloque
  if (currentBlock.children.length > 0) {
    blockContent.push(currentBlock)
  }

  return blockContent
}

migratePosts()
