import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface IDropzoneProps {
  children: React.ReactNode;
}
export default ({ children }: IDropzoneProps) => {
  const onDrop = useCallback(acceptedFiles => {
    // Do something with the files
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop
  });

  return (
    <div style={{ width: "100%", height: "100%" }} {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? <p>Drop the files here ...</p> : children}
    </div>
  );
};
