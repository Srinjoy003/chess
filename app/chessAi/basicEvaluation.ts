import { CheckMate, InsufficientMaterial, StaleMate } from "../helperFunctions";

const piecevalue: { [key: string]: number } = {
	P: 100,
	H: 300,
	B: 300,
	R: 500,
	Q: 900,
};

export function Evaluate(
	boardState: string[][],
	currentTurn: string,
	prevMove: [number, number] | null,
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean]
): number {
	let evaluation = 0;

	if (CheckMate(currentTurn, boardState, prevMove, whiteCastling, blackCastling)){
		evaluation = currentTurn === 'w' ? -Infinity: Infinity
	}

	else if(StaleMate(boardState, currentTurn, prevMove, whiteCastling, blackCastling) || InsufficientMaterial(boardState)){
		evaluation = 0

	}

	else{
		for (let i = 0; i < 7; i++) {
			for (let j = 0; j < 7; j++) {
				if (boardState[i][j] !== "-") {
					let piece = boardState[i][j][1];
					let colour = boardState[i][j][0];
					let direction = colour === "w" ? 1 : -1;
					evaluation += piecevalue[piece] * direction;
				}
			}
		}
	}


	return evaluation;
}
