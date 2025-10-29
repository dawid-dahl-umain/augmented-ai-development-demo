import { defineConfig } from "vitest/config"
import { fileURLToPath, URL } from "node:url"

if (typeof process.loadEnvFile === "function") {
    process.loadEnvFile()
}

export default defineConfig({
    resolve: {
        alias: {
            "#": fileURLToPath(new URL("./src", import.meta.url)),
            "#src": fileURLToPath(new URL("./src", import.meta.url))
        }
    },
    test: {
        reporters: "verbose"
    }
})
