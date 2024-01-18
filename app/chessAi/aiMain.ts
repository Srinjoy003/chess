import { ImprovedTotalMoveList } from "./aiMoves";
import { MoveGenerator, MoveMaker } from "./MoveGenerator";
import {
	deepCopyBoard,
	deepCopyCastling,
	deepCopyPrevMove,
} from "./MoveGenerator";
import { extractChessPosition } from "./aiHelperFunctions";
import PawnPromotion from "../components/PawnPromotion";
import { CheckMate, isGameOver } from "../helperFunctions";
import { Evaluate } from "./basicEvaluation";
import { fenToChessboard } from "./aiHelperFunctions";

export function Minimax(
	depth: number,
	boardState: string[][],
	currentTurn: string,
	prevMove: [number, number] | null,
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean],
	maximizingPlayer: boolean,
	alpha: number = -Infinity,
    beta: number = Infinity
): { bestMove: [number, number, string] | null; bestScore: number } {
	if (
		depth === 0 
		// || isGameOver(boardState, currentTurn, prevMove, whiteCastling, blackCastling)
	) {
		//add these laterT
		// Evaluate the board and return the score
		return {
			bestMove: null,
			bestScore: Evaluate(
				boardState,
				currentTurn,
				prevMove,
				whiteCastling,
				blackCastling
			),
		};
	}

	if (prevMove === null) prevMove = [-1, -1];
	let bestMove: [number, number, string] | null = null;
	let bestScore = maximizingPlayer ? -Infinity : Infinity;

	const totalMoveList = ImprovedTotalMoveList(
		boardState,
		currentTurn,
		prevMove,
		whiteCastling,
		blackCastling
	);

	for (let move of totalMoveList) {
		// Apply the move to the board
		// ..

		const [fromIndex, toIndex] = move;

		const nextTurn = currentTurn === "w" ? "b" : "w";

		const i1 = Math.floor(fromIndex / 10);
		const j1 = fromIndex % 10;

		const i2 = Math.floor(toIndex / 10);
		const j2 = toIndex % 10;

		const piece = boardState[i1][j1];

		const promotionList = ["Q", "B", "H", "R"];

		if (
			//pawn promotion
			piece[1] === "P" &&
			((piece[0] === "w" && i2 === 7) || (piece[0] === "b" && i2 === 0))
		) {
			for (let promotionMove of promotionList) {
				const newBoardState = deepCopyBoard(boardState);
				const newWhiteCastling = deepCopyCastling(whiteCastling);
				const newBlackCastling = deepCopyCastling(blackCastling);
				const newPrevMove = deepCopyPrevMove(prevMove);

				MoveMaker(
					newBoardState,
					fromIndex,
					toIndex,
					promotionMove,
					prevMove,
					newWhiteCastling,
					newBlackCastling
				);

				if (newPrevMove) {
					newPrevMove[0] = fromIndex;
					newPrevMove[1] = toIndex;
				}

				const evaluation = Minimax(
					depth - 1,
					newBoardState, // Updated board state after the move
					nextTurn,
					newPrevMove,
					newWhiteCastling,
					newBlackCastling,
					!maximizingPlayer, // Switch to minimizing player
					alpha,
					beta
				).bestScore;

				if (maximizingPlayer) {
					bestScore = Math.max(bestScore, evaluation);
					alpha = Math.max(alpha, bestScore);
					bestMove = [fromIndex, toIndex, promotionMove];
	
				} else {
					bestScore = Math.min(bestScore, evaluation);
					beta = Math.min(beta, bestScore);
					bestMove = [fromIndex, toIndex, promotionMove];
	
				}
	
				if (beta <= alpha) {
					// Prune the branch
					break;
				}
			}
		} else {
			const newBoardState = deepCopyBoard(boardState);
			const newWhiteCastling = deepCopyCastling(whiteCastling);
			const newBlackCastling = deepCopyCastling(blackCastling);
			const newPrevMove = deepCopyPrevMove(prevMove);


			MoveMaker(
				newBoardState,
				fromIndex,
				toIndex,
				"no promotion",
				prevMove,
				newWhiteCastling,
				newBlackCastling
			);

			if (newPrevMove) {
				newPrevMove[0] = fromIndex;
				newPrevMove[1] = toIndex;
			}

			const evaluation = Minimax(
				depth - 1,
				newBoardState, // Updated board state after the move
				nextTurn,
				newPrevMove,
				newWhiteCastling,
				newBlackCastling,
				!maximizingPlayer,  // Switch to minimizing player
				alpha,
				beta
			).bestScore;

			

			if (maximizingPlayer) {
                bestScore = Math.max(bestScore, evaluation);
                alpha = Math.max(alpha, bestScore);
				bestMove = [fromIndex, toIndex, ""];

            } else {
                bestScore = Math.min(bestScore, evaluation);
                beta = Math.min(beta, bestScore);
				bestMove = [fromIndex, toIndex, ""];

            }

            if (beta <= alpha) {
                // Prune the branch
                break;
            }
		}
	}

	return { bestMove, bestScore };
}

// export function Minimax(
// 	depth: number,
// 	currentDepth: number,
// 	boardState: string[][],
// 	currentTurn: string,
// 	prevMove: [number, number] | null,
// 	whiteCastling: [boolean, boolean, boolean],
// 	blackCastling: [boolean, boolean, boolean],
// 	maximizingPlayer: boolean
// ): number {
// 	if (
// 		currentDepth === 0 )
// 	 {
// 		//add these laterT
// 		// Evaluate the board and return the score
// 		return 1;
// 	}

// 	if (prevMove === null) prevMove = [-1, -1];
// 	let bestMove: [number, number] | null = null;
// 	let bestScore = maximizingPlayer ? -Infinity : Infinity;

// 	const totalMoveList = ImprovedTotalMoveList(
// 		boardState,
// 		currentTurn,
// 		prevMove,
// 		whiteCastling,
// 		blackCastling
// 	);
// 	let moveNumber = 0;

// 	for (let move of totalMoveList) {
// 		// Apply the move to the board
// 		// ..

// 		const [fromIndex, toIndex] = move;

// 		const nextTurn = currentTurn === "w" ? "b" : "w";

// 		const i1 = Math.floor(fromIndex / 10);
// 		const j1 = fromIndex % 10;

// 		const i2 = Math.floor(toIndex / 10);
// 		const j2 = toIndex % 10;

// 		const piece = boardState[i1][j1];

// 		const promotionList = ["Q", "B", "H", "R"];

// 		if (
// 			//pawn promotion
// 			piece[1] === "P" &&
// 			((piece[0] === "w" && i2 === 7) || (piece[0] === "b" && i2 === 0))
// 		) {
// 			for (let promotionMove of promotionList) {
// 				const newBoardState = deepCopyBoard(boardState);
// 				const newWhiteCastling = deepCopyCastling(whiteCastling);
// 				const newBlackCastling = deepCopyCastling(blackCastling);
// 				const newPrevMove = deepCopyPrevMove(prevMove);

// 				MoveMaker(
// 					newBoardState,
// 					fromIndex,
// 					toIndex,
// 					promotionMove,
// 					prevMove,
// 					newWhiteCastling,
// 					newBlackCastling
// 				);

// 				if (newPrevMove) {
// 					newPrevMove[0] = fromIndex;
// 					newPrevMove[1] = toIndex;
// 				}

// 				const num = Minimax(
// 					depth,
// 					currentDepth - 1,
// 					newBoardState, // Updated board state after the move
// 					nextTurn,
// 					newPrevMove,
// 					newWhiteCastling,
// 					newBlackCastling,
// 					!maximizingPlayer // Switch to minimizing player
// 				);

// 				if (currentDepth === depth) {
// 					const fromIndexPos = extractChessPosition(fromIndex);
// 					const toIndexPos = extractChessPosition(toIndex);
// 					const moveName =
// 						fromIndexPos + toIndexPos + promotionMove.toLowerCase() + ":";

// 					// console.log(moveName, num);
// 				}

// 				moveNumber += num;
// 			}
// 		} else {
// 			const newBoardState = deepCopyBoard(boardState);
// 			const newWhiteCastling = deepCopyCastling(whiteCastling);
// 			const newBlackCastling = deepCopyCastling(blackCastling);
// 			const newPrevMove = deepCopyPrevMove(prevMove);

// 			MoveMaker(
// 				newBoardState,
// 				fromIndex,
// 				toIndex,
// 				"no promotion",
// 				prevMove,
// 				newWhiteCastling,
// 				newBlackCastling
// 			);

// 			if (newPrevMove) {
// 				newPrevMove[0] = fromIndex;
// 				newPrevMove[1] = toIndex;
// 			}

// 			const num = Minimax(
// 				depth,
// 				currentDepth-1,
// 				newBoardState, // Updated board state after the move
// 				nextTurn,
// 				newPrevMove,
// 				newWhiteCastling,
// 				newBlackCastling,
// 				!maximizingPlayer // Switch to minimizing player
// 			);

// 			if (currentDepth === depth) {
// 				const fromIndexPos = extractChessPosition(fromIndex);
// 				const toIndexPos = extractChessPosition(toIndex);
// 				const moveName = fromIndexPos + toIndexPos + ":";

// 				// console.log(moveName, num);
// 			}

// 			moveNumber += num;
// 		}
// 	}

// 	return moveNumber;
// }

// const fen = "2R2B2/Rp1p4/2p1pQ2/2pk1p2/2p1b1p1/2PB4/2KN2P1/8 w - - 0 1";
// const whiteCastling: [boolean, boolean, boolean] = [true, true, true];
// const blackCastling: [boolean, boolean, boolean] = [true, true, true];
// const prevMove: [number, number] = [-1, -1];

// const [currentTurn, chessboard] = fenToChessboard(
// 	fen,
// 	whiteCastling,
// 	blackCastling,
// 	prevMove
// );

// function MiniMax(boardState: string[][], depth: number) {
// 	if (depth == 0) return Evaluate(boardState);
// 	let moveList = ImprovedTotalMoveList(boardState, currentTurn)
// 	if (GenerateMoves().length == 0) {
// 		if (InCheck()) return -Infinity;

// 		return 0; // stalemate
// 	}

// 	let bestEvaluation = -Infinity;
// 	for (let move of GenerateMoves()) {
// 		MakeMove(boardState, move);
// 		let evaluation = -Minimax(boardState, depth - 1);
// 		bestEvaluation = Math.max(bestEvaluation, evaluation);
// 		UnmakeMove(boardState, move);
// 	}

// 	return bestEvaluation
// }

//Add a quantifier to show which promotion will take place for promotion moves
