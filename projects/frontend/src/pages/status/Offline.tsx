import styled from "styled-components"
import { Link } from "react-router-dom"
import offlineImg from "../../images/offline.png"

const OfflineContainer = styled.div`
	width: 100%;
	padding: 20px;
	display: flex;
	flex-direction: column;
	align-items: center;
`

const Image = styled.img`
	width: 200px;
	height: 200px;
`

export const Offline = () => (
	<OfflineContainer>
		<Image src={offlineImg} alt="offline" />
		<h2>Offline?</h2>
		<p></p>
		<Link to="/">Retry</Link>
	</OfflineContainer>
)
