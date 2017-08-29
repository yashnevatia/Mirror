import React from 'react';


class Time extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hours: new Date().getHours(),
      minutes: new Date().getMinutes(),
      seconds: new Date().getSeconds(),
      interval: () => ''
    };
  }
  componentDidMount() {
  //update time
    this.setState({ interval: setInterval(() => {
      const min = (new Date).getMinutes();
      const minutes = (min < 10) ? '0'+min : min;
      const secs = (new Date).getSeconds();
      const seconds = (secs < 10) ? '0'+secs : secs;

      this.setState({
        hours: new Date().getHours(),
        minutes: minutes,
        seconds: seconds
      });
    }, 100)
    });
  }
  componentWillUnmount() {
    clearInterval(this.state.interval);
    console.log('clearing');
  }
  render() {
    return (
    <div className="timeDiv">
      <div className={this.props.timeState ? 'isActiveTime' : 'isStandbyTime'}>
        {this.state.hours}:{this.state.minutes}:{this.state.seconds}
      </div>
     </div>
    );
  }
}

export default Time;
