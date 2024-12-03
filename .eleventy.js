module.exports = function (eleventyConfig) {
    markdownTemplateEngine: "njk";
    return {
      dir: {
        input: "src",
        output: "public",
      },
    };
  };