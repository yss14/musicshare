import React from "react"
import { useSong } from "../../../graphql/queries/song-query"
import { useGenres } from "../../../graphql/queries/genres-query"
import { useSongTypes } from "../../../graphql/queries/song-types-query"
import { useArtists } from "@musicshare/graphql-client"
import { SongForm } from "./SongForm"
import { useTags } from "../../../graphql/queries/tags-query"
import { useLibraryID } from "../../../graphql/client/queries/libraryid-query"
import { IShareSong } from "@musicshare/shared-types"

interface ISongModalProps {
	song: IShareSong
	playlistID?: string
	closeForm: () => void
}

export const SongModal = ({ song, closeForm, playlistID }: ISongModalProps) => {
	const { loading: loadingSong, error: errorSong, data: songFromAPI } = useSong(song.shareID, song.id)
	const { loading: loadingGenres, error: errorGenres, data: genres } = useGenres()
	const { isFetching: loadingArtists, error: errorArtists, data: artists } = useArtists()
	const { loading: loadingTags, error: errorTags, data: tags } = useTags()
	const { loading: loadingSongTypes, error: errorSongTypes, data: songTypes } = useSongTypes()
	const userLibraryID = useLibraryID()

	if (loadingSong || loadingGenres || loadingSongTypes || loadingArtists || loadingTags) {
		return <div>Loading</div>
	}
	if (errorSong || errorGenres || errorSongTypes || errorArtists || errorTags) {
		closeForm()

		return null
	}
	if (songFromAPI && genres && songTypes && artists && tags) {
		return (
			<SongForm
				song={songFromAPI}
				genres={genres}
				songTypes={songTypes}
				artists={artists}
				closeForm={closeForm}
				tags={tags}
				playlistID={playlistID}
				readOnly={!userLibraryID || song.libraryID !== userLibraryID}
			/>
		)
	} else {
		console.error("Some data is invalid", { songFromAPI, genres, songTypes, artists, tags })

		closeForm()

		return null
	}
}
