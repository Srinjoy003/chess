import { CreateBoardMap } from "../chessFunctions/moves";

export type PlayState = {
	serverBoardState: string[][];
	serverPrevMove: [number, number];
	serverWhiteCastling: [boolean, boolean, boolean];
	serverBlackCastling: [boolean, boolean, boolean];
	serverTurn: string;
};

export function initializePlayState(
	roomId: string,
	playStateByRoom: Record<string, PlayState>
) {
	const boardState: string[][] = CreateBoardMap();
	const prevMove: [number, number] = [-1, -1];
	const whiteCastling: [boolean, boolean, boolean] = [false, false, false];
	const blackCastling: [boolean, boolean, boolean] = [false, false, false];
	let currentTurn: string = "w";

	playStateByRoom[roomId] = {
		serverBoardState: boardState,
		serverPrevMove: prevMove,
		serverWhiteCastling: whiteCastling,
		serverBlackCastling: blackCastling,
		serverTurn: currentTurn,
	};
}
