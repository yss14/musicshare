import * as React from 'react';
import { Sidebar } from '../../container/sidebar/Sidebar';
import { Dropdown } from '../../container/dropdown/Dropdown';
import { DropdownItem } from '../../container/dropdown/DropdownItem';
import { withRouter, RouteComponentProps } from 'react-router';

interface IMainViewProps extends RouteComponentProps<MainViewSidebarLeftComponent> {

}

class MainViewSidebarLeftComponent extends React.Component<IMainViewProps> {
	public render() {
		return (
			<Sidebar orientation="left" width={200}>
				<Dropdown onChange={(newVal) => { console.log(newVal); }} title="Library">
					<DropdownItem value='lib1' selected={true}>Lib 1</DropdownItem>
					<DropdownItem value='lib2' selected={false}>Lib 2</DropdownItem>
				</Dropdown>
			</Sidebar>
		);
	}
}

export const MainViewSidebarLeft = withRouter(MainViewSidebarLeftComponent);