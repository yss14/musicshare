import * as React from "react";
import styled from "styled-components";
import { IStyledComponentProps } from "../../types/props/StyledComponent.props";

import { Button, Icon } from "antd";

const ButtonGroup = Button.Group;

const StyledBtnGrp = styled(ButtonGroup)`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0px 20px;
`;

interface IPlayerControlsProps extends IStyledComponentProps {
  isPlaying: boolean;
  onClickPlayPause: () => void;
  onClickNext: () => void;
  onClickPrev: () => void;
}

const PlayerControlsComponent: React.StatelessComponent<
  IPlayerControlsProps
> = props => (
  <StyledBtnGrp style={{ display: "flex" }}>
    <Button>
      <Icon type="backward" theme="filled" />
    </Button>
    <Button>
      <Icon type="play-circle" theme="filled" />
    </Button>
    <Button>
      <Icon type="forward" theme="filled" />
    </Button>
  </StyledBtnGrp>
);

export const PlayerControls = PlayerControlsComponent;
