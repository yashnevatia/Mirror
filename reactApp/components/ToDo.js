import React from 'react';

class ToDo extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      toDo: [],
    };
  }

  componentDidMount () {
    // get request to retrive all existing todos
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

      </div>
    );
  }
}

export default ToDo;
