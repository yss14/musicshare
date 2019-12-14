import styled from "styled-components"
import imgSelectedUp from '../../images/th_selected_up.png'
import imgSelectedDown from '../../images/th_selected_down.png'

export const Table = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
`

export const Header = styled.div`
	width: 100%;
	background-color: #fafafa;
	display: flex;
	flex-direction: row;
`

export const Col = styled.div`
	padding: 3px 6px;
	box-sizing: border-box;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
`

interface IHeaderColProps {
	selected: boolean;
	direction: 'asc' | 'desc';
}

export const HeaderCol = styled(Col) <IHeaderColProps>`
	padding: 4px 6px;
	border-top: 1px solid #dcdcdc;
    border-bottom: 1px solid #dcdcdc;
	background-image: url(${props => props.selected ? (props.direction === 'asc' ? imgSelectedUp : imgSelectedDown) : null});
	background-position: right 10px center;
	background-repeat: no-repeat;
`

export const Body = styled.div`
	flex: 1 1 0px;
	overflow: auto;
`

export const Row = styled.div`
	width: 100%;
	display: flex;
	flex-direction: row;

	&:hover{
		background-color: #e6f6ff;
	}
`
