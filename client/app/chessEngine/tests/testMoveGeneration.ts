import { testArray } from "./testPositions";
import { MoveGenerator } from "../core/MoveGenerator";
import { fenToChessboard } from "../core/aiHelperFunctions";

export function EngineTest() {
	let passed = 0;
	let failed = 0;

	for (let testPosition of testArray) {
		const fen = testPosition.fen;
		const whiteCastling: [boolean, boolean, boolean] = [true, true, true];
		const blackCastling: [boolean, boolean, boolean] = [true, true, true];
		const prevMove: [number, number] = [-1, -1];
		const depth = testPosition.depth;

		const [currentTurn, boardState] = fenToChessboard(
			fen,
			whiteCastling,
			blackCastling,
			prevMove
		);

		const nodes = MoveGenerator(
			depth,
			depth,
			boardState,
			currentTurn,
			prevMove,
			whiteCastling,
			blackCastling
		);

		console.log(fen, depth);
		console.log("Expected:", testPosition.nodes, " Got:", nodes);
		if (nodes === testPosition.nodes) {
			console.log("PASSED");
			passed++;
		} else {
			console.log("FAILED");
			failed++;
		}

		console.log("");
		console.log("");
	}

	console.log("Passed:", passed, " Failed", failed);
}
