import React from "react";
import Image from "next/image";
import { Bebas_Neue, Source_Code_Pro } from "next/font/google";
import Link from "next/link";
const BebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"] });
const SourceCodePro = Source_Code_Pro({ weight: "400", subsets: ["latin"] });
import background from "@/public/Images/chess-bg3.jpg";
import { FaGithub } from "react-icons/fa";

function Home() {
	return (
		<div
			className="w-screen h-screen bg-room-bg flex flex-row items center justify-center"
			style={{
				backgroundImage: `url(${background.src})`,
				backgroundSize: "cover",
				imageRendering: "crisp-edges",
			}}
		>
			<Link href='https://github.com/Srinjoy003' className="absolute text-white left-4 top-4 text-4xl transition-all duration-300 hover:scale-125 z-20">
				<FaGithub />
			</Link>
			<div className="absolute w-full h-full flex flex-col items-center justify-center font-bold gap-8 sm:gap-10 md:gap-12 lg:gap-14 z-10">
				<div className="flex flex-col items-center">
					<h1
						className={`${BebasNeue.className} text	 text-4xl sm:text-7xl lg:text-8xl tracking-widest flex items-center justify-center text-room-secondary`}
					>
						Chess Eclipse
					</h1>
					<h2
						className={`${SourceCodePro.className} text-room-secondary text-[10px] md:text-sm lg:text-2xl mt-4`}
					>
						Your Ultimate Chess Playground
					</h2>
				</div>

				<div className="flex row items-center justify-center gap-8 md:gap-9 lg:gap-10 text-[10px] md:text-sm lg:text-base">
					<Link
						href="/GameRoom"
						className="h-9 w-24 md:h-14 md:w-32 md:px-3 md:py-1 lg:h-16 lg:w-40 lg:px-4 lg:py-2 bg-room-tertiary text-black border border-solid border-black duration-300 ease-in-out hover:bg-opacity-0 hover:text-room-secondary hover:border-room-tertiary rounded flex items-center justify-center"
					>
						Multiplayer
					</Link>
					<Link
						href="/PlayComputer"
						className="h-9 w-24 md:h-14 md:w-32 md:px-3 md:py-1 lg:h-16 lg:w-40 lg:px-4 lg:py-2 text-room-secondary border-room-tertiary border border-solid transition duration-300 ease-in-out hover:bg-room-tertiary hover:bg-opacity-20 rounded flex items-center justify-center"
					>
						Play Computer
					</Link>
				</div>
			</div>
			{/* <Image
				className="opacity-25"
				src="/Images/chess-2730034_1920.jpg"
				alt="Description of the image"
				width={1920}
				height={1080}
			/> */}
		</div>
	);
}

export default Home;
