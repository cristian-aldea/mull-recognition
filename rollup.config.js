import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

const inPath = "src/ts";
const outPath = "dist/js";

// configuration
const common = {
  format: "iife",
  name: "main",
};

const devOutput = {
  file: `${outPath}/main.js`,
  format: common.format,
  name: common.name,
  sourcemap: true,
};

const prodOutput = {
  file: `${outPath}/main.min.js`,
  format: common.format,
  name: common.name,
  plugins: [terser({ output: { comments: false } })],
  sourcemap: false,
};

const config = {
  input: `${inPath}/main.ts`,
  plugins: [typescript(), commonjs(), nodeResolve()],
  output: [devOutput, prodOutput],
};

export default config;
