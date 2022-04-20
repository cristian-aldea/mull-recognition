export default {
  build: {
    target: "es2015",
    minify: "terser",
    terserOptions: {
      format: {
        comments: false,
      },
    },
  },
  server: {
    open: true,
    port: 8080,
    strictPort: true,
  },
};
