import React, { useCallback } from "react"
import Dropzone, { DuplicateActions } from "./Dropzone"
import { Flex, Box } from "../Flex"
import { WarningOutlined } from "@ant-design/icons"
import { Progress, Popover, Button, Typography, message } from "antd"
import styled from "styled-components"
import Scrollbars from "react-custom-scrollbars"
import { UploadItemStatus, ISongUploadItem } from "../../utils/upload/SongUploadContext"
import { buildSongName } from "../../utils/songname-builder"
import { IUploadFileArgs } from "../../utils/upload/uploadFile"
import { ShareSong } from "@musicshare/shared-types"
import { useShareName } from "../../hooks/use-share-name"
import { useAddSongsToPlaylist } from "@musicshare/react-graphql-client"

const UploadProgressContainer = styled(Scrollbars)`
	background-color: white;
	max-height: 200px;
`

const UploadItem = styled.div`
	width: 100%;
	padding: 4px 12px;

	& .ant-progress-outer {
		width: calc(100% - 14px) !important;
	}
`

const DuplicateHeader = styled.div`
	display: flex;
	align-items: center;
`

const DuplicateActionButtonGroup = styled.div`
	margin-left: auto;
`

export const UploadDropzone: React.FC = ({ children }) => {
	return (
		<Dropzone>
			{(uploadItems, duplicates, duplicateActions) => {
				return (
					<Flex direction="column" style={{ width: "100%", height: "100%" }}>
						{uploadItems.length > 0 || duplicates.length > 0 ? (
							<UploadProgressContainer autoHide autoHeight>
								<>
									{duplicates.map(([item, duplicateSongs]) => (
										<DuplicateUpload
											key={item.id}
											item={item}
											duplicateSongs={duplicateSongs}
											duplicateActions={duplicateActions}
										/>
									))}
									{uploadItems
										.filter((item) => item.progress > 0)
										.concat(uploadItems.filter((item) => item.progress === 0))
										.map((item) => (
											<ActiveUpload key={item.id} item={item} />
										))}
								</>
							</UploadProgressContainer>
						) : null}
						<Box style={{ width: "100%", height: "100%" }}>
							<div
								style={{
									width: "100%",
									height: "100%",
									position: "relative",
								}}
							>
								{children}
							</div>
						</Box>
					</Flex>
				)
			}}
		</Dropzone>
	)
}

interface IDuplicateUploadProps {
	item: IUploadFileArgs
	duplicateSongs: ShareSong[]
	duplicateActions: DuplicateActions
}

const DuplicateUpload: React.FC<IDuplicateUploadProps> = ({ item, duplicateSongs, duplicateActions }) => {
	const [addSongsToPlaylist] = useAddSongsToPlaylist()

	const onClickAddToPlaylist = useCallback(
		async (song: ShareSong) => {
			const key = "add-song-to-playlist"
			message.loading({ content: `Adding ${buildSongName(song)} to playlist`, key })
			await addSongsToPlaylist({ shareID: item.shareID, playlistID: item.playlistIDs[0], songIDs: [song.id] })
			message.success({ content: `Added ${buildSongName(song)} to playlist`, key })
			duplicateActions.abort(item)
		},
		[addSongsToPlaylist, item, duplicateActions],
	)

	return (
		<UploadItem>
			<DuplicateHeader>
				<WarningOutlined style={{ marginRight: 8 }} />
				<span>
					<Typography.Text code>{item.file.name}</Typography.Text> has been dected as a duplicate.{" "}
				</span>
				<Popover
					placement="bottom"
					title="Detected duplicates"
					content={
						<>
							{duplicateSongs.map((song) => (
								<DetectedDuplicate song={song} key={song.id} />
							))}
						</>
					}
					trigger="click"
				>
					<Button type="link">See duplicates</Button>
				</Popover>
				<DuplicateActionButtonGroup>
					<Button type="link" onClick={() => duplicateActions.proceed(item)}>
						Proceed Upload
					</Button>
					{item.playlistIDs && item.playlistIDs.length > 0 && (
						<Popover
							placement="bottom"
							title="Select duplicate to add"
							content={
								<>
									{duplicateSongs.map((song) => (
										<SelectDetectedDuplicate
											song={song}
											onClick={() => onClickAddToPlaylist(song)}
											key={song.id}
										/>
									))}
								</>
							}
							trigger="click"
						>
							<Button type="link" style={{ paddingLeft: 0 }}>
								Add to Playlist
							</Button>
						</Popover>
					)}
					<Button
						type="link"
						style={{ color: "#ff4d4f", paddingLeft: 0 }}
						onClick={() => duplicateActions.abort(item)}
					>
						Abort
					</Button>
				</DuplicateActionButtonGroup>
			</DuplicateHeader>
			<Progress percent={0} showInfo />
		</UploadItem>
	)
}

interface IDetectedDuplicateProps {
	song: ShareSong
}

const DetectedDuplicate: React.FC<IDetectedDuplicateProps> = ({ song }) => {
	const shareName = useShareName(song.shareID)

	return (
		<div style={{ color: "#497aba" }}>
			{song.artists.join(", ") + " - " + buildSongName(song) + ` [${shareName}]`}
		</div>
	)
}

interface ISelectDetectedDuplicateProps extends IDetectedDuplicateProps {
	onClick: () => void
}

const SelectDetectedDuplicate: React.FC<ISelectDetectedDuplicateProps> = ({ song, onClick }) => {
	const shareName = useShareName(song.shareID)

	return (
		<Button type="link" onClick={onClick} style={{ display: "block" }}>
			{song.artists.join(", ") + " - " + buildSongName(song) + ` [${shareName}]`}
		</Button>
	)
}

interface IActiveUploadProps {
	item: ISongUploadItem
}

const ActiveUpload: React.FC<IActiveUploadProps> = ({ item: { filename, progress, status } }) => (
	<UploadItem>
		<div>{filename}</div>
		<Progress
			percent={Math.round(progress)}
			showInfo={true}
			status={
				status === UploadItemStatus.Failed
					? "exception"
					: status === UploadItemStatus.Uploaded
					? "success"
					: "active"
			}
		/>
	</UploadItem>
)
