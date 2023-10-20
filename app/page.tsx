"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ChessBoard from "./components/ChessBoard";
import { Providers } from "./reduxStore/provider";

export default function Home() {
	return (
		<Providers>
			<DndProvider backend={HTML5Backend}>
				<ChessBoard />
			</DndProvider>
		</Providers>
	);
}
