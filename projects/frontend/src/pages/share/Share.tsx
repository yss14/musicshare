import React, { useEffect } from "react";
import gql from "graphql-tag";
import { Query, Mutation, MutationFn } from "react-apollo";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Table } from "antd";
import { buildSongName } from "../../utils/songname-builder";
import { ISong } from "../../schemas/shares.schema";
import {
  ILocalShareVariables,
  ILocalShareData
} from "../../resolvers/types.local";

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

const columns = [
  {
    title: "Title",
    dataIndex: "titleStats",
    width: 200,
    key: "title",
    render: (song: ISong) => <a href="#">{buildSongName(song)}</a>
  },
  {
    title: "Artists",
    dataIndex: "artists",
    width: 150,
    key: "artists",
    render: (artists: string[]) =>
      artists.reduce((prev, curr) => prev + ", " + curr)
  },
  {
    title: "Release date",
    dataIndex: "releaseDate",
    width: 100,
    key: "duration",
    render: (releaseDate: string) => releaseDate
  },
  {
    title: "Genres",
    dataIndex: "genres",
    width: 150,
    key: "genres",
    render: (genres: string[]) =>
      genres.reduce((prev, curr) => prev + ", " + curr)
  }
];

interface IShareProps {
  id: string;
  updateShareId: MutationFn<ILocalShareData, ILocalShareVariables>;
}

const UPDATE_SHARE_ID = gql`
  mutation updateShareId($shareId: string!) {
    updateShareId(shareId: $shareId) @client
  }
`;

const MutationWrapper = ({ match }: RouteComponentProps<{ id: string }>) => {
  const { id } = match.params;
  return (
    <Mutation<ILocalShareData, ILocalShareVariables>
      mutation={UPDATE_SHARE_ID}
      variables={{ shareId: id }}
    >
      {updateShareId => {
        return <Share id={id} updateShareId={updateShareId} />;
      }}
    </Mutation>
  );
};

const Share = ({ updateShareId, id }: IShareProps) => {
  useEffect(() => {
    updateShareId();
  }, []);

  return (
    <Query<IData, IVariables> query={GET_SHARE} variables={{ id }}>
      {({ loading, error, data }) => {
        if (loading) {
          return <div>Loading ...</div>;
        }
        if (error) return `Error!: ${error}`;
        if (data) {
          const songs = data.share.songs.map(song => ({
            ...song,
            titleStats: song
          }));
          return (
            <Table
              size="middle"
              columns={columns}
              dataSource={songs}
              pagination={false}
              scroll={{ y: 1242 }}
            />
          );
        }
      }}
    </Query>
  );
};

export default withRouter(MutationWrapper);
