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
	StaleMate,
	InsufficientMaterial,
} from "../helperFunctions";
import PawnPromotion from "./PawnPromotion";
import Timer from "./Timer";
import { useDispatch } from "react-redux";
import { toggleTurn } from "../reduxStore/turnSlice";

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

	// board[7][0] = "bK";
	// board[1][0] = "wK";
	// board[6][7] = "wB";
	// board[7][6] = "bB";


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

	const [isTimeUp, setIsTimeUp] = useState(false);
	const [playTime, setplayTime] = useState(5);

	const turn = useSelector((state: RootState) => state.turn);
	const dispatch = useDispatch();

	const isCheckMate = CheckMate(
		turn,
		boardState,
		prevMove,
		whiteCastling,
		blackCastling
	);

	const isStaleMate = StaleMate(
		boardState,
		turn,
		prevMove,
		whiteCastling,
		blackCastling
	);

	const hasInsufficientMaterial = InsufficientMaterial(boardState);

	const victoryOrLoss = isCheckMate || isTimeUp;
	const draw = isStaleMate || hasInsufficientMaterial;
	const gameEnded = victoryOrLoss || draw;

	const handlePromotion = useCallback(
		(piece: string) => {
			setpawnPromotionOpen(false);
			dispatch(toggleTurn());
			console.log("Toggle inside select");

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

				if (turn === "w") {
					updatedBoard[i1][j1] = "-";
				} else {
					updatedBoard[i1][j1] = "-";
				}

				setBoardState(updatedBoard);
			}
		},
		[turn, boardState, promotedPiecePosition, dispatch]
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

			if (
				!(
					(
						selectedPiece &&
						selectedPiece[1][1] === "P" &&
						((selectedPiece[1][0] == "w" && i2 === 7) ||
							(selectedPiece[1][0] == "b" && i2 === 0))
					) //no pawn promotion
				)
			) {
				updatedBoard[i2][j2] = updatedBoard[i1][j1];
				updatedBoard[i1][j1] = "-";
				dispatch(toggleTurn());
				console.log("Toggle inside move");
			}

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
		<div className="flex flex-row gap-10  bg-chess-bg">
			<div className="flex flex-col-reverse items-center justify-center w-screen h-screen">
				<div className="flex flex-col-reverse">{board}</div>
				<div className="absolute z-20 -translate-x-10">
					<PawnPromotion
						open={pawnPromotionOpen}
						handleSelect={handlePromotion}
					/>
				</div>
			</div>

			<div className="absolute flex flex-col gap-60 right-10 top-1/4 item-start justify-center">
				<Timer
					playTime={playTime}
					timerFor={"b"}
					turn={turn}
					pawnPromotionOpen={pawnPromotionOpen}
					setIsTimeUp={setIsTimeUp}
					gameEnded={gameEnded}
				/>
				<Timer
					playTime={playTime}
					timerFor={"w"}
					turn={turn}
					pawnPromotionOpen={pawnPromotionOpen}
					setIsTimeUp={setIsTimeUp}
					gameEnded={gameEnded}
				/>
			</div>

			<div
				className={`absolute top-1/3 left-1/2 w-40 h-40 bg-white flex-col items-center justify-center z-50 ${
					victoryOrLoss ? "" : "hidden"
				}`}
			>
				<p>{turn === "b" ? "White Wins" : "Black Wins"}</p>
				<p>
					{isCheckMate ? "By Checkmate" : ""} {isTimeUp ? "By Timeout" : ""}
				</p>
			</div>

			<div
				className={`absolute top-1/3 left-1/2 w-40 h-40 bg-white flex-col items-center justify-center z-50 ${
					draw ? "" : "hidden"
				}`}
			>
				<p>DRAW</p>
				<p>
					{isStaleMate && "By Stalemate"}{" "}
					{hasInsufficientMaterial && "By Insufficient Material"}
				</p>
			</div>
		</div>
	);
}
