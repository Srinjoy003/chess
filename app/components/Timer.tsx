import React from "react";
import Countdown from "react-countdown";
import { CountdownRenderProps, CountdownApi } from "react-countdown";
import { useState, useEffect, useRef } from "react";
type TimerProps = {
	playTime: number;
	timerFor: string;
	turn: string;
	pawnPromotionOpen: boolean;
	setIsTimeUp: (isTimeUp: boolean) => void;
	isCheckMate: boolean;
};

export default function Timer({
	playTime,
	timerFor,
	turn,
	pawnPromotionOpen,
	setIsTimeUp,
	isCheckMate,
}: TimerProps) {
	const timeGiven = playTime * 60000;
	const [time, setTime] = useState(Date.now());
	const [initialTimeSet, setInitialTimeSet] = useState(false);
	const countdownRef = useRef<Countdown>(null);

	const api = countdownRef.current?.api;

	// if(api){

	// 	if (pawnPromotionOpen && turn === timerFor){

	// 		if(!api.isPaused())
	// 			console.log("pause working", pawnPromotionOpen, turn, timerFor);

	// 		else{
	// 			console.log("pause not working", pawnPromotionOpen, turn, timerFor);

	// 		}
	// 	}
	// 	if (pawnPromotionOpen && turn !== timerFor && !api.isCompleted())
	// 		console.log("play", pawnPromotionOpen, turn, timerFor);
	// }
	// else{
	// 	console.log("no api")
	// }

	useEffect(() => {
		if (api) {
			if (turn !== timerFor && !api.isPaused()) {
				api.pause();
			}
			if (turn === timerFor && !api.isCompleted() && !isCheckMate) {
				api.start();
			}

			if (isCheckMate) api.pause();
		}
	}, [api, timerFor, turn, isCheckMate, pawnPromotionOpen]);

	useEffect(() => {
		if (turn === timerFor && !initialTimeSet) {
			// Set the initial time when turn === timerFor
			setTime(Date.now());
			setInitialTimeSet(true);
		}
	}, [turn, timerFor, initialTimeSet]);

	const countdownTime = time + timeGiven;

	const renderer = ({ minutes, seconds }: CountdownRenderProps) => {
		return (
			<p className="h-16 w-32 bg-black text-white flex items-center justify-center rounded text-3xl">{`${minutes}:${
				seconds < 10 ? "0" : ""
			}${seconds}`}</p>
		);
	};

	return (
		<Countdown
			ref={countdownRef}
			date={countdownTime}
			renderer={renderer}
			controlled={false}
			autoStart={timerFor === "w"}
			onComplete={() => setIsTimeUp(true)}
		/>
	);
}
