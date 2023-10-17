"use client";

import { DragPreviewOptions,useDrag } from "react-dnd";
import {
	FaChessBishop,
	FaChessKing,
	FaChessKnight,
	FaChessPawn,
	FaChessQueen,
	FaChessRook,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { RootState } from "../reduxStore/store";
import { useState, useCallback } from "react";

type ChessPieceProps = {
	piece: string;
	position: number;
};

const ChessPiece = ({ piece, position }: ChessPieceProps) => {
	const turn = useSelector((state: RootState) => state.turn);

	const [{ isDragging }, dragRef, dragPreviewRef] = useDrag({
		type: "CHESS_PIECE",
		item: { piece, position },
		canDrag: piece[0] === turn,
		collect: (monitor) => ({
			isDragging: !!monitor.isDragging(),
		}),
	
	});

	return (

		<div
			className={`text-5xl z-10 ${
				piece[0] == "w" ? "text-white" : "text-black"
			}`}
			ref={dragRef}
			style={{
				opacity: isDragging ? 0 : 1, // Reduce opacity when dragging
			}}
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
