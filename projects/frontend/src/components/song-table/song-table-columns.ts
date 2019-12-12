import { IScopedSong, IScopedPlaylistSong } from "../../graphql/types"
import { buildSongName } from "../../utils/songname-builder"
import { formatDuration } from "../../utils/format-duration"

type Song = IScopedSong | IScopedPlaylistSong

export interface IColumn {
	title: string;
	width: number;
	key: string;
	render: (song: Song) => string | number | React.ReactElement<any>;
}

export const SongTableColumn = {
	Title: {
		title: "Title",
		width: 250,
		key: "title",
		render: (song: Song) => buildSongName(song),
	},
	Time: {
		title: "Time",
		width: 40,
		key: "duration",
		render: (song: Song) => formatDuration(song.duration)
	},
	Artists: {
		title: "Artists",
		width: 150,
		key: "artists",
		render: (song: Song) => song.artists.join(', ')
	},
	Genres: {
		title: "Genres",
		width: 150,
		key: "genres",
		render: (song: Song) => song.genres.join(', ')
	},
}
