export type PlayerMark = "X" | "O"

export interface ProtocolDriver {
    resetScenario(): Promise<void>
    startNewGame(): Promise<void>
    playMoves(moves: ReadonlyArray<number>): Promise<void>
    playMovesFromCsv(sequence: string): Promise<void>
    placeMark(position: number): Promise<void>
    submitInvalidInput(value: string): Promise<void>
    confirmInitialPlayer(expected: PlayerMark): Promise<void>
    confirmCurrentPlayer(expected: PlayerMark): Promise<void>
    confirmPositionEmpty(position: number): Promise<void>
    confirmPositionContains(position: number, mark: PlayerMark): Promise<void>
    confirmWinner(mark: PlayerMark): Promise<void>
    confirmDraw(): Promise<void>
    confirmMoveRejected(): Promise<void>
    confirmMoveCompleted(): Promise<void>
    confirmBoardTemplate(): Promise<void>
    confirmBoardIsEmpty(): Promise<void>
    confirmAllPositionsAreEmpty(): Promise<void>
    confirmTextInOutput(text: string): Promise<void>
    confirmExitCode(code: number): Promise<void>
}
