import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Icon, Typography } from "antd";
import styled from "styled-components";

const StyledIcon = styled(Icon)`
  font-size: 48px;
`;

const { Title } = Typography;

const UploadContainer = styled.div`
  position: fixed;
  top: 48px;
  left: 200px;
  width: 100%;
  height: 100%;
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

interface IChildrenProps {
  progress: number;
  loading: boolean;
  error?: string;
}
interface IDropzoneProps {
  children: ({ progress, loading, error }: IChildrenProps) => React.ReactNode;
}
export default ({ children }: IDropzoneProps) => {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback(acceptedFiles => {
    // Do something with the files
    setFiles(acceptedFiles);
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
      <Blur active={isDragActive}>
        {children({
          progress: 20,
          loading: files.length > 0,
          error: undefined
        })}
      </Blur>
    </div>
  );
};
