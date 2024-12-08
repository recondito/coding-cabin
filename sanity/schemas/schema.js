// schemas/schema.js
import createSchema from "part:@sanity/base/schema-creator";
import schemaTypes from "all:part:@sanity/base/schema-type";

// Definir el schema para los posts
const post = {
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string'
    },
    {
      name: 'author',
      title: 'Author',
      type: 'string'
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime'
    },
    {
      name: 'content',
      title: 'Content',
      type: 'text'
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true, // Permite seleccionar el área de la imagen (opcional)
      }
    }
  ]
};

export default createSchema({
  name: 'default',
  types: schemaTypes.concat([post]) // Agrega el schema del post a los tipos disponibles
});
