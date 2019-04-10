import React from "react";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import { RouteComponentProps } from "react-router-dom";

interface IData {
  share: {
    songs: {
      id: string;
      title: string;
      suffix: string;
      year: number;
      bpm: number;
      dateLastEdit: string;
      releaseDate: string;
      isRip: boolean;
      artists: string[];
      remixer: string[];
      featurings: string[];
      type: string;
      genres: string[];
      label: string;
      requiresUserAction: boolean;
    }[];
  };
}

interface IVariables {
  id: string;
}

const GET_SHARE = gql`
  query share($id: String!) {
    share(id: $id) {
      id
      name
      songs {
        id
        title
        suffix
        year
        bpm
        dateLastEdit
        releaseDate
        isRip
        artists
        remixer
        featurings
        type
        genres
        label
        requiresUserAction
      }
    }
  }
`;

interface IRouteProps {
  id: string;
}

const Shares = ({ match }: RouteComponentProps<IRouteProps>) => {
  const { id } = match.params;
  return (
    <>
      <Query<IData, IVariables> query={GET_SHARE} variables={{ id }}>
        {({ loading, error, data }) => {
          if (loading) {
            return <div>Loading ...</div>;
          }
          if (error) return `Error!: ${error}`;
          if (data) {
            return (
              <ul>
                {data.share.songs.map(el => (
                  <li key={el.id}>{el.title}</li>
                ))}
              </ul>
            );
          }
        }}
      </Query>
    </>
  );
};

export default Shares;
