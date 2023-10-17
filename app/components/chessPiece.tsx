"use client";

import { useDrag } from "react-dnd";
import {
	FaChessBishop,
	FaChessKing,
	FaChessKnight,
	FaChessPawn,
	FaChessQueen,
	FaChessRook,
} from "react-icons/fa";

type ChessPieceProps = {
	piece: string;
	type: string;
	position: number;
	currentTurn: "w" | "b";
};

const ChessPiece = ({ piece, type, position, currentTurn }: ChessPieceProps) => {
	const [, ref] = useDrag(
		{
		type: "CHESS_PIECE",
		item: { piece, position },
	});

	return (
		<div
			className={`text-5xl z-10 ${
				piece[0] == "w" ? "text-white" : "text-black"
			}`}
			ref={ref}
			// style={{
			// 	opacity: isDragging ? 0 : 1, // Reduce opacity when dragging
			// 	cursor: isDragging ? "grabbing" : "grab", // Change cursor style
			// }}
		>
			{piece[1] == "P" && <FaChessPawn />}
			{piece[1] == "R" && <FaChessRook />}
			{piece[1] == "K" && <FaChessKing />}
			{piece[1] == "H" && <FaChessKnight />}
			{piece[1] == "Q" && <FaChessQueen />}
			{piece[1] == "B" && <FaChessBishop />}
		</div>
	);
};

export default ChessPiece;
