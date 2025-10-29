import { createServer } from "node:http"
import type { IncomingMessage, ServerResponse } from "node:http"
import { readFile, stat } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, "..", "..", "..")
const publicDir = path.resolve(projectRoot, "public")
const distDir = path.resolve(projectRoot, "dist")

const mimeTypes: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8"
}

const tryResolve = async (
    baseDir: string,
    pathname: string
): Promise<string | undefined> => {
    const candidate = path.resolve(baseDir, `.${pathname}`)
    if (!candidate.startsWith(baseDir)) return undefined

    try {
        const info = await stat(candidate)
        if (info.isDirectory()) return undefined
        return candidate
    } catch (error) {
        const err = error as NodeJS.ErrnoException
        if (err.code === "ENOENT") return undefined
        throw error
    }
}

const resolveAssetPath = async (
    pathname: string
): Promise<string | undefined> => {
    if (pathname === "/") return path.resolve(publicDir, "tictactoe.html")

    if (pathname.startsWith("/frontend/")) {
        return tryResolve(distDir, pathname)
    }

    const fromPublic = await tryResolve(publicDir, pathname)
    if (fromPublic) return fromPublic

    return tryResolve(distDir, pathname)
}

const handleRequest = async (
    request: IncomingMessage,
    response: ServerResponse
) => {
    try {
        const url = new URL(request.url ?? "/", "http://localhost")
        const assetPath = await resolveAssetPath(url.pathname)

        if (!assetPath) {
            response.writeHead(404, {
                "Content-Type": "text/plain; charset=utf-8"
            })
            response.end("Not Found")
            return
        }

        const body = await readFile(assetPath)
        const ext = path.extname(assetPath)
        const contentType = mimeTypes[ext] ?? "application/octet-stream"

        response.writeHead(200, { "Content-Type": contentType })
        response.end(body)
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        response.writeHead(500, {
            "Content-Type": "text/plain; charset=utf-8"
        })
        response.end(`Internal Server Error: ${message}`)
    }
}

const server = createServer((req, res) => {
    void handleRequest(req, res)
})

const port = Number(process.env.UI_PORT ?? "5173")

server.listen(port, () => {
    // eslint-disable-next-line no-console -- CLI utility
    console.log(`Tic Tac Toe UI available at http://localhost:${port}`)
})
