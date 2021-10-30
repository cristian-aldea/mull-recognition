import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/ts/main.ts",
  plugins: [typescript(), commonjs(), nodeResolve()],
  output: {
    dir: "dist/js/",
    format: "es",
    name: "main",
    sourcemap: true,
  },
  preserveEntrySignatures: false,
};
