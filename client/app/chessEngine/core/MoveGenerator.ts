import { ImprovedTotalMoveList } from "./aiMoves";
import { extractChessPosition, printChessboard } from "./aiHelperFunctions";


export function deepCopyBoard(boardState: string[][]): string[][] {
	// Create a new array and copy the contents of the original array to it
	return boardState.map((row) => [...row]);
}

export function deepCopyCastling(
	castling: [boolean, boolean, boolean]
): [boolean, boolean, boolean] {
	return [...castling];
}

export function deepCopyPrevMove(
	prevMove: [number, number] | null
): [number, number] | null {
	return prevMove ? [...prevMove] : null;
}

export function UnmakeMove(
	boardState: string[][],
	moveDesc: [number, number, string, boolean, boolean, boolean]
) {
	const [
		fromIndex,
		toIndex,
		capturedPiece,
		isEnPassant,
		isCastling,
		isPromotion,
	] = moveDesc;

	const i1 = Math.floor(fromIndex / 10);
	const j1 = fromIndex % 10;

	const i2 = Math.floor(toIndex / 10);
	const j2 = toIndex % 10;

	let piece1 = boardState[i2][j2];
	let piece2 = capturedPiece; //not neccesarily piece, could be empty square

	if (isCastling) {
		if (j2 === 2) {
			//long Castling
			boardState[i2][0] = boardState[i2][3];
			boardState[i2][3] = "-"; //return rook to original position
		} else if (j2 === 6) {
			//short Castling
			boardState[i2][7] = boardState[i2][5];
			boardState[i2][5] = "-"; //return rook to original position
		}
	} else if (isEnPassant) {
		const pieceColour = piece1[0];
		const direction = pieceColour === "w" ? -1 : 1;
		const capturedPawn = pieceColour === "w" ? "bP" : "wP";
		boardState[i2 + direction][j2] = capturedPawn; //restore captured pawn
	} else if (isPromotion) {
		const pieceColour = piece1[0];
		piece1 = pieceColour + "P";
	}
	boardState[i1][j1] = piece1;
	boardState[i2][j2] = piece2;
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

				const num = MoveGenerator(
					depth,
					currentDepth - 1,
					boardState,
					nextTurn,
					newPrevMove,
					newWhiteCastling,
					newBlackCastling
				);

				UnmakeMove(boardState, moveDesc);

				if (currentDepth === depth) {
					const fromIndexPos = extractChessPosition(fromIndex);
					const toIndexPos = extractChessPosition(toIndex);
					const moveName =
						fromIndexPos + toIndexPos + promotionMove.toLowerCase() + ":";

					// console.log(moveName, num);
				}

				moveNumber += num;
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
				"hello",
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

			const num = MoveGenerator(
				depth,
				currentDepth - 1,
				boardState,
				nextTurn,
				newPrevMove,
				newWhiteCastling,
				newBlackCastling
			);

			UnmakeMove(boardState, moveDesc);

			if (currentDepth === depth) {
				const fromIndexPos = extractChessPosition(fromIndex);
				const toIndexPos = extractChessPosition(toIndex);
				const moveName = fromIndexPos + toIndexPos + ":";

				// console.log(moveName, num);
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
	isPromotion: boolean,
	isCastling: boolean,
	isEnPassant: boolean,
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean]
) {
	const i1 = Math.floor(fromIndex / 10);
	const j1 = fromIndex % 10;

	const i2 = Math.floor(toIndex / 10);
	const j2 = toIndex % 10;

	const piece = boardState[i1][j1];

	if (isPromotion) {
		boardState[i2][j2] = piece[0] + promotedPiece;
		boardState[i1][j1] = "-";
	} else {
		boardState[i2][j2] = boardState[i1][j1];
		boardState[i1][j1] = "-";
	}

	let currentSelectedPiece: [number, string] = [fromIndex, piece];

	if (isEnPassant) {
		const opponentPawnDirection = currentSelectedPiece[1][0] === "w" ? -1 : 1;
		boardState[i2 + opponentPawnDirection][j2] = "-";
	}

	//                 //FOR CASTLING

	if (isCastling) {
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
