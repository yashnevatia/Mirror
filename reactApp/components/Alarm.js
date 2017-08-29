import React from 'react';
import axios from 'axios';

const NEWS_API_KEY = 'f6c882d2ff2c4c949ffc69ba6d5c0dac';

class Alarm extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      socket: props.socket
    };

  }

  render () {
    const newsStyle = {
      width: '100%',
    };
    return (
      <div className="alarmContainer right widget" style={newsStyle} style={{color: 'white'}}>
        alarm
      </div>
    );
  }
}

export default News;
