export function extractChessPosition(position: number): string {
	const row = Math.floor(position / 10); // Extract the "tens" place as row
	const col = position % 10; // Extract the "ones" place as column
	return String.fromCharCode("a".charCodeAt(0) + col) + (row + 1);
}