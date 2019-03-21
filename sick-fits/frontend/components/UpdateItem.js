import React, { Component } from "react";
import { Mutation, Query } from "react-apollo";
import gql from "graphql-tag";
import Router from "next/router";
import Form from "./styles/Form";
import formatMoney from "../lib/formatMoney";
import Error from "./ErrorMessage";

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY(
    item(where: {id: $id}) 
    {id
    title
    description
    price}
  )

`;

//CREATE part of CRUD
const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ) {
    createItem(
      title: $title
      description: $description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      id
    }
  }
`;

export default class UpdateItem extends Component {
  //do not need constructor and this.state in ES6. Can just declare state ={}
  state = {};

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
      <Query
        query={SINGLE_ITEM_QUERY}
        variables={{
          id: this.props.id
        }}
      >
        {({ data, loading }) => {
          if (loading) return <p>Loading...</p>;
          return (
            //THe only child of a query can be a function
            <Mutation mutation={UPDATE_ITEM_MUTATION} variables={this.state}>
              {(createItem, { loading, error }) => (
                <Form
                  onSubmit={async e => {
                    //Stop the form from submitting
                    e.preventDefault();
                    //call the mutation
                    const res = await createItem();
                    //route user to the single item page
                    console.log(res);
                    Router.push({
                      pathname: "/item",
                      query: { id: res.data.createItem.id }
                    });
                  }}
                >
                  <Error error={error} />
                  <fieldset
                    disabled={loading}
                    aria-busy={loading} /*aria-busy is for accessibility*/
                  >
                    <label htmlFor="title">
                      Title
                      <input
                        type="text"
                        id="title"
                        name="title"
                        placeholder="Title"
                        required
                        //default value allows initial value to show but then user edits will be sent to state
                        defaultValue={data.item.title}
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
                        defaultValue={data.item.price}
                        onChange={this.handleChange}
                      />
                    </label>

                    <label htmlFor="description">
                      Description
                      <textarea
                        id="description"
                        name="description"
                        placeholder="Enter a Description"
                        required
                        // defaultValue
                        defaultValue={data.item.description}
                        onChange={this.handleChange}
                      />
                    </label>
                    {/* Submit buttons normally send all info to the URL bar */}
                    <button type="submit">Save</button>
                  </fieldset>
                </Form>
              )}
            </Mutation>
          );
        }}
      </Query>
    );
  }
}

export { UPDATE_ITEM_MUTATION };
