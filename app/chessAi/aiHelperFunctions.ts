export function extractChessPosition(position: number): string {
	const row = Math.floor(position / 10); // Extract the "tens" place as row
	const col = position % 10; // Extract the "ones" place as column
	return String.fromCharCode("a".charCodeAt(0) + col) + (row + 1);
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
) {
	const pieceMap: { [key: string]: string } = {
		P: "wP",
		Q: "wQ",
		H: "wH",
		B: "wB",
		K: "wK",
		R: "wR",
		p: "bP",
		q: "bQ",
		h: "bH",
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

		prevMove[0] = fromMoveRow * 10 + fenCol
		prevMove[1] = toMoveRow * 10 + fenCol		
	}
	return [currentTurn, board];
}

function printChessboard(board: string[][]) {
	for (const row of board) {
		console.log(row.join(" "));
	}
}

// Example usage
const fen = "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR b KQkq a3 0 1";
const whiteCastling: [boolean, boolean, boolean] = [true, true, true];
const blackCastling: [boolean, boolean, boolean] = [true, true, true];
const prevMove: [number, number] = [-1, -1];

const [currentTurn, chessboard] = fenToChessboard(fen, whiteCastling, blackCastling, prevMove);
// console.log(chessboard)
// console.log(prevMove)
// printChessboard(chessboard);
