import React from "react";
import gql from "graphql-tag";
import { Query, Mutation } from "react-apollo";
import { Link } from "react-router-dom";

interface IData {
	user: {
		shares: {
			id: string;
			name: string;
			userID: string;
		}[];
	};
}

interface IVisibilityData {
	visibilityFilter: string;
}

interface IVisibilityVariables {
	visibilityFilter: string;
}

interface IVariables {
	id: string;
}

const GET_SHARES = gql`
  query user {
    user {
      shares {
        id
        name
        userID
        isLibrary
      }
    }
  }
`;

class ShareQuery extends Query<IData, IVariables> { }

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
