"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ChessBoard from "./components/ChessBoard";
import { Providers } from "./reduxStore/provider";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

type moveProps = { fromIndex: number; toIndex: number };
const socket = io("http://localhost:3001");

export default function Home() {
	const [moveFromIndex, setMoveFromIndex] = useState<number | null>(null); //for sockets
	const [moveToIndex, setMoveToIndex] = useState<number | null>(null);
	const [colour, setColour] = useState<string | null>(null);

	// useEffect(() => {
	// 	socket.on("move", (move: moveProps) => {
	// 		setMoveFromIndex(move.fromIndex);
	// 		setMoveToIndex(move.toIndex);
	// 		console.log("RECIEVED DATA", move.fromIndex, move.toIndex);
	// 	});

	// 	socket.on("colorAssigned", (colour: string) => {
	// 		setColour(colour);
	// 		console.log("RECIEVED COLOUR", colour);
	// 	});
	// }, []);

	
	return (
		<Providers>
			<DndProvider backend={HTML5Backend}>
				<ChessBoard
					moveFromIndex={moveFromIndex}
					moveToIndex={moveToIndex}
					socket={socket}
					clientTurnColour={colour}
				/>
			</DndProvider>
		</Providers>
	);
}
