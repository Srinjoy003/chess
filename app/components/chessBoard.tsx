import { v4 as uuidv4 } from "uuid";
import Square from "./Square";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../reduxStore/store";
import {
	InCheck,
	CheckMate,
	EnPassantMoveList,
	CastlingMoveList,
	StaleMate,
	InsufficientMaterial,
	ThreeFoldRepetition,
	MoveList,
} from "../helperFunctions";
import PawnPromotion from "./PawnPromotion";
import Timer from "./Timer";
import { useDispatch } from "react-redux";
import { toggleTurn } from "../reduxStore/turnSlice";
import { AiRandomMove } from "../chessAi/aiMoves";
import { MoveGenerator } from "../chessAi/MoveGenerator";
import { fenToChessboard } from "../chessAi/aiHelperFunctions";
import { current } from "@reduxjs/toolkit";

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

	// board[1][0] = "-"
	// board[3][0] = "wP" //a2a4

	// board[6][0] = "-"
	// board[5][0] = "bP" //a7a6

	// board[3][0] = "-"
	// board[4][0] = "wP" //a4a5

	// board[6][1] = "-"
	// board[4][1] = "bP" //b7b5

	// // board[4][0] = "-"
	// // board[5][1] = "wP" //a5b6
	// // board[4][1] = "-"

	return board;
}

function useCombinedEffect(effect: () => void, deps: [string, string[][]]) {
	const combinedDeps: [string, string] = useMemo(
		() => [deps[0], JSON.stringify(deps[1])],
		[deps]
	);
	const prevDepsRef = useRef<[string, string]>(["", ""]);

	useEffect(() => {
		const allDepsChanged = combinedDeps.every(
			(dep, i) => dep !== prevDepsRef.current[i]
		);

		if (allDepsChanged) {
			effect();
			prevDepsRef.current = combinedDeps;
		}
	}, [combinedDeps, effect]);
}

export default function ChessBoard() {
	type positionType = [string, string[][]];
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

	const [position, setPosition] = useState<positionType>([turn, boardState]);
	const [positionList, setPositionList] = useState<positionType[]>([
		[turn, boardState],
	]);

	const [sound, setSound] = useState<
		"move" | "capture" | "check" | "promote" | "end"
	>("move");

	const noOfMoves = useRef(0);

	const moveSound = useRef<HTMLAudioElement | null>(null);
	const checkSound = useRef<HTMLAudioElement | null>(null);
	const captureSound = useRef<HTMLAudioElement | null>(null);
	const promoteSound = useRef<HTMLAudioElement | null>(null);
	const endSound = useRef<HTMLAudioElement | null>(null);

	const inCheck = InCheck(turn, boardState);

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

	const isThreeFoldRepetion = ThreeFoldRepetition(positionList, position);

	const victoryOrLoss = isCheckMate || isTimeUp;
	const draw = isStaleMate || hasInsufficientMaterial || isThreeFoldRepetion;
	const gameEnded = victoryOrLoss || draw;

	let aiRandomMoveWhite = useRef<number[]>([]);
	let aiRandomMoveBlack = useRef<number[]>([]);

	useEffect(() => {

		const fen =  "r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10";


		const whiteCastling: [boolean, boolean, boolean] = [true, true, true];
		const blackCastling: [boolean, boolean, boolean] = [true, true, true];
		const prevMove: [number, number] = [-1, -1];

		const [currentTurn, boardState] = fenToChessboard(
			fen,
			whiteCastling,
			blackCastling,
			prevMove
		);

		// if(currentTurn === "b"){
		// 	dispatch(toggleTurn())
		// 	console.log("Hello 	")

		// }
		setBoardState(boardState);
		setPrevMove(prevMove);
		setWhiteCastling(whiteCastling);
		setBlackCastling(blackCastling);

		// const moves = MoveGenerator(
		// 	2,
		// 	2,
		// 	boardState,
		// 	currentTurn,
		// 	prevMove,
		// 	whiteCastling,
		// 	blackCastling
		// );
		// console.log(moves);

		// for(let depth = 1; depth <= 4; depth++){
		// 	const moves = MoveGenerator(
		// 		depth,
		// 		depth,
		// 		boardState,
		// 		currentTurn,
		// 		prevMove,
		// 		whiteCastling,
		// 		blackCastling
		// 	);
		// 	console.log("depth ", depth, " : ", moves);
		// }
		
	}, [dispatch]);

	useEffect(() => {
		setPosition([turn, boardState]);
	}, [turn, boardState]);

	useEffect(() => {
		if (positionList.length === noOfMoves.current) {
			positionList.push(position);
		}
	}, [position, positionList, noOfMoves]);

	const playSound = (audio: HTMLAudioElement | null) => {
		if (audio) {
			audio?.play().catch((error) => {
				// console.error("Audio playback error:", error);
			});
		}
	};

	useEffect(() => {
		if (inCheck) setSound("check");
		if (gameEnded) setSound("end");
		if (sound === "move") playSound(moveSound.current);
		else if (sound === "capture") playSound(captureSound.current);
		else if (sound === "check") playSound(checkSound.current);
		else if (sound === "promote") playSound(promoteSound.current);
		else if (sound === "end") playSound(endSound.current);
	}, [boardState, inCheck, sound, gameEnded]);

	const handlePromotion = useCallback(
		(piece: string, ai: boolean) => {
			setpawnPromotionOpen(false);
			setSound("promote");

			if (promotedPiecePosition) {
				const updatedBoard = boardState.map((item) => {
					return item.slice();
				});

				const i1 = Math.floor(promotedPiecePosition[0] / 10);
				const j1 = promotedPiecePosition[0] % 10;

				const i2 = Math.floor(promotedPiecePosition[1] / 10);
				const j2 = promotedPiecePosition[1] % 10;

				updatedBoard[i2][j2] = piece;

				if (turn === "w") {
					updatedBoard[i1][j1] = "-";
				} else {
					updatedBoard[i1][j1] = "-";
				}

				dispatch(toggleTurn());
				setBoardState(updatedBoard);
				noOfMoves.current++;
			}
		},
		[turn, boardState, promotedPiecePosition, dispatch]
	);

	const movePiece = useCallback(
		(fromIndex: number, toIndex: number, ai: boolean) => {
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
					if (updatedBoard[i2][j2] === "-") setSound("move");
					else setSound("capture");

					updatedBoard[i2][j2] = updatedBoard[i1][j1];
					updatedBoard[i1][j1] = "-";
				}

				//PAWN PROMOTION FOR AI

				if (ai) {
					//for ai
					const aiPiece = boardState[i1][j1];
					setSelectedPiece([fromIndex, aiPiece]);

					if (
						aiPiece[1] === "P" &&
						((aiPiece[0] === "w" && i2 === 7) ||
							(aiPiece[0] === "b" && i2 === 0))
					) {
						setPromotedPiecePosition([fromIndex, toIndex]);
						updatedBoard[i2][j2] = turn + "Q";
						updatedBoard[i1][j1] = "-";
						setSound("promote");
						dispatch(toggleTurn());
						setBoardState(updatedBoard);
						noOfMoves.current++;
						return;
					}
				}

				if (selectedPiece || ai) {
					const aiPiece = boardState[i1][j1];
					let currentSelectedPiece: [number, string] = [-1, "hello"];

					if (selectedPiece) currentSelectedPiece = selectedPiece;
					else currentSelectedPiece = [fromIndex, aiPiece];

					//ENPASSANT
					const enpassantMoveList = EnPassantMoveList(
						currentSelectedPiece[1],
						currentSelectedPiece[0],
						boardState,
						prevMove
					);

					const castlingMoveList = CastlingMoveList(
						currentSelectedPiece[1],
						boardState,
						whiteCastling,
						blackCastling
					);

					if (enpassantMoveList.includes(toIndex)) {
						setSound("capture");
						const opponentPawnDirection =
							currentSelectedPiece[1][0] === "w" ? -1 : 1;
						updatedBoard[i2 + opponentPawnDirection][j2] = "-";
					}

					// PAWN PROMOTION

					//for human
					if (currentSelectedPiece[1][1] === "P") {
						if (
							(currentSelectedPiece[1][0] == "w" && i2 === 7) ||
							(currentSelectedPiece[1][0] == "b" && i2 === 0)
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

					if (currentSelectedPiece[1][0] === "w") {
						//white
						if (
							currentSelectedPiece[0] === 0 &&
							currentSelectedPiece[1][1] === "R"
						) {
							//left Rook
							setWhiteCastling((currWhiteCastling) => [
								true,
								currWhiteCastling[1],
								currWhiteCastling[2],
							]);
						} else if (
							currentSelectedPiece[0] === 7 &&
							currentSelectedPiece[1][1] === "R"
						) {
							//  right rook
							setWhiteCastling((currWhiteCastling) => [
								currWhiteCastling[0],
								currWhiteCastling[1],
								true,
							]);
						} else if (
							currentSelectedPiece[0] === 4 &&
							currentSelectedPiece[1][1] === "K"
						) {
							// king
							setWhiteCastling((currWhiteCastling) => [
								currWhiteCastling[0],
								true,
								currWhiteCastling[2],
							]);
						}
					}

					if (currentSelectedPiece[1][0] === "b") {
						//black
						if (
							currentSelectedPiece[0] === 70 &&
							currentSelectedPiece[1][1] === "R"
						) {
							setBlackCastling((currBlackCastling) => [
								true,
								currBlackCastling[1],
								currBlackCastling[2],
							]);
						} else if (
							currentSelectedPiece[0] === 77 &&
							currentSelectedPiece[1][1] === "R"
						) {
							setBlackCastling((currBlackCastling) => [
								currBlackCastling[0],
								currBlackCastling[1],
								true,
							]);
						} else if (
							currentSelectedPiece[0] === 74 &&
							currentSelectedPiece[1][1] === "K"
						) {
							setBlackCastling((currBlackCastling) => [
								currBlackCastling[0],
								true,
								currBlackCastling[2],
							]);
						}
					}
				}

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
					noOfMoves.current++;
					dispatch(toggleTurn());

					setBoardState(() => {
						return updatedBoard;
					});
				}
			}
		},
		[
			blackCastling,
			whiteCastling,
			boardState,
			dispatch,
			prevMove,
			selectedPiece,
			turn,
		]
	);

	const aiMove = useCallback(() => {
		if (turn === "b") {
			aiRandomMoveBlack.current = AiRandomMove(
				boardState,
				turn,
				prevMove,
				whiteCastling,
				blackCastling
			);
		}
		if (turn === "w") {
			aiRandomMoveWhite.current = AiRandomMove(
				boardState,
				turn,
				prevMove,
				whiteCastling,
				blackCastling
			);
		}

		if (turn === "b") {
			if (aiRandomMoveBlack.current.length !== 0) {
				movePiece(
					aiRandomMoveBlack.current[0],
					aiRandomMoveBlack.current[1],
					true
				);
				setPrevMove([
					aiRandomMoveBlack.current[0],
					aiRandomMoveBlack.current[1],
				]); //infinite loop caused by this
				setSelectedPiece(null);
			}
		}
		if (turn === "w") {
			if (aiRandomMoveWhite.current.length !== 0) {
				movePiece(
					aiRandomMoveWhite.current[0],
					aiRandomMoveWhite.current[1],
					true
				);
				setPrevMove([
					aiRandomMoveWhite.current[0],
					aiRandomMoveWhite.current[1],
				]); //infinite loop caused by this
				setSelectedPiece(null);
			}
		}
	}, [boardState, blackCastling, whiteCastling, prevMove, turn, movePiece]);

	// useEffect(() => {
	// 	const delay = 1000; // Set the desired delay in milliseconds
	// 	console.log(turn, boardState);
	// 	if (!gameEnded) {
	// 		console.log(turn);
	// 		const timer = setTimeout(() => {
	// 			aiMove();
	// 		}, delay);

	// 		return () => clearTimeout(timer);
	// 	}
	// 	// eslint-disable-next-line
	// }, [boardState]);

	// useCombinedEffect(() => {
	// 	const delay = 2000; // Set the desired delay in milliseconds
	// 	// console.log(turn, boardState);
	// 	if (!gameEnded) {
	// 		const timer = setTimeout(() => {
	// 			aiMove();
	// 		}, delay);

	// 		return () => clearTimeout(timer);
	// 	}
	// }, [turn, boardState]);

	const board = boardState.map((row, i) => {
		let newRow = row.map((_, j) => {
			return (
				<Square
					boardState={boardState}
					key={i * 10 + j}
					position={i * 10 + j}
					colour={(i + j) % 2 ? "bg-chess-dark" : "bg-chess-light"}
					movePiece={movePiece}
					selectedPiece={selectedPiece}
					setSelectedPiece={setSelectedPiece}
					prevMove={prevMove}
					setPrevMove={setPrevMove}
					whiteCastling={whiteCastling}
					blackCastling={blackCastling}
					pawnPromotionOpen={pawnPromotionOpen}
					gameEnded={gameEnded}
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
		<>
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

				<div className="absolute flex flex-col md:gap-60 md:right-10 md:top-1/4 item-start justify-center">
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
						gameEnded ? "" : "hidden"
					}`}
				>
					<p>
						{victoryOrLoss
							? turn === "b"
								? "White Wins"
								: "Black Wins"
							: "DRAW"}
					</p>
					<p>
						{isCheckMate ? "By Checkmate" : ""}
						{isTimeUp ? "By Timeout" : ""}
						{isStaleMate && "By Stalemate"}{" "}
						{hasInsufficientMaterial && "By Insufficient Material"}
						{isThreeFoldRepetion && "by Three Fold Repetition"}
					</p>
				</div>
			</div>
			<audio ref={moveSound} src="/sound/move.mp3" />
			<audio ref={checkSound} src="/sound/check.mp3" />
			<audio ref={captureSound} src="/sound/capture.mp3" />
			<audio ref={promoteSound} src="/sound/promote.mp3" />
			<audio ref={endSound} src="/sound/end.mp3" />
		</>
	);
}
