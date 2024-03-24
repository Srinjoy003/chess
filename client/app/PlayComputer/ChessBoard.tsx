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
} from "../helperFunctions";
import PawnPromotion from "./PawnPromotion";
import Timer from "../components/Timer";
import { useDispatch } from "react-redux";
import { toggleTurn } from "../reduxStore/turnSlice";

import { moveToUCI } from "../chessEngine/openings/openingParser";

import { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { Slider } from "@/components/ui/slider";
import { Merienda } from "next/font/google";
import Resignation from "./Resignation";
import Image from "next/image";
const playerFont = Merienda({ weight: "900", subsets: ["latin"] });

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
	const [resignation, setResignation] = useState(false);
	const [engineMoveTime, setEngineMoveTime] = useState<number>(5);
	const turn = useSelector((state: RootState) => state.turn);
	const dispatch = useDispatch();

	const [position, setPosition] = useState<positionType>([turn, boardState]);
	const [positionList, setPositionList] = useState<positionType[]>([
		[turn, boardState],
	]);

	const [moveList, setMoveList] = useState<string[]>([]);

	const [sound, setSound] = useState<
		"move" | "capture" | "check" | "promote" | "end" | "none"
	>("none");

	const [socket, setSocket] = useState<Socket>(io({ autoConnect: false }));

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
	const gameEnded = victoryOrLoss || draw || resignation;

	useEffect(() => {
		const socket = io("http://localhost:3002", { reconnection: false });
		setSocket(socket);

		return () => {
			socket.disconnect();
		};
	}, []);

	useEffect(() => {
		setPosition([turn, boardState]);
	}, [turn, boardState]); //could be problematic for multiplayer

	useEffect(() => {
		if (positionList.length === noOfMoves.current) {
			positionList.push(position);
		}
	}, [position, positionList, noOfMoves]);

	const playSound = (audio: HTMLAudioElement | null) => {
		if (audio) {
			audio?.play().catch((error) => {
				console.error("Audio playback error:", error);
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
		(
			fromIndex: number,
			toIndex: number,
			ai: boolean,
			recieved: boolean = false,
			aiPromotionMove: string = "Q"
		) => {
			if (fromIndex != toIndex) {
				const updatedBoard = boardState.map((item) => {
					return item.slice();
				});

				const i1 = Math.floor(fromIndex / 10);
				const j1 = fromIndex % 10;

				const i2 = Math.floor(toIndex / 10);
				const j2 = toIndex % 10;

				const uciMove = moveToUCI(fromIndex, toIndex);
				setMoveList((prevMoveList) => [...prevMoveList, uciMove]);

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
						updatedBoard[i2][j2] = turn + aiPromotionMove;
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
		const aiTurn: string = "b";

		if (turn === aiTurn) {
			socket.emit("aiMove", {
				boardState,
				aiTurn,
				prevMove,
				whiteCastling,
				blackCastling,
				timeLimit: engineMoveTime, // Assuming time limit is fixed at 5000 milliseconds
				moveList,
			});
		}
	}, [
		boardState,
		blackCastling,
		whiteCastling,
		prevMove,
		turn,
		moveList,
		socket,
		engineMoveTime,
	]);

	useEffect(() => {
		const delay = 0;
		if (!gameEnded) {
			const timer = setTimeout(() => {
				aiMove();
			}, delay);

			return () => clearTimeout(timer);
		} else {
			console.log("Game has ended");
		}
	}, [boardState, aiMove, gameEnded]);

	useEffect(() => {
		socket.on("aiMove", ({ finalBestMove, finalBestScore }) => {
			movePiece(
				finalBestMove[0],
				finalBestMove[1],
				true,
				false,
				finalBestMove[2]
			);
			setPrevMove([finalBestMove[0], finalBestMove[1]]);
			setSelectedPiece(null);
		});
	}, [movePiece, socket]);

	const handleReturn = () => {
		window.location.reload();
	};

	const board = boardState.map((row, i) => {
		let newRow = row.map((_, j) => {
			return (
				<Square
					boardState={boardState}
					key={i * 10 + j}
					position={i * 10 + j}
					colour={(i + j) % 2 ? "bg-chess-light" : "bg-chess-dark"}
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
		<div className="max-h-screen">
			<div className="flex flex-row gap-10 bg-room-bg">
				<div className="flex flex-col-reverse items-center justify-center w-screen h-screen">
					<div className="flex flex-col-reverse">{board}</div>
					<div className="absolute z-20 -translate-x-10">
						<PawnPromotion
							open={pawnPromotionOpen}
							handleSelect={handlePromotion}
						/>
					</div>
				</div>

				<div
					className={`absolute top-1/3 left-1/2 w-52 h-[310px] sm:w-56 sm:h-[310px] md:w-64 md:h-[370px] lg:w-72 lg:h-[450px] text-amber-950 text-2xl bg-room-accent flex-col items-center justify-center text-center z-50 -translate-x-32 lg:-translate-y-24 rounded-lg shadow-2xl shadow-amber-950 ${
						gameEnded ? "" : "hidden"
					}`}
				>
					<Image
						className="relative w-44 h-36 sm:w-48 sm:h-36 md:w-52 md:h-44 lg:w-60 lg:h-52 ml-auto mr-auto mt-4 sm:mt-4 md:mt-7 rounded-lg"
						src="/Images/checkmate2.jpg"
						alt="Description of the image"
						width={1280}
						height={800}
					/>

					<div className="flex flex-col mt-4 sm:mt-4 md:mt-5 lg:mt-8 gap-1">
						<p className="text-2xl sm:text-2xl lg:text-3xl font-bold">
							{!resignation &&
								(victoryOrLoss
									? turn === "b"
										? `You Won`
										: `Computer Won`
									: "DRAW")}
							{resignation && `Computer Won`}
						</p>

						<p className="text-base sm:text-base lg:text-lg font-semibold">
							{isCheckMate ? "By Checkmate" : ""}
							{isTimeUp ? "By Timeout" : ""}
							{isStaleMate && "By Stalemate"}{" "}
							{hasInsufficientMaterial && "By Insufficient Material"}
							{isThreeFoldRepetion && "by Three Fold Repetition"}
							{resignation && "by Resignation"}
						</p>
					</div>

					<button
						onClick={handleReturn}
						className="px-3 py-1 md:px-4 md:py-1 lg:px-5 lg:py-2 rounded-lg mt-6 sm:mt-6 md:mt-7 lg:mt-10 text-base sm:text-base md:text-lg lg:text-xl text-room-secondary bg-room-primary hover:text-white hover:bg-amber-950 font-semibold"
					>
						Play Again
					</button>
				</div>
				
			</div>
			<audio ref={moveSound} src="/sound/move.mp3" />
			<audio ref={checkSound} src="/sound/check.mp3" />
			<audio ref={captureSound} src="/sound/capture.mp3" />
			<audio ref={promoteSound} src="/sound/promote.mp3" />
			<audio ref={endSound} src="/sound/end.mp3" />

			<div
				className={`fixed w-32 sm:w-36 md:w-48 lg:w-52 h-fit p-3 bg-room-secondary text-amber-950 top-1/2 right-1/2 -translate-x-12 -translate-y-[255px] sm:-translate-x-14 sm:-translate-y-[290px] md:-translate-x-16 md:-translate-y-[340px] lg:-translate-x-28 lg:-translate-y-[400px] lg:gap-4 md:gap-4 sm:gap-3 gap-2 flex justify-center items-center rounded-xl font-extrabold lg:text-2xl md:text-xl text-lg`}
			>
				Computer
			</div>
			<div
				className={`fixed w-32 lg:w-52 md:w-48 sm:w-36 h-fit p-3 bg-room-secondary text-amber-950 bottom-1/2 right-1/2 -translate-x-12 translate-y-[265px] sm:bottom-1/2 sm:right-1/2 sm:-translate-x-14 sm:translate-y-[290px] md:bottom-1/2 md:right-1/2 md:-translate-x-16 md:translate-y-[350px] lg:top-1/2 lg:right-1/2 lg:-translate-x-28 lg:translate-y-[340px] lg:gap-3 md:gap-4 sm:gap-3 gap-2 flex justify-center items-center rounded-xl font-extrabold lg:text-2xl md:text-xl text-lg`}
			>
				You
			</div>

			<div className="absolute bottom-10 left-28 sm:left-56 md:top-4 md:left-2 flex flex-col gap-5">
				<p className="text-room-accent md:text-base lg:text-lg text-center flex gap-2">
					<span className="font-semibold">Computer Time:{""}</span>
					<span className="text-room-secondary">{engineMoveTime} sec</span>
				</p>
				<Slider
					defaultValue={[5]}
					min={1}
					max={60}
					step={1}
					className="w-48"
					value={[engineMoveTime]}
					onValueChange={(value) => {
						setEngineMoveTime(value[0]);
					}}
				/>
			</div>

			<div className="fixed top-1/2 left-1/2 translate-y-[220px] sm:translate-y-[250px] -translate-x-9 md:translate-y-[310px] md:-translate-x-10 lg:translate-y-[350px] lg:-translate-x-16 z-50">
				{!gameEnded && <Resignation setResignation={setResignation} />}
			</div>
		</div>
	);
}
