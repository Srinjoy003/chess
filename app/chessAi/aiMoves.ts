import { MoveList } from "../helperFunctions";

function AiTotalMoveList(
	boardState: string[][],
	currentTurn: string,
	prevMove: [number, number] | null,
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean]
): number[][] {
	const aiTotalMoveList = [];

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
					aiTotalMoveList.push([position, a]);
				}
			}
		}
	}
	return aiTotalMoveList;
}

export function AiRandomMove(
	boardState: string[][],
	currentTurn: string,
	prevMove: [number, number] | null,
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean]
): number[] {
	const aiTotalMoveList = AiTotalMoveList(
		boardState,
		currentTurn,
		prevMove,
		whiteCastling,
		blackCastling
	);

	if (aiTotalMoveList.length === 0) return [];
    
	const randomIndex = Math.floor(Math.random() * aiTotalMoveList.length);
	const aiRandomMove = aiTotalMoveList[randomIndex];

	return aiRandomMove;
}
