import axios from "axios";

interface IAxiosProgress {
  total?: number;
  loaded?: number;
}

export const upload = async (
  userID: string,
  shareID: string,
  file: File,
  buffer: ArrayBuffer,
  onProgress: (progress: IAxiosProgress) => void
): Promise<void> => {
  await axios.post<void>(
    `http://127.0.0.1:4000/users/${userID}/shares/${shareID}/files`,
    buffer,
    {
      onUploadProgress: onProgress
    }
  );
};
