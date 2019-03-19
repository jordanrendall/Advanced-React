import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import FormatMoney from "../lib/formatMoney";

export default class CreateItem extends Component {
  //do not need constructor and this.state in ES6. Can just declare state ={}
  state = {
    title: "",
    description: "",
    image: "",
    largeImage: "",
    price: 0 //can have trailing commas in ES6
  };

  render() {
    return (
      <Form>
        <fieldset>
          <label htmlFor="title">
            Title
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Title"
              required
              value={this.state.title}
            />
          </label>
        </fieldset>
      </Form>
    );
  }
}
