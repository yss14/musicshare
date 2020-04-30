import React from "react"
import styled from "styled-components"
import { Input } from "antd"

const SidebarSectionContainer = styled.div<ISidebarBaseProps>`
	width: 100%;
	overflow-y: auto;
	${({ overflowScroll }) => (overflowScroll === true ? "flex: 1 1 auto;" : "flex-shrink: 0;")}
`

const SidebarSectionTitle = styled.div`
	width: 100%;
	box-sizing: border-box;
	color: grey;
	font-size: 12px;
	padding: 8px 8px 4px 8px;
	font-weight: 800;
	background-color: #303030;
	position: sticky;
	top: 0px;
	display: flex;
	flex-direction: row;
`

const StyledInput = styled(Input)`
	width: 90px;
	font-size: 11px;
	margin-left: 8px;
	height: 18px;
	background-color: transparent;
	border: 1px dashed silver;
	color: white;
	opacity: 0.4;
	outline: none;

	&:focus {
		opacity: 1;
		width: 110px;
		box-shadow: 0 0 2px rgba(255, 255, 255, 1);
		border: 1px dashed white;
	}
`

const Title = styled.div`
	flex: 1 1 0px;
`

interface ISidebarBaseProps {
	overflowScroll?: boolean
}

interface ISidebarSectionProps extends ISidebarBaseProps {
	title: string
	filter?: {
		onFilter: (filterValue: string) => void
		value: string
		placeholder?: string
	}
}

export const SidebarSection: React.FC<ISidebarSectionProps> = ({ title, overflowScroll, children, filter }) => (
	<SidebarSectionContainer overflowScroll={overflowScroll}>
		<SidebarSectionTitle>
			<Title>{title}</Title>
			{filter && (
				<StyledInput
					size="small"
					value={filter.value}
					placeholder={filter.placeholder || "Filter"}
					onChange={(e) => filter.onFilter(e.target.value)}
				/>
			)}
		</SidebarSectionTitle>
		{children}
	</SidebarSectionContainer>
)
