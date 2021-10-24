import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

// Configs
var configs = {
  files: ["main.js"],
  formats: ["iife", "es"],
  default: "iife",
  pathIn: "src/js",
  pathOut: "dist/js",
  minify: true,
  sourceMap: false,
};

// Banner
var banner = `/* ${pkg.name} ${
  pkg.version ? "v" + pkg.version + " " : ""
}| (c) ${new Date().getFullYear()}, ${pkg.author.name} | ${pkg.license} License${
  pkg.repository.url ? " | " + pkg.repository.url : ""
} */`;

/**
 *
 * @param {string} filename
 * @param {boolean} minify
 * @returns output object
 */
var createOutput = (filename, minify) => {
  return configs.formats.map((format) => {
    var output = {
      file: `${configs.pathOut}/${filename}${format === configs.default ? "" : `.${format}`}${
        minify ? ".min" : ""
      }.js`,
      format: format,
      banner: banner,
      name: filename,
    };
    if (minify) {
      output.plugins = [terser()];
    }

    output.sourcemap = configs.sourceMap;

    return output;
  });
};

/**
 * Create output formats
 * @param  {string} filename The filename
 * @return {Array}           The outputs array
 */
var createOutputs = (filename) => {
  // Create base outputs
  var outputs = createOutput(filename);

  // If not minifying, return outputs
  if (!configs.minify) return outputs;

  // Otherwise, ceate second set of outputs
  var outputsMin = createOutput(filename, true);

  // Merge and return the two arrays
  return outputs.concat(outputsMin);
};

/**
 * Create export object
 * @return {Array} The export object
 */
var createExport = (file) => {
  return configs.files.map((file) => {
    return {
      input: `${configs.pathIn}/${file}`,
      output: createOutputs(file.replace(".js", "")),
    };
  });
};

console.log(JSON.stringify(createExport(), null, 2));
console.log(terser());

export default createExport();
