import React from "react"
import Dropzone from "./Dropzone"
import { Flex, Box } from "../Flex"
import { Progress } from "antd"
import styled from "styled-components"
import { groupBy } from "lodash"

const UploadProgressContainer = styled(Box)`
	background-color: white;
	max-height: 200px;
	overflow-y: scroll;
`

const UploadItem = styled.div`
	width: 100%;
	padding: 4px 12px;

	& .ant-progress-outer {
		width: calc(100% - 14px) !important;
	}
`

export const UploadDropzone: React.FC = ({ children }) => (
	<Dropzone>
		{(uploadItems) => {
			return (
				<Flex direction="column" style={{ width: "100%", height: "100%" }}>
					{uploadItems.length > 0 ? (
						<UploadProgressContainer>
							{uploadItems
								.filter((item) => item.progress > 0)
								.concat(uploadItems.filter((item) => item.progress === 0))
								.map((item, idx) => (
									<UploadItem key={idx + item.hash}>
										<div>{item.filename}</div>
										<Progress
											percent={Math.round(item.progress)}
											showInfo={true}
											status={
												item.status === 2
													? item.status === 3
														? "exception"
														: "success"
													: "active"
											}
										/>
									</UploadItem>
								))}
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
