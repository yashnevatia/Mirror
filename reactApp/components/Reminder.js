import React from 'react';
import axios from 'axios';

class Reminder extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      toDo: [],
      socket: props.socket
    };
    console.log('todo constructed')
  }

  componentDidMount() {
    // get request to retrive all existing todos
    axios.get('http://localhost:3000/todo')
      .then((resp) => {
        console.log('receives todos in :', resp);
        this.setState({toDo: resp.data});
      });

    // START SOCKETS STUFF:
    const self = this;
    this.state.socket.on('connect', () => {
      // join socket as ToDo
      console.log('CLIENT todo connected to sockets');
      self.state.socket.emit('join', 'TODO');

      // listen for end of stt
      self.state.socket.on('stt_finished', respObj => {
        console.log('received stt finished', respObj);
        console.log('calling process request')
        self.processRequest(respObj);
      });

    });
  }

  //function to add todo
  createToDo(task){
    console.log('in create todo task');
    //axios post request with given task
    axios.post('http://localhost:3000/todo', {task})
    //returns the Reminder object, push to this.state.toDo and update state
    .then( resp => {
      let newToDo = [...this.state.toDo, {task: resp.data.task}]
      console.log('creating new todo list', newToDo)
      this.setState({toDo: newToDo})
    })
    .catch( err => {
      console.log('ERROR: ', err);
      // this.state.emit('invalid request')
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
    .catch( err => {
      console.log('ERORRRR: ', err);
    });
  };

  processRequest(respObj) {
    const self = this;
    console.log('in process request with ', respObj)

    // command is under todo category --> process it
    if (respObj.category === 'todo') {

      if (!respObj.params) {   // if no params, keep listening
        // do nothing
      } else if (!respObj.params.verb || !respObj.params.task) {   // keep listening if missing params
        // do nothing
      } else if (respObj.verb === 'add') {   // command is to add task
        console.log('adding todo: ',respObj.params.task[0] )
        self.createToDo(respObj.params.task);
      } else if (respObj.params.verb === 'delete') {   // command is to delete task
        console.log('deleting todo: ',respObj.params.task[0] )
      } else if (respObj.params.verb === 'add') {   // command is to add task
        self.createToDo(respObj.params.task);
      } else if (respObj.params.verb === 'delete') {   // command is to delete task
        self.deleteToDo(respObj.params.task);
      }

      // need an else statement here ?

      // command did not fall under todo --> ignore and start listening again
    } else {
	     console.log('invalid request');
    }
  }


  render () {
    // loop through articles for current source and list out article heaadlines
    return (
      <div >
        <h3 className='right' style={{color: 'white'}}> Reminders</h3>
        <ol>
          {this.state.toDo.map((toDo)=> {
            return (<li className="remindersListItem">{toDo.task}</li>)
          })}
        </ol>
      </div>
    );
  }
}

export default Reminder;
