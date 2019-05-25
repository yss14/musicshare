import React, { useState, useEffect } from "react";
import { Table } from "antd";
import { IShareSong, IBaseSong } from "../../graphql/types";
import { buildSongName } from "../../utils/songname-builder";
import { formatDuration } from "../../utils/format-duration";

const columns = [
  {
    title: "Title",
    width: 200,
    key: "title",
    render: (song: IShareSong) => <a href="#">{buildSongName(song)}</a>
  },
  {
    title: "Time",
    width: 100,
    dataIndex: "duration",
    key: "duration",
    render: (duration: number) => formatDuration(duration)
  },
  {
    title: "Artists",
    dataIndex: "artists",
    width: 150,
    key: "artists",
    render: (artists: string[]) =>
      artists.reduce((prev, curr) => prev + ", " + curr,'')
  },
  {
    title: "Genres",
    dataIndex: "genres",
    width: 150,
    key: "genres",
    render: (genres: string[]) =>
      genres.reduce((prev, curr) => prev + ", " + curr,'')
  }
];

interface ISongTableProps {
  songs: IBaseSong[];
  onRowClick: (record: IBaseSong, index: number, event: Event) => void;
}

export const SongTable = ({ songs, onRowClick }: ISongTableProps) => {
  const [height, setHeight] = useState(0);
  const updateDimensions = () => {
    setHeight(window.innerHeight);
  };

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  return (
    <Table
      size="middle"
      columns={columns}
      dataSource={songs}
      rowKey={(record, index) => "song-key-" + index}
      pagination={false}
      scroll={{ y: height - 210 }}
      onRowClick={onRowClick}
    />
  );
};
