import React from "react";
import Image from "next/image";
import { Bebas_Neue, Source_Code_Pro } from "next/font/google";
const BebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"] });
const SourceCodePro = Source_Code_Pro({ weight: "400", subsets: ["latin"] });

function Home() {
	return (
		<div className="w-screen h-screen bg-black flex flex-row items center justify-center">
			<div className="absolute w-full h-full flex flex-col items-center justify-center font-bold gap-14 z-10">
				<div className="flex flex-col items-center">
					<h1
						className={`${BebasNeue.className} text-white text-7xl lg:text-8xl tracking-widest flex items-center justify-center`}
					>
						Mind Chess
					</h1>
					<h2
						className={`${SourceCodePro.className} text-white text-xs md:text-sm lg:text-base`}
					>
						Your Ultimate Chess Playground
					</h2>
				</div>

				<div className="flex row items-center justify-center gap-8 md:gap-9 lg:gap-10 text-xs md:text-sm lg:text-base">
					<button className="h-10 w-24 sm:h-11 sm:w-28 md:h-14 md:w-32 md:px-3 md:py-1 lg:h-16 lg:w-40 lg:px-4 lg:py-2 bg-white text-black border border-solid border-black duration-300 ease-in-out hover:bg-opacity-0 hover:text-white hover:border-white">
						Multiplayer
					</button>
					<button className="h-11 w-28 md:h-14 md:w-32 md:px-3 md:py-1 lg:h-16 lg:w-40 lg:px-4 lg:py-2 text-white border-white border border-solid transition duration-300 ease-in-out hover:bg-white hover:bg-opacity-20">
						Play Computer
					</button>
				</div>
			</div>
			<Image
				className="opacity-25"
				src="/Images/chess-2730034_1920.jpg"
				alt="Description of the image"
				// layout="responsive"
				width={1920}
				height={1080}
			/>
		</div>
	);
}

export default Home;
