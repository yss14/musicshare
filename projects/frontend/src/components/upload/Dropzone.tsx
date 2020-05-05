import React, { useCallback, ReactNode, useMemo } from "react"
import { useDropzone, FileRejection } from "react-dropzone"
import { Icon, Typography, message } from "antd"
import styled from "styled-components"
import { uploadFile } from "../../utils/upload/uploadFile"
import { useConfig } from "../../hooks/use-config"
import { useUser } from "../../graphql/queries/user-query"
import { useLibraryID } from "../../graphql/client/queries/libraryid-query"
import { last } from "lodash"
import { useSongUploadQueue, ISongUploadItem } from "../../utils/upload/SongUploadContext"
import { useApolloClient } from "react-apollo"
import { makeGenerateUploadableUrl } from "../../graphql/programmatic/generate-file-uploadable-url"
import { makeSubmitSongFromRemoteFile } from "../../graphql/programmatic/submit-song-from-remote-file"

const StyledIcon = styled(Icon)`
	font-size: 64px;
`

const { Title } = Typography

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
`

const Blur = styled.div`
	filter: ${(props: { active: boolean }) => (props.active ? "blur(3px)" : "")};
	width: 100%;
	height: 100%;
`

interface IDropzoneProps {
	shareID: string
	userID: string
	children: (uploadItems: ISongUploadItem[]) => ReactNode
}

interface WrapperProps {
	children: (uploadItems: ISongUploadItem[]) => ReactNode
}

const getPlaylistIDFromUrl = (): string[] => {
	const urlParts = window.location.href.split("/")
	const playlistIdx = urlParts.findIndex((part) => part === "playlists")
	if (playlistIdx === -1) {
		return []
	}
	const playlistID = urlParts[playlistIdx + 1]

	return playlistID ? [playlistID] : []
}

export default ({ children }: WrapperProps) => {
	const user = useUser()
	const libraryID = useLibraryID()
	return user.data && user.data.viewer && libraryID ? (
		<Dropzone userID={user.data.viewer.id} shareID={libraryID}>
			{(state) => children(state)}
		</Dropzone>
	) : null
}

const Dropzone = ({ userID, shareID, children }: IDropzoneProps) => {
	const [state, dispatch] = useSongUploadQueue()
	const config = useConfig()
	const client = useApolloClient()

	const generateUploadableUrl = useMemo(() => makeGenerateUploadableUrl(client), [client])
	const submitSongFromRemoteUrl = useMemo(() => makeSubmitSongFromRemoteFile(client), [client])

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			const playlistIDs = getPlaylistIDFromUrl()
			acceptedFiles.forEach((file) =>
				uploadFile(
					userID,
					shareID,
					playlistIDs,
					file,
					generateUploadableUrl,
					submitSongFromRemoteUrl,
				)(dispatch),
			)
		},
		[shareID, userID, dispatch, generateUploadableUrl, submitSongFromRemoteUrl],
	)

	const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
		console.log(fileRejections)
		const rejectedFileExtension = fileRejections.map((reason) => last(reason.file.name.split(".")))

		message.info(`Files with extension(s) ${rejectedFileExtension} are not supported yet!`)
	}, [])
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		onDropRejected,
		noClick: true,
		accept: ["audio/mpeg", "audio/mp3"],
		maxSize: 200 * 1024 * 1024, // 200 MB
	})

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
	)
}
