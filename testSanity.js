const client = require('./scripts/sanity')

// Hacemos una consulta simple para probar que la conexión funcione
client.fetch('*[_type == "post"]{title, publishedAt}')
  .then(posts => {
    console.log(posts)
  })
  .catch(err => {
    console.error('Error fetching posts:', err)
  })
