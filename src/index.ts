import { CliRunner } from "#src/adapters/cli/runner/cli-runner"

const main = (): number => {
    const [, , ...argv] = process.argv

    const runner = new CliRunner()

    return runner.run(argv)
}

const code = main()

if (code !== 0) process.exitCode = code
