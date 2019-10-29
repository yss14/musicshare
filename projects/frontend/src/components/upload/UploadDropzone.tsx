import React from 'react'
import Dropzone from './Dropzone';
import { Flex, Box } from '../Flex';
import { Progress } from 'antd';

export const UploadDropzone: React.FC = ({ children }) => (
	<Dropzone>
		{uploadItems => {
			const percent =
				uploadItems.reduce((prev, curr) => prev + curr.progress, 0) /
				uploadItems.length;
			const done = uploadItems.reduce(
				(prev, curr) => (prev = curr.status === 2 || curr.status === 3),
				false
			);

			const failed = uploadItems.find(el => el.status === 3);

			return (
				<Flex
					direction="column"
					style={{ width: "100%", height: "100%" }}
				>
					{uploadItems.length > 0 ? (
						<Box>
							<Progress
								style={{
									padding: 10,
									background: "white"
								}}
								percent={done ? 100 : percent}
								showInfo={false}
								status={
									done ? (failed ? "exception" : "success") : "active"
								}
							/>
						</Box>
					) : null}
					<Box style={{ width: "100%", height: "100%" }}>
						<div
							style={{
								width: "100%",
								height: "100%",
								position: "relative"
							}}
						>
							{children}
						</div>
					</Box>
				</Flex>
			);
		}}
	</Dropzone>
)
