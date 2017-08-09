import React from 'react';
import axios from 'axios';

class ToDo extends React.Component {
  //componentdidMount --> onConnect--> emit join &widget name
  //on stt finished// create finished processing funciton

  constructor (props) {
    super(props);
    this.state = {
      toDo: [{task:'clean'},{task:'jump'}],
      socket: props.socket
    };
  }

  componentDidMount() {
    // get request to retrive all existing todos
    axios.get('http://localhost:3000/todo').then((resp) => this.setState({toDo: resp}));

    // START SOCKETS STUFF:
    const self = this;
    this.state.socket.on('connect', () => {
      console.log('CLIENT todo connected to sockets');

      self.state.socket.emit('join', 'TODO');

      

    });
  }

  //function to add todo
  createToDo(task){
    //axios post request with given task
    axios.post('http://localhost:3000/todo', {task})
    //returns the Reminder object, push to this.state.toDo and update state
    .then((resp) => {
      newToDo = [...this.state.toDo,resp]
      this.setState({toDo: newToDo})
    })
  };

  //funciton to delete todo
  deleteToDo(task){
    // post request to delete
    axios.post('http://localhost:3000/deltodo', {task})
    //return array of reminders in database without deleted reminder
    .then((resp) => {
      this.setState({toDo: resp})
    })
  };


  render () {
    // loop through articles for current source and list out article heaadlines
    return (
      <div >
        <h1 style={{color: 'white'}}> Reminders</h1>
        {this.state.toDo.map((toDo)=> {
          return (<li style={{color: 'white'}}>{toDo.task}</li>)
        })}
      </div>
    );
  }
}

export default ToDo;
