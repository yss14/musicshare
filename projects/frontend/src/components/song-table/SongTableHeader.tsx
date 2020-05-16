import React from "react"
import { Typography, Button } from "antd"
import styled from "styled-components"
import { formatDuration } from "../../utils/format-duration"
import { SongSearch } from "./search/SongSearch"
import { usePlayerActions } from "../../player/player-hook"
import { ISongSearchFilter } from "./search/search-types"
import { SongViewSettings, ISongViewSettings } from "./search/SongViewSettings"
import { useSongDropzone } from "../upload/Dropzone"
import { IShareSong } from "@musicshare/shared-types"
import { ArrowUpOutlined } from "@ant-design/icons"

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

const HeaderButton = styled(Button)`
	align-self: flex-end;
	margin-right: 16px;
`

interface ISongTableHeaderProps {
	songs: IShareSong[]
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
	const { changeSong } = usePlayerActions()
	const { open: triggerUploadModal } = useSongDropzone()

	const durationSum = songs.reduce((acc, song) => acc + song.duration, 0)

	const onClickSong = (song: IShareSong) => {
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
			<HeaderButton icon={<ArrowUpOutlined />} onClick={triggerUploadModal} title="Upload" />
			<SongViewSettings onChange={onSongViewSettingsChange} />
			<SongSearch onClickSong={onClickSong} onSearchFilterChange={onSearchFilterChange} />
		</SongTableHeaderFlexContainer>
	)
}
