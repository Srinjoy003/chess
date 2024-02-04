import { fenToChessboard, printChessboard } from "../core/aiHelperFunctions";
import { Evaluate } from "../core/evaluation";

const evaluationTestPositions = [
	{
		fen: "r1bqkbnr/ppppppp1/2n4p/8/3P4/8/PPPBPPPP/RN1QKBNR w KQkq - 0 3",
	},

	{
		fen: "rnbqkbnr/ppppppp1/7p/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2", //h7h6
	},

	{
		fen: "rnbqkb1r/ppppppp1/7n/8/3P4/8/PPP1PPPP/RN1QKBNR w KQkq - 0 3", //h7h6 after all capture
	},
];

export function EvaluationTest() {
	// for (let testPosition of evaluationTestPositions) {
	const testPosition = evaluationTestPositions[2];
	const whiteCastling: [boolean, boolean, boolean] = [true, true, true];
	const blackCastling: [boolean, boolean, boolean] = [true, true, true];
	const prevMove: [number, number] = [-1, -1];

	const [currentTurn, boardState] = fenToChessboard(
		testPosition.fen,
		whiteCastling,
		blackCastling,
		prevMove
	);

	const evaluation = Evaluate(
		boardState,
		currentTurn,
		prevMove,
		whiteCastling,
		blackCastling,
		1
	);

	printChessboard(boardState);
	console.log("Evaluation:", evaluation);
	// }
}
