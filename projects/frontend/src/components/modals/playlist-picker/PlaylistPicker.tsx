import React, { useState } from 'react'
import { Modal, Select } from 'antd'
import { usePlaylists } from '../../../graphql/queries/playlists-query'
import { useShareID } from '../../../hooks/use-share'
import useReactRouter from "use-react-router";
import { IPlaylist } from '../../../graphql/types';
import { filterUndefined } from '../../../utils/filter-null';

const { Option } = Select;

interface IPlaylistPickerProps {
	visible: boolean;
	onSubmit: (playlists: IPlaylist[]) => void;
}

export const PlaylistPicker: React.FC<IPlaylistPickerProps> = ({ visible, onSubmit }) => {
	const shareID = useShareID()
	const { data, loading, error } = usePlaylists({ shareID })
	const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([])

	const onSelectPlaylist = (playlistIDs: string[]) => {
		setSelectedPlaylists(playlistIDs)
	}

	const onDeselectPlaylist = (playlistID: string) => {
		setSelectedPlaylists(playlistIDs => playlistIDs.filter(id => id !== playlistID))
	}

	if (loading || error || !data) return null

	const onSubmitModal = () => {
		const playlists = selectedPlaylists
			.map(playlistID => data.share.playlists.find(playlist => playlist.id === playlistID))
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
				style={{ width: '100%' }}
				placeholder="Select one or more playlists"
				defaultValue={[]}
				onChange={onSelectPlaylist}
				onDeselect={onDeselectPlaylist}
				optionLabelProp="title"
			>
				{data.share.playlists.map((playlist) => (
					<Option value={playlist.id} title={playlist.name}>{playlist.name}</Option>
				))}
			</Select>
		</Modal >
	)
}
