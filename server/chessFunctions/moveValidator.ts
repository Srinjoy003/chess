import { ImprovedTotalMoveList } from "./moves";
import { MoveMaker } from "./MoveGenerator";

export function MoveValidator(
	boardState: string[][],
	currentTurn: string,
	prevMove: [number, number] | null,
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean],
	fromIndex: number,
	toIndex: number
): boolean {
	const totalMoveList = ImprovedTotalMoveList(
		boardState,
		currentTurn,
		prevMove,
		whiteCastling,
		blackCastling
	);

	console.log(totalMoveList, fromIndex, toIndex)

	for (let move of totalMoveList) {
		if (fromIndex === move[0] && toIndex === move[1]) {
			return true;
		}
	}

	return false;
}

export function PlayMove(
	boardState: string[][],
	currentTurn: string,
	prevMove: [number, number],
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean],
	fromIndex: number,
	toIndex: number,
	promotionMove: string
) {

	const i1 = Math.floor(fromIndex / 10);
	const j1 = fromIndex % 10;

	const i2 = Math.floor(toIndex / 10);
	const j2 = toIndex % 10;

	const piece = boardState[i1][j1];
	const isCastling =
		piece !== "-" && piece[1] === "K" && Math.abs(j1 - j2) > 1 ? true : false;

	const isEnpassant =
		piece !== "-" &&
		piece[1] === "P" &&
		j1 !== j2 &&
		boardState[i2][j2] === "-";

	const isPromotion =
		(piece[1] === "P" && piece[0] == "w" && i2 === 7) ||
		(piece[0] == "b" && i2 === 0);

	MoveMaker(
		boardState,
		fromIndex,
		toIndex,
		promotionMove,
		isPromotion,
		isCastling,
		isEnpassant,
		whiteCastling,
		blackCastling
	);

    prevMove[0] = fromIndex;
    prevMove[1] = toIndex;
}
