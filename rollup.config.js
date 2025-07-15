import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import inject from "@rollup/plugin-inject";
import json from "@rollup/plugin-json";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";

import { defineEnv } from "unenv";
import { nodeResolve } from "@rollup/plugin-node-resolve";

import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

export default async () => {
  const stringdec = fileURLToPath(
    new URL("./shims/string_decoder.js", import.meta.url),
  );

  const eventshim = fileURLToPath(
    new URL("./shims/events.js", import.meta.url),
  );

  const fsshim = fileURLToPath(
    new URL("./shims/fs.js", import.meta.url)
  );

  const stacktrace = readFileSync(
    new URL("./shims/stack_trace.js", import.meta.url),
    "utf-8",
  );

  const pkey = readFileSync("./private-key.pem", "utf-8");

  const { env } = defineEnv({
    nodeCompat: true,
    npmShims: true,
    resolve: true,
    overrides: {
      alias: {
        "graceful-fs": "fs",
        events: eventshim,
        fs: fsshim,
        string_decoder: stringdec,
        stream: "readable-stream",
        "node:events": eventshim,
        "node:fs": fsshim,
        "node:string_decoder": stringdec,
        "node:stream": "readable-stream",
      },
    },
  });

  const { alias: envAlias, inject: envInject, external } = env;

  const aliasEntries = Object.entries(envAlias).map(([find, replacement]) => ({
    find: new RegExp(`^${find}$`),
    replacement,
  }));

  return {
    input: "index.js",
    output: {
      dir: "dist",
      format: "esm",
      banner: stacktrace,
    },
    external,
    plugins: [
      replace({
        preventAssignment: true,
        delimiters: ["", ""],
        "commonjsGlobal.process": "unenvProcess",
        // regex fixes
        "const ID_START = /^[$_\\p{ID_Start}]$/u":
          "const ID_START = /^[$_a-zA-Z]$/",
        "const ID_CONTINUE = /^[$\\u200c\\u200d\\p{ID_Continue}]$/u":
          "const ID_CONTINUE = /^[$_a-zA-Z0-9\\u200c\\u200d]$/",
        // Inject private key
        __WEBHOOK_SECRET__: JSON.stringify(
          "RFevZu+Ei2rm98J/eI1uoyWtjEyVU1XimHvHbWbbCgc=",
        ),
        __PRIVATE_KEY__: JSON.stringify(pkey),
        __APP_ID__: "1446795",
      }),
      alias({
        entries: aliasEntries,
        customResolver: nodeResolve({ preferBuiltins: true }),
      }),
      nodeResolve({ preferBuiltins: true }),
      commonjs({
        include: /node_modules/,
        defaultIsModuleExports: "auto",
        transformMixedEsModules: true,
      }),
      inject({
        include: ["**/*.js", "**/*.mjs", "**/*.cjs"],
        modules: {
          ...envInject,
          clearImmediate: false,
          setImmediate: false,
          console: false,
        },
      }),
      json(),
    ],
    onwarn(warning, warn) {
      if (
        !["CIRCULAR_DEPENDENCY", "EVAL", "THIS_IS_UNDEFINED"].includes(
          warning.code || "",
        ) &&
        !warning.message.includes("Unsupported source map comment")
      ) {
        warn(warning);
      }
    },
  };
};
