import * as React from 'react';
import styled from 'styled-components';
import { IStyledComponentProps } from '../../../types/props/StyledComponent.props';
// @ts-ignore
import { Line } from 'rc-progress';
// @ts-ignore
import colorLerp from 'color-lerp';
import { IUploadItem } from '../../../redux/upload/upload.schema';

const Filename = styled.div`
	font-size: 10px;
`;

interface IUploadListItemProps extends IStyledComponentProps {
	upload: IUploadItem;
}

const UploadListItemComponent: React.StatelessComponent<IUploadListItemProps> = (props) => {
	const { upload } = props;

	const percentageInt = Math.min(Math.floor(upload.progress), 99);
	const lerpedColor = colorLerp('#3498db', '#2ecc71', 100)[percentageInt];

	return (
		<div className={props.className}>
			<Filename>{props.upload.filename}</Filename>
			<Line percent={props.upload.progress} strokeWidth="8" strokeColor={lerpedColor} trailColor="#d9d9d9" />
		</div>
	);
}

const UploadListItemStyled = styled(UploadListItemComponent)`
	width: 100%;
`;

export const UploadListItem = UploadListItemStyled;