import React from "react";
import Countdown from "react-countdown";
import { CountdownRenderProps, CountdownApi } from "react-countdown";
import { useState, useEffect } from "react";

type TimerProps = {
	timerFor: string;
	turn: string;
	pawnPromotionOpen: boolean;
};

export default function Timer({
	timerFor,
	turn,
	pawnPromotionOpen,
}: TimerProps) {
	const timeGiven = 300000;
	const [time, setTime] = useState(Date.now());
	const [initialTimeSet, setInitialTimeSet] = useState(false);

	useEffect(() => {
		if (turn === timerFor && !initialTimeSet) {
		  // Set the initial time when turn === timerFor
		  setTime(Date.now());
		  setInitialTimeSet(true);
		}
	  }, [turn, timerFor, initialTimeSet]);


	const renderer = ({
		minutes,
		seconds,
		completed,
		api,
	}: CountdownRenderProps) => {
		if (turn !== timerFor && !api.isPaused()) {
			api.pause();
		} else if (turn === timerFor && !api.isCompleted()) {
			api.start();
		}
		return (
			<p className="h-16 w-32 bg-black text-white flex items-center justify-center rounded text-3xl">{`${minutes}:${
				seconds < 10 ? "0" : ""
			}${seconds}`}</p>
		);
	};

	return (
		<Countdown
			date={time + timeGiven}
			renderer={renderer}
			controlled={false}
			autoStart={timerFor === "w"}
		/>
	);
}
