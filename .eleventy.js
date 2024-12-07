const { client } = require('./src/sanityClient');

module.exports = function (eleventyConfig) {
    markdownTemplateEngine: "njk";
    eleventyConfig.addPassthroughCopy('./src/css');
    eleventyConfig.addPassthroughCopy('./src/fonts');
    eleventyConfig.addPassthroughCopy('./src/img');
    eleventyConfig.addPassthroughCopy('./src/js');
    
    eleventyConfig.addCollection('posts', async function() {
      const posts = await client.fetch('*[_type == "post"]');
      return posts;
    });
    
    return {
      dir: {
        input: "src",
        output: "public",
      },
    };
  };