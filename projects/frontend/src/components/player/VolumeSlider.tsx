import * as React from "react";
import styled from "styled-components";
import { ISong } from "../../redux/shares/shares.schema";
import imgCoverPlaceholder from "../../images/player/cover_placeholder.png";
import { buildSongName } from "../../utils/songname-builder";
import { Slider, Icon } from "antd";

const BarWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: row;
  margin: 0px 20px;
`;

const StyledSlider = styled(Slider)`
  flex: 3;
  width: 100px;
`;

export interface IVolumeSliderProps {}

export class VolumeSlider extends React.Component<IVolumeSliderProps> {
  public render() {
    return (
      <BarWrapper>
        <i className="fas fa-volume-up" />
        <StyledSlider defaultValue={30} disabled={false} />
      </BarWrapper>
    );
  }
}
