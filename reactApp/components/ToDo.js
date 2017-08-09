import React from 'react';
import axios from 'axios';x

class ToDo extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      toDo: [],
    };
  }

  componentDidMount () {
    // get request to retrive all existing todos
    axios.get('http://localhost:3000/todo')
        .then((resp) => this.setState({toDo: resp}))
  }

  //funciton to add todo
    //adds todo to database
        //axios post request with given task
            //returns the ToDo object
            // push to this.state.toDo
    //renders new todo
  //funciton to delete todo
    // post request to delete
        //remove from state array --> find by id or task in array



  render () {
    // loop through articles for current source and list out article heaadlines
    return (
      <div >
          {this.state.toDo.map((toDo)=> {<li>{toDo.task}</li>})}
      </div>
    );
  }
}

export default ToDo;
