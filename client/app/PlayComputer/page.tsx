"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ChessBoard from "./ChessBoard";
import { Providers } from "../reduxStore/provider";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";


export default function Home() {


	return (
		<Providers>
			<DndProvider backend={HTML5Backend}>
				<ChessBoard />
			</DndProvider>
		</Providers>
	);
}
