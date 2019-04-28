import React from "react";
import styled from "styled-components";

const FlexParent = styled.div`
  display: flex;
  flex-direction: ${(props: IFlexParentProps) =>
    props.direction ? props.direction : "row"};
  justify-content: ${(props: IFlexParentProps) =>
    props.justify ? props.justify : "flex-start"};
  align-content: ${(props: IFlexParentProps) =>
    props.alignContent ? props.alignContent : "stretch"};
  align-items: ${(props: IFlexParentProps) =>
    props.align ? props.align : "stretch"};
  flex-wrap: ${(props: IFlexParentProps) =>
    props.wrap ? props.wrap : "nowrap"};
`;

const FlexChild = styled.div`
  flex-grow: ${(props: IFlexChildProps) => (props.grow ? props.grow : 0)};
  flex-shrink: ${(props: IFlexChildProps) => (props.shrink ? props.shrink : 1)};
  flex-basis: ${(props: IFlexChildProps) =>
    props.basis ? props.basis : "auto"};
  order: ${(props: IFlexChildProps) => (props.order ? props.order : 0)};
`;

interface IFlexParentProps {
  justify?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-around"
    | "space-between"
    | "space-evenly";
  align?: "stretch" | "flex-start" | "flex-end" | "center" | "baseline";
  alignContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-around"
    | "space-between"
    | "strech";
  direction?: "row" | "row-reverse" | "column" | "column-reverse";
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
  style?: React.CSSProperties;
}

interface IFlexChildProps {
  grow?: number;
  shrink?: number;
  order?: number;
  alignSelf?:
    | "auto"
    | "flex-start"
    | "flex-end"
    | "center"
    | "baseline"
    | "stretch";
  basis?: number | "auto";
  style?: React.CSSProperties;
}

export { FlexParent as Flex, FlexChild as Box };
