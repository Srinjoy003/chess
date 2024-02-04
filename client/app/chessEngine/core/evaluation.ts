import {
	CheckMate,
	InsufficientMaterial,
	StaleMate,
} from "../../helperFunctions";
import { extractChessPosition, printChessboard } from "./aiHelperFunctions";
import { MATE_VAL } from "./aiSearch";

export const piecevalue: { [key: string]: number } = {
	P: 100,
	H: 320,
	B: 330,
	R: 500,
	Q: 900,
	K: 0,
};

const blackPawnTable = [
	[0, 0, 0, 0, 0, 0, 0, 0],
	[50, 50, 50, 50, 50, 50, 50, 50],
	[10, 10, 20, 30, 30, 20, 10, 10],
	[5, 5, 10, 25, 25, 10, 5, 5],
	[0, 0, 0, 20, 20, 0, 0, 0],
	[5, -5, -10, 0, 0, -10, -5, 5],
	[5, 10, 10, -20, -20, 10, 10, 5],
	[0, 0, 0, 0, 0, 0, 0, 0],
];

const whitePawnTable = [
	[0, 0, 0, 0, 0, 0, 0, 0],
	[5, 10, 10, -20, -20, 10, 10, 5],
	[5, -5, -10, 0, 0, -10, -5, 5],
	[0, 0, 0, 20, 20, 0, 0, 0],
	[5, 5, 10, 25, 25, 10, 5, 5],
	[10, 10, 20, 30, 30, 20, 10, 10],
	[50, 50, 50, 50, 50, 50, 50, 50],
	[0, 0, 0, 0, 0, 0, 0, 0],
];

const blackKnightTable = [
	[-50, -40, -30, -30, -30, -30, -40, -50],
	[-40, -20, 0, 0, 0, 0, -20, -40],
	[-30, 0, 10, 15, 15, 10, 0, -30],
	[-30, 5, 15, 20, 20, 15, 5, -30],
	[-30, 0, 15, 20, 20, 15, 0, -30],
	[-30, 5, 10, 15, 15, 10, 5, -30],
	[-40, -20, 0, 5, 5, 0, -20, -40],
	[-50, -40, -30, -30, -30, -30, -40, -50],
];

const whiteKnightTable = [
	[-50, -40, -30, -30, -30, -30, -40, -50],
	[-40, -20, 0, 5, 5, 0, -20, -40],
	[-30, 5, 10, 15, 15, 10, 5, -30],
	[-30, 0, 15, 20, 20, 15, 0, -30],
	[-30, 5, 15, 20, 20, 15, 5, -30],
	[-30, 0, 10, 15, 15, 10, 0, -30],
	[-40, -20, 0, 0, 0, 0, -20, -40],
	[-50, -40, -30, -30, -30, -30, -40, -50],
];

const blackBishopTable = [
	[-20, -10, -10, -10, -10, -10, -10, -20],
	[-10, 0, 0, 0, 0, 0, 0, -10],
	[-10, 0, 5, 10, 10, 5, 0, -10],
	[-10, 5, 5, 10, 10, 5, 5, -10],
	[-10, 0, 10, 10, 10, 10, 0, -10],
	[-10, 10, 10, 10, 10, 10, 10, -10],
	[-10, 5, 0, 0, 0, 0, 5, -10],
	[-20, -10, -10, -10, -10, -10, -10, -20],
];

const whiteBishopTable = [
	[-20, -10, -10, -10, -10, -10, -10, -20],
	[-10, 5, 0, 0, 0, 0, 5, -10],
	[-10, 0, 10, 10, 10, 10, 0, -10],
	[-10, 5, 5, 10, 10, 5, 5, -10],
	[-10, 0, 5, 10, 10, 5, 0, -10],
	[-10, 0, 0, 0, 0, 0, 0, -10],
	[-10, 5, 10, 10, 10, 5, 0, -10],
	[-20, -10, -10, -10, -10, -10, -10, -20],
];

const blackRookTable = [
	[0, 0, 0, 0, 0, 0, 0, 0],
	[5, 10, 10, 10, 10, 10, 10, 5],
	[-5, 0, 0, 0, 0, 0, 0, -5],
	[-5, 0, 0, 0, 0, 0, 0, -5],
	[-5, 0, 0, 0, 0, 0, 0, -5],
	[-5, 0, 0, 0, 0, 0, 0, -5],
	[-5, 0, 0, 0, 0, 0, 0, -5],
	[0, 0, 0, 5, 5, 0, 0, 0],
];

const whiteRookTable = [
	[0, 0, 0, 5, 5, 0, 0, 0],
	[-5, 0, 0, 0, 0, 0, 0, -5],
	[-5, 0, 0, 0, 0, 0, 0, -5],
	[-5, 0, 0, 0, 0, 0, 0, -5],
	[-5, 0, 0, 0, 0, 0, 0, -5],
	[-5, 0, 0, 0, 0, 0, 0, -5],
	[5, 10, 10, 10, 10, 10, 10, 5],
	[0, 0, 0, 0, 0, 0, 0, 0],
];

const blackQueenTable = [
	[-20, -10, -10, -5, -5, -10, -10, -20],
	[-10, 0, 0, 0, 0, 0, 0, -10],
	[-10, 0, 5, 5, 5, 5, 0, -10],
	[-5, 0, 5, 5, 5, 5, 0, -5],
	[0, 0, 5, 5, 5, 5, 0, -5],
	[-10, 5, 5, 5, 5, 5, 0, -10],
	[-10, 0, 5, 0, 0, 0, 0, -10],
	[-20, -10, -10, -5, -5, -10, -10, -20],
];

const whiteQueenTable = [
	[-20, -10, -10, -5, -5, -10, -10, -20],
	[-10, 0, 5, 0, 0, 0, 0, -10],
	[-10, 5, 5, 5, 5, 5, 0, -10],
	[0, 0, 5, 5, 5, 5, 0, -5],
	[-5, 0, 5, 5, 5, 5, 0, -5],
	[-5, 0, 5, 5, 5, 5, 0, -5],
	[-10, 0, 5, 5, 5, 5, 0, -10],
	[-20, -10, -10, -5, -5, -10, -10, -20],
];

const mgBlackKingTable = [
	[-30, -40, -40, -50, -50, -40, -40, -30],
	[-30, -40, -40, -50, -50, -40, -40, -30],
	[-30, -40, -40, -50, -50, -40, -40, -30],
	[-30, -40, -40, -50, -50, -40, -40, -30],
	[-20, -30, -30, -40, -40, -30, -30, -20],
	[-10, -20, -20, -20, -20, -20, -20, -10],
	[20, 20, 0, 0, 0, 0, 20, 20],
	[20, 30, 10, 0, 0, 10, 30, 20],
];

const mgWhiteKingTable = [
	[20, 30, 10, 0, 0, 10, 30, 20],
	[20, 20, 0, 0, 0, 0, 20, 20],
	[-10, -20, -20, -20, -20, -20, -20, -10],
	[-20, -30, -30, -40, -40, -30, -30, -20],
	[-30, -40, -40, -50, -50, -40, -40, -30],
	[-30, -40, -40, -50, -50, -40, -40, -30],
	[-30, -40, -40, -50, -50, -40, -40, -30],
	[-30, -40, -40, -50, -50, -40, -40, -30],
];

const egBlackKingTable = [
	[-50, -40, -30, -20, -20, -30, -40, -50],
	[-30, -20, -10, 0, 0, -10, -20, -30],
	[-30, -10, 20, 30, 30, 20, -10, -30],
	[-30, -10, 30, 40, 40, 30, -10, -30],
	[-30, -10, 30, 40, 40, 30, -10, -30],
	[-30, -10, 20, 30, 30, 20, -10, -30],
	[-30, -30, 0, 0, 0, 0, -30, -30],
	[-50, -30, -30, -30, -30, -30, -30, -50],
];

const egWhiteKingTable = [
	[-50, -30, -30, -30, -30, -30, -30, -50],
	[-30, -30, 0, 0, 0, 0, -30, -30],
	[-30, -10, 20, 30, 30, 20, -10, -30],
	[-30, -10, 30, 40, 40, 30, -10, -30],
	[-30, -10, 30, 40, 40, 30, -10, -30],
	[-30, -10, 20, 30, 30, 20, -10, -30],
	[-30, -20, -10, 0, 0, -10, -20, -30],
	[-50, -40, -30, -20, -20, -30, -40, -50],
];

const pieceSquareTable: { [key: string]: number[][] } = {
	wP: whitePawnTable,
	bP: blackPawnTable,
	wH: whiteKnightTable,
	bH: blackKnightTable,
	wB: whiteBishopTable,
	bB: blackBishopTable,
	wR: whiteRookTable,
	bR: blackRookTable,
	wQ: whiteQueenTable,
	bQ: blackQueenTable,
};

const kingSquareTable: { [key: string]: number[][] } = {
	egwK: egWhiteKingTable,
	egbK: egBlackKingTable,
	mgwK: mgWhiteKingTable,
	mgbK: mgBlackKingTable,
};

// export function Evaluate(
// 	boardState: string[][],
// 	currentTurn: string,
// 	prevMove: [number, number] | null,
// 	whiteCastling: [boolean, boolean, boolean],
// 	blackCastling: [boolean, boolean, boolean]
// ): number {
// 	let evaluation = 0;
// 	if (
// 		CheckMate(currentTurn, boardState, prevMove, whiteCastling, blackCastling)
// 	) {
// 		evaluation = currentTurn === "w" ? -Infinity : Infinity;
// 	} else if (
// 		StaleMate(
// 			boardState,
// 			currentTurn,
// 			prevMove,
// 			whiteCastling,
// 			blackCastling
// 		) ||
// 		InsufficientMaterial(boardState)
// 	) {
// 		evaluation = 0;
// 	} else {

// 		for (let i = 0; i < 8; i++) {
// 			for (let j = 0; j < 8; j++) {
// 				if (boardState[i][j] !== "-" && boardState[i][j][1] !== "K") {
// 					let piece = boardState[i][j][1];
// 					let colour = boardState[i][j][0];
// 					let direction = colour === "w" ? 1 : -1;
// 					const pieceTable = pieceSquareTable[colour + piece]
// 					evaluation += (piecevalue[piece] +  pieceTable[i][j])* direction;
// 				}
// 			}
// 		}
// 	}
// 	if (prevMove) {
// 		const [fromIndex, toIndex] = prevMove;
// 		const fromPos = extractChessPosition(fromIndex);
// 		const toPos = extractChessPosition(toIndex);
// 	}

// 	return evaluation;
// }

export function Evaluate(
	boardState: string[][],
	currentTurn: string,
	prevMove: [number, number] | null,
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean],
	depth: number
): number {
	let evaluation = 0;

	if (
		CheckMate(currentTurn, boardState, prevMove, whiteCastling, blackCastling)
	) {
		evaluation = currentTurn === "w" ? -MATE_VAL - depth : MATE_VAL + depth;
	} else if (
		StaleMate(
			boardState,
			currentTurn,
			prevMove,
			whiteCastling,
			blackCastling
		) ||
		InsufficientMaterial(boardState)
	) {
		evaluation = 0;
	} else {
		let whiteQueenAlive = false;
		let blackQueenAlive = false;
		let whiteMajorPieceCount = 0;
		let blackMajorPieceCount = 0;
		const majorPieceList = ["H", "R", "B"];

		let whiteKingPosition = [-1, -1];
		let blackKingPosition = [-1, -1];

		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				if (boardState[i][j] !== "-") {
					let piece = boardState[i][j][1];
					let colour = boardState[i][j][0];
					let direction = colour === "w" ? 1 : -1;
					if (piece !== "K") {
						const pieceTable = pieceSquareTable[colour + piece];
						// console.log(colour + piece, i, j, pieceTable[i][j])
						evaluation += (piecevalue[piece] + pieceTable[i][j]) * direction;

						if (colour === "w") {
							if (piece === "Q") whiteQueenAlive = true;
							else if (majorPieceList.includes(piece)) whiteMajorPieceCount++;
						} else {
							if (piece === "Q") blackQueenAlive = true;
							else if (majorPieceList.includes(piece)) blackMajorPieceCount++;
						}
					} else if (piece === "K") {
						if (colour === "w") whiteKingPosition = [i, j];
						else blackKingPosition = [i, j];
					}
				}
			}
		}

		const whiteEndgame =
			!whiteQueenAlive || whiteMajorPieceCount <= 1 ? true : false;
		const blackEndgame =
			!blackQueenAlive || blackMajorPieceCount <= 1 ? true : false;

		const [blackKingRow, blackKingCol] = blackKingPosition;
		const [whiteKingRow, whiteKingCol] = whiteKingPosition;
		const gamePhase = whiteEndgame && blackEndgame ? "eg" : "mg";

		evaluation +=
			kingSquareTable[gamePhase + "wK"][whiteKingRow][whiteKingCol] -
			kingSquareTable[gamePhase + "bK"][blackKingRow][blackKingCol];
	}

	return evaluation;
}
