import { CliDriver } from "./cli/driver"
import { CliOutputParser } from "./cli/output-parser"
import { CliResponseValidator } from "./cli/response-validator"
import type { ProtocolDriver } from "./interface"
import { WebDriver } from "./web/driver"
import { describeHeadlessState, resolveHeadlessPreference } from "./web/runtime"

let lastAnnouncedProtocol: string | null = null

const announceProtocol = (protocol: string): void => {
    if (lastAnnouncedProtocol === protocol) return
    lastAnnouncedProtocol = protocol
    console.log(`AAID acceptance driver: ${protocol}`)
}

export const createProtocolDriver = (protocol: string): ProtocolDriver => {
    switch (protocol) {
        case "cli":
            announceProtocol("cli")
            return new CliDriver(
                new CliResponseValidator(new CliOutputParser())
            )
        case "web":
            announceProtocol(
                `web (${describeHeadlessState(resolveHeadlessPreference())})`
            )
            return new WebDriver()
        default:
            throw new Error(`Unknown protocol: ${protocol}`)
    }
}
