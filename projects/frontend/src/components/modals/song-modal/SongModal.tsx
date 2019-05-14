import React from 'react';
import { Modal } from 'antd';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

interface ISongModalProps {
	shareID: string;
	songID: string;
	onSongUpdate?: (updatedSong: any) => void;
	onCancel?: () => void;
}

export const SongModal = ({ songID, shareID, onCancel }: ISongModalProps) => {
	console.log('SongModal')

	return (
		<Modal
			title="Basic Modal"
			visible={true}
			onCancel={onCancel}
		>
			<SongQuery query={GET_SONG} variables={{ songID, shareID }}>
				{({ loading, error, data }) => {
					console.log({ loading, error, data });

					return null;
				}}
			</SongQuery>
		</Modal>
	);
}

interface ISongData {
	user: {
		share: {
			song: {
				id: string;
				title: string;
			}
		}
	}
}

interface ISongVariables {
	shareID: string;
	songID: string;
}

const GET_SONG = gql`
	query song ($shareID: String!, $songID: String!){
		share(shareID: $shareID) {
			id,
      		song(id: $songID){
				id
				title
				suffix
				year
				bpm
				dateLastEdit
				releaseDate
				isRip
				artists
				remixer
				featurings
				type
				genres
				label
				requiresUserAction,
				tags
			}
    	}
  	}
`;

class SongQuery extends Query<ISongData, ISongVariables>{ }