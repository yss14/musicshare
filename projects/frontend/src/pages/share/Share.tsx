import React, { useEffect } from "react";
import gql from "graphql-tag";
import { Mutation, MutationFn } from "react-apollo";
import {
	ILocalShareVariables,
	ILocalShareData
} from "../../graphql/types.local";
import useReactRouter from 'use-react-router';
import { Route } from "react-router";
import { ShareSongs } from "./ShareSongs";
import { PlaylistSongs } from "./PlaylistSongs";

interface IShareProps {
	shareID: string;
	updateShareId: MutationFn<ILocalShareData, ILocalShareVariables>;
}

const UPDATE_SHARE_ID = gql`
  mutation updateShareId($shareID: String!) {
    updateShareId(shareID: $shareID) @client
  }
`;

const MutationWrapper = () => {
	const { match: { params: { shareID } } } = useReactRouter<{ shareID: string }>();
	return (
		<Mutation<ILocalShareData, ILocalShareVariables>
			mutation={UPDATE_SHARE_ID}
			variables={{ shareID }}
		>
			{updateShareId => {
				return <Share shareID={shareID} updateShareId={updateShareId} />;
			}}
		</Mutation>
	);
};

const Share = ({ updateShareId, shareID }: IShareProps) => {
	const { match } = useReactRouter();

	useEffect(() => {
		updateShareId();
		console.log("update", shareID);
	}, [shareID]);


	return (
		<>
			<Route path={`${match.url}/playlists/:playlistID`} render={() => <PlaylistSongs shareID={shareID} />} />
			<Route path="/shares/:shareID" exact render={() => <ShareSongs />} />
		</>
	);
};

export default MutationWrapper;
