import React from "react";
import { Flex, Box } from "./Flex";
import styled from "styled-components";

const FlexWithStyles = styled(Flex)`
  background: green;
`;

export default ({}) => {
  return (
    <FlexWithStyles direction="column">
      <Box>asd</Box>
      <Box>def</Box>
    </FlexWithStyles>
  );
};
