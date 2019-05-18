import React, { useCallback, useReducer, ReactNode } from "react";
import { useDropzone } from "react-dropzone";
import { Icon, Typography } from "antd";
import styled from "styled-components";
import { uploadFile } from "../utils/upload/uploadFile";
import { reducer } from "../utils/upload/upload.reducer";
import { Query } from "react-apollo";
import {
	ILocalUserVariables,
	ILocalShareVariables,
	ILocalShareData,
	ILocalUserData
} from "../graphql/types.local";
import gql from "graphql-tag";
import { useConfig } from "../hooks/use-config";
import { IUploadItem } from "../graphql/rest-types";

const StyledIcon = styled(Icon)`
  font-size: 64px;
`;

const { Title } = Typography;

const UploadContainer = styled.div`
  position: fixed;
  top: 48px;
  left: 200px;
  width: 100%;
  height: calc(100% - 96px);
  display: flex;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 100;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Blur = styled.div`
  filter: ${(props: { active: boolean }) => (props.active ? "blur(3px)" : "")};
`;

interface IDropzoneProps {
	shareID: string;
	userId: string;
	children: (uploadItems: IUploadItem[]) => ReactNode;
}

interface WrapperProps {
	children: (uploadItems: IUploadItem[]) => ReactNode;
}

const GET_SHARE_ID = gql`
  query {
    shareId @client
  }
`;
const GET_USER_ID = gql`
  query {
    userId @client
  }
`;

export default ({ children }: WrapperProps) => {
	return (
		<Query<ILocalUserData, ILocalUserVariables> query={GET_USER_ID}>
			{localUserQuery => {
				if (localUserQuery.data) {
					return (
						<Query<ILocalShareData, ILocalShareVariables> query={GET_SHARE_ID}>
							{localShareQuery => {
								if (localUserQuery.data && localShareQuery.data) {
									return (
										<Dropzone
											userId={localUserQuery.data.userId}
											shareID={localShareQuery.data.shareID}
										>
											{state => children(state)}
										</Dropzone>
									);
								}
							}}
						</Query>
					);
				}
			}}
		</Query>
	);
};

const Dropzone = ({ userId, shareID, children }: IDropzoneProps) => {
	const [state, dispatch] = useReducer(reducer, []);
	const config = useConfig();
	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			acceptedFiles.forEach(file =>
				uploadFile(userId, shareID, file, config)(dispatch)
			);
		},
		[shareID, userId]
	);
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		noClick: true,
	});

	return (
		<div style={{ width: "100%", height: "100%" }} {...getRootProps()}>
			<input {...getInputProps()} />
			{isDragActive ? (
				<UploadContainer>
					<StyledIcon type="upload" />
					<Title level={1}>Drop here to upload track</Title>
				</UploadContainer>
			) : null}
			<Blur active={isDragActive}>{children(state)}</Blur>
		</div>
	);
};
