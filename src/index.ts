import type { AstroAdapter, AstroIntegration } from "astro";


function getAdapter(): AstroAdapter {
  return {
    name: "checkoutjoy-astro-ssr",
    serverEntrypoint: `./entrypoint`,
    exports: ["handler"],
  };
}

export default function createIntegration(): AstroIntegration {
  return {
    name: "checkoutjoy-astro-ssr",
    hooks: {
      "astro:config:done": ({ setAdapter }) => {
        setAdapter(getAdapter());
      },
    },
  };
}