export const formatDuration = (duration: number) => {
	const hours = Math.floor(duration / 3600)
	let remainder = duration - hours * 3600
	const minutes = Math.floor(remainder / 60)
	remainder = remainder - minutes * 60
	const seconds = remainder

	if (hours > 0) {
		return `${fillZeros(hours)}:${fillZeros(minutes)}:${fillZeros(seconds)}`
	} else {
		return `${fillZeros(minutes)}:${fillZeros(seconds)}`
	}
}

const fillZeros = (num: number) => (num < 10 ? `0${num}` : num)
