import { ImprovedTotalMoveList } from "./aiMoves";
import { MoveGenerator, MoveMaker } from "./MoveGenerator";
import {
	deepCopyBoard,
	deepCopyCastling,
	deepCopyPrevMove,
} from "./MoveGenerator";
import { extractChessPosition, printChessboard } from "./aiHelperFunctions";
import PawnPromotion from "../components/PawnPromotion";
import { CheckMate, isGameOver, arraysEqualNumber } from "../helperFunctions";
import { Evaluate } from "./basicEvaluation";
import { fenToChessboard } from "./aiHelperFunctions";
import { UnmakeMove } from "./MoveGenerator";
import { OrderMoves } from "./aiHelperFunctions";


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
		depth === 0 ||
		isGameOver(boardState, currentTurn, prevMove, whiteCastling, blackCastling)
	) {
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

	OrderMoves(boardState, totalMoveList, currentTurn)

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
				alpha,
				beta
			).bestScore;

			UnmakeMove(boardState, moveDesc);


			if (maximizingPlayer && evaluation > bestScore) {
				bestScore = evaluation;
				alpha = bestScore;
				bestMove = [fromIndex, toIndex, ""];
			} else if (!maximizingPlayer && evaluation < bestScore) {
				bestScore = evaluation;
				beta = bestScore;
				bestMove = [fromIndex, toIndex, ""];
			}
		}
	}

	return { bestMove, bestScore };
}
