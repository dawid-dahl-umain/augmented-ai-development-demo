import { CliDriver } from "./cli-driver"
import { CliOutputParser } from "./cli-output-parser"
import { CliResponseValidator } from "./cli-response-validator"
import type { ProtocolDriver } from "./interface"

export const createProtocolDriver = (protocol: string): ProtocolDriver => {
    switch (protocol) {
        case "cli":
            return new CliDriver(
                new CliResponseValidator(new CliOutputParser())
            )
        default:
            throw new Error(`Unknown protocol: ${protocol}`)
    }
}
