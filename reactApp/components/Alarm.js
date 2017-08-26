import React from 'react';
import axios from 'axios';

class Alarm extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      socket: props.socket
    };

    console.log('alarm rendered');
  }

  componentDidMount () {
    const self = this;



    // called only once
    self.state.socket.on('connect', () => {
      console.log('CLIENT alarm connected to sockets');
      self.state.socket.emit('join', 'ALARM');
    });

    // listen for end of stt
    self.state.socket.on('stt_finished', respObj => {
      const cat = respObj.category.indexOf('alarm');
      console.log('ALARM received stt finished', respObj, cat);
      if (respObj.params && respObj.category && respObj.category.indexOf('alarm') >= 0) {
        self.processRequest(respObj);
      } else {
        console.log('invalid alarm request')
      }
    });

  }

  processRequest(respObj) {
    const self = this;

    if ( ) {


    } else if ( ) {


    }

  }

  render () {

    return (
      <div id="alarmContainer" className="right widget">
	     <h2 className='right uberOptions'> Alarm </h2>

       <div>

       </div>

     </div>
  }
}

export default Alarm;
