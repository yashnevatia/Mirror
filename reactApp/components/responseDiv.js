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
    return (
    <div className="response">
      <p>> Iris: </p>
      <p> {this.props.display} </p>
     </div>
    );
  }
}

export default Response;
