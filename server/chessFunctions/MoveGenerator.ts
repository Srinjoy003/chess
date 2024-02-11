import { ImprovedTotalMoveList } from "./moves";

export function extractChessPosition(position: number): string {
	const row = Math.floor(position / 10); // Extract the "tens" place as row
	const col = position % 10; // Extract the "ones" place as column
	return String.fromCharCode("a".charCodeAt(0) + col) + (row + 1);
}
export function printChessboard(board: string[][]) {
	for (const row of board) {
		console.log(row.join(" "));
	}
}

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
