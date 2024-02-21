import React, { useState, useEffect, useMemo } from "react";
import { useDrop } from "react-dnd";
import ChessPiece from "./ChessPiece";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "../reduxStore/store";
import { MoveList } from "../helperFunctions";
import { EnPassantMoveList } from "../helperFunctions";
import { extractChessPosition } from "../chessEngine/core/aiHelperFunctions";
import { Socket } from "socket.io-client";
import { isPromotion } from "../helperFunctions";

type SquareProp = {
	pawnPromotionOpen: boolean;
	boardState: Array<Array<string>>;
	colour: string;
	position: number;
	selectedPiece: [number, string] | null;
	setSelectedPiece: (newSelectedPiece: [number, string] | null) => void;
	prevMove: [number, number] | null;
	whiteCastling: [boolean, boolean, boolean];
	blackCastling: [boolean, boolean, boolean];
	gameEnded: boolean;
	socket: Socket;
	clientTurnColour: string | null;
	setPromotedPiecePosition: (
		promotedPiecePosition: [number, number] | null
	) => void;
	setpawnPromotionOpen: (pawnPromotionOpen: () => boolean) => void;
};

const Square = ({
	pawnPromotionOpen,
	colour,
	position,
	boardState,
	selectedPiece,
	setSelectedPiece,
	prevMove,
	whiteCastling,
	blackCastling,
	gameEnded,
	socket,
	clientTurnColour,
	setPromotedPiecePosition,
	setpawnPromotionOpen,
}: SquareProp) => {
	const dispatch = useDispatch();
	const turn = useSelector((state: RootState) => state.turn);
	const row = Math.floor(position / 10);
	const col = position % 10;

	const positionName = extractChessPosition(position);

	const enpassantMoveList = useMemo(() => {
		if (selectedPiece) {
			return EnPassantMoveList(
				selectedPiece[1],
				selectedPiece[0],
				boardState,
				prevMove
			);
		}
		return [];
	}, [selectedPiece, boardState, prevMove]);

	const moveList = useMemo(() => {
		if (selectedPiece) {
			return MoveList(
				selectedPiece[1],
				selectedPiece[0],
				boardState,
				prevMove,
				whiteCastling,
				blackCastling
			);
		}
		return [];
	}, [selectedPiece, boardState, prevMove, whiteCastling, blackCastling]);

	const [{ isOver, canDrop }, drop] = useDrop({
		accept: "CHESS_PIECE",
		drop: (item: any) => {
			if (moveList.includes(position) && !pawnPromotionOpen && !gameEnded) {
				if (isPromotion(boardState, item.position, position)) {
					setpawnPromotionOpen(() => {
						setPromotedPiecePosition([item.position, position]);
						return true;
					});
				} else {
				}
				socket.emit("move", {
					fromIndex: item.position,
					toIndex: position,
					promotionMove: "",
				});

				item.position = position;
			}
		},
		collect: (monitor) => ({
			isOver: !!monitor.isOver(),
			canDrop: !!monitor.canDrop(),
		}),
	});

	const handlePieceSelection = useCallback(() => {
		if (!pawnPromotionOpen && !gameEnded) {
			if (
				selectedPiece &&
				selectedPiece[0] !== position &&
				moveList.includes(position)
			) {
				if (isPromotion(boardState, selectedPiece[0], position)) {
					setpawnPromotionOpen(() => {
						setPromotedPiecePosition([selectedPiece[0], position]);
						return true;
					});
				} else {
					socket.emit("move", {
						fromIndex: selectedPiece[0],
						toIndex: position,
						promotionMove: "",
					});
				}
			} else if (boardState[row][col][0] === turn && turn == clientTurnColour) {
				setSelectedPiece([position, boardState[row][col]]);
			}
		}
	}, [
		boardState,
		row,
		col,
		selectedPiece,
		setSelectedPiece,
		position,
		moveList,
		turn,
		pawnPromotionOpen,
		gameEnded,
		socket,
		clientTurnColour,
		setpawnPromotionOpen,
		setPromotedPiecePosition
	]);

	const pieceColour = boardState[row][col][0];

	const selectedPieceColour = useMemo(() => {
		if (selectedPiece) {
			return selectedPiece[1][0];
		}
		return "";
	}, [selectedPiece]);

	return (
		<div
			className={`relative flex flex-row w-11 h-11 text-xs sm:w-12 sm:h-12 sm:text-sm md:w-16 md:h-16 md:text-lg lg:w-20 lg:h-20 lg:text-xl items-center justify-center ${
				(selectedPiece &&
					selectedPiece[0] === position &&
					boardState[row][col][0] === turn) ||
				prevMove?.includes(position)
					? colour === "bg-chess-light"
						? "bg-chess-selected-light"
						: "bg-chess-selected-dark"
					: colour
			}`}
			ref={drop}
			onMouseDown={handlePieceSelection}
		>
			{boardState[row][col] != "-" && (
				<ChessPiece
					piece={boardState[row][col]}
					position={position}
					pawnPromotionOpen={pawnPromotionOpen}
					gameEnded={gameEnded}
				/>
			)}

			{moveList.includes(position) &&
				boardState[row][col] === "-" &&
				!enpassantMoveList.includes(position) && (
					<div
						className={`w-4 h-4 sm:w-4 sm:h-4 md:w-6 md:h-6 lg:w-7 lg:h-7 rounded-full ${
							colour === "bg-chess-light"
								? "bg-chess-move-light"
								: "bg-chess-move-dark"
						}`}
					></div>
				)}

			{moveList.includes(position) &&
				(boardState[row][col] !== "-" ||
					enpassantMoveList.includes(position)) &&
				pieceColour !== selectedPieceColour && (
					<div
						className={`w-11 h-11 border-4 sm:w-12 sm:h-12 sm:border-4 md:w-16 md:h-16 md:border-[6px] lg:w-20 lg:h-20 lg:border-8 rounded-full absolute ${
							colour === "bg-chess-light"
								? "border-chess-move-light"
								: "border-chess-move-dark"
						}`}
					></div>
				)}

			{positionName[0] === "a" && (
				<div
					className={`absolute left-0 top-0 font-semibold ${
						colour === "bg-chess-light" ? "text-chess-dark" : "text-chess-light"
					}`}
				>
					{positionName[1]}
				</div>
			)}

			{positionName[1] === "1" && (
				<div
					className={`absolute right-0 bottom-0 font-semibold ${
						colour === "bg-chess-light" ? "text-chess-dark" : "text-chess-light"
					}`}
				>
					{positionName[0]}
				</div>
			)}
		</div>
	);
};

export default Square;
