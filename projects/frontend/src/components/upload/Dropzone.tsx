import React, { useCallback, useReducer, ReactNode } from "react"
import { useDropzone, FileRejection } from "react-dropzone"
import { Icon, Typography, message } from "antd"
import styled from "styled-components"
import { uploadFile } from "../../utils/upload/uploadFile"
import { reducer } from "../../utils/upload/upload.reducer"
import { useConfig } from "../../hooks/use-config"
import { IUploadItem } from "../../graphql/rest-types"
import { useUser } from "../../graphql/queries/user-query"
import { useLibraryID } from "../../graphql/client/queries/libraryid-query"
import { last } from "lodash"

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
	children: (uploadItems: IUploadItem[]) => ReactNode
}

interface WrapperProps {
	children: (uploadItems: IUploadItem[]) => ReactNode
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
	const [state, dispatch] = useReducer(reducer, [])
	const config = useConfig()
	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			const playlistIDs = getPlaylistIDFromUrl()
			acceptedFiles.forEach((file) => uploadFile(userID, shareID, playlistIDs, file, config)(dispatch))
		},
		[shareID, userID, config],
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
