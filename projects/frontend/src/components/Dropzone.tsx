import React, {
  useCallback,
  useState,
  useReducer,
  useEffect,
  ReactNode
} from "react";
import { useDropzone } from "react-dropzone";
import { Icon, Typography } from "antd";
import styled from "styled-components";
import { uploadFile } from "../utils/upload/uploadFile";
import { reducer } from "../utils/upload/upload.reducer";
import { IUploadItem } from "../schemas/upload.schema";

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
  shareId: string;
  userId: string;
  children: (uploadItems: IUploadItem[]) => ReactNode;
}

export default ({ userId, shareId, children }: IDropzoneProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [state, dispatch] = useReducer(reducer, []);
  console.log(userId);
  useEffect(() => {
    console.log(state);
  }, [state]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Do something with the files
    setFiles(acceptedFiles);
    acceptedFiles.forEach(file => uploadFile(userId, shareId, file)(dispatch));
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop
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
