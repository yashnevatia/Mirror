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
  const createToDo = (task) => {
      //adds todo to database
          //axios post request with given task
    axios.post('http://localhost:3000/todo',
        {task}
    )
    //returns the Reminder object
    // push to this.state.toDo and update state
    .then((resp) => {
        newToDo = [...this.state.toDo,resp]
        this.setState({toDo: newToDo})
    })
  }

  //funciton to delete todo
  const createToDo = (task) => {
    // post request to delete
    axios.post('http://localhost:3000/deltodo',
        {task}
    )
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
