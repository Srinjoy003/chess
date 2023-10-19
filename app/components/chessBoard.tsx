import ChessPiece from "./chessPiece";
import { v4 as uuidv4 } from "uuid";
import Square from "./Square";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../reduxStore/store";
import { InCheck } from "../moveFunctions";
import { CheckMate } from "../moveFunctions";
import { EnPassantMoveList } from "../moveFunctions";

export function CreateBoardMap() {
	const board = [];

	for (let i = 0; i <= 7; i++) {
		let row = [];
		for (let j = 0; j <= 7; j++) {
			let piece = "";
			let colour = "";

			if (i == 1 || i == 6) piece = "P";
			else if (i == 0 || i == 7) {
				if (j == 0 || j == 7) piece = "R";
				else if (j == 1 || j == 6) piece = "H";
				else if (j == 2 || j == 5) piece = "B";
				else if (j == 3) piece = "Q";
				else if (j == 4) piece = "K";
			} else piece = "-";

			if (i < 2) colour = "w";
			else if (i > 5) colour = "b";

			row.push(colour + piece);
		}

		board.push(row);
	}

	return board;
}

export default function ChessBoard() {
	const boardMap = CreateBoardMap();
	const [boardState, setBoardState] = useState(Array.from(boardMap));
	const [selectedPiece, setSelectedPiece] = useState<[number, string] | null>(
		null
	);

	const [prevMove, setPrevMove] = useState<[number, number] | null>(null);

	const turn = useSelector((state: RootState) => state.turn);
	
	const movePiece = (fromIndex: number, toIndex: number) => {
		if (fromIndex != toIndex) {
			const updatedBoard = boardState.map((item) => {
				return item;
			});

			const i1 = Math.floor(fromIndex / 10);
			const j1 = fromIndex % 10;

			const i2 = Math.floor(toIndex / 10);
			const j2 = toIndex % 10;

			updatedBoard[i2][j2] = updatedBoard[i1][j1];
			updatedBoard[i1][j1] = "-";

			if (selectedPiece) {
				const enpassantMoveList = EnPassantMoveList(
					selectedPiece[1],
					selectedPiece[0],
					boardState,
					prevMove
				);


				if (enpassantMoveList.includes(toIndex)) {
					const opponentPawnDirection = selectedPiece[1][0] === "w" ? -1 : 1;
					updatedBoard[i2 + opponentPawnDirection][j2] = "-"
				}
			}

			setBoardState(updatedBoard);
		}
	};

	const board = boardState.map((row, i) => {
		let newRow = row.map((col, j) => {
			return (
				<Square
					boardState={boardState}
					key={i * 10 + j}
					position={i * 10 + j}
					colour={(i + j) % 2 ? "bg-chess-dark" : "bg-chess-light"}
					movePiece={(fromIndex, toIndex) => movePiece(fromIndex, toIndex)}
					selectedPiece={selectedPiece}
					setSelectedPiece={setSelectedPiece}
					prevMove={prevMove}
					setPrevMove={setPrevMove}
				/>
			);
		});
		return (
			<div className="flex flex-row" key={uuidv4()}>
				{newRow}
			</div>
		);
	});

	return (
		<div className="flex flex-row gap-10">
			<div className="flex flex-col-reverse w-screen h-screen items-center justify-center bg-slate-700">
				{board}
			</div>
			<div className="absolute text-white text-5xl flex flex-col gap-10">
				{InCheck(turn, boardState) && "CHECK"}
				{CheckMate(turn, boardState, prevMove) && "CHECKMATE"}
			</div>
		</div>
	);
}
