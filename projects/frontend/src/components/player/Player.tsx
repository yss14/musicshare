import * as React from "react";
import styled from "styled-components";
import { IStyledComponentProps } from "../../types/props/StyledComponent.props";
import { bind } from "bind-decorator";
import { PlayerControls } from "./PlayerControls";
import { PlaybackFeedback } from "./PlaybackFeedback";
import { VolumeSlider } from "./VolumeSlider";

interface IPlayerProps extends IStyledComponentProps {
  dummy?: any; // TODO remove
}

class PlayerComponent extends React.Component<IPlayerProps> {
  @bind
  private onClickPlayPause() {
    //
  }

  @bind
  private onClickPrevNext(next: boolean) {
    //
  }

  public render() {
    const { className } = this.props;

    return (
      <BottomBarContainer>
        <PlayerControls
          isPlaying={false}
          onClickPlayPause={this.onClickPlayPause}
          onClickPrev={this.onClickPrevNext.bind(this, false)}
          onClickNext={this.onClickPrevNext.bind(this, true)}
        />
        <PlaybackFeedback
          song={undefined}
          onSkip={() => undefined}
          progress={20}
        />
        <VolumeSlider />
      </BottomBarContainer>
    );
  }
}

const BottomBarContainer = styled.div`
  height: 60px;
  background: #7f8c8d;
  padding: 10px;
  display: flex;
  flex-direction: row;
`;
const PlayerStyled = styled(PlayerComponent)`
  width: 100%;
  height: 50px;
  background-color: #3a3a3a;
  display: flex;
  justify-content: "space-between";
  align-items: center;
  flex-direction: row;
`;

export const Player = PlayerStyled;
