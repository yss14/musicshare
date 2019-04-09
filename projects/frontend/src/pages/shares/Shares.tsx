import React from "react";
import gql from "graphql-tag";
import { Query, Mutation } from "react-apollo";

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
  query user($id: String!) {
    user(id: $id) {
      shares {
        id
        name
        userID
        isLibrary
      }
    }
  }
`;

const GET_LOCAL_VISIBILITY_FILTER = gql`
  query {
    visibilityFilter @client
  }
`;

const UPDATE_LOCAL_VISIBILITY_FILTER = gql`
  mutation updateVisibilityFilter($visibilityFilter: string!) {
    updateVisibilityFilter(visibilityFilter: $visibilityFilter) @client
  }
`;

class ShareQuery extends Query<IData, IVariables> {}

const Shares = () => (
  <>
    <ShareQuery
      query={GET_SHARES}
      variables={{ id: "f0d8e1f0-aeb1-11e8-a117-43673ffd376b" }}
    >
      {({ loading, error, data }) => {
        if (loading) {
          return <div>Loading ...</div>;
        }
        if (error) return `Error!: ${error}`;
        console.log(data);
        if (data) {
          return (
            <ul>
              {data.user.shares.map(el => (
                <li key={el.id}>{el.name}</li>
              ))}
            </ul>
          );
        }
      }}
    </ShareQuery>
    <Query<IVisibilityData, undefined> query={GET_LOCAL_VISIBILITY_FILTER}>
      {({ loading, error, data }) => {
        if (loading) {
          return <div>Loading ...</div>;
        }
        if (error) return `Error!: ${error}`;
        console.log(data);
        if (data) {
          return <div>{data.visibilityFilter}</div>;
        }
      }}
    </Query>
    <Mutation<IVisibilityData, IVisibilityVariables>
      mutation={UPDATE_LOCAL_VISIBILITY_FILTER}
      variables={{ visibilityFilter: "UPDATED_FILTER" }}
    >
      {toggleVisibilityFilter => (
        <button onClick={e => toggleVisibilityFilter()}>Update filter</button>
      )}
    </Mutation>
  </>
);

export default Shares;
