import React, {
	useState,
	ReactNode,
	useRef,
	useEffect,
	MutableRefObject
} from "react";
import { Icon, Layout, Progress } from "antd";
import Menu from "./menu/Menu";
import Dropzone from "./Dropzone";
import { Flex, Box } from "./Flex";
import styled from "styled-components";
import { Player } from "./Player";
import HeaderMenu from "./HeaderMenu";

const { Header, Footer } = Layout;

const StyledHeader = styled(Header)`
  position: fixed;
  background-color: ${(props: { theme: any }) => props.theme.lightgrey};
  z-index: 10;
  padding: 0;
  height: 48px;
  width: 100%;
`;

const StyledFooter = styled.div`
  position: fixed;
  bottom: 0px;
  width: 100%;
  z-index: 10;
`;

const { Sider, Content } = Layout;

const StyledSider = styled(Sider)`
  margin-top: 48px;
  margin-bottom: 48px;
  height: calc(100% - 32px);
  position: fixed;
  z-index: 9;
  left: 0;
`;
const CollapseIcon = styled(Icon)`
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  width: 100%;
  border-right: 1px solid #e8e8e8;
`;

const StyledContent = styled(Content)`
  margin-top: 48px;
  margin-bottom: 48px;
  background-color: ${(props: { collapsed: boolean; theme: any }) =>
		props.theme.lightgrey};
  display: block;
  margin-left: ${(props: { collapsed: boolean; theme: any }) =>
		props.collapsed ? "80px" : "200px"};
`;

interface IRouteWrapperProps {
	children: (currentContainer: any) => ReactNode;
}

const RouteWrapper = ({ children }: IRouteWrapperProps) => {
	const [collapsed, setCollapsed] = useState(false);
	const [currentContainer, setCurrentContainer] = useState<MutableRefObject<
		any
	> | null>(null);
	const toggleCollapse = () => {
		setCollapsed(collapsed => !collapsed);
	};

	const myRef = useRef<any>(null);

	useEffect(() => {
		if (!currentContainer && myRef) {
			setCurrentContainer(myRef);
		}
	}, [currentContainer]);

	return (
		<Layout>
			<StyledHeader>
				<HeaderMenu />
			</StyledHeader>

			<StyledSider
				theme="light"
				collapsible
				collapsed={collapsed}
				onCollapse={toggleCollapse}
			>
				<Menu />
				<CollapseIcon
					type={collapsed ? "menu-unfold" : "menu-fold"}
					onClick={toggleCollapse}
				/>
			</StyledSider>
			<StyledContent collapsed={collapsed}>
				<Dropzone>
					{uploadItems => {
						/*if ("error") {
										return <div>Error.</div>;
									  }*/
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
										ref={myRef}
									>
										{currentContainer && children(currentContainer)}
									</div>
								</Box>
							</Flex>
						);
					}}
				</Dropzone>
			</StyledContent>
			<StyledFooter>
				<Player />
			</StyledFooter>
		</Layout>
	);
};

export default RouteWrapper;
