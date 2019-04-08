import * as React from "react";
import styled from "styled-components";
import { ISong } from "../../redux/shares/shares.schema";
import imgCoverPlaceholder from "../../images/player/cover_placeholder.png";
import { buildSongName } from "../../utils/songname-builder";
import { Slider } from "antd";

const BarWrapper = styled.div`
  flex: 5;
  margin: 0px 20px;
`;

export interface IPlaybackFeedbackProps {
  song?: ISong;
  progress: number;
  onSkip: (skipTo: number) => void;
}

const marks = {
  0: { label: <span>0:00</span>, stlye: { color: "white" } },
  100: { label: <span>3:12</span>, stlye: { color: "white" } }
};

export class PlaybackFeedback extends React.Component<IPlaybackFeedbackProps> {
  public render() {
    const { progress, song } = this.props;

    const percentage = song ? progress / song.duration : 0;

    return (
      <BarWrapper>
        <Slider marks={marks} defaultValue={30} disabled={false} />
      </BarWrapper>
    );
  }
}
