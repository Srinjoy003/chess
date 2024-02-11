"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ChessBoard from "./components/ChessBoard";
import { Providers } from "./reduxStore/provider";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

type moveProps = { fromIndex: number; toIndex: number; promotionMove: string };
export type PlayState = {
	serverBoardState: string[][];
	serverPrevMove: [number, number];
	serverWhiteCastling: [boolean, boolean, boolean];
	serverBlackCastling: [boolean, boolean, boolean];
	serverTurn: string;
};

export default function Home() {
	const [socket, setSocket] = useState<Socket>(io("http://localhost:3002"));
	const [moveFromIndex, setMoveFromIndex] = useState<number | null>(null); //for sockets
	const [moveToIndex, setMoveToIndex] = useState<number | null>(null);
	const [promotionMove, setPromotionMove] = useState<string | null>(null);
	const [colour, setColour] = useState<string | null>(null);
	const [playState, setPlayState] = useState<PlayState | null>(null);

	useEffect(() => {
		const socket = io("http://localhost:3001", { reconnection: false });
		setSocket(socket);
		return () => {
			socket.disconnect();
		};
	}, []);

	useEffect(() => {
		socket.on("move", (move: moveProps) => {
			setMoveFromIndex(move.fromIndex);
			setMoveToIndex(move.toIndex);
			setPromotionMove(move.promotionMove);
			console.log(
				"RECIEVED DATA",
				move.fromIndex,
				move.toIndex,
				move.promotionMove
			);
		});

		socket.on("colorAssigned", (colour: string) => {
			setColour(colour);
			console.log("RECIEVED COLOUR", colour);
		});

		socket.on("playState", (playState: PlayState) => {
			setPlayState(playState);
			console.log("RECIEVED PLAYSTATE", playState);
		});
	}, [socket]);

	return (
		<Providers>
			<DndProvider backend={HTML5Backend}>
				<ChessBoard
					moveFromIndex={moveFromIndex}
					moveToIndex={moveToIndex}
					promotionMove={promotionMove}
					socket={socket}
					clientTurnColour={colour}
					playState={playState}
				/>
			</DndProvider>
		</Providers>
	);
}
