import { ImprovedTotalMoveList } from "./aiMoves";
import { EnPassantMoveList, CastlingMoveList } from "../helperFunctions";
import { extractChessPosition } from "./aiHelperFunctions";
import PawnPromotion from "../components/PawnPromotion";

export function deepCopyBoard(boardState: string[][]): string[][] {
	// Create a new array and copy the contents of the original array to it
	return boardState.map((row) => [...row]);
}

function deepCopyCastling(
	castling: [boolean, boolean, boolean]
): [boolean, boolean, boolean] {
	return [...castling];
}

function deepCopyPrevMove(
	prevMove: [number, number] | null
): [number, number] | null {
	return prevMove ? [...prevMove] : null;
}

export function MoveGenerator(
	depth: number,
	currentDepth: number,
	boardState: string[][],
	currentTurn: string,
	prevMove: [number, number] | null,
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean]
): number {
	if (currentDepth === 0) return 1;

	if (prevMove === null) prevMove = [-1, -1];

	const totalMoveList = ImprovedTotalMoveList(
		boardState,
		currentTurn,
		prevMove,
		whiteCastling,
		blackCastling
	);

	let moveNumber = 0;

	for (let move of totalMoveList) {
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

				const num = MoveGenerator(
					depth,
					currentDepth - 1,
					newBoardState,
					nextTurn,
					newPrevMove,
					newWhiteCastling,
					newBlackCastling
				);

				if (currentDepth === depth) {
					const fromIndexPos = extractChessPosition(fromIndex);
					const toIndexPos = extractChessPosition(toIndex);
					const moveName =
						fromIndexPos + toIndexPos + promotionMove.toLowerCase() + ":";

					console.log(moveName, num);
				}

				moveNumber += num;
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
				"hello",
				prevMove,
				newWhiteCastling,
				newBlackCastling
			);

			if (newPrevMove) {
				newPrevMove[0] = fromIndex;
				newPrevMove[1] = toIndex;
			}

			const num = MoveGenerator(
				depth,
				currentDepth - 1,
				newBoardState,
				nextTurn,
				newPrevMove,
				newWhiteCastling,
				newBlackCastling
			);

			if (currentDepth === depth) {
				const fromIndexPos = extractChessPosition(fromIndex);
				const toIndexPos = extractChessPosition(toIndex);
				const moveName = fromIndexPos + toIndexPos + ":";

				console.log(moveName, num);
			}

			moveNumber += num;
		}
	}
	return moveNumber;
}

export function MoveMaker(
	boardState: string[][],
	fromIndex: number,
	toIndex: number,
	promotedPiece: string,
	prevMove: [number, number] | null,
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean]
) {
	const i1 = Math.floor(fromIndex / 10);
	const j1 = fromIndex % 10;

	const i2 = Math.floor(toIndex / 10);
	const j2 = toIndex % 10;

	const piece = boardState[i1][j1];
	const boardCopy = deepCopyBoard(boardState); //so that castling moves list  works on unedited board

	if (
		!(
			(
				piece[1] === "P" &&
				((piece[0] == "w" && i2 === 7) || (piece[0] == "b" && i2 === 0))
			) //no pawn promotion
		)
	) {
		boardState[i2][j2] = boardState[i1][j1];
		boardState[i1][j1] = "-";
	} else if (
		//pawn promotion
		piece[1] === "P" &&
		((piece[0] === "w" && i2 === 7) || (piece[0] === "b" && i2 === 0))
	) {
		boardState[i2][j2] = piece[0] + promotedPiece;
		boardState[i1][j1] = "-";
	}

	let currentSelectedPiece: [number, string] = [fromIndex, piece];

	//ENPASSANT
	const enpassantMoveList = EnPassantMoveList( //could create error by using boardstate instead of boardcopy
		currentSelectedPiece[1],
		currentSelectedPiece[0],
		boardState,
		prevMove
	);

	const castlingMoveList = CastlingMoveList(
		currentSelectedPiece[1],
		boardCopy,
		whiteCastling,
		blackCastling
	);


	if(castlingMoveList)

	if (enpassantMoveList.includes(toIndex)) {
		const opponentPawnDirection = currentSelectedPiece[1][0] === "w" ? -1 : 1;
		boardState[i2 + opponentPawnDirection][j2] = "-";
	}

	//                 //FOR CASTLING

	if (castlingMoveList.includes(toIndex)) {
		if (toIndex === 2) {
			boardState[0][0] = "-";
			boardState[0][3] = "wR";
		} else if (toIndex === 6) {
			boardState[0][7] = "-";
			boardState[0][5] = "wR";
		}

		if (toIndex === 72) {
			boardState[7][0] = "-";
			boardState[7][3] = "bR";
		} else if (toIndex === 76) {
			boardState[7][7] = "-";
			boardState[7][5] = "bR";
		}

	}

	if (currentSelectedPiece[1][0] === "w") {
		//white
		if (currentSelectedPiece[0] === 0 && currentSelectedPiece[1][1] === "R") {
			//left Rook
			whiteCastling[0] = true;
		} else if (
			currentSelectedPiece[0] === 7 &&
			currentSelectedPiece[1][1] === "R"
		) {
			//  right rook
			whiteCastling[2] = true;

		} else if (
			currentSelectedPiece[0] === 4 &&
			currentSelectedPiece[1][1] === "K"
		) {
			// king
			whiteCastling[1] = true;

		}
	}

	if (currentSelectedPiece[1][0] === "b") {
		//black
		if (currentSelectedPiece[0] === 70 && currentSelectedPiece[1][1] === "R") {
			blackCastling[0] = true;

		} else if (
			currentSelectedPiece[0] === 77 &&
			currentSelectedPiece[1][1] === "R"
		) {
			blackCastling[2] = true;

		} else if (
			currentSelectedPiece[0] === 74 &&
			currentSelectedPiece[1][1] === "K"
		) {
			blackCastling[1] = true;

		}
	}


}
