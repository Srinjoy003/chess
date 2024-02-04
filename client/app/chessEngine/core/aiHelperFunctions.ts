import { InCheck, PieceAtPosition } from "../../helperFunctions";
import { MoveMaker, UnmakeMove } from "./MoveGenerator";
import { piecevalue } from "./evaluation";

export function extractChessPosition(position: number): string {
	const row = Math.floor(position / 10); // Extract the "tens" place as row
	const col = position % 10; // Extract the "ones" place as column
	return String.fromCharCode("a".charCodeAt(0) + col) + (row + 1);
}

export function semiUCIToChessPosition(coordinate: string): number {
    const col = coordinate.charCodeAt(0) - "a".charCodeAt(0);
    const row = parseInt(coordinate.charAt(1), 10) - 1;

    return row * 10 + col;
}

function chessPositionToIndices(position: string): [number, number] {
	return [
		parseInt(position[1]) - 1,
		position[0].charCodeAt(0) - "a".charCodeAt(0),
	];
}



export function fenToChessboard(
	fen: string,
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean],
	prevMove: [number, number]
): [string, string[][]] {
	const pieceMap: { [key: string]: string } = {
		P: "wP",
		Q: "wQ",
		N: "wH",
		B: "wB",
		K: "wK",
		R: "wR",
		p: "bP",
		q: "bQ",
		n: "bH",
		b: "bB",
		k: "bK",
		r: "bR",
	};

	const board = Array.from({ length: 8 }, () => Array(8).fill("-"));

	const fenParts = fen.split(" ");
	const boardFen = fenParts[0];
	let rank = 7,
		file = 0;

	for (const char of boardFen) {
		if (char === "/") {
			rank--;
			file = 0;
		} else if (
			char === "1" ||
			char === "2" ||
			char === "3" ||
			char === "4" ||
			char === "5" ||
			char === "6" ||
			char === "7" ||
			char === "8"
		) {
			file += parseInt(char);
		} else {
			const piece = pieceMap[char];
			if (piece) {
				board[rank][file] = piece;
				file++;
			}
		}
	}

	whiteCastling.fill(true);
	blackCastling.fill(true);

	if (fenParts.length >= 3) {
		const castlingRights = fenParts[2];

		// Update castling rights for white
		if (castlingRights.includes("K")) {
			whiteCastling[1] = false;
			whiteCastling[2] = false;
		}
		if (castlingRights.includes("Q")) {
			whiteCastling[1] = false;
			whiteCastling[0] = false;
		}

		// Update castling rights for black
		if (castlingRights.includes("k")) {
			blackCastling[1] = false;
			blackCastling[2] = false;
		}
		if (castlingRights.includes("q")) {
			blackCastling[1] = false;
			blackCastling[0] = false;
		}
	}

	const currentTurn = fenParts[1];

	if (fenParts[3] !== "-") {
		const direction = currentTurn === "w" ? -1 : 1;
		const [fenRow, fenCol] = chessPositionToIndices(fenParts[3]); // where the enpassant capture is available

		const fromMoveRow = fenRow - direction;
		const toMoveRow = fenRow + direction;

		prevMove[0] = fromMoveRow * 10 + fenCol;
		prevMove[1] = toMoveRow * 10 + fenCol;
	}
	return [currentTurn, board];
}

export function printChessboard(board: string[][]) {
	for (const row of board) {
		console.log(row.join(" "));
	}
}

export function OpponentPawnAttackSquares(
	boardState: string[][],
	currentTurn: string
): number[] {
	const opponentColour = currentTurn === "w" ? "b" : "w";
	const forwardDirection = opponentColour === "b" ? -1 : 1;
	const pawn = opponentColour + "P";
	const pawnAttackingSquares = [];

	for (let row = 0; row < 8; row++) {
		for (let col = 0; col < 8; col++) {
			if (boardState[row][col] === pawn) {
				if (col + 1 < 8) {
					const position1 = (row + forwardDirection) * 10 + col + 1;
					pawnAttackingSquares.push(position1);
				}

				if (col - 1 >= 0) {
					const position2 = (row + forwardDirection) * 10 + col - 1;
					pawnAttackingSquares.push(position2);
				}
			}
		}
	}
	return pawnAttackingSquares;
}

function isCheckMove(
	boardState: string[][],
	move: number[],
	currentTurn: string
) {
	const opponentTurn = currentTurn === "w" ? "b" : "w";
	const [fromIndex, toIndex] = move;

	const i1 = Math.floor(fromIndex / 10);
	const j1 = fromIndex % 10;

	const i2 = Math.floor(toIndex / 10);
	const j2 = toIndex % 10;
	const capturedPiece = boardState[i2][j2];
	const piece = boardState[i1][j1];
	const isCastling =
		piece !== "-" && piece[1] === "K" && Math.abs(j1 - j2) > 1 ? true : false;

	const isEnpassant =
		piece !== "-" &&
		piece[1] === "P" &&
		j1 !== j2 &&
		boardState[i2][j2] === "-";

	const isPromotion = false;
	const whiteCastling: [boolean, boolean, boolean] = [false, false, false];
	const blackCastling: [boolean, boolean, boolean] = [false, false, false];

	let check = false;
	const moveDesc: [number, number, string, boolean, boolean, boolean] = [
		move[0],
		move[1],
		capturedPiece,
		isEnpassant,
		isCastling,
		isPromotion,
	];

	MoveMaker(
		boardState,
		fromIndex,
		toIndex,
		"no promotion",
		isPromotion,
		isCastling,
		isEnpassant,
		whiteCastling,
		blackCastling
	);

	if (InCheck(opponentTurn, boardState)) {
		check = true;
	}

	UnmakeMove(boardState, moveDesc);

	return check;
}

function CalculateMoveScore(
	boardState: string[][],
	move: number[],
	currentTurn: string
): number {
	let moveScoreGuess = 0;
	const [fromIndex, toIndex] = move;
	const i1 = Math.floor(fromIndex / 10);
	const j1 = fromIndex % 10;

	const i2 = Math.floor(toIndex / 10);
	const j2 = toIndex % 10;

	const movePiece = boardState[i1][j1];
	const capturePiece = boardState[i2][j2];
	const movePieceType = movePiece[1];

	if (capturePiece !== "-") {
		const capturePieceType = capturePiece[1];

		moveScoreGuess =
			10 * piecevalue[capturePieceType] - piecevalue[movePieceType];
	}

	if (
		//pawn promotion
		movePieceType === "P" &&
		((movePiece[0] === "w" && i2 === 7) || (movePiece[0] === "b" && i2 === 0))
	) {
		moveScoreGuess += 700;
	}

	if (OpponentPawnAttackSquares(boardState, currentTurn).includes(toIndex)) {
		moveScoreGuess -= piecevalue[movePieceType];
	}

	// if (isCheckMove(boardState, move, currentTurn)) moveScoreGuess += 50

	return moveScoreGuess;
}

export function OrderMoves(
	boardState: string[][],
	moveList: number[][],
	currentTurn: string,
	previousIterationBestMove: [number, number] | null
) {
	moveList.sort((moveA, moveB) => {
		const scoreA = CalculateMoveScore(boardState, moveA, currentTurn);
		const scoreB = CalculateMoveScore(boardState, moveB, currentTurn);

		// Sort in descending order
		return scoreB - scoreA;
	});

	if (previousIterationBestMove) {
		const bestMoveIndex = moveList.findIndex((move) =>
			move.every((coord, index) => coord === previousIterationBestMove[index])
		);

		if (bestMoveIndex !== -1) {
			moveList.splice(bestMoveIndex, 1); // Remove the best move from its current position
			moveList.unshift(previousIterationBestMove); // Move it to the start
		}
	}
}

export function getEnpassantSquare(
	boardState: string[][],
	prevMove: [number, number],
	currentTurn: string
) {
	const dir = currentTurn === "w" ? 1 : -1;

	if (prevMove[1] === -1) return -1;

	if (
		PieceAtPosition(boardState, prevMove[1]) === "P" &&
		Math.abs(prevMove[0] - prevMove[1]) === 20
	)
		return prevMove[1] + 10 * dir;

	return -1;
}
