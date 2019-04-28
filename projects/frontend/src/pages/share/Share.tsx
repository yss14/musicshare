import React from "react";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Table } from "antd";
import { buildSongName } from "../../utils/songname-builder";
import { ISong } from "../../schemas/shares.schema";

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

interface IShareProps extends RouteComponentProps<IRouteProps> {
  container: any;
}

const Share = ({ match, container }: IShareProps) => {
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
    </>
  );
};

export default withRouter(Share);
