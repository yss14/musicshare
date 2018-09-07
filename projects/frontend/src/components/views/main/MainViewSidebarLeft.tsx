import * as React from 'react';
import { Sidebar } from '../../container/sidebar/Sidebar';
import { Dropdown } from '../../container/dropdown/Dropdown';
import { DropdownItem } from '../../container/dropdown/DropdownItem';
import { withRouter, RouteComponentProps } from 'react-router';
import { IStoreSchema } from '../../../redux/store.schema';
import { connect } from 'react-redux';
import { ISharesSchema } from '../../../redux/shares/shares.schema';
import { IRouteShare } from '../../../types/props/RouterProps';
import bind from 'bind-decorator';

interface IMainViewSidebarLeftProps extends RouteComponentProps<IRouteShare> {
	shares: ISharesSchema;
}

class MainViewSidebarLeftComponent extends React.Component<IMainViewSidebarLeftProps> {

	@bind
	private onChangeDropdownShare(newShareIDHash: string) {
		this.props.history.push(this.props.match.path.replace(':shareID', newShareIDHash));
	}

	public render() {
		const { shares, match } = this.props;

		return (
			<Sidebar orientation="left" width={200}>
				<Dropdown onChange={this.onChangeDropdownShare} title="Library">
					{
						shares.map(share => (
							<DropdownItem
								value={share.idHash}
								key={share.idHash}
								selected={share.idHash === match.params.shareID}
							>
								{share.name}
							</DropdownItem>
						))
					}
				</Dropdown>
			</Sidebar>
		);
	}
}

const mapStateToProps = (state: IStoreSchema) => ({
	shares: state.shares
});

export const MainViewSidebarLeft = withRouter(connect(mapStateToProps)(MainViewSidebarLeftComponent));