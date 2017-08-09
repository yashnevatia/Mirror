import React from 'react';


class Response extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hours: new Date().getHours(),
      minutes: new Date().getMinutes(),
      seconds: new Date().getSeconds(),
      interval: () => ''
    };
  }

  render() {
    console.log('rendered with ', this.props.display);
    return (
    <div className="response">
      <p>> Iris: </p>
      <p> {this.props.display} </p>
     </div>
    );
  }
}

export default Response;
