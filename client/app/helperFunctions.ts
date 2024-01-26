import {
	MoveMaker,
	deepCopyBoard,
	deepCopyCastling,
	deepCopyPrevMove,
	UnmakeMove,
} from "./chessAi/MoveGenerator";
import { ImprovedTotalMoveList } from "./chessAi/aiMoves";

export function EnPassantMoveList(
	currentPiece: string,
	position: number,
	boardState: string[][],
	prevMove: [number, number] | null
): number[] {
	const enpassantMoveList = [];

	if (currentPiece[1] === "P") {
		const currentPieceColour = currentPiece[0];
		const opponentColour = currentPieceColour === "w" ? "b" : "w";
		const prevMoveDirection = opponentColour === "w" ? -1 : 1;
		const row = opponentColour === "w" ? 3 : 4;

		for (let col = 0; col < 8; col++) {
			const opponentPosition = row * 10 + col;
			if (
				boardState[row][col] === opponentColour + "P" &&
				prevMove &&
				prevMove[1] === opponentPosition &&
				prevMove[0] === prevMove[1] + prevMoveDirection * 20 &&
				(position === opponentPosition + 1 || position === opponentPosition - 1)
			) {
				enpassantMoveList.push(opponentPosition + prevMoveDirection * 10);
			}
		}
	}

	return enpassantMoveList;
}

function FasterEnpassantMoveFinder(
	currentPiece: string,
	position: number,
	boardState: string[][],
	prevMove: [number, number] | null
): number[] {
	const enpassantMoveList = [];

	if (currentPiece[1] === "P") {
		const currentPieceColour = currentPiece[0];
		const opponentColour = currentPieceColour === "w" ? "b" : "w";
		const prevMoveDirection = opponentColour === "w" ? -1 : 1;
		const row = opponentColour === "w" ? 3 : 4;

		if (prevMove && prevMove[0] !== -1 && prevMove[1] !== -1) {
			const opponentPosition = prevMove[1];
			const col = opponentPosition % 10;
			if (
				boardState[row][col] === opponentColour + "P" &&
				prevMove[0] === prevMove[1] + prevMoveDirection * 20 &&
				(position === opponentPosition + 1 || position === opponentPosition - 1)
			) {
				enpassantMoveList.push(opponentPosition + prevMoveDirection * 10);
			}
		}
	}

	return enpassantMoveList;
}

function PawnMoveList( //refactor later
	currentPiece: string,
	position: number,
	boardState: string[][],
	prevMove: [number, number] | null
): number[] {
	const moveList = [];
	const row = Math.floor(position / 10); //0 to 7
	const col = position % 10;
	const pieceColour = currentPiece[0];
	const direction = pieceColour === "w" ? 1 : -1;

	if (row < 7 && row > 0) {
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

	const enpassantMoveList = EnPassantMoveList(
		currentPiece,
		position,
		boardState,
		prevMove
	);
	moveList.push(...enpassantMoveList);

	// const enpassantMoveList = FasterEnpassantMoveFinder(
	// 	currentPiece,
	// 	position,
	// 	boardState,
	// 	prevMove
	// );
	// moveList.push(...enpassantMoveList);
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

export function CastlingMoveList(
	currentKing: string,
	boardState: string[][],
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean]
): number[] {
	const castlingMoveList = [];

	if (currentKing[1] === "K") {
		//check ;ater
		const kingColour = currentKing[0];
		const currentTurn = kingColour;

		const opponentMoveList = OpponentMoveList(currentTurn, boardState);
		const leftWhiteCastleSquares = [2, 3];
		const rightWhiteCastleSquares = [5, 6];
		const leftBlackCastleSquares = [72, 73];
		const rightBlackCastleSquares = [75, 76];

		const leftBlackCatlingNonCheckingSquare = 71; //here we only check if this square is empty
		const leftWhiteCatlingNonCheckingSquare = 1;

		const isSquareEmpty = (squarePosition: number) => {
			const row = Math.floor(squarePosition / 10);
			const col = squarePosition % 10;
			return boardState[row][col] === "-";
		};

		const isSquaresSafe = (castleMovelist: number[]) => {
			return castleMovelist.every((square) => {
				const row = Math.floor(square / 10);
				const col = square % 10;

				return (
					!opponentMoveList.includes(square) && boardState[row][col] === "-"
				);
			});
		};

		if (
			kingColour === "w" &&
			whiteCastling[1] === false &&
			!InCheck(kingColour, boardState)
		) {
			if (
				isSquaresSafe(leftWhiteCastleSquares) &&
				isSquareEmpty(leftWhiteCatlingNonCheckingSquare) &&
				whiteCastling[0] === false &&
				boardState[0][0] === "wR"
			) {
				castlingMoveList.push(2);
			}

			if (
				isSquaresSafe(rightWhiteCastleSquares) &&
				whiteCastling[2] === false &&
				boardState[0][7] === "wR"
			) {
				castlingMoveList.push(6);
			}
		} else if (
			kingColour === "b" &&
			blackCastling[1] === false &&
			!InCheck(kingColour, boardState)
		) {
			if (
				isSquaresSafe(leftBlackCastleSquares) &&
				isSquareEmpty(leftBlackCatlingNonCheckingSquare) &&
				blackCastling[0] === false &&
				boardState[7][0] === "bR"
			) {
				castlingMoveList.push(72);
			}

			if (
				isSquaresSafe(rightBlackCastleSquares) &&
				blackCastling[2] === false &&
				boardState[7][7] === "bR"
			) {
				castlingMoveList.push(76);
			}
		}
	}

	return castlingMoveList;
}

function KingMoveList(
	currentPiece: string,
	position: number,
	boardState: string[][],
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean]
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

	const castlingMoveList = CastlingMoveList(
		currentPiece,
		boardState,
		whiteCastling,
		blackCastling
	);

	finalMoveList.push(...castlingMoveList);
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

// export function InCheck2(currentTurn: string, boardState: string[][]): boolean {
// 	const kingPosition = findKing(currentTurn, boardState);
// 	const row = Math.floor(kingPosition / 10); //0 to 7
// 	const col = kingPosition % 10;
// 	const opponentColour = currentTurn === "w" ? "b" : "w";
// 	const pawnAttackDirection = currentTurn === "w" ? 1 : -1;

// 	const pawnAttackMoves = [1, -1];

// 	for (const dy of pawnAttackMoves) {
// 		const moveRow = row + pawnAttackDirection;
// 		const moveCol = col + dy;
// 		if (moveRow >= 0 && moveRow <= 7 && moveCol >= 0 && moveCol <= 7) {
// 			if (boardState[moveRow][moveCol] === opponentColour + "P") return true;
// 		}
// 	}

// 	const knightMoves = [
// 		[-2, -1],
// 		[-2, 1],
// 		[-1, -2],
// 		[-1, 2],
// 		[1, -2],
// 		[1, 2],
// 		[2, -1],
// 		[2, 1],
// 	];

// 	for (const [dx, dy] of knightMoves) {
// 		const moveRow = row + dx;
// 		const moveCol = col + dy;

// 		if (moveRow >= 0 && moveRow <= 7 && moveCol >= 0 && moveCol <= 7) {
// 			if (boardState[moveRow][moveCol] === opponentColour + "H") {
// 				return true;
// 			}
// 		}
// 	}

// 	const slidingDirections = [
// 		[-1, -1],
// 		[-1, 0],
// 		[-1, 1],
// 		[0, -1],
// 		[0, 1],
// 		[1, -1],
// 		[1, 0],
// 		[1, 1],
// 	];

// 	const slidingPieces = ["B", "Q", "R"];

// 	for (const [dx, dy] of slidingDirections) {
// 		//for sliding pieces
// 		let moveRow = row + dx;
// 		let moveCol = col + dy;
// 		let iteration = 1

// 		while (moveRow >= 0 && moveRow <= 7 && moveCol >= 0 && moveCol <= 7) {
// 			const piece = boardState[moveRow][moveCol];
// 			if (iteration === 1 && piece === opponentColour + "K"){
// 				return true
// 			}
// 			if (piece[0] === opponentColour && slidingPieces.includes(piece[1])) {
// 				return true;
// 			} else if (piece !== "-")
// 				//non empty square
// 				break;

// 			moveRow += dx;
// 			moveCol += dy;
// 			iteration++
// 		}
// 	}

// 	return false;
// }

export function IsMoveAllowed(
	currentTurn: string,
	boardState: string[][],
	prevMove: [number, number] | null,
	fromIndex: number,
	toIndex: number,
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean]
): boolean {
	const newWhiteCastling = deepCopyCastling(whiteCastling);
	const newBlackCastling = deepCopyCastling(blackCastling);

	const i1 = Math.floor(fromIndex / 10);
	const j1 = fromIndex % 10;

	const i2 = Math.floor(toIndex / 10);
	const j2 = toIndex % 10;

	const piece = boardState[i1][j1];
	const capturedPiece = boardState[i2][j2];
	const isCastling =
		piece !== "-" && piece[1] === "K" && Math.abs(j1 - j2) > 1 ? true : false;

	const isEnpassant =
		piece !== "-" &&
		piece[1] === "P" &&
		j1 !== j2 &&
		boardState[i2][j2] === "-";

	const isPromotion = false;

	const moveDesc: [number, number, string, boolean, boolean, boolean] = [
		fromIndex,
		toIndex,
		capturedPiece,
		isEnpassant,
		isCastling,
		isPromotion,
	];

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

	const isAllowed = !InCheck(currentTurn, boardState);
	UnmakeMove(boardState, moveDesc);

	return isAllowed;
}

export function MoveList(
	piece: string,
	position: number,
	boardState: string[][],
	prevMove: [number, number] | null,
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean]
): number[] {
	let moveList: number[] = [];

	if (piece !== "-") {
		if (piece[1] === "P") {
			moveList = PawnMoveList(piece, position, boardState, prevMove);
		} else if (piece[1] === "K") {
			moveList = KingMoveList(
				piece,
				position,
				boardState,
				whiteCastling,
				blackCastling
			);
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
		return IsMoveAllowed(
			currentTurn,
			boardState,
			prevMove,
			position,
			movePosition,
			whiteCastling,
			blackCastling
		);
	});

	return moveList;
}

export function CheckMate( //used unfixed version of movemaker
	currentTurn: string,
	boardState: string[][],
	prevMove: [number, number] | null,
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean]
): boolean {
	const currentKing = currentTurn + "K";
	const kingPosition = findKing(currentTurn, boardState);

	if (InCheck(currentTurn, boardState)) {
		const kingMoveList = MoveList(
			currentKing,
			kingPosition,
			boardState,
			prevMove,
			whiteCastling,
			blackCastling
		);
		if (kingMoveList.length === 0) {
			const totalMoveList = ImprovedTotalMoveList(
				boardState,
				currentTurn,
				prevMove,
				whiteCastling,
				blackCastling
			);

			let isMate = true;

			for (let [fromIndex, toIndex] of totalMoveList) {
				const i1 = Math.floor(fromIndex / 10);
				const j1 = fromIndex % 10;

				const i2 = Math.floor(toIndex / 10);
				const j2 = toIndex % 10;

				const piece = boardState[i1][j1];
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
					fromIndex,
					toIndex,
					capturedPiece,
					isEnpassant,
					isCastling,
					isPromotion,
				];

				MoveMaker(
					boardState,
					fromIndex,
					toIndex,
					"hello",
					isPromotion,
					isCastling,
					isEnpassant,
					whiteCastling,
					blackCastling
				);

				if (!InCheck(currentTurn, boardState)) {
					isMate = false;
				}
				UnmakeMove(boardState, moveDesc);
				if (!isMate) break;
			}
			return isMate;
		}
	}

	return false;
}

function TotalMoveList(
	boardState: string[][],
	currentTurn: string,
	prevMove: [number, number] | null,
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean]
): number[] {
	const totalMoveList = [];

	for (let row = 0; row < 8; row++) {
		for (let col = 0; col < 8; col++) {
			if (boardState[row][col][0] === currentTurn) {
				const piece = boardState[row][col];
				const position = row * 10 + col;
				const moveList = MoveList(
					piece,
					position,
					boardState,
					prevMove,
					whiteCastling,
					blackCastling
				);
				totalMoveList.push(...moveList);
			}
		}
	}
	return totalMoveList;
}

export function StaleMate(
	boardState: string[][],
	currentTurn: string,
	prevMove: [number, number] | null,
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean]
): boolean {
	const totalMoveList = TotalMoveList(
		boardState,
		currentTurn,
		prevMove,
		whiteCastling,
		blackCastling
	);
	if (totalMoveList.length === 0 && !InCheck(currentTurn, boardState)) {
		return true;
	}
	return false;
}

export function InsufficientMaterial(boardState: string[][]): boolean {
	const pawnCount = [0, 0];
	const bishopCount = [0, 0];
	const rookCount = [0, 0];
	const knightCount = [0, 0];
	const queenCount = [0, 0];

	for (let row = 0; row < 8; row++) {
		for (let col = 0; col < 8; col++) {
			if (boardState[row][col] !== "-") {
				const colour = boardState[row][col][0];
				const piece = boardState[row][col][1];
				const index = colour === "b" ? 0 : 1;

				if (piece === "P") pawnCount[index] += 1;
				else if (piece === "B") bishopCount[index] += 1;
				else if (piece === "R") rookCount[index] += 1;
				else if (piece === "H") knightCount[index] += 1;
				else if (piece === "Q") queenCount[index] += 1;
			}
		}
	}

	if (
		//no queen, pawn or rook for either side
		pawnCount[0] === 0 &&
		pawnCount[1] === 0 &&
		queenCount[0] === 0 &&
		queenCount[1] === 0 &&
		rookCount[0] === 0 &&
		rookCount[1] === 0
	) {
		if (
			(bishopCount[0] === 0 && //king and 1 knight(or less) for either side(eg: 1K,1H vs 1K)
				bishopCount[1] === 0 &&
				knightCount[0] <= 1 &&
				knightCount[1] <= 1) ||
			(bishopCount[0] <= 1 && //king and 1 bishop(or less) for either side
				bishopCount[1] <= 1 &&
				knightCount[0] === 0 &&
				knightCount[1] === 0) ||
			(bishopCount[0] === 0 && //only king for either side
				bishopCount[1] === 0 &&
				knightCount[0] === 0 &&
				knightCount[1] === 0) ||
			(bishopCount[0] === 0 && //king and 2 knight(or less) on one side vs a lone king
				bishopCount[1] === 0 &&
				((knightCount[0] <= 2 && knightCount[1] === 0) ||
					(knightCount[0] === 0 && knightCount[1] <= 2)))
		) {
			return true;
		}
	}

	return false;
}

export function arraysEqual(arr1: string[][], arr2: string[][]) {
	if (JSON.stringify(arr1) === JSON.stringify(arr2)) {
		return true;
	}

	return false;
}

export function arraysEqualNumber(arr1: number[][], arr2: number[][]) {
	if (JSON.stringify(arr1) === JSON.stringify(arr2)) {
		return true;
	}

	return false;
}

export function ThreeFoldRepetition(
	positionList: Array<[string, string[][]]>,
	currentPosition: [string, string[][]]
): boolean {
	let count = 0;
	for (const [turn, boardstate] of positionList) {
		if (
			turn === currentPosition[0] &&
			arraysEqual(boardstate, currentPosition[1])
		) {
			count++;
		}
	}

	return count === 3;
}

export function isGameOver(
	boardState: string[][],
	currentTurn: string,
	prevMove: [number, number] | null,
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean]
): boolean {
	if (
		CheckMate(
			currentTurn,
			boardState,
			prevMove,
			whiteCastling,
			blackCastling
		) ||
		StaleMate(
			boardState,
			currentTurn,
			prevMove,
			whiteCastling,
			blackCastling
		) ||
		InsufficientMaterial(boardState)
	) {
		return true;
	}
	return false;
}

export function PieceAtPosition(
	boardState: string[][],
	position: number
): string {
	const rank = Math.floor(position / 10);
	const file = position % 10;
	return boardState[rank][file];
}

function isCaptureMove(boardState: string[][], move: number[]): boolean {
	const [fromIndex, toIndex] = move;
	const i1 = Math.floor(fromIndex / 10);
	const j1 = fromIndex % 10;

	const i2 = Math.floor(toIndex / 10);
	const j2 = toIndex % 10;

	const capturePiece = boardState[i2][j2];

	if (capturePiece !== "-") return true;

	return false;
}

export function CaptureMoveList(
	boardState: string[][],
	currentTurn: string,
	prevMove: [number, number] | null,
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean]
): number[][] {
	const totalMoveList = ImprovedTotalMoveList(
		boardState,
		currentTurn,
		prevMove,
		whiteCastling,
		blackCastling
	);
	const captureMoveList = totalMoveList.filter((move) =>
		isCaptureMove(boardState, move)
	);
	return captureMoveList;
}
