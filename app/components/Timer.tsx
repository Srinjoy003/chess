import React from "react";
import Countdown from "react-countdown";

export default function Timer() {
	const renderer = ({ minutes, seconds, completed }) => {
		if (completed) {
			// Timer completed
			return <p>Countdown completed!</p>;
		} else {
			// Display minutes and seconds
			return <p>{`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`}</p>;
		}
	};

	return <Countdown date={Date.now() + 300000} renderer={renderer} />;
}
