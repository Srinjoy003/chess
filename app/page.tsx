import Image from "next/image";
import {
	FaChessBishop,
	FaChessKing,
	FaChessKnight,
	FaChessPawn,
	FaChessQueen,
	FaChessRook,
} from "react-icons/fa";

import { v4 as uuidv4 } from "uuid";

function CreateBoardMap() {
	const board = [];

	for (let i = 0; i <= 7; i++) {
		let row = [];
		for (let j = 0; j <= 7; j++) {
			if (i == 1 || i == 6) row.push("P");
			else if (i == 0 || i == 7) {
				if (j == 0 || j == 7) row.push("R");
				else if (j == 1 || j == 6) row.push("H");
				else if (j == 2 || j == 5) row.push("B");
				else if(j == 3) row.push("Q");
				else if(j == 4) row.push("K");

			}
			else
				row.push("_");
		}
		
		board.push(row);
	}

	return board;
}

function CreateBoard(boardMap: string[][]) {
	const board = boardMap.map((row, i) => {
		let newRow = row.map((col, j) => {
			return (
				<div
					className={`flex flex-row w-20 h-20 border-2 border-black text-5xl items-center justify-center ${
						(i + j) % 2 ? "bg-amber-950" : "bg-slate-500"
					} ${i > 5 ? "text-white": "text-black"}`}
					key={i * j}
				>
					{col == "P" && <FaChessPawn />}
					{col == "R" && <FaChessRook />}
					{col == "K" && <FaChessKing />}
					{col == "H" && <FaChessKnight />}
					{col == "Q" && <FaChessQueen />}
					{col == "B" && <FaChessBishop />}




				</div>
			);
		});
		return (
			<div className="flex flex-row" key={uuidv4()}>
				{newRow}
			</div>
		);
	});

	return board;
}

export default function Home() {
	const boardMap = CreateBoardMap();
	const board = CreateBoard(boardMap);

	return (
		<div className="flex flex-col w-screen h-screen items-center justify-center bg-slate-700">
			{board}
		</div>
	);
}
