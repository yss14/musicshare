import React, { useCallback, useReducer, ReactNode } from "react";
import { useDropzone } from "react-dropzone";
import { Icon, Typography } from "antd";
import styled from "styled-components";
import { uploadFile } from "../utils/upload/uploadFile";
import { reducer } from "../utils/upload/upload.reducer";
import { Query } from "react-apollo";
import { useConfig } from "../hooks/use-config";
import { IUploadItem } from "../graphql/rest-types";
import { useUser } from "../graphql/client/queries/user-query";
import { useShare } from "../graphql/client/queries/share-query";

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
  width: 100%;
  height: 100%;
`;

interface IDropzoneProps {
  shareID: string;
  userID: string;
  children: (uploadItems: IUploadItem[]) => ReactNode;
}

interface WrapperProps {
  children: (uploadItems: IUploadItem[]) => ReactNode;
}

export default ({ children }: WrapperProps) => {
  const user = useUser();
  const share = useShare();
  console.log(user, share);
  return user.data && share.data ? (
    <Dropzone userID={user.data.userID} shareID={share.data.shareID}>
      {state => children(state)}
    </Dropzone>
  ) : null;
};

const Dropzone = ({ userID, shareID, children }: IDropzoneProps) => {
  const [state, dispatch] = useReducer(reducer, []);
  const config = useConfig();
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach(file =>
        uploadFile(userID, shareID, file, config)(dispatch)
      );
    },
    [shareID, userID]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true
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
