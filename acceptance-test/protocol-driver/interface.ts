export type PlayerMark = "X" | "O"

export interface ProtocolDriver {
    resetScenario(): Promise<void>
    startNewGame(): Promise<void>
    playMoves(moves: ReadonlyArray<number>): Promise<void>
    playMovesFromCsv(sequence: string): Promise<void>
    placeMark(position: number): Promise<void>
    submitInvalidInput(value: string): Promise<void>
    confirmInitialPlayer(expected: PlayerMark): void
    confirmCurrentPlayer(expected: PlayerMark): void
    confirmPositionEmpty(position: number): void
    confirmPositionContains(position: number, mark: PlayerMark): void
    confirmWinner(mark: PlayerMark): void
    confirmDraw(): void
    confirmMoveRejected(): void
    confirmMoveCompleted(): void
    confirmBoardTemplate(): void
    confirmBoardIsEmpty(): void
    confirmAllPositionsAreEmpty(): void
    confirmTextInOutput(text: string): void
    confirmExitCode(code: number): void
}
