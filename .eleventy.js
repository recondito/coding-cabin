module.exports = function (eleventyConfig) {
    markdownTemplateEngine: "njk";
    eleventyConfig.addPassthroughCopy('./src/css');
    eleventyConfig.addPassthroughCopy('./src/fonts');
    eleventyConfig.addPassthroughCopy('./src/img');
    eleventyConfig.addPassthroughCopy('./src/js');
    return {
      dir: {
        input: "src",
        output: "public",
      },
    };
  };