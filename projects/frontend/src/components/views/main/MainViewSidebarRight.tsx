import * as React from 'react';
import styled from 'styled-components';
import { Sidebar } from '../../container/sidebar/Sidebar';
import { withRouter, RouteComponentProps } from 'react-router';
import { IStoreSchema } from '../../../redux/store.schema';
import { connect } from 'react-redux';
import { ISharesSchema } from '../../../redux/shares/shares.schema';
import { IRouteShare } from '../../../types/props/RouterProps';
import { UploadZone } from '../../container/upload-zone/UploadZone';
import { DispatchPropThunk } from '../../../types/props/DispatchPropThunk';
import { UploadAction } from '../../../redux/upload/upload.actions';

const UploadWrapper = styled.div`
	width: 200px;
	height: 200px;
	align-self: flex-end;
	margin-top: auto;
	box-sizing: content-box;
	border-top: 1px solid silver;
	background-color: #fafafa;
`;

interface IMainViewSidebarRightProps extends RouteComponentProps<IRouteShare>, DispatchPropThunk<IStoreSchema, UploadAction> {
	shares: ISharesSchema;
}

class MainViewSidebarRightComponent extends React.Component<IMainViewSidebarRightProps> {
	public render() {
		return (
			<Sidebar orientation="right" width={200}>
				<div>Right</div>
				<UploadWrapper>
					<UploadZone
						shareID="f0d649e0-aeb1-11e8-a117-43673ffd376b"
						userID="f0d8e1f0-aeb1-11e8-a117-43673ffd376b"
					/>
				</UploadWrapper>
			</Sidebar>
		);
	}
}

const mapStateToProps = (state: IStoreSchema) => ({
	shares: state.shares
});

export const MainViewSidebarRight = withRouter(connect(mapStateToProps)(MainViewSidebarRightComponent));