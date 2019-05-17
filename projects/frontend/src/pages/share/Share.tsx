import React, { useEffect, useState } from "react";
import gql from "graphql-tag";
import { Mutation, MutationFn } from "react-apollo";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Table } from "antd";
import { buildSongName } from "../../utils/songname-builder";
import {
	ILocalShareVariables,
	ILocalShareData
} from "../../graphql/types.local";
import { SongModal } from "../../components/modals/song-modal/SongModal";
import { IShareSong } from "../../graphql/types";
import { ShareWithSongs, GET_SHARE_WITH_SONGS } from "../../graphql/queries/share-with-songs-query";

const columns = [
	{
		title: "Title",
		dataIndex: "titleStats",
		width: 200,
		key: "title",
		render: (song: IShareSong) => <a href="#">{buildSongName(song)}</a>
	},
	{
		title: "Artists",
		dataIndex: "artists",
		width: 150,
		key: "artists",
		render: (artists: string[]) =>
			artists.reduce((prev, curr) => prev + ", " + curr)
	},
	{
		title: "Release date",
		dataIndex: "releaseDate",
		width: 100,
		key: "duration",
		render: (releaseDate: string) => releaseDate
	},
	{
		title: "Genres",
		dataIndex: "genres",
		width: 150,
		key: "genres",
		render: (genres: string[]) =>
			genres.reduce((prev, curr) => prev + ", " + curr)
	}
];

interface IShareProps {
	shareID: string;
	updateShareId: MutationFn<ILocalShareData, ILocalShareVariables>;
}

const UPDATE_SHARE_ID = gql`
  mutation updateShareId($shareId: String!) {
    updateShareId(shareId: $shareId) @client
  }
`;

const MutationWrapper = ({ match }: RouteComponentProps<{ id: string }>) => {
	const { id } = match.params;
	return (
		<Mutation<ILocalShareData, ILocalShareVariables>
			mutation={UPDATE_SHARE_ID}
			variables={{ shareId: id }}
		>
			{updateShareId => {
				return <Share shareID={id} updateShareId={updateShareId} />;
			}}
		</Mutation>
	);
};

const Share = ({ updateShareId, shareID }: IShareProps) => {
	const [editSongID, setEditSongID] = useState<string | null>(null);

	useEffect(() => {
		updateShareId();
		console.log("update", shareID);
	}, [shareID]);

	const onRowClick = (song: any) => {
		setEditSongID(song.id);
	}

	return (
		<>
			<ShareWithSongs query={GET_SHARE_WITH_SONGS} variables={{ shareID }}>
				{({ loading, error, data }) => {
					if (loading) {
						return <div>Loading ...</div>;
					}
					if (error) return `Error!: ${error}`;
					if (data) {
						const songs = data.share.songs.map(song => ({
							...song,
							titleStats: song
						}));
						return (
							<Table
								size="middle"
								columns={columns}
								dataSource={songs}
								pagination={false}
								scroll={{ y: 1242 }}
								onRowClick={onRowClick}
							/>
						);
					}
				}}
			</ShareWithSongs>
			{editSongID ? <SongModal songID={editSongID} shareID={shareID} closeForm={() => setEditSongID(null)} /> : null}
		</>
	);
};

export default withRouter(MutationWrapper);
