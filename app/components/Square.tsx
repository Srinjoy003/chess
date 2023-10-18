import React, { useState, useEffect, useMemo } from "react";
import { useDrop } from "react-dnd";
import ChessPiece from "./chessPiece";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { toggleTurn } from "../reduxStore/turnSlice";
import { useSelector } from "react-redux";
import { RootState } from "../reduxStore/store";
import { MoveList } from "../moveList";

type SquareProp = {
	boardState: Array<Array<string>>;
	colour: string;
	position: number;
	movePiece: (fromIndex: number, toIndex: number) => void;
	selectedPiece: [number, string] | null;
	setSelectedPiece: (newSelectedPiece: [number, string] | null) => void;
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
	// let moveList: number[] = [];

	// if (selectedPiece) {
	// 	moveList= MoveList(selectedPiece[1], selectedPiece[0], boardState);
	// 	console.log(moveList, selectedPiece);
	// }

	const moveList = useMemo(() => {
		if (selectedPiece) {
			return MoveList(selectedPiece[1], selectedPiece[0], boardState);
		}
		return [];
	}, [selectedPiece, boardState]);

	const [{ isOver, canDrop }, drop] = useDrop({
		accept: "CHESS_PIECE",
		drop: (item: any) => {
			// Update the state to place the chess piece in the square
			// setChessPiece(item.piece);
			if (moveList.includes(position)) {
				movePiece(item.position, position);
				setSelectedPiece(null);
				if (position !== item.position) dispatch(toggleTurn());
				item.position = position;
			}
		},
		collect: (monitor) => ({
			isOver: !!monitor.isOver(),
			canDrop: !!monitor.canDrop(),
		}),
	});

	const handlePieceSelection = useCallback(() => {
		if (
			selectedPiece &&
			selectedPiece[0] !== position &&
			moveList.includes(position)
		) {
			movePiece(selectedPiece[0], position);
			setSelectedPiece(null);
			dispatch(toggleTurn());
		} else if (boardState[row][col][0] === turn) {
			setSelectedPiece([position, boardState[row][col]]);
		}
	}, [
		boardState,
		row,
		col,
		dispatch,
		movePiece,
		selectedPiece,
		setSelectedPiece,
		position,
		moveList,
		turn,
	]);

	return (
		<div
			className={`flex flex-row w-20 h-20 text-5xl items-center justify-center ${
				selectedPiece &&
				selectedPiece[0] === position &&
				boardState[row][col][0] === turn
					? "bg-chess-selected"
					: colour
			}`}
			ref={drop}
			onMouseDown={handlePieceSelection}
		>
			{boardState[row][col] != "-" && (
				<ChessPiece piece={boardState[row][col]} position={position} />
			)}

			{moveList.includes(position) && "x"}
		</div>
	);
};

export default Square;
