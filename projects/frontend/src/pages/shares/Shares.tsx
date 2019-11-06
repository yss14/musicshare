import React from "react";
import { Link } from "react-router-dom";
import { useShares } from "../../graphql/queries/shares-query";

const Shares = () => {
	const { loading, error, data } = useShares();
	if (loading) {
		return <div>Loading ...</div>;
	}
	if (error) return `Error!: ${error}`;

	if (data) {
		return (
			<div>
				<ul>
					{data.viewer.shares.map(el => (
						<li key={el.id}>
							<Link to={`/shares/${el.id}`}>{el.name}</Link>
						</li>
					))}
				</ul>
			</div>
		);
	}
};

export default Shares;
