import { ShareSong } from "./generatedTypes"

export const buildSongName = (song: ShareSong): string => {
	let name = song.title

	if (song.remixer && song.remixer.length > 0) {
		name += ` (${song.remixer.join(" & ")} ${song.suffix ? song.suffix : ""} ${song.type})`
	}

	if (song.featurings && song.featurings.length > 0) {
		name += ` (feat. ${song.featurings.join(" & ")})`
	}

	return name
}
