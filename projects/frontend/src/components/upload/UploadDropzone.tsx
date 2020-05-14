import React from "react"
import Dropzone, { DuplicateActions } from "./Dropzone"
import { Flex, Box } from "../Flex"
import { Progress, Popover, Button, Typography, Icon } from "antd"
import styled from "styled-components"
import Scrollbars from "react-custom-scrollbars"
import { UploadItemStatus, ISongUploadItem } from "../../utils/upload/SongUploadContext"
import { buildSongName } from "../../utils/songname-builder"
import { IUploadFileArgs } from "../../utils/upload/uploadFile"
import { IShareSong } from "@musicshare/shared-types"

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

export const UploadDropzone: React.FC = ({ children }) => (
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

interface IDuplicateUploadProps {
	item: IUploadFileArgs
	duplicateSongs: IShareSong[]
	duplicateActions: DuplicateActions
}

const DuplicateUpload: React.FC<IDuplicateUploadProps> = ({ item, duplicateSongs, duplicateActions }) => (
	<UploadItem>
		<DuplicateHeader>
			<Icon type="warning" style={{ marginRight: 8 }} />
			<span>
				<Typography.Text code>{item.file.name}</Typography.Text> has been dected as a duplicate.{" "}
			</span>
			<Popover
				placement="bottom"
				title="Detected duplicates"
				content={
					<>
						{duplicateSongs.map((song) => (
							<div style={{ color: "#497aba" }} key={song.id}>
								{song.artists.join(", ") + " - " + buildSongName(song)}
							</div>
						))}
					</>
				}
				trigger="click"
			>
				<Button type="link">See duplicates</Button>
			</Popover>
			<DuplicateActionButtonGroup>
				<Button type="link" onClick={() => duplicateActions.proceed(item)}>
					Proceed
				</Button>
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
