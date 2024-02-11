import { MoveList } from "./helperFunctions";

export function ImprovedTotalMoveList(
	boardState: string[][],
	currentTurn: string,
	prevMove: [number, number] | null,
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean]
): number[][] {
	const totalMoveList: number[][] = [];

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

				for (let a of moveList) {
					const move: [number, number] = [position, a];
					totalMoveList.push(move);
				}
			}
		}
	}
	return totalMoveList;
}

export function CreateBoardMap(): string[][] {
	const board: string[][] = [];

	for (let i = 0; i <= 7; i++) {
		let row: string[] = [];
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

module.exports = { CreateBoardMap, ImprovedTotalMoveList };