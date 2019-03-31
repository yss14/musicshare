import React from 'react';
import { IStoreSchema } from "../../../redux/store.schema";
import { RouteComponentProps } from "react-router";
import { IRouteShare } from "../../../types/props/RouterProps";
import { useEffect, useContext } from 'react';
import { login } from '../../../redux/user/user.actions';
import { APIContext } from '../../../context/APIContext';
import { useMappedState, useDispatch } from '../../../redux/custom-store-hooks';
import { fetchShares } from '../../../redux/shares/shares.actions';
import { Link } from 'react-router-dom';

interface IProps extends RouteComponentProps<IRouteShare> { }

export const DebugShareSelection: React.FunctionComponent<IProps> = ({ history }) => {
	const { shares } = useMappedState((state) => ({
		shares: state.shares
	}));
	const dispatch = useDispatch();

	const { musicshareAPI } = useContext(APIContext);

	useEffect(() => {
		dispatch(login(musicshareAPI, '', '')).then(userID => {
			dispatch(fetchShares(musicshareAPI, userID));
		});
	}, []);

	return (
		<React.Fragment>
			<h1>Shares:</h1>
			<ul>
				{
					shares.map(share => (
						<li key={share.id}>
							<Link to={`/shares/${share.id}`}>{share.name}</Link>
						</li>
					))
				}
			</ul>
			{shares.length === 0 && <p>No shares available</p>}
		</React.Fragment>
	);
}