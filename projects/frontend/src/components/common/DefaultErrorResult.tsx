import { Button, Result } from "antd"
import styled from "styled-components"

const Title = styled.div`
	font-size: 18px;
`

interface DefaultErrorResultProps {
	error?: string
	details?: string
}

export const DefaultErrorResult = ({ error, details }: DefaultErrorResultProps) => (
	<Result
		status="error"
		title={<Title>{error || "Something went wrong"}</Title>}
		subTitle={details || "Please reload the page and retry."}
		extra={[
			<Button type="primary" key="reload" onClick={() => window.location.reload()}>
				Reload
			</Button>,
			<Button
				key="report"
				href="https://github.com/yss14/musicshare/issues?q=is%3Aissue+label%3Abug+"
				target="__blank"
			>
				Report Error
			</Button>,
		]}
	/>
)
