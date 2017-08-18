import React from 'react';
import axios from 'axios';

const NEWS_API_KEY = 'f6c882d2ff2c4c949ffc69ba6d5c0dac';

class News extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      socket: props.socket,
      timeNow: ,
      interval: () => '',

      task: '',
      alarm: ''
    };

    console.log('alarm rendered');
  }

  componentDidMount () {
    const self = this;
    // called only once
    self.state.socket.on('connect', () => {
      console.log('CLIENT news connected to sockets');
      self.state.socket.emit('join', 'ALARM');
    });

    // listen for end of stt
    self.state.socket.on('stt_finished', respObj => {
      const cat = respObj.category.indexOf('alarm');
      console.log('ALARM received stt finished', respObj, cat);
      if (respObj.params && respObj.category && respObj.category === 'alarm') {
        self.processRequest(respObj);
      } else {
        console.log('invalid alarm request')
      }
    });

    this.setState({ interval: setInterval(() => {
      const timeNow = new Date();

      this.setState({
        timeNow: new Date()
      });
    }, 1000 * 5);
    });
  }

  componentWillUnmount() {
    clearInterval(this.state.interval);
    console.log('clearing');
  }

  processRequest(respObj) {
    console.log('ALARM in process request');
    const self = this;

    if (respObj.params.alarmTask) {
      console.log('ALARM setting TASK as', respObj.params.alarmTask)
      self.setState({task: respObj.params.alarmTask})
    }

    if (respObj.params.time) {
      console.log('ALARM setting ALARM as', respObj.params.time)
      self.setState({alarm: respObj.params.time})
    }
  }

  render () {
    const newsStyle = {
      width: '100%',
    };
    return (
      <div className="newsContainer right widget" style={newsStyle} style={{color: 'white'}}>
	     <h2 className='right uberOptions' style={{color: 'white'}}> Alarm</h2>


      </div>
    );
  }
}

export default News;
