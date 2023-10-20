import { v4 as uuidv4 } from "uuid";
import Square from "./Square";
import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../reduxStore/store";
import {
	InCheck,
	CheckMate,
	EnPassantMoveList,
	CastlingMoveList,
} from "../moveFunctions";
import PawnPromotion from "./PawnPromotion";
import Countdown from "react-countdown";
import Timer from "./Timer";

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
	const [whiteCastling, setWhiteCastling] = useState<
		[boolean, boolean, boolean]
	>([false, false, false]);
	const [blackCastling, setBlackCastling] = useState<
		[boolean, boolean, boolean]
	>([false, false, false]);
	const [pawnPromotionOpen, setpawnPromotionOpen] = useState(false);
	const [promotedPiecePosition, setPromotedPiecePosition] = useState<
		[number, number] | null
	>(null);

	const turn = useSelector((state: RootState) => state.turn);

	const handlePromotion = useCallback(
		(piece: string) => {
			//opposite as turn is switched until choice is made
			const promotionTurn = turn === "w" ? "b" : "w";

			console.log(piece);

			setpawnPromotionOpen(false);

			if (promotedPiecePosition) {
				const updatedBoard = boardState.map((item) => {
					return item.slice();
				});

				const i1 = Math.floor(promotedPiecePosition[0] / 10);
				const j1 = promotedPiecePosition[0] % 10;

				const i2 = Math.floor(promotedPiecePosition[1] / 10);
				const j2 = promotedPiecePosition[1] % 10;

				updatedBoard[i2][j2] = piece;
				console.log(i2, j2, promotedPiecePosition, turn);

				if (promotionTurn === "w") {
					updatedBoard[i1][j1] = "-";
				} else {
					updatedBoard[i1][j1] = "-";
				}

				setBoardState(updatedBoard);
			}
		},
		[turn, boardState, promotedPiecePosition]
	);

	const movePiece = (fromIndex: number, toIndex: number) => {
		if (fromIndex != toIndex) {
			const updatedBoard = boardState.map((item) => {
				return item.slice();
			});

			const i1 = Math.floor(fromIndex / 10);
			const j1 = fromIndex % 10;

			const i2 = Math.floor(toIndex / 10);
			const j2 = toIndex % 10;

			updatedBoard[i2][j2] = updatedBoard[i1][j1];
			updatedBoard[i1][j1] = "-";

			if (selectedPiece) {
				//ENPASSANT
				const enpassantMoveList = EnPassantMoveList(
					selectedPiece[1],
					selectedPiece[0],
					boardState,
					prevMove
				);

				const castlingMoveList = CastlingMoveList(
					selectedPiece[1],
					boardState,
					whiteCastling,
					blackCastling
				);

				if (enpassantMoveList.includes(toIndex)) {
					const opponentPawnDirection = selectedPiece[1][0] === "w" ? -1 : 1;
					updatedBoard[i2 + opponentPawnDirection][j2] = "-";
				}

				//PAWN PROMOTION

				if (selectedPiece[1][1] === "P") {
					if (
						(selectedPiece[1][0] == "w" && i2 === 7) ||
						(selectedPiece[1][0] == "b" && i2 === 0)
					) {
						setpawnPromotionOpen(() => {
							setPromotedPiecePosition([fromIndex, toIndex]);
							updatedBoard[i1][j1] = updatedBoard[i2][j2];
							updatedBoard[i2][j2] = "-";
							return true;
						});
					}
				}

				//FOR CASTLING

				if (castlingMoveList.includes(toIndex)) {
					if (toIndex === 2) {
						updatedBoard[0][0] = "-";
						updatedBoard[0][3] = "wR";
					} else if (toIndex === 6) {
						updatedBoard[0][7] = "-";
						updatedBoard[0][5] = "wR";
					}

					if (toIndex === 72) {
						updatedBoard[7][0] = "-";
						updatedBoard[7][3] = "bR";
					} else if (toIndex === 76) {
						updatedBoard[7][7] = "-";
						updatedBoard[7][5] = "bR";
					}
				}

				if (selectedPiece[1][0] === "w") {
					//white
					if (selectedPiece[0] === 0 && selectedPiece[1][1] === "R") {
						//left Rook
						setWhiteCastling((currWhiteCastling) => [
							true,
							currWhiteCastling[1],
							currWhiteCastling[2],
						]);
					} else if (selectedPiece[0] === 7 && selectedPiece[1][1] === "R") {
						//  right rook
						setWhiteCastling((currWhiteCastling) => [
							currWhiteCastling[0],
							currWhiteCastling[1],
							true,
						]);
					} else if (selectedPiece[0] === 4 && selectedPiece[1][1] === "K") {
						// king
						setWhiteCastling((currWhiteCastling) => [
							currWhiteCastling[0],
							true,
							currWhiteCastling[2],
						]);
					}
				}

				if (selectedPiece[1][0] === "b") {
					//black
					if (selectedPiece[0] === 70 && selectedPiece[1][1] === "R") {
						setBlackCastling((currBlackCastling) => [
							true,
							currBlackCastling[1],
							currBlackCastling[2],
						]);
					} else if (selectedPiece[0] === 77 && selectedPiece[1][1] === "R") {
						setBlackCastling((currBlackCastling) => [
							currBlackCastling[0],
							currBlackCastling[1],
							true,
						]);
					} else if (selectedPiece[0] === 74 && selectedPiece[1][1] === "K") {
						setBlackCastling((currBlackCastling) => [
							currBlackCastling[0],
							true,
							currBlackCastling[2],
						]);
					}
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
					whiteCastling={whiteCastling}
					blackCastling={blackCastling}
					pawnPromotionOpen={pawnPromotionOpen}
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
		<div className="flex flex-row gap-10  bg-slate-700">
			<div className="flex flex-col-reverse items-center justify-center w-screen h-screen">
				<div className="flex flex-col-reverse">{board}</div>
				<div className="absolute z-20 -translate-x-10">
					<PawnPromotion
						open={pawnPromotionOpen}
						handleSelect={handlePromotion}
					/>
				</div>
			</div>
			<div className="absolute flex flex-col gap-10 text-5xl text-white">
				{InCheck(turn, boardState) &&
					!CheckMate(
						turn,
						boardState,
						prevMove,
						whiteCastling,
						blackCastling
					) &&
					"CHECK"}
				{CheckMate(turn, boardState, prevMove, whiteCastling, blackCastling) &&
					"CHECKMATE"}
			</div>
			<div className="absolute">
				{/* <Countdown date={Date.now() + 10000}/> */}
				<Timer />
			</div>
		</div>
	);
}
