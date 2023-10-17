import React, { useState, useEffect } from "react";
import { useDrop } from "react-dnd";
import ChessPiece from "./chessPiece";
import ChessBoard from "./chessBoard";
import { useCallback } from "react";

type SquareProp = {
	boardState: Array<Array<string>>;
	colour: string;
	position: number;
	movePiece: (fromIndex: number, toIndex: number) => void;
	selectedPiece: number | null;
	setSelectedPiece: (piecePosition: number) => void;
	currentTurn: "w" | "b",
};

const Square = ({
	colour,
	position,
	movePiece,
	boardState,
	selectedPiece,
	setSelectedPiece,
	currentTurn,
}: SquareProp) => {
	const [{ isOver, canDrop }, drop] = useDrop({
		accept: "CHESS_PIECE",
		drop: (item: any) => {
			// Update the state to place the chess piece in the square
			// setChessPiece(item.piece);
			console.log(item.position, position);
			movePiece(item.position, position);
			if (selectedPiece === item.position) { //not working fix it
				console.log("set");
				setSelectedPiece(position);
			}
			item.position = position;
		},
		collect: (monitor) => ({
			isOver: !!monitor.isOver(),
			canDrop: !!monitor.canDrop(),
		}),
	});

	const handlePieceSelection = useCallback(() => {
		setSelectedPiece(position);
	}, [setSelectedPiece, position]);

	const row = Math.floor(position / 10);
	const col = position % 10;

	return (
		<div
			className={`flex flex-row w-20 h-20 border-2 border-black text-5xl items-center justify-center ${
				selectedPiece === position && boardState[row][col] != "-"
					? "bg-green-300"
					: colour
			}`}
			ref={drop}
			onMouseDown={handlePieceSelection}
		>
			{boardState[row][col] != "-" && (
				<ChessPiece
					piece={boardState[row][col]}
					position={position}
					type="CHESS_PIECE"
				/>
			)}
		</div>
	);
};

export default Square;
