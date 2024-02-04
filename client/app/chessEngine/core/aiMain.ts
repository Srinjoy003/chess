import { iterativeDeepeningSearch } from "./iterativeDeepening";
import { findOpeningMove } from "../openings/openingParser";
import { semiUCIToChessPosition } from "./aiHelperFunctions";

export function MakeEngineMove(
    boardState: string[][],
	currentTurn: string,
	prevMove: [number, number] | null,
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean],
	timeLimit: number,
    moveList: string[]): {
        finalBestMove: [number, number, string] | null;
        finalBestScore: number | null;
    }{
        const tick = performance.now()
        const openingMove = findOpeningMove(moveList)
        const tock = performance.now()
        console.log("Time for opening:", tock-tick)

        if(openingMove !== null){
            console.log("Opening Move:", openingMove)
            const fromIndex = semiUCIToChessPosition(openingMove.substring(0,2))
            const toIndex = semiUCIToChessPosition(openingMove.substring(2,4))
            const finalBestMove: [number, number, string] = [fromIndex, toIndex, ""]
            const finalBestScore = null
            return {finalBestMove, finalBestScore}

        }

        return iterativeDeepeningSearch(boardState, currentTurn, prevMove, whiteCastling, blackCastling, timeLimit)

}