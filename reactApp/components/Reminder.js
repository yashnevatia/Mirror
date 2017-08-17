import React from 'react';
import axios from 'axios';
import io from 'socket.io-client';
const socket = io('http://localhost:3000');

class Reminder extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      toDo: [],
      socket: socket
    };
  }

  componentDidMount() {
    // get request to retrive all existing todos
    axios.get('http://localhost:3000/gettodo')
      .then((resp) => {
        console.log('receives todos in :', resp);
        this.setState({toDo: resp.data});
      });

    // START SOCKETS STUFF:
    const self = this;
    // join socket as ToDo
    self.state.socket.on('connect', () => {
      console.log('CLIENT todo connected to sockets');
      self.state.socket.emit('join', 'REMINDERS');
    });

    // listen for end of stt
    self.state.socket.on('stt_finished', respObj => {
      console.log('TODO received stt finished', respObj);
      if (respObj.category === 'reminders'){
        self.processRequest(respObj);
      }else {
        console.log("invalid request");
      }
    });
  }

  //function to add todo
  createToDo(task){
    console.log('in create todo task');
    //axios post request with given task
    axios.post('http://localhost:3000/addtodo', {task})
    //returns the Reminder object, push to this.state.toDo and update state
    .then( resp => {
      return axios.get('http://localhost:3000/gettodo')


      // let newToDo = [...this.state.toDo, {task: resp.data.task}]
      // console.log('creating new todo list', newToDo)
      // this.setState({toDo: newToDo})
    })
    .then( resp2 => {
      console.log('receives NEW TODOS in :', resp2);
      this.setState({toDo: resp2.data});
    })
    .catch( err => {
      console.log('ERROR: ', err);
      // this.state.emit('invalid request')
    })
  };

  //funciton to delete todo
  deleteToDo(task){
    console.log('111 in deleting ')
    // post request to delete
    axios.post('http://localhost:3000/deltodo', {task})
    //return array of reminders in database without deleted reminder
    .then((resp) => {
      console.log('222 setting state todo as', resp)
      this.setState({toDo: resp.data})
    })
    .catch( err => {
      console.log('ERORRRR: ', err);
    });
  };

  processRequest(respObj) {
    const self = this;
    console.log('in process request with ', respObj);

      if (!respObj.params || !respObj.params.verb || !respObj.params.task) {   // keep listening if missing params
        // do nothing
      }
      else if (respObj.params.verb === 'add') {   // command is to add task
        console.log('adding task', respObj.params.task)
        self.createToDo(respObj.params.task);
      }
      else if (respObj.params.verb === 'delete') {   // command is to delete task
        // user can specify task number
        if (respObj.params.number || respObj.params.ordinal) {
          const num = respObj.params.number || respObj.params.ordinal;
          let taskToDelete = [];
          taskToDelete.push(self.state.toDo[num-1].task);
          console.log('deleting task', taskToDelete)
          self.deleteToDo(taskToDelete);
        // or user can specify task name
        } else {
          console.log('deleting task', respObj.params.task)
          self.deleteToDo(respObj.params.task)
        }
      }
      // command did not fall under todo --> ignore and start listening again

  }


  render () {
    // loop through articles for current source and list out article heaadlines
    return (
      <div className='widget'>
        <h2 className='uberOptions right'>Reminders</h2>
        <div>
          {this.state.toDo.map((toDo)=> {
            return (<p className="remindersListItem right">{toDo.task}</p>)
          })}
        </div>
      </div>
    );
  }
}

export default Reminder;
