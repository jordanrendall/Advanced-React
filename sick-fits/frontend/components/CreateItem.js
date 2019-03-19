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

  //can use arrow functions to get 'this' keyword assumed to be this object, and do not have to bind function to 'this'
  handleChange = e => {
    const { name, type, value } = e.target;
    const val = type === "number" ? parseFloat(value) : value;
    this.setState({
      [name]: val
    });
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
              onChange={this.handleChange}
            />
          </label>

          <label htmlFor="price">
            Price
            <input
              type="number"
              id="price"
              name="price"
              placeholder="Price"
              required
              value={this.state.price}
              onChange={this.handleChange}
            />
          </label>
        </fieldset>
      </Form>
    );
  }
}
