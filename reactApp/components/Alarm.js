import React from 'react';
import axios from 'axios';
// const React = require('react');
// const axios = require('axios');

class Alarm extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      socket: props.socket,

      timeNow: new Date(),
      interval: () => '',

      task: 'go outside!',
      countdown: '',
      alarm: new Date((new Date()).getTime() + 1000*60*0.15),

      showAlarm: false
    };

    this.updateTimes = this.updateTimes.bind(this);
    this.flashAlarm = this.flashAlarm.bind(this);

    console.log('alarm rendered');
  }

  componentDidMount () {
    const self = this;

    // connect to sockets - called only once
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

    // make interval to set current time and check for alarm
    self.setState({ interval: setInterval(() => {
      // reset current time
      const timeNow = new Date();
      self.setState({
        timeNow: timeNow
      });

      // check if there exists an alarm ; quit function if not
      try {
        console.log('trying alarm', self.state.alarm, self.state.alarm.getTime())
        self.state.alarm.getTime();
        // code reaches here if alarm exists => update countdown and check alarm
        self.updateTimes(timeNow);
      } catch (err) {
        console.log('NO current alarm in component did mount', err);
        return;
      }

    }, 1000 * 5)

    });

  }

  componentWillUnmount () {
    clearInterval(this.state.interval);
    console.log('clearing');
  }

  processRequest (respObj) {
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

  updateTimes (timeNow) {
    const self = this;

    console.log('ALARM in update times');
    // reset countdown (converting milliseconds to hours:minutes)
    const countdownNum = (self.state.alarm.getTime() - timeNow.getTime()) / 60000;
    const countdownHrs = Math.trunc(countdownNum / 60);
    let countdownMin = Math.round(countdownNum % 60);
    countdownMin = (countdownMin < 10) ? '0'+countdownMin : countdownMin;
    const countdown = countdownHrs+':'+countdownMin;
    console.log('created countdown: ',countdownNum,countdown)

    if (countdownNum <= 0) {
      // alarm goes off
      console.log('ALARM ALARM ALARM GOES OFF');
      const alarmObj = {
        task: self.state.task,
        alarm: self.state.alarm,
      }

      self.state.socket.emit('alarm_ring', alarmObj)

      // // make screen flash white for alarm
      // self.setState({showAlarm: true});

      // clear state with alarm data
      clearInterval(self.state.interval);
      self.setState({alarm: {}, task: '', countdown: ''})

      // // clear white alarm flash after half a second
      // setTimeout(() => {
      //   self.setState({showAlarm: false});
      // }, 500)

      self.flashAlarm()
      .then (() => {
        console.log('AFTER flash alarm')
      })
      .catch ( err => {
        console.log('error flashing alarm', err);
      })

    } else {
      console.log('ALARM still active');
      // alarm still active
      self.setState({ countdown });

    }

  }

  flashAlarm () {
    const self = this;
    return new Promise((resolve, reject) => {
      // make screen flash white for alarm
      self.setState({showAlarm: true});

      // clear white alarm flash after half a second
      setTimeout(() => {
        self.setState({showAlarm: false});
      }, 500);

      // repeat process

    });
  }

  getTimeString (time, showSecs) {
    // check that time is valid Date input
    if (!time) {
      console.log('invalid time {A}');
      return null;
    }
    try {
      time.getDate()
    } catch (err) {
      console.log('invalid time {B}');
      return null;
    }

    const hrs = time.getHours();
    const hours = (hrs < 10) ? '0'+hrs : hrs;
    const min = time.getMinutes();
    const minutes = (min < 10) ? '0'+min : min;
    const secs = time.getSeconds();
    const seconds = (secs < 10) ? '0'+secs : secs;

    return showSecs ? hours+':'+minutes+':'+seconds : hours+':'+minutes;
  }

  render () {

    console.log('****** white alarm flash', this.state.showAlarm);

    return (
      <div id="alarmContainer" className="right widget">
        <h2 className='right uberOptions white'> Alarm </h2>

        <div className='white'>
          now: {this.getTimeString(this.state.timeNow, true) || 'time'}
        </div>
        <div className='white'>
          alarm: {this.getTimeString(this.state.alarm, false) || 'no alarm set'}
        </div>
        <div className='white'>
          countdown: {this.state.countdown}
          {/* time until alarm goes off: {this.getTimeString(this.state.countdown, false)} */}
        </div>

        {this.state.showAlarm && <div id="alarm_flash"> </div>}

      </div>
    )
  }
}


export default Alarm;
