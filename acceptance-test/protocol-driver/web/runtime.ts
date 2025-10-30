import { execFile, spawn, type ChildProcess } from "node:child_process"
import process from "node:process"
import { setTimeout as delay } from "node:timers/promises"
import {
    chromium,
    type Browser,
    type BrowserContext,
    type Page
} from "playwright"

type ExecOutcome = { stdout: string; stderr: string; code: number }

const execFilePromise = (
    cmd: string,
    args: ReadonlyArray<string>
): Promise<ExecOutcome> =>
    new Promise(resolve => {
        execFile(cmd, [...args], (error, stdout, stderr) => {
            const code =
                error &&
                typeof (error as unknown as { code?: number }).code === "number"
                    ? (error as unknown as { code: number }).code
                    : 0

            resolve({ stdout: String(stdout), stderr: String(stderr), code })
        })
    })

let didBuild = false

const ensureBuild = async (): Promise<void> => {
    if (didBuild) return

    const pnpmCmd = process.platform === "win32" ? "pnpm.cmd" : "pnpm"

    await execFilePromise(pnpmCmd, ["run", "build"])

    didBuild = true
}

const uiPort = Number(process.env.UI_PORT ?? "5173")
const baseUrlEnv = process.env.UI_BASE_URL
const baseUrl = baseUrlEnv
    ? `${baseUrlEnv.replace(/\/$/, "")}:${uiPort}`
    : `http://localhost:${uiPort}`

export const getWebBaseUrl = (): string => baseUrl

const normalizeFlag = (value: string): string => value.trim().toLowerCase()

const TRUE_FLAG_VALUES = new Set(["true", "1", "yes", "on"])
const FALSE_FLAG_VALUES = new Set(["false", "0", "no", "off"])

const parseBooleanFlag = (value: string | undefined): boolean | undefined => {
    if (value === undefined) return undefined
    const normalized = normalizeFlag(value)
    if (TRUE_FLAG_VALUES.has(normalized)) return true
    if (FALSE_FLAG_VALUES.has(normalized)) return false
    return undefined
}

export const resolveHeadlessPreference = (): boolean => {
    const pwdebug = process.env.PWDEBUG
    if (pwdebug !== undefined) {
        return parseBooleanFlag(pwdebug) === false ? true : false
    }

    const headlessFlag = parseBooleanFlag(process.env.PLAYWRIGHT_HEADLESS)
    if (headlessFlag !== undefined) return headlessFlag

    return true
}

export const describeHeadlessState = (headless: boolean): string =>
    headless ? "headless" : "headed"

let serverProcess: ChildProcess | null = null
let serverReadyPromise: Promise<void> | undefined

const isServerAvailable = async (): Promise<boolean> => {
    try {
        const response = await fetch(baseUrl, { method: "GET" })
        return response.ok
    } catch {
        return false
    }
}

const waitForServer = async (): Promise<void> => {
    const deadline = Date.now() + 10_000

    while (Date.now() < deadline) {
        try {
            const response = await fetch(baseUrl, { method: "GET" })
            if (response.ok) return
        } catch {
            // Ignore and retry until the deadline
        }

        await delay(200)
    }

    throw new Error("Timed out waiting for web server to start")
}

const ensureServerStarted = async (): Promise<void> => {
    await ensureBuild()

    if (serverProcess && !serverProcess.killed) {
        await serverReadyPromise
        return
    }

    if (await isServerAvailable()) {
        serverReadyPromise = Promise.resolve()
        return
    }

    const command = process.execPath
    const args = ["dist/adapters/web/server.js"]

    serverProcess = spawn(command, args, {
        env: { ...process.env, UI_PORT: String(uiPort) },
        stdio: "inherit"
    })

    serverProcess.on("exit", code => {
        if (code !== null && code !== 0) {
            didBuild = false
        }
    })

    process.once("exit", () => {
        serverProcess?.kill()
    })

    serverReadyPromise = waitForServer()
    await serverReadyPromise
}

let browserPromise: Promise<Browser> | null = null

const ensureBrowser = async (): Promise<Browser> => {
    if (!browserPromise) {
        browserPromise = chromium.launch({
            headless: resolveHeadlessPreference()
        })

        process.once("exit", async () => {
            if (!browserPromise) return
            const browser = await browserPromise.catch(() => null)
            await browser?.close()
        })
    }

    return browserPromise
}

export const prepareWebPage = async (): Promise<{
    page: Page
    context: BrowserContext
}> => {
    await ensureServerStarted()

    const browser = await ensureBrowser()
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto(baseUrl, { waitUntil: "load" })
    await page.waitForSelector("#board .cell")

    return { page, context }
}
