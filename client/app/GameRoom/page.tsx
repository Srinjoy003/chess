import React from "react";
import "./index.css";
import { Bebas_Neue, Source_Code_Pro } from "next/font/google";

const BebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"] });

function Home() {
	return (
		<div className="w-screen h-screen bg-black flex flex-col items-center justify-center gap-10">
			<div>
				<div className="inputbox">
					<input required={true} type="text" />
					<span>Enter your Name</span>
					<i></i>
				</div>
			</div>

			<button className="h-10 w-32 sm:w-36 text-zinc-700 hover:text-zinc-200 backdrop-blur-lg bg-gradient-to-tr from-transparent via-[rgba(121,121,121,0.16)] to-transparent rounded-md py-2 px-6 shadow hover:shadow-zinc-400 duration-700">
				Submit
			</button>
		</div>
	);
}

export default Home;
