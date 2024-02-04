import { extractChessPosition } from "../core/aiHelperFunctions";
import { openingBook } from "./openingBook";
export function moveToUCI(fromIndex: number, toIndex: number) {
	return extractChessPosition(fromIndex) + extractChessPosition(toIndex);
}

export function findOpeningMove(moveList: string[]): string | null {
	const possibleMoves = [];

	for (const line of openingBook) {
		const movesInLine: string[] = line.trim().split(/\s+/);
		if (movesInLine.slice(0, moveList.length).join("") === moveList.join("")) {
			// If the moveList is a prefix of the line, return the next move
			if (movesInLine.length > moveList.length) {
				possibleMoves.push(movesInLine[moveList.length]);
			}
		}
	}

	if (possibleMoves.length === 0) return null;

	const randomIndex = Math.floor(Math.random() * possibleMoves.length);
	return possibleMoves[randomIndex];
}

// Example usage
