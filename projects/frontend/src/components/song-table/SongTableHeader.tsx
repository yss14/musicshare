import React from "react"
import { Typography } from "antd"
import { IBaseSong, IScopedSong } from "../../graphql/types"
import styled from "styled-components"
import { formatDuration } from "../../utils/format-duration"
import { SongSearch } from "./search/SongSearch"
import { usePlayer } from "../../player/player-hook"
import { ISongSearchFilter } from "./search/search-types"
import { SongViewSettings, ISongViewSettings } from "./search/SongViewSettings"

const { Title, Text } = Typography

const SongTableHeaderFlexContainer = styled.div`
	display: flex;
	flex-direction: row;
	width: 100%;
	padding: 8px;
	box-sizing: border-box;
	background-color: white;
`

const MetaInfoContainer = styled.div`
	display: flex;
	flex: 1 1 0px;
	flex-direction: column;
`

interface ISongTableHeaderProps {
	songs: IBaseSong[]
	title: string
	onSearchFilterChange: (newFilter: ISongSearchFilter) => void
	onSongViewSettingsChange: (newSettings: ISongViewSettings) => void
}

export const SongTableHeader = ({
	songs,
	title,
	onSearchFilterChange,
	onSongViewSettingsChange,
}: ISongTableHeaderProps) => {
	const { changeSong } = usePlayer()

	const durationSum = songs.reduce((acc, song) => acc + song.duration, 0)

	const onClickSong = (song: IScopedSong) => {
		changeSong(song)
	}

	return (
		<SongTableHeaderFlexContainer>
			<MetaInfoContainer>
				<Title level={4} style={{ marginBottom: 0 }}>
					{title}
				</Title>
				<Text>
					{songs.length} songs | {formatDuration(durationSum)}
				</Text>
			</MetaInfoContainer>
			<SongViewSettings onChange={onSongViewSettingsChange} />
			<SongSearch onClickSong={onClickSong} onSearchFilterChange={onSearchFilterChange} />
		</SongTableHeaderFlexContainer>
	)
}
