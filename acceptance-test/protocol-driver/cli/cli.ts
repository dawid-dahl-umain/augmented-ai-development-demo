import { execFile } from "node:child_process"

export type CliResult = { stdout: string; code: number }

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

const runCli = async (args: ReadonlyArray<string>): Promise<CliResult> => {
    await ensureBuild()

    const result = await execFilePromise(process.execPath, [
        "dist/index.js",
        ...args
    ])

    return { stdout: result.stdout, code: result.code }
}

export const cliDriver = {
    run: runCli,
    reset: (): void => {
        didBuild = false
    }
}
