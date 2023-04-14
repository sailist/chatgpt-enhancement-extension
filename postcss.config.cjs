/* eslint-disable @typescript-eslint/no-var-requires */
module.exports = {
  plugins: [
    require("tailwindcss/nesting"),
    require("tailwindcss"),
    require("postcss-prefix-selector")({
      ignoreFiles: ["index.html"],
      prefix: ".cee-root", // you can change this whatever you want
    }),
  ],
};
