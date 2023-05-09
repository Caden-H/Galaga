import { defineConfig } from "vite";

const removeCrossorigin = () => {
  return {
    name: "no-attribute",
    transformIndexHtml(html: string) {
      return html.replace("crossorigin", "");
    },
  };
};

export default defineConfig({
  plugins: [removeCrossorigin()],
  base: "./",
  build: {
    minify: false,
  },
});
