import React from "react";
import styled from "styled-components";
import { Flex } from "../../components/Flex";
import { LoginForm } from "./LoginForm";

const Container = styled(Flex)`
  width: 100%;
  height: 100%;
  padding: 20px;
`;

export default () => {
  return (
    <Container direction="row" justify="center" align="center">
      <LoginForm />
    </Container>
  );
};
