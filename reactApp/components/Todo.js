import React from 'react';
import axios from 'axios';

class ToDo extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      toDo: [{task:'clean'},{task:'jump'}],
      socket: props.socket
    };
    console.log('todo constructed')
    this.startListening = this.props.listen.bind(this);
  }

  componentDidMount() {
    // get request to retrive all existing todos
    axios.get('http://localhost:3000/todo').then((resp) => this.setState({toDo: resp}));

    // START SOCKETS STUFF:
    const self = this;
    this.state.socket.on('connect', () => {
      // join socket as ToDo
      console.log('CLIENT todo connected to sockets');
      self.state.socket.emit('join', 'TODO');

      // listen for end of stt
      self.state.socket.on('stt_finished', respObj => {
        console.log('received stt finished', respObj);
        self.processRequest(respObj);
      });

    });

    // start listening at mount of component
    this.startListening('TODO');
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

  processRequest(respObj) {
    const self = this;

    // command is under todo category --> process it
    if (respObj.category === 'todo') {

      if (!respObj.params) {   // if no params, keep listening
	self.startListening('TODO');
      } else if (!respObj.params.verb || !respObj.params.task) {   // keep listening if missing params
	self.startListening('TODO');
      } else if (respObj.params.verb === 'add') {   // command is to add task
	self.createToDo(respObj.params.task);
} else if (respObj.params.verb === 'delete') {   // command is to delete task
        self.deleteToDo(respObj.params.task);
      }

      // need an else statement here ?

    // command did not fall under todo --> ignore and start listening again
    } else {
      self.state.socket.emit('invalid_request');
      self.startListening('TODO');
    }
  }


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
