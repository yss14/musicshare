import * as React from 'react';
import styled from 'styled-components';
import { IStyledComponentProps } from '../../../types/props/StyledComponent.props';
import Dropzone from 'react-dropzone';
import { bind } from 'bind-decorator';
import { UploadAction, upload } from '../../../redux/upload/upload.actions';
import { DispatchPropThunk } from '../../../types/props/DispatchPropThunk';
import { IStoreSchema } from '../../../redux/store.schema';
import { IUploadSchema } from '../../../redux/upload/upload.schema';
import { connect } from 'react-redux';
import { UploadListItem } from './UploadListItem';
import imgUpload from '../../../images/upload.png';
import { useContext } from 'react';
import { APIContext } from '../../../context/APIContext';

const UploadListWrapper = styled.div`
	flex: 1;
	width: 100%;
	padding: 5px;
	overflow-x: hidden;
	overflow-y: scroll;
	position: relative;
`;

const UploadListLabel = styled.div`
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	font-weight: bold;
	font-size: 14px;
	position: absolute;
	color: #c2c2c2;
`;

interface IUploadZoneProps extends IStyledComponentProps, DispatchPropThunk<IStoreSchema, UploadAction> {
	shareID: string;
	userID: string;
	uploads: IUploadSchema;
}

class UploadZoneComponent extends React.Component<IUploadZoneProps>{

	@bind
	private onDrop(files: File[]) {
		const { dispatch, userID, shareID } = this.props;

		const { musicshareAPI } = useContext(APIContext);

		console.log(files);
		files.forEach(file => {
			dispatch(upload(userID, shareID, musicshareAPI, file));
		});
	}

	public render() {
		const { className, uploads } = this.props;

		const dropzoneStyled: React.CSSProperties = {
			alignSelf: 'flex-end',
			height: '60px',
			width: '100%',
			backgroundImage: `url(${imgUpload})`,
			backgroundRepeat: 'no-repeat',
			backgroundPosition: 'center',
			backgroundSize: '30px',
			cursor: 'pointer'
		}

		const dropzoneDropHoverStyle: React.CSSProperties = {
			backgroundColor: 'rgba(46, 204, 113,0.5)'
		}

		return (
			<div className={className}>
				<UploadListWrapper>
					{
						uploads.sort((a, b) => b.progress - a.progress).map((u, idx) => (
							<UploadListItem upload={u} key={u.hash} />
						))
					}
					{
						uploads.length === 0 ? <UploadListLabel>No uploads</UploadListLabel> : null
					}
				</UploadListWrapper>
				<Dropzone
					onDrop={this.onDrop}
					style={dropzoneStyled}
					multiple={true}
					activeStyle={dropzoneDropHoverStyle}
				>
					Drop here
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
	-webkit-box-shadow: inset 0px 0px 45px -14px rgba(0,0,0,0.17);
	-moz-box-shadow: inset 0px 0px 45px -14px rgba(0,0,0,0.17);
	box-shadow: inset 0px 0px 45px -14px rgba(0,0,0,0.17);
`;

const mapStateToProps = (state: IStoreSchema) => ({
	uploads: state.uploads
});

export const UploadZone = connect(mapStateToProps)(UploadZoneStyled);