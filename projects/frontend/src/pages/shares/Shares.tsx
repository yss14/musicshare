import React from "react";
import { Link } from "react-router-dom";
import { ShareQuery, GET_SHARES } from "../../graphql/queries/shares-query";

const Shares = () => (
	<div>
		<ShareQuery
			query={GET_SHARES}
			variables={{ id: "f0d8e1f0-aeb1-11e8-a117-43673ffd376b" }}
		>
			{({ loading, error, data }) => {
				if (loading) {
					return <div>Loading ...</div>;
				}
				if (error) return `Error!: ${error}`;
				if (data) {
					return (
						<ul>
							{data.user.shares.map(el => (
								<li key={el.id}>
									<Link to={`/shares/${el.id}`}>{el.name}</Link>
								</li>
							))}
						</ul>
					);
				}
			}}
		</ShareQuery>
	</div>
);

export default Shares;
