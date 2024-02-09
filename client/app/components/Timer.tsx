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
	gameEnded: boolean;
};

export default function Timer({
	playTime,
	timerFor,
	turn,
	pawnPromotionOpen,
	setIsTimeUp,
	gameEnded,
}: TimerProps) {
	const timeGiven = playTime * 60000;
	const [time, setTime] = useState(Date.now());
	const [initialTimeSet, setInitialTimeSet] = useState(false);
	const countdownRef = useRef<Countdown>(null);

	const api = countdownRef.current?.api;

	useEffect(() => {
		if (api) {
			if (turn !== timerFor && !api.isPaused()) {
				api.pause();
			}
			if (turn === timerFor && !api.isCompleted() && !gameEnded) {
				api.start();
			}

			if (gameEnded) api.pause();
		}
	}, [api, timerFor, turn, gameEnded, pawnPromotionOpen]);

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
			<p
				className={`h-12 w-24 text-4xl px-16 py-8 md:h-14 md:w-28 md:text-[40px] md:px-20 md:py-10 lg:h-24 lg:w-48 lg:text-5xl flex items-center justify-center rounded-xl  text-bold ${
					timerFor === turn ? "bg-white text-black" : "bg-black text-gray-400"
				}`}
			>{`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`}</p>
		);
	};

	return (
		<Countdown
			ref={countdownRef}
			date={countdownTime}
			renderer={renderer}
			controlled={false}
			autoStart={false}
			onComplete={() => setIsTimeUp(true)}
		/>
	);
}
