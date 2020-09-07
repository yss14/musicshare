import React, { useCallback, ReactNode, useMemo, useState, useContext } from "react"
import { useDropzone, FileRejection, DropzoneState } from "react-dropzone"
import { Typography, message } from "antd"
import styled from "styled-components"
import { uploadFile, IUploadFileArgs } from "../../utils/upload/uploadFile"
import { last, uniqBy } from "lodash"
import { useSongUploadQueue, ISongUploadItem } from "../../utils/upload/SongUploadContext"
import { blobToArrayBuffer } from "../../utils/upload/blob-to-arraybuffer"
import SparkMD5 from "spark-md5"
import { v4 as uuid } from "uuid"
import { IShareSong } from "@musicshare/shared-types"
import { UploadOutlined } from "@ant-design/icons"
import { useLibraryID } from "../../hooks/data/useLibraryID"
import {
	useSongFileDuplicates,
	useGenerateUploadableUrl,
	useSubmitSongFromRemoteFile,
} from "@musicshare/graphql-client"

const StyledUploadIcon = styled(UploadOutlined)`
	font-size: 64px;
	color: white;
`

const { Title } = Typography

const UploadContainer = styled.div`
	position: fixed;
	top: 48px;
	left: 200px;
	right: 0px;
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

export type DetectedDuplicate = [IUploadFileArgs, IShareSong[]]
export type DuplicateActions = {
	proceed: (item: IUploadFileArgs) => void
	abort: (item: IUploadFileArgs) => void
}

interface IBaseProps {
	children: (
		uploadItems: ISongUploadItem[],
		duplicates: DetectedDuplicate[],
		duplicateActions: DuplicateActions,
	) => ReactNode
}

interface IDropzoneProps extends IBaseProps {
	shareID: string
}

interface WrapperProps extends IBaseProps {}

const getPlaylistIDsFromUrl = (): string[] => {
	const urlParts = window.location.href.split("/")
	const playlistIdx = urlParts.findIndex((part) => part === "playlists")
	if (playlistIdx === -1) {
		return []
	}
	const playlistID = urlParts[playlistIdx + 1]

	return playlistID ? [playlistID] : []
}

export default ({ children }: WrapperProps) => {
	const libraryID = useLibraryID()

	return libraryID ? <Dropzone shareID={libraryID}>{(...args) => children(...args)}</Dropzone> : null
}

const SongDropzoneContext = React.createContext<DropzoneState | null>(null)

export const useSongDropzone = () => {
	const context = useContext(SongDropzoneContext)

	if (!context) {
		throw new Error(`useSongDropzone() can only be used inside a SongDropzoneContext`)
	}

	return context
}

const Dropzone = ({ shareID, children }: IDropzoneProps) => {
	const [state, dispatch] = useSongUploadQueue()
	const [detectedDuplicates, setDetectedDuplicates] = useState<DetectedDuplicate[]>([])

	const [generateUploadableUrl] = useGenerateUploadableUrl()
	const [submitSongFromRemoteUrl] = useSubmitSongFromRemoteFile()

	const [findSongFileDuplicates] = useSongFileDuplicates()

	const processFile = useCallback(
		async (file: File) => {
			const id = uuid()
			const playlistIDs = getPlaylistIDsFromUrl()

			const buffer = await blobToArrayBuffer(file)
			const spark = new SparkMD5()
			spark.appendBinary(buffer as any)
			const hash = spark.end()

			const duplicateSongs = uniqBy(await findSongFileDuplicates({ hash }), (song) => song.id)

			const uploadItem: IUploadFileArgs = {
				id,
				hash,
				file,
				buffer,
				playlistIDs,
				shareID,
				generateUploadableUrl,
				submitSongFromRemoteUrl,
				dispatch,
			}

			if (duplicateSongs.length === 0) {
				uploadFile(uploadItem)
			} else {
				setDetectedDuplicates((currentState) => [...currentState, [uploadItem, duplicateSongs]])
			}
		},
		[submitSongFromRemoteUrl, generateUploadableUrl, findSongFileDuplicates, dispatch, shareID],
	)

	const duplicateActions = useMemo(
		() => ({
			proceed: (item: IUploadFileArgs) => {
				setDetectedDuplicates((currentState) => currentState.filter((duplicate) => duplicate[0].id !== item.id))
				uploadFile(item)
			},
			abort: (item: IUploadFileArgs) => {
				setDetectedDuplicates((currentState) => currentState.filter((duplicate) => duplicate[0].id !== item.id))
			},
		}),
		[],
	)

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			acceptedFiles.forEach((file) => processFile(file))
		},
		[processFile],
	)

	const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
		console.log(fileRejections)
		const rejectedFileExtension = fileRejections.map((reason) => last(reason.file.name.split(".")))

		message.info(`Files with extension(s) ${rejectedFileExtension} are not supported yet!`)
	}, [])
	const dropzoneState = useDropzone({
		onDrop,
		onDropRejected,
		noClick: true,
		accept: ["audio/mpeg", "audio/mp3"],
		maxSize: 200 * 1024 * 1024, // 200 MB
	})
	const { getRootProps, getInputProps, isDragActive } = dropzoneState

	return (
		<SongDropzoneContext.Provider value={dropzoneState}>
			<div style={{ width: "100%", height: "100%" }} {...getRootProps()}>
				<input {...getInputProps()} />
				{isDragActive ? (
					<UploadContainer>
						<StyledUploadIcon type="upload" />
						<Title level={1} style={{ color: "white" }}>
							Drop here to upload track
						</Title>
					</UploadContainer>
				) : null}
				<Blur active={isDragActive}>{children(state.uploadItems, detectedDuplicates, duplicateActions)}</Blur>
			</div>
		</SongDropzoneContext.Provider>
	)
}
