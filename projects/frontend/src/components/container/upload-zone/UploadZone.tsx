import * as React from 'react';
import styled from 'styled-components';
import { IStyledComponentProps } from '../../../types/props/StyledComponent.props';
import Dropzone, { ImageFile } from 'react-dropzone';
import { bind } from 'bind-decorator';
import { UploadAction, upload } from '../../../redux/upload/upload.actions';
import { DispatchPropThunk } from '../../../types/props/DispatchPropThunk';
import { IStoreSchema } from '../../../redux/store.schema';
import { MusicShareApi } from '../../../apis/musicshare-api';
import { IUploadSchema } from '../../../redux/upload/upload.schema';
import { connect } from 'react-redux';
import { UploadListItem } from './UploadListItem';

const UploadListWrapper = styled.div`
	flex: 1;
	width: 100%;
`;

interface IUploadZoneProps extends IStyledComponentProps, DispatchPropThunk<IStoreSchema, UploadAction> {
	shareID: string;
	userID: string;
	uploads: IUploadSchema;
}

class UploadZoneComponent extends React.Component<IUploadZoneProps>{

	@bind
	private onDrop(files: ImageFile[]) {
		const { dispatch, userID, shareID } = this.props;

		console.log(files);
		files.forEach(file => {
			dispatch(upload(userID, shareID, new MusicShareApi(process.env.REACT_APP_MUSICSHARE_BACKEND_URL), file));
		});
	}

	public render() {
		const { className, uploads } = this.props;

		const dropzoneStyled: React.CSSProperties = {
			alignSelf: 'flex-end',
			height: '60px'
		}

		return (
			<div className={className}>
				<UploadListWrapper>
					{
						uploads.map((u, idx) => (
							<UploadListItem upload={u} key={u.hash} />
						))
					}
				</UploadListWrapper>
				<Dropzone onDrop={this.onDrop} style={dropzoneStyled} multiple={true}>
					<p>Drop here</p>
				</Dropzone>
			</div>
		)
	}
}

const UploadZoneStyled = styled(UploadZoneComponent)`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
`;

const mapStateToProps = (state: IStoreSchema) => ({
	uploads: state.uploads
});

export const UploadZone = connect(mapStateToProps)(UploadZoneStyled);