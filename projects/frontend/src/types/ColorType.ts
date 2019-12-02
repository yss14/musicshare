export type RGBA = [number, number, number, number]
export type HEX = string

export type ColorType = RGBA | HEX

const hexToRgb = (hex: string) => {
	return hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
		, (m, r, g, b) => '#' + r + r + g + g + b + b)
		.substring(1).match(/.{2}/g)!
		.map(x => parseInt(x, 16))
}

export const colorToRGBA = (color: ColorType): RGBA => {
	if (typeof color === 'string') {
		const rgb = hexToRgb(color)

		return [rgb[0], rgb[1], rgb[2], 1]
	}

	return color
}
