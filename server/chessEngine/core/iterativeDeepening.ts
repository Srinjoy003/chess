import { Minimax } from "./aiSearch";
import { TranspositionTable } from "./aiSearch";
import { extractChessPosition } from "./aiHelperFunctions";
import { MATE_VAL } from "./aiSearch";

export function iterativeDeepeningSearch(
	boardState: string[][],
	currentTurn: string,
	prevMove: [number, number] | null,
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean],
	timeLimit: number
): {
	finalBestMove: [number, number, string] | null;
	finalBestScore: number | null;
} {
	let previousIterationBestMove: [number, number] | null = null;
	const cancel = { isCancelled: false };
	const endTime = Date.now() + timeLimit;
	let depth = 1;
	const maximising = currentTurn === "w" ? true : false;
	let finalBestMove: [number, number, string] | null = null;
	let finalBestScore: number | null = null;

	while (true) {
		const nodeCount = { value: 0 };
		const transpositionTable: TranspositionTable = {};
		const tick = performance.now();

		const { bestMove, bestScore } = Minimax(
			depth,
			boardState,
			currentTurn,
			prevMove,
			whiteCastling,
			blackCastling,
			maximising,
			nodeCount,
			transpositionTable,
			endTime,
			cancel,
			previousIterationBestMove
		);
		const tock = performance.now();

		if (bestMove !== null) {
			const [fromIndex, toIndex, promotionMove] = bestMove;
			const fromPos = extractChessPosition(fromIndex);
			const toPos = extractChessPosition(toIndex);

			console.log(
				"Depth:",
				depth,
				" Move:",
				fromPos + toPos + promotionMove,
				" Eval:",
				bestScore
			);
			console.log("Previous Best Move:", previousIterationBestMove);

			previousIterationBestMove = [bestMove[0], bestMove[1]];
		}

		console.log("Time: ", tock - tick);
		console.log("Nodes Searched: ", nodeCount.value);
		console.log("isCancelled:", cancel.isCancelled);
		console.log("\n\n");

		if (cancel.isCancelled) {
			if (finalBestMove === null) {
				finalBestMove = bestMove;
				finalBestScore = bestScore;
			}
			break;
		}

		finalBestMove = bestMove;
		finalBestScore = bestScore;
		depth++;
	}

	return { finalBestMove, finalBestScore };
}
