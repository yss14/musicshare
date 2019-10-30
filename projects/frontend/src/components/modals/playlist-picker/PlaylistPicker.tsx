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

	const onSelectPlaylist = (values: string[]) => {
		setSelectedPlaylists([
			...selectedPlaylists,
			...values,
		])
	}

	if (loading || error || !data) return null

	const onSubmitModal = () => {
		const playlists = selectedPlaylists
			.map(playlistID => data.share.playlists.find(playlist => playlist.id === playlistID))
			.filter(filterUndefined)

		onSubmit(playlists)
	}

	return (
		<Modal title="Pick playlist(s)" visible={visible} onOk={onSubmitModal} onCancel={() => onSubmit([])}>
			<Select
				mode="multiple"
				style={{ width: '100%' }}
				placeholder="Select one or more playlists"
				defaultValue={[]}
				onChange={onSelectPlaylist}
				optionLabelProp="title"
			>
				{data.share.playlists.map((playlist) => (
					<Option value={playlist.id} title={playlist.name}>{playlist.name}</Option>
				))}
			</Select>
		</Modal >
	)
}
