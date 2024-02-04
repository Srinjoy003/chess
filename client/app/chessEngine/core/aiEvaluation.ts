// Piece and Color Definitions
const PAWN = 0;
const KNIGHT = 1;
const BISHOP = 2;
const ROOK = 3;
const QUEEN = 4;
const KING = 5;

// Board Representation
const WHITE = 0;
const BLACK = 1;

const WHITE_PAWN = 2 * PAWN + WHITE;
const BLACK_PAWN = 2 * PAWN + BLACK;
const WHITE_KNIGHT = 2 * KNIGHT + WHITE;
const BLACK_KNIGHT = 2 * KNIGHT + BLACK;
const WHITE_BISHOP = 2 * BISHOP + WHITE;
const BLACK_BISHOP = 2 * BISHOP + BLACK;
const WHITE_ROOK = 2 * ROOK + WHITE;
const BLACK_ROOK = 2 * ROOK + BLACK;
const WHITE_QUEEN = 2 * QUEEN + WHITE;
const BLACK_QUEEN = 2 * QUEEN + BLACK;
const WHITE_KING = 2 * KING + WHITE;
const BLACK_KING = 2 * KING + BLACK;
const EMPTY = BLACK_KING + 1;

const PCOLOR = (p: number) => p & 1;

let side2move: number;
const board: number[] = Array(64).fill(0);

const FLIP = (sq: number) => sq ^ 56;
const OTHER = (side: number) => side ^ 1;

const mg_value: number[] = [82, 337, 365, 477, 1025, 0];
const eg_value: number[] = [94, 281, 297, 512, 936, 0];

// Piece/sq tables
const mg_pawn_table: number[] = [
	0, 0, 0, 0, 0, 0, 0, 0, 98, 134, 61, 95, 68, 126, 34, -11, -6, 7, 26, 31, 65,
	56, 25, -20, -14, 13, 6, 21, 23, 12, 17, -23, -27, -2, -5, 12, 17, 6, 10, -25,
	-26, -4, -4, -10, 3, 3, 33, -12, -35, -1, -20, -23, -15, 24, 38, -22, 0, 0, 0,
	0, 0, 0, 0, 0,
];

const eg_pawn_table: number[] = [
	0, 0, 0, 0, 0, 0, 0, 0, 178, 173, 158, 134, 147, 132, 165, 187, 94, 100, 85,
	67, 56, 53, 82, 84, 32, 24, 13, 5, -2, 4, 17, 17, 13, 9, -3, -7, -7, -8, 3,
	-1, 4, 7, -6, 1, 0, -5, -1, -8, 13, 8, 8, 10, 13, 0, 2, -7, 0, 0, 0, 0, 0, 0,
	0, 0,
];

const mg_knight_table: number[] = [
	-167, -89, -34, -49, 61, -97, -15, -107, -73, -41, 72, 36, 23, 62, 7, -17,
	-47, 60, 37, 65, 84, 129, 73, 44, -9, 17, 19, 53, 37, 69, 18, 22, -13, 4, 16,
	13, 28, 19, 21, -8, -23, -9, 12, 10, 19, 17, 25, -16, -29, -53, -12, -3, -1,
	18, -14, -19, -105, -21, -58, -33, -17, -28, -19, -23,
];

const eg_knight_table: number[] = [
	-58, -38, -13, -28, -31, -27, -63, -99, -25, -8, -25, -2, -9, -25, -24, -52,
	-24, -20, 10, 9, -1, -9, -19, -41, -17, 3, 22, 22, 22, 11, 8, -18, -18, -6,
	16, 25, 16, 17, 4, -18, -23, -3, -1, 15, 10, -3, -20, -22, -42, -20, -10, -5,
	-2, -20, -23, -44, -29, -51, -23, -15, -22, -18, -50, -64,
];

const mg_bishop_table: number[] = [
	-29, 4, -82, -37, -25, -42, 7, -8, -26, 16, -18, -13, 30, 59, 18, -47, -16,
	37, 43, 40, 35, 50, 37, -2, -4, 5, 19, 50, 37, 37, 7, -2, -6, 13, 13, 26, 34,
	12, 10, 4, 0, 15, 15, 15, 14, 27, 18, 10, 4, 15, 16, 0, 7, 21, 33, 1, -33, -3,
	-14, -21, -13, -12, -39, -21,
];

const eg_bishop_table: number[] = [
	-14, -21, -11, -8, -7, -9, -17, -24, -8, -4, 7, -12, -3, -13, -4, -14, 2, -8,
	0, -1, -2, 6, 0, 4, -3, 9, 12, 9, 14, 10, 3, 2, -3, 5, -5, -2, 9, 7, -1, -6,
	3, 13, 19, 7, 10, -3, -9, -12, -3, 8, 10, 13, 3, -7, -15, -14, -18, -7, -1, 4,
	-9, -15, -27, -23, -9, -23, -5, -9, -16, -5, -17,
];

const mg_rook_table: number[] = [
	32, 42, 32, 51, 63, 9, 31, 43, 27, 32, 58, 62, 80, 67, 26, 44, -5, 19, 26, 36,
	17, 45, 61, 16, -24, -11, 7, 26, 24, 35, -8, -20, -36, -26, -12, -1, 9, -7, 6,
	-23, -45, -25, -16, -17, 3, 0, -5, -33, -44, -16, -20, -9, -1, 11, -6, -71,
	-19, -13, 1, 17, 16, 7, -37, -26,
];

const eg_rook_table: number[] = [
	13, 10, 18, 15, 12, 12, 8, 5, 11, 13, 13, 11, -3, 3, 8, 3, 7, 7, 7, 5, 4, -3,
	-5, -3, 4, 3, 13, 1, 2, 1, -1, 2, 3, 5, 8, 4, -5, -6, -8, -11, -4, 0, -5, -1,
	-7, -12, -8, -16, -6, -6, 0, 2, -9, -9, -11, -3, -9, 2, 3, -1, -5, -13, 4,
	-20,
];

const mg_queen_table: number[] = [
	-28, 0, 29, 12, 59, 44, 43, 45, -24, -39, -5, 1, -16, 57, 28, 54, -13, -17, 7,
	8, 29, 56, 47, 57, -27, -27, -16, -16, -1, 17, -2, 1, -9, -26, -9, -10, -2,
	-4, 3, -3, -14, 2, -11, -2, -5, 2, 14, 5, -35, -8, 11, 2, 8, 15, -3, 1, -1,
	-18, -9, 10, -15, -25, -31, -50,
];

const eg_queen_table: number[] = [
	-9, 22, 22, 27, 27, 19, 10, 20, -17, 20, 32, 41, 58, 25, 30, 0, -20, 6, 9, 49,
	47, 35, 19, 9, 3, 22, 24, 45, 57, 40, 57, 36, -18, 28, 19, 47, 31, 34, 39, 23,
	-16, -27, 15, 6, 9, 17, 10, 5, -22, -23, -30, -16, -16, -23, -36, -32, -33,
	-28, -22, -43, -5, -32, -20, -41,
];

const mg_king_table: number[] = [
	-65, 23, 16, -15, -56, -34, 2, 13, 29, -1, -20, -7, -8, -4, -38, -29, -9, 24,
	2, -16, -20, 6, 22, -22, -17, -20, -12, -27, -30, -25, -14, -36, -49, -1, -27,
	-39, -46, -44, -33, -51, -14, -14, -22, -46, -44, -30, -15, -27, 1, 7, -8,
	-64, -43, -16, 9, 8, -15, 36, 12, -54, 8, -28, 24, 14,
];

const eg_king_table: number[] = [
	-74, -35, -18, -18, -11, 15, 4, -17, -12, 17, 14, 17, 17, 38, 23, 11, 10, 17,
	23, 15, 20, 45, 44, 13, -8, 22, 24, 27, 26, 33, 26, 3, -18, -4, 21, 24, 27,
	23, 9, -11, -19, -3, 11, 21, 23, 16, 7, -9, -27, -11, 4, 13, 14, 4, -5, -17,
	-53, -34, -21, -11, -28, -14, -24, -43,
];

const mg_pesto_table: number[][] = [
	mg_pawn_table,
	mg_knight_table,
	mg_bishop_table,
	mg_rook_table,
	mg_queen_table,
	mg_king_table,
];

const eg_pesto_table: number[][] = [
	eg_pawn_table,
	eg_knight_table,
	eg_bishop_table,
	eg_rook_table,
	eg_queen_table,
	eg_king_table,
];

const gamephaseInc: number[] = [0, 0, 1, 1, 1, 1, 2, 2, 4, 4, 0, 0];

const mg_table: number[][] = Array.from({ length: 12 }, () =>
	Array(64).fill(0)
);
const eg_table: number[][] = Array.from({ length: 12 }, () =>
	Array(64).fill(0)
);

function initTables() {
	for (let p = PAWN, pc = WHITE_PAWN; p <= KING; pc += 2, p++) {
		for (let sq = 0; sq < 64; sq++) {
			mg_table[pc][sq] = mg_value[p] + mg_pesto_table[p][sq];
			eg_table[pc][sq] = eg_value[p] + eg_pesto_table[p][sq];
			mg_table[pc + 1][sq] = mg_value[p] + mg_pesto_table[p][FLIP(sq)];
			eg_table[pc + 1][sq] = eg_value[p] + eg_pesto_table[p][FLIP(sq)];
		}
	}
}

function evaluate() {
	const mg: number[] = [0, 0];
	const eg: number[] = [0, 0];
	let gamePhase = 0;

	for (let sq = 0; sq < 64; ++sq) {
		const pc = board[sq];
		if (pc !== EMPTY) {
			mg[PCOLOR(pc)] += mg_table[pc][sq];
			eg[PCOLOR(pc)] += eg_table[pc][sq];
			gamePhase += gamephaseInc[pc];
		}
	}

	const mgScore = mg[side2move] - mg[OTHER(side2move)];
	const egScore = eg[side2move] - eg[OTHER(side2move)];
	let mgPhase = gamePhase;
	if (mgPhase > 24) mgPhase = 24; // In case of early promotion
	const egPhase = 24 - mgPhase;
	return (mgScore * mgPhase + egScore * egPhase) / 24;
}

function flatten2DArray<T>(arr2D: T[][]): T[] {
	return arr2D.reduce((flatArray, row) => flatArray.concat(row), []);
}

// Example usage:
const twoDArray: number[][] = [
	[1, 2, 3],
	[4, 5, 6],
	[7, 8, 9],
];

const oneDArray: number[] = flatten2DArray(twoDArray);
console.log("Flattened Array:", oneDArray);

function replacePieceStrings(arr2D: string[][]): number[][] {
	const pieceMap: Record<string, number> = {
		wP: WHITE_PAWN,
		bP: BLACK_PAWN,
		wN: WHITE_KNIGHT,
		bN: BLACK_KNIGHT,
		wB: WHITE_BISHOP,
		bB: BLACK_BISHOP,
		wR: WHITE_ROOK,
		bR: BLACK_ROOK,
		wQ: WHITE_QUEEN,
		bQ: BLACK_QUEEN,
		wK: WHITE_KING,
		bK: BLACK_KING,
		"": EMPTY,
	};

	return arr2D.map(
		(row) =>
			row.map((cell) =>
				pieceMap[cell] !== undefined ? pieceMap[cell] : cell
			) as number[]
	);
}

const chessboard: string[][] = [
	["wP", "wN", "wB", "wR", "wQ", "wK"],
	["bP", "bN", "bB", "bR", "bQ", "bK"],
	["", "", "", "", "", ""],
	["", "", "", "", "", ""],
];

const updatedChessboard: number[][] = replacePieceStrings(chessboard);

console.log("Updated Chessboard:", updatedChessboard);

// Example usage:
side2move = WHITE;
board[27] = WHITE_KING;
board[28] = BLACK_PAWN;
initTables();
const evaluation = evaluate();
console.log("Evaluation:", evaluation);

/////board is not initialized with empty but with 0
//check if flatten works
