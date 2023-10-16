import React, { useState } from "react";
import { useDrop } from "react-dnd";
import ChessPiece from "./chessPiece";
import ChessBoard from "./chessBoard";

type SquareProp = {
    boardState: Array<Array<string>>
	colour: string;
	position: number;
	piece: string;
	movePiece: (fromIndex: number, toIndex: number) => void;
};

const Square = ({ colour, position, piece, movePiece, boardState }: SquareProp) => {
	const [chessPiece, setChessPiece] = useState(piece);

	const [{ isOver, canDrop }, drop] = useDrop({
		accept: "CHESS_PIECE",
		drop: (item: any) => {
			// Update the state to place the chess piece in the square
			// setChessPiece(item.piece);
            console.log(item.position, position);
            movePiece(item.position, position);
            item.position = position;

		},
		collect: (monitor) => ({
			isOver: !!monitor.isOver(),
			canDrop: !!monitor.canDrop(),
		}),
	});

    const row = Math.floor(position / 10);
    const col = position % 10;




	return (
		<div
			className={`flex flex-row w-20 h-20 border-2 border-black text-5xl items-center justify-center ${colour}`}
			ref={drop}
		
		>
			{/*boardState[row][col] != "-" && */<ChessPiece piece={boardState[row][col]} position={position} type="CHESS_PIECE" />}
		</div>
	);
};

export default Square;
