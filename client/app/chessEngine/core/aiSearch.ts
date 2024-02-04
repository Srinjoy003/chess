import { ImprovedTotalMoveList } from "./aiMoves";
import { MoveGenerator, MoveMaker } from "./MoveGenerator";
import {
	deepCopyBoard,
	deepCopyCastling,
	deepCopyPrevMove,
} from "./MoveGenerator";
import {
	extractChessPosition,
	getEnpassantSquare,
	printChessboard,
} from "./aiHelperFunctions";
import PawnPromotion from "../../components/PawnPromotion";
import {
	CheckMate,
	isGameOver,
	arraysEqualNumber,
	InCheck,
	PieceAtPosition,
} from "../../helperFunctions";
import { Evaluate } from "./evaluation";
import { fenToChessboard } from "./aiHelperFunctions";
import { UnmakeMove } from "./MoveGenerator";
import { OrderMoves } from "./aiHelperFunctions";
import { CaptureMoveList } from "../../helperFunctions";

export type TranspositionTable = {
	[key: string]: {
		depth: number;
		score: number;
		bestMove: [number, number, string] | null;
	};
};

export const MATE_VAL = 100000;

function getBoardKey(
	boardState: string[][],
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean],
	enpassantSquare: number
): string {
	// Include castling and en passant information in the key
	const keyObject = {
		boardState,
		whiteCastling,
		blackCastling,
		enpassantSquare,
	};
	return JSON.stringify(keyObject);
}

export function SearchAllCaptures(
	depth: number,
	boardState: string[][],
	currentTurn: string,
	prevMove: [number, number] | null,
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean],
	maximizingPlayer: boolean,
	nodeCount: { value: number },
	transpositionTable: TranspositionTable,
	endTime: number,
	cancel: { isCancelled: boolean },
	alpha: number,
	beta: number
) {
	nodeCount.value++;

	if (Date.now() >= endTime) {
		return {
			bestMove: null,
			bestScore: Evaluate(
				boardState,
				currentTurn,
				prevMove,
				whiteCastling,
				blackCastling,
				depth
			),
		};
	}

	if (prevMove === null) prevMove = [-1, -1];
	let bestMove: [number, number, string] | null = null;
	// let bestScore = maximizingPlayer ? -MATE_VAL - 100 : MATE_VAL + 100;
	let bestScore = Evaluate(
		boardState,
		currentTurn,
		prevMove,
		whiteCastling,
		blackCastling,
		depth
	);

	const captureMoveList = CaptureMoveList(
		boardState,
		currentTurn,
		prevMove,
		whiteCastling,
		blackCastling
	);

	OrderMoves(boardState, captureMoveList, currentTurn, null);

	if (captureMoveList.length === 0) {
		return {
			bestMove: null,
			bestScore: Evaluate(
				boardState,
				currentTurn,
				prevMove,
				whiteCastling,
				blackCastling,
				depth
			),
		};
	}

	for (let captureMove of captureMoveList) {
		if (Date.now() >= endTime) break;

		const [fromIndex, toIndex] = captureMove;

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
			const capturedPiece = boardState[i2][j2];
			const isEnpassant = false;
			const isCastling = false;
			const isPromotion = true;
			const moveDesc: [number, number, string, boolean, boolean, boolean] = [
				captureMove[0],
				captureMove[1],
				capturedPiece,
				isEnpassant,
				isCastling,
				isPromotion,
			];
			for (let promotionMove of promotionList) {
				const newWhiteCastling = deepCopyCastling(whiteCastling);
				const newBlackCastling = deepCopyCastling(blackCastling);
				const newPrevMove = deepCopyPrevMove(prevMove);

				if (bestMove === null) {
					bestMove = [fromIndex, toIndex, promotionMove];
				}

				MoveMaker(
					boardState,
					fromIndex,
					toIndex,
					promotionMove,
					isPromotion,
					isCastling,
					isEnpassant,
					newWhiteCastling,
					newBlackCastling
				);

				if (newPrevMove) {
					newPrevMove[0] = fromIndex;
					newPrevMove[1] = toIndex;
				}

				const evaluation = SearchAllCaptures(
					depth - 1,
					boardState, // Updated board state after the move
					nextTurn,
					newPrevMove,
					newWhiteCastling,
					newBlackCastling,
					!maximizingPlayer, // Switch to minimizing player
					nodeCount,
					transpositionTable,
					endTime,
					cancel,
					alpha,
					beta
				).bestScore;

				UnmakeMove(boardState, moveDesc);

				if (maximizingPlayer && evaluation > bestScore) {
					bestScore = evaluation;
					alpha = bestScore;
					bestMove = [fromIndex, toIndex, promotionMove];
				} else if (!maximizingPlayer && evaluation < bestScore) {
					bestScore = evaluation;
					beta = bestScore;
					bestMove = [fromIndex, toIndex, promotionMove];
				}

				if (beta <= alpha) {
					// Prune the branch
					break;
				}
			}
		} else {
			const capturedPiece = boardState[i2][j2];
			const isCastling =
				piece !== "-" && piece[1] === "K" && Math.abs(j1 - j2) > 1
					? true
					: false;

			const isEnpassant =
				piece !== "-" &&
				piece[1] === "P" &&
				j1 !== j2 &&
				boardState[i2][j2] === "-";

			const isPromotion = false;

			const moveDesc: [number, number, string, boolean, boolean, boolean] = [
				captureMove[0],
				captureMove[1],
				capturedPiece,
				isEnpassant,
				isCastling,
				isPromotion,
			];
			const newWhiteCastling = deepCopyCastling(whiteCastling);
			const newBlackCastling = deepCopyCastling(blackCastling);
			const newPrevMove = deepCopyPrevMove(prevMove);

			if (bestMove === null) {
				bestMove = [fromIndex, toIndex, ""];
			}

			MoveMaker(
				boardState,
				fromIndex,
				toIndex,
				"no promotion",
				isPromotion,
				isCastling,
				isEnpassant,
				newWhiteCastling,
				newBlackCastling
			);

			if (newPrevMove) {
				newPrevMove[0] = fromIndex;
				newPrevMove[1] = toIndex;
			}

			const evaluation = SearchAllCaptures(
				depth - 1,
				boardState, // Updated board state after the move
				nextTurn,
				newPrevMove,
				newWhiteCastling,
				newBlackCastling,
				!maximizingPlayer, // Switch to minimizing player
				nodeCount,
				transpositionTable,
				endTime,
				cancel,
				alpha,
				beta
			).bestScore;

			UnmakeMove(boardState, moveDesc);

			if (maximizingPlayer && evaluation > bestScore) {
				bestScore = evaluation;
				alpha = bestScore;
				bestMove = [fromIndex, toIndex, ""];
				if (prevMove[0] === 67 && prevMove[1] == 57)
					console.log("Capture:", bestMove, bestScore);
			} else if (!maximizingPlayer && evaluation < bestScore) {
				bestScore = evaluation;
				beta = bestScore;
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

export function Minimax(
	depth: number,
	boardState: string[][],
	currentTurn: string,
	prevMove: [number, number] | null,
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean],
	maximizingPlayer: boolean,
	nodeCount: { value: number },
	transpositionTable: TranspositionTable,
	endTime: number,
	cancel: { isCancelled: boolean },
	previousIterationBestMove: [number, number] | null,
	alpha: number = -Infinity,
	beta: number = Infinity
): { bestMove: [number, number, string] | null; bestScore: number } {
	if (prevMove === null) prevMove = [-1, -1];
	let bestMove: [number, number, string] | null = null;
	let bestScore = maximizingPlayer ? -Infinity : Infinity;

	const enpassantSquare = getEnpassantSquare(boardState, prevMove, currentTurn);

	const boardKey = getBoardKey(
		boardState,
		whiteCastling,
		blackCastling,
		enpassantSquare
	);
	if (
		transpositionTable[boardKey] &&
		transpositionTable[boardKey].depth >= depth
	) {
		return {
			bestMove: transpositionTable[boardKey].bestMove,
			bestScore: transpositionTable[boardKey].score,
		};
	}

	nodeCount.value++;

	if (
		isGameOver(
			boardState,
			currentTurn,
			prevMove,
			whiteCastling,
			blackCastling
		) ||
		Date.now() >= endTime
	) {
		if (Date.now() >= endTime) cancel.isCancelled = true;

		return {
			bestMove: null,
			bestScore: Evaluate(
				boardState,
				currentTurn,
				prevMove,
				whiteCastling,
				blackCastling,
				depth
			),
		};
	}

	if (depth === 0) {
		return SearchAllCaptures(
			depth,
			boardState,
			currentTurn,
			prevMove,
			whiteCastling,
			blackCastling,
			maximizingPlayer,
			nodeCount,
			transpositionTable,
			endTime,
			cancel,
			alpha,
			beta
		);

		// return {
		// 	bestMove: null,
		// 	bestScore: Evaluate(
		// 		boardState,
		// 		currentTurn,
		// 		prevMove,
		// 		whiteCastling,
		// 		blackCastling,
		// 		depth
		// 	),
		// };
	}

	const totalMoveList = ImprovedTotalMoveList(
		boardState,
		currentTurn,
		prevMove,
		whiteCastling,
		blackCastling
	);

	OrderMoves(boardState, totalMoveList, currentTurn, previousIterationBestMove);

	for (let move of totalMoveList) {
		if (Date.now() >= endTime) {
			cancel.isCancelled = true;
			break;
		}

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
			const capturedPiece = boardState[i2][j2];
			const isEnpassant = false;
			const isCastling = false;
			const isPromotion = true;
			const moveDesc: [number, number, string, boolean, boolean, boolean] = [
				move[0],
				move[1],
				capturedPiece,
				isEnpassant,
				isCastling,
				isPromotion,
			];
			for (let promotionMove of promotionList) {
				const newWhiteCastling = deepCopyCastling(whiteCastling);
				const newBlackCastling = deepCopyCastling(blackCastling);
				const newPrevMove = deepCopyPrevMove(prevMove);

				MoveMaker(
					boardState,
					fromIndex,
					toIndex,
					promotionMove,
					isPromotion,
					isCastling,
					isEnpassant,
					newWhiteCastling,
					newBlackCastling
				);

				if (newPrevMove) {
					newPrevMove[0] = fromIndex;
					newPrevMove[1] = toIndex;
				}

				const evaluation = Minimax(
					depth - 1,
					boardState, // Updated board state after the move
					nextTurn,
					newPrevMove,
					newWhiteCastling,
					newBlackCastling,
					!maximizingPlayer, // Switch to minimizing player
					nodeCount,
					transpositionTable,
					endTime,
					cancel,
					null,
					alpha,
					beta
				).bestScore;

				UnmakeMove(boardState, moveDesc);

				if (maximizingPlayer && evaluation > bestScore) {
					bestScore = evaluation;
					alpha = bestScore;
					bestMove = [fromIndex, toIndex, promotionMove];
				} else if (!maximizingPlayer && evaluation < bestScore) {
					bestScore = evaluation;
					beta = bestScore;
					bestMove = [fromIndex, toIndex, promotionMove];
				}

				if (beta <= alpha) {
					// Prune the branch
					break;
				}
			}
		} else {
			const capturedPiece = boardState[i2][j2];
			const isCastling =
				piece !== "-" && piece[1] === "K" && Math.abs(j1 - j2) > 1
					? true
					: false;

			const isEnpassant =
				piece !== "-" &&
				piece[1] === "P" &&
				j1 !== j2 &&
				boardState[i2][j2] === "-";

			const isPromotion = false;

			const moveDesc: [number, number, string, boolean, boolean, boolean] = [
				move[0],
				move[1],
				capturedPiece,
				isEnpassant,
				isCastling,
				isPromotion,
			];
			const newWhiteCastling = deepCopyCastling(whiteCastling);
			const newBlackCastling = deepCopyCastling(blackCastling);
			const newPrevMove = deepCopyPrevMove(prevMove);

			MoveMaker(
				boardState,
				fromIndex,
				toIndex,
				"no promotion",
				isPromotion,
				isCastling,
				isEnpassant,
				newWhiteCastling,
				newBlackCastling
			);

			if (newPrevMove) {
				newPrevMove[0] = fromIndex;
				newPrevMove[1] = toIndex;
			}

			const evaluation = Minimax(
				depth - 1,
				boardState, // Updated board state after the move
				nextTurn,
				newPrevMove,
				newWhiteCastling,
				newBlackCastling,
				!maximizingPlayer, // Switch to minimizing player
				nodeCount,
				transpositionTable,
				endTime,
				cancel,
				null,
				alpha,
				beta
			).bestScore;

			UnmakeMove(boardState, moveDesc);

			if (maximizingPlayer && evaluation >= bestScore) {
				bestScore = evaluation;
				alpha = bestScore;
				bestMove = [fromIndex, toIndex, ""];
			} else if (!maximizingPlayer && evaluation <= bestScore) {
				bestScore = evaluation;
				beta = bestScore;
				bestMove = [fromIndex, toIndex, ""];
			}

			if (beta <= alpha) {
				// Prune the branch
				break;
			}
		}
	}

	transpositionTable[boardKey] = {
		depth,
		score: bestScore,
		bestMove,
	};

	return { bestMove, bestScore };
}
