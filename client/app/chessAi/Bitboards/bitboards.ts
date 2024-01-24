import { PieceAtPosition } from "../../helperFunctions";

export function ConvertToLinearIndex(position: number): number {
	//could slow down the engine
	const rank = Math.floor(position / 10);
	const file = position % 10;
	return rank * 8 + file;
}

export type Bitboards = {
	[key: string]: bigint;
};

export function convertToBitboards(board: string[][]): Bitboards {
	let bitboards: Bitboards = {
		wP: BigInt(0),
		wR: BigInt(0),
		wH: BigInt(0),
		wB: BigInt(0),
		wQ: BigInt(0),
		wK: BigInt(0),
		bP: BigInt(0),
		bR: BigInt(0),
		bH: BigInt(0),
		bB: BigInt(0),
		bQ: BigInt(0),
		bK: BigInt(0),
	};

	for (let row = 0; row < 8; row++) {
		for (let col = 0; col < 8; col++) {
			const piece = board[row][col];

			if (piece !== "-") {
				const pieceColor = piece[0];
				const pieceType = piece[1];

				const squareIndex = row * 8 + col;
				const squareBit = BigInt(1) << BigInt(squareIndex);
				// console.log(bitboards[piece])
				bitboards[piece] |= squareBit;
			}
		}
	}
	return bitboards;
}

export function UpdateBitboardsWithMove( //implement isPromotion later
	//updating of castling privelages later
	boardState: string[][],
	bitboards: Bitboards,
	move: number[]
) {
	const [fromIndex, toIndex] = move;
	const i1 = Math.floor(fromIndex / 10);
	const j1 = fromIndex % 10;

	const i2 = Math.floor(toIndex / 10);
	const j2 = toIndex % 10;

	const movePiece = PieceAtPosition(boardState, fromIndex);
	const capturedPiece = PieceAtPosition(boardState, toIndex);

	const movePieceColour = movePiece[0];

	const fromLinearIndex = ConvertToLinearIndex(fromIndex);
	const toLinearIndex = ConvertToLinearIndex(toIndex);

	const isCastling =
		movePiece !== "-" && movePiece[1] === "K" && Math.abs(j1 - j2) > 1
			? true
			: false;

	const isEnpassant =
		movePiece !== "-" &&
		movePiece[1] === "P" &&
		j1 !== j2 &&
		boardState[i2][j2] === "-";

	bitboards[movePiece] ^=
		(BigInt(1) << BigInt(fromLinearIndex)) |
		(BigInt(1) << BigInt(toLinearIndex));

	if (capturedPiece !== "-") {
		bitboards[capturedPiece] ^= BigInt(1) << BigInt(toLinearIndex);
	}

	if (isEnpassant) {
		const opponentPawnDirection = movePieceColour === "w" ? -8 : 8;
		const capturedPiece = movePieceColour === "w" ? "bP" : "wP";
		const capturedPawnPosition = toLinearIndex + opponentPawnDirection;

		bitboards[capturedPiece] ^= BigInt(1) << BigInt(capturedPawnPosition);
	}

	if (isCastling) {
		if (toIndex === 2) {
			bitboards["wR"] ^= (BigInt(1) << BigInt(0)) | (BigInt(1) << BigInt(3));
		} else if (toIndex === 6) {
			bitboards["wR"] ^= (BigInt(1) << BigInt(7)) | (BigInt(1) << BigInt(5));
		}
		if (toIndex === 72) {
			bitboards["bR"] ^= (BigInt(1) << BigInt(56)) | (BigInt(1) << BigInt(59));
		} else if (toIndex === 76) {
			bitboards["bR"] ^= (BigInt(1) << BigInt(63)) | (BigInt(1) << BigInt(61));
		}
	}
}

export function getNthBit(num: bigint, n: number): bigint {
	const mask = BigInt(1) << BigInt(n);
	return (num & mask) >> BigInt(n);
}

// Example: Convert the starting position to bitboards
const startingPosition: string[][] = [
	["wR", "wH", "wB", "wQ", "wK", "wB", "wH", "wR"],
	["wP", "wP", "wP", "wP", "wP", "wP", "wP", "wP"],
	["-", "-", "-", "-", "-", "-", "-", "-"],
	["-", "-", "-", "-", "-", "-", "-", "-"],
	["-", "-", "-", "-", "-", "-", "-", "-"],
	["-", "-", "-", "-", "-", "-", "-", "-"],
	["bP", "bP", "bP", "bP", "bP", "bP", "bP", "bP"],
	["bR", "bH", "bB", "bQ", "bK", "bB", "bH", "bR"],
];

const bitboards = convertToBitboards(startingPosition);

// // Example: Output the bitboards
// console.log("White Pawns:", bitboards.wP.toString(2).padStart(64, "0"));
// console.log("Black Rooks:", bitboards.bR.toString(2).padStart(64, "0"));
// console.log("Black Knights:", bitboards.bH.toString(2).padStart(64, "0"));
