import React from 'react'
import styled from 'styled-components'

const SidebarSectionContainer = styled.div<ISidebarBaseProps>`
	width: 100%;
	overflow-y: auto;
	${({ overflowScroll }) => overflowScroll === true ? 'flex: 1 1 auto;' : 'flex-shrink: 0;'}
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
`

interface ISidebarBaseProps {
	overflowScroll?: boolean;
}

interface ISidebarSectionProps extends ISidebarBaseProps {
	title: string;
}

export const SidebarSection: React.FC<ISidebarSectionProps> = ({ title, overflowScroll, children }) => (
	<SidebarSectionContainer overflowScroll={overflowScroll}>
		<SidebarSectionTitle>{title}</SidebarSectionTitle>
		{children}
	</SidebarSectionContainer>
)