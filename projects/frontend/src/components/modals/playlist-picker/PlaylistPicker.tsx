import React, { useState } from "react"
import { Modal, Select } from "antd"
import { useSharePlaylists } from "@musicshare/graphql-client"
import { filterUndefined } from "../../../utils/filter-null"
import { useShareID } from "../../../hooks/data/useShareID"
import { Playlist } from "@musicshare/shared-types"

const { Option } = Select

interface IPlaylistPickerProps {
	visible: boolean
	onSubmit: (playlists: Playlist[]) => void
}

export const PlaylistPicker: React.FC<IPlaylistPickerProps> = ({ visible, onSubmit }) => {
	const shareID = useShareID()!

	const { data, isLoading, error } = useSharePlaylists(shareID, { enabled: !!shareID })
	const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([])

	const onSelectPlaylist = (playlistIDs: string[]) => {
		setSelectedPlaylists(playlistIDs)
	}

	const onDeselectPlaylist = (playlistID: string) => {
		setSelectedPlaylists((playlistIDs) => playlistIDs.filter((id) => id !== playlistID))
	}

	if (isLoading || error || !data) return null

	const onSubmitModal = () => {
		const playlists = selectedPlaylists
			.map((playlistID) => data.find((playlist) => playlist.id === playlistID))
			.filter(filterUndefined)

		setSelectedPlaylists([])

		onSubmit(playlists)
	}

	const onCancelModal = () => {
		setSelectedPlaylists([])

		onSubmit([])
	}

	if (!visible) return null // forces select to re-render on open

	return (
		<Modal title="Pick playlist(s)" visible={visible} onOk={onSubmitModal} onCancel={onCancelModal}>
			<Select
				mode="multiple"
				style={{ width: "100%" }}
				placeholder="Select one or more playlists"
				defaultValue={[]}
				onChange={onSelectPlaylist}
				onDeselect={onDeselectPlaylist}
				optionLabelProp="title"
			>
				{data.map((playlist) => (
					<Option value={playlist.id} title={playlist.name} key={playlist.id}>
						{playlist.name}
					</Option>
				))}
			</Select>
		</Modal>
	)
}
