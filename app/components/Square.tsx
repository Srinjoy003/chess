import React, { useState, useEffect } from "react";
import { useDrop } from "react-dnd";
import ChessPiece from "./chessPiece";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { toggleTurn } from "../reduxStore/turnSlice";
import { useSelector } from "react-redux";
import { RootState } from "../reduxStore/store";

type SquareProp = {
	boardState: Array<Array<string>>;
	colour: string;
	position: number;
	movePiece: (fromIndex: number, toIndex: number) => void;
	selectedPiece: number | null;
	setSelectedPiece: (piecePosition: number | null) => void;
};

const Square = ({
	colour,
	position,
	movePiece,
	boardState,
	selectedPiece,
	setSelectedPiece,
}: SquareProp) => {
	const dispatch = useDispatch();
	const turn = useSelector((state: RootState) => state.turn);
	const row = Math.floor(position / 10);
	const col = position % 10;

	const [{ isOver, canDrop }, drop] = useDrop({
		accept: "CHESS_PIECE",
		drop: (item: any) => {
			// Update the state to place the chess piece in the square
			// setChessPiece(item.piece);
			console.log(item.position, position);
			movePiece(item.position, position);
			if (selectedPiece === item.position) {
				//not working fix it
				setSelectedPiece(position);
			}

			if (position !== item.position) dispatch(toggleTurn());

			item.position = position;
		},
		collect: (monitor) => ({
			isOver: !!monitor.isOver(),
			canDrop: !!monitor.canDrop(),
		}),
	});

	const handlePieceSelection = useCallback(() => {
		if (selectedPiece && selectedPiece !== position) {
			movePiece(selectedPiece, position);
			setSelectedPiece(null);
			dispatch(toggleTurn());
		} 
		else if(boardState[row][col] !== "-"){
			setSelectedPiece(position);
		}
	}, [boardState,row, col, dispatch, movePiece, selectedPiece, setSelectedPiece, position]);

	

	return (
		<div
			className={`flex flex-row w-20 h-20 text-5xl items-center justify-center ${
				selectedPiece === position && boardState[row][col][0] === turn
					? "bg-chess-selected"
					: colour
			}`}
			ref={drop}
			onMouseDown={handlePieceSelection}
		>
			{boardState[row][col] != "-" && (
				<ChessPiece piece={boardState[row][col]} position={position} />
			)}
		</div>
	);
};

export default Square;
