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

	for (let i = 1; i <= 8; i++) {
		let row = [];
		for (let j = 1; j <= 8; j++) {
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
						(i + j) % 2 ? "bg-amber-950" : "bg-white"
					}`}
					key={i * j}
				>
					<FaChessBishop />
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
