import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Chess Eclipse | Your ultimate chess playground",
	description:
		"Experience the thrill of chess like never before with Chess Eclipse. Play against friends or challenge yourself against our advanced AI opponents. Built with Next.js for a seamless and immersive gaming experience.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>{children}</body>
		</html>
	);
}
