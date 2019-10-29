import React, { useEffect } from "react";

import useReactRouter from "use-react-router";
import { Route } from "react-router";
import { ShareSongs } from "./ShareSongs";
import { PlaylistSongs } from "./PlaylistSongs";
import {
	useUpdateShare,
	IShareVariables
} from "../../graphql/client/mutations/share-mutation";
import { MutationFn } from "react-apollo/Mutation";

interface IShareProps {
	shareID: string;
	updateShareId: MutationFn<{}, IShareVariables>;
}

const MutationWrapper = () => {
	const {
		match: {
			params: { shareID }
		}
	} = useReactRouter<{ shareID: string }>();
	const [updateShareId, { called, loading }] = useUpdateShare({ shareID });
	return <Share shareID={shareID} updateShareId={updateShareId as any} />;
};

const Share = ({ updateShareId, shareID }: IShareProps) => {
	const { match } = useReactRouter();

	useEffect(() => {
		updateShareId();
	}, [shareID]);

	return (
		<>
			<Route
				path={`${match.url}/playlists/:playlistID`}
				render={() => <PlaylistSongs shareID={shareID} />}
			/>
			<Route path="/shares/:shareID" exact render={() => <ShareSongs />} />
		</>
	);
};

export default MutationWrapper;
