import React, { Component } from "react";
import Header from "./Header";
import Meta from "./Meta";
import styled from "styled-components";

const MyButton = styled.button`
  background: red;
  font-size: ${props => (props.huge ? "100px" : "50px")};
  span {
    font-size: 100px;
  }
`;

const BigPoop = styled.span`
  font-size: 100px;
`;

export class Page extends Component {
  render() {
    return (
      <div>
        <Meta />
        <Header />
        <MyButton huge>
          Click me
          <span>💩</span>
        </MyButton>
        <MyButton>Second smaller button</MyButton>
        {this.props.children}
      </div>
    );
  }
}

export default Page;
