import esbuild from "esbuild"
import {globby} from "globby"

const entryPoints = await globby(
  ["**/*.ts","/*.ts"],
  {
    ignore:[
      "node_modules/",
      ".out/"
    ]
  }
)
esbuild.build({
  entryPoints: entryPoints,
  outdir: ".out/",
  platform: "node"
})