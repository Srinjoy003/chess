function CreateBoardMap() {
	const board = [];

	for (let i = 0; i <= 7; i++) {
		let row = [];
		for (let j = 0; j <= 7; j++) {
			let piece = "";
			let colour = "";

			if (i == 1 || i == 6) piece = "P";
			else if (i == 0 || i == 7) {
				if (j == 0 || j == 7) piece = "R";
				else if (j == 1 || j == 6) piece = "H";
				else if (j == 2 || j == 5) piece = "B";
				else if (j == 3) piece = "Q";
				else if (j == 4) piece = "K";
			} else piece = "-";

			if (i < 2) colour = "w";
			else if (i > 5) colour = "b";

			row.push(colour + piece);
		}

		board.push(row);
	}

	return board;
}

function PawnMoveList( //refactor later
	currentPiece: string,
	position: number,
	boardState: string[][]
): number[] {
	const moveList = [];
	const row = Math.floor(position / 10); //0 to 7
	const col = position % 10;
	const pieceColour = currentPiece[0];
	const direction = pieceColour === "w" ? 1 : -1;

	if (row < 7) {
		const moveRow = row + direction;
		const moveCol = col;
		const movePosition = moveRow * 10 + moveCol;

		if (boardState[moveRow][moveCol] === "-")
			//forward move
			moveList.push(movePosition);

		if (col > 0) {
			//left diagonal capture
			const leftCaptureRow = row + direction;
			const leftCaptureCol = col - 1;
			const leftCapturePosition = leftCaptureRow * 10 + leftCaptureCol;
			const leftCapturePieceColour =
				boardState[leftCaptureRow][leftCaptureCol][0];

			if (
				leftCapturePieceColour !== "-" &&
				leftCapturePieceColour !== pieceColour
			) {
				//if opposite colour piece exists
				moveList.push(leftCapturePosition);
			}
		}

		if (col < 7) {
			//right diagonal capture
			const rightCaptureRow = row + direction;
			const rightCaptureCol = col + 1;
			const rightCapturePosition = rightCaptureRow * 10 + rightCaptureCol;
			const rightCapturePieceColour =
				boardState[rightCaptureRow][rightCaptureCol][0];

			if (
				rightCapturePieceColour !== "-" &&
				rightCapturePieceColour !== pieceColour
			) {
				//if opposite colour piece exists
				moveList.push(rightCapturePosition);
			}
		}

		if (
			(pieceColour === "w" && row === 1) ||
			(pieceColour === "b" && row === 6)
		) {
			const moveRow = row + direction * 2;
			const moveCol = col;
			const movePosition = moveRow * 10 + moveCol;
			if (
				boardState[moveRow][moveCol] === "-" &&
				boardState[row + direction][col] === "-"
			)
				moveList.push(movePosition);
		}
	}
	return moveList;
}

function OpponentPawnCaptureMoveList( //no forward moves recorded
	currentPiece: string,
	position: number,
	boardState: string[][]
): number[] {
	const moveList = [];
	const row = Math.floor(position / 10); //0 to 7
	const col = position % 10;
	const pieceColour = currentPiece[0];
	const direction = pieceColour === "w" ? 1 : -1;

	if (row < 7) {
		if (col > 0) {
			//left diagonal capture
			const leftCaptureRow = row + direction;
			const leftCaptureCol = col - 1;
			const leftCapturePosition = leftCaptureRow * 10 + leftCaptureCol;

			//if opposite colour piece exists
			moveList.push(leftCapturePosition);
		}

		if (col < 7) {
			//right diagonal capture
			const rightCaptureRow = row + direction;
			const rightCaptureCol = col + 1;
			const rightCapturePosition = rightCaptureRow * 10 + rightCaptureCol;

			//if opposite colour piece exists
			moveList.push(rightCapturePosition);
		}
	}
	return moveList;
}

function RookMoveList(
	currentPiece: string,
	position: number,
	boardState: string[][]
): number[] {
	const moveList = [];
	const row = Math.floor(position / 10);
	const col = position % 10;
	const pieceColour = currentPiece[0];

	const directions = [
		[-1, 0],
		[0, -1],
		[0, 1],
		[1, 0],
	];

	for (const [dx, dy] of directions) {
		let moveRow = row + dx;
		let moveCol = col + dy;

		while (moveRow >= 0 && moveRow <= 7 && moveCol >= 0 && moveCol <= 7) {
			const movePieceColour = boardState[moveRow][moveCol][0];

			if (movePieceColour === pieceColour) {
				break;
			}

			const movePosition = moveRow * 10 + moveCol;
			moveList.push(movePosition);

			if (movePieceColour !== "-") {
				break;
			}

			moveRow += dx;
			moveCol += dy;
		}
	}

	return moveList;
}

function BishopMoveList(
	currentPiece: string,
	position: number,
	boardState: string[][]
): number[] {
	const moveList = [];
	const row = Math.floor(position / 10); // 0 to 7
	const col = position % 10;
	const pieceColour = currentPiece[0];

	const directions = [
		[-1, -1],
		[-1, 1],
		[1, -1],
		[1, 1],
	];

	for (const [dx, dy] of directions) {
		let moveRow = row + dx;
		let moveCol = col + dy;

		while (moveRow >= 0 && moveRow <= 7 && moveCol >= 0 && moveCol <= 7) {
			const movePieceColour = boardState[moveRow][moveCol][0];

			if (movePieceColour === pieceColour) {
				break;
			}

			const movePosition = moveRow * 10 + moveCol;
			moveList.push(movePosition);

			if (movePieceColour !== "-") {
				break;
			}

			moveRow += dx;
			moveCol += dy;
		}
	}

	return moveList;
}

function QueenMoveList(
	currentPiece: string,
	position: number,
	boardState: string[][]
): number[] {
	const moveList = [];
	const row = Math.floor(position / 10);
	const col = position % 10;
	const pieceColour = currentPiece[0];

	const directions = [
		[-1, -1],
		[-1, 0],
		[-1, 1],
		[0, -1],
		[0, 1],
		[1, -1],
		[1, 0],
		[1, 1],
	];

	for (const [dx, dy] of directions) {
		let moveRow = row + dx;
		let moveCol = col + dy;

		while (moveRow >= 0 && moveRow <= 7 && moveCol >= 0 && moveCol <= 7) {
			const movePieceColour = boardState[moveRow][moveCol][0];

			if (movePieceColour === pieceColour) {
				break;
			}

			const movePosition = moveRow * 10 + moveCol;
			moveList.push(movePosition);

			if (movePieceColour !== "-") {
				break;
			}

			moveRow += dx;
			moveCol += dy;
		}
	}

	return moveList;
}

function KnightMoveList(
	currentPiece: string,
	position: number,
	boardState: string[][]
): number[] {
	const moveList = [];
	const row = Math.floor(position / 10);
	const col = position % 10;
	const pieceColour = currentPiece[0];

	const knightMoves = [
		[-2, -1],
		[-2, 1],
		[-1, -2],
		[-1, 2],
		[1, -2],
		[1, 2],
		[2, -1],
		[2, 1],
	];

	for (const [dx, dy] of knightMoves) {
		const moveRow = row + dx;
		const moveCol = col + dy;

		if (moveRow >= 0 && moveRow <= 7 && moveCol >= 0 && moveCol <= 7) {
			const movePieceColour = boardState[moveRow][moveCol][0];

			if (movePieceColour !== pieceColour) {
				const movePosition = moveRow * 10 + moveCol;
				moveList.push(movePosition);
			}
		}
	}

	return moveList;
}

function OpponentKingCaptureMoveList(
	currentPiece: string,
	position: number,
	boardState: string[][]
): number[] {
	const moveList = [];
	const row = Math.floor(position / 10); //0 to 7
	const col = position % 10;
	const pieceColour = currentPiece[0];

	const directions = [
		[-1, -1],
		[-1, 0],
		[-1, 1],
		[0, -1],
		[0, 1],
		[1, -1],
		[1, 0],
		[1, 1],
	];

	for (const [dx, dy] of directions) {
		const moveRow = row + dx;
		const moveCol = col + dy;

		if (moveRow >= 0 && moveRow <= 7 && moveCol >= 0 && moveCol <= 7) {
			const movePieceColour = boardState[moveRow][moveCol][0];
			if (movePieceColour !== pieceColour) {
				const movePosition = moveRow * 10 + moveCol;
				moveList.push(movePosition);
			}
		}
	}

	return moveList;
}

export function OpponentPieceMoveList(
	piece: string,
	position: number,
	boardState: string[][]
): number[] {
	if (piece !== "-") {
		if (piece[1] === "P") {
			return OpponentPawnCaptureMoveList(piece, position, boardState);
		}

		if (piece[1] === "K") {
			return OpponentKingCaptureMoveList(piece, position, boardState);
		}

		if (piece[1] === "R") {
			return RookMoveList(piece, position, boardState);
		}

		if (piece[1] === "B") {
			return BishopMoveList(piece, position, boardState);
		}

		if (piece[1] === "Q") {
			return QueenMoveList(piece, position, boardState);
		}

		if (piece[1] === "H") {
			return KnightMoveList(piece, position, boardState);
		}
	}

	return [];
}

function OpponentMoveList(
	currentTurn: string,
	boardState: string[][]
): number[] {
	const totalMoveList = [];
	const opponentColour = currentTurn === "w" ? "b" : "w";

	for (let row = 0; row < 8; row++) {
		for (let col = 0; col < 8; col++) {
			const opponentPiece = boardState[row][col];
			const position = row * 10 + col;

			if (opponentPiece[0] === opponentColour) {
				const moveList = OpponentPieceMoveList(
					opponentPiece,
					position,
					boardState
				);
				totalMoveList.push(...moveList);
			}
		}
	}

	return totalMoveList;
}

function KingMoveList(
	currentPiece: string,
	position: number,
	boardState: string[][]
): number[] {
	const moveList = [];
	const row = Math.floor(position / 10); //0 to 7
	const col = position % 10;
	const pieceColour = currentPiece[0];

	const directions = [
		[-1, -1],
		[-1, 0],
		[-1, 1],
		[0, -1],
		[0, 1],
		[1, -1],
		[1, 0],
		[1, 1],
	];

	for (const [dx, dy] of directions) {
		const moveRow = row + dx;
		const moveCol = col + dy;

		if (moveRow >= 0 && moveRow <= 7 && moveCol >= 0 && moveCol <= 7) {
			const movePieceColour = boardState[moveRow][moveCol][0];
			if (movePieceColour !== pieceColour) {
				const movePosition = moveRow * 10 + moveCol;
				moveList.push(movePosition);
			}
		}
	}

	const opponentCaptureMoveList = OpponentMoveList(pieceColour, boardState);
	const finalMoveList = moveList.filter(
		(move) => !opponentCaptureMoveList.includes(move)
	);

	return finalMoveList;
}

function findKing(kingColour: string, boardState: string[][]): number {
	for (let row = 0; row < 8; row++) {
		for (let col = 0; col < 8; col++) {
			if (boardState[row][col] === kingColour + "K") {
				return row * 10 + col;
			}
		}
	}

	return -1;
}

export function InCheck(currentTurn: string, boardState: string[][]): boolean {
	const opponentCaptureMoveList = OpponentMoveList(currentTurn, boardState);
	const kingPosition = findKing(currentTurn, boardState);

	if (opponentCaptureMoveList.includes(kingPosition)) return true;

	return false;
}

export function IsMoveAllowed(
	currentTurn: string,
	boardState: string[][],
	fromIndex: number,
	toIndex: number
): boolean {
	const updatedBoard = boardState.map((row) => row.slice());

	const i1 = Math.floor(fromIndex / 10);
	const j1 = fromIndex % 10;
	const i2 = Math.floor(toIndex / 10);
	const j2 = toIndex % 10;

	updatedBoard[i2][j2] = updatedBoard[i1][j1];
	updatedBoard[i1][j1] = "-";
	console.log(updatedBoard);

	return !InCheck(currentTurn, updatedBoard);
}

export function MoveList(
	piece: string,
	position: number,
	boardState: string[][]
): number[] {
	let moveList: number[] = [];

	if (piece !== "-") {
		if (piece[1] === "P") {
			moveList = PawnMoveList(piece, position, boardState);
		} else if (piece[1] === "K") {
			moveList = KingMoveList(piece, position, boardState);
		} else if (piece[1] === "R") {
			moveList = RookMoveList(piece, position, boardState);
		} else if (piece[1] === "B") {
			moveList = BishopMoveList(piece, position, boardState);
		} else if (piece[1] === "Q") {
			moveList = QueenMoveList(piece, position, boardState);
		} else if (piece[1] === "H") {
			moveList = KnightMoveList(piece, position, boardState);
		}
	}
	const currentTurn = piece[0];

	moveList = moveList.filter((movePosition) => {
		return IsMoveAllowed(currentTurn, boardState, position, movePosition);
	});

	return moveList;
}

export function CheckMate(currentTurn: string, boardState: string[][]): boolean {
	const currentKing = currentTurn + "K";
	const kingPosition = findKing(currentTurn, boardState);
	const kingMoveList = MoveList(currentKing, kingPosition, boardState);

	if (InCheck(currentTurn, boardState) && kingMoveList.length === 0){
		return true;
	}

	return false;
}
