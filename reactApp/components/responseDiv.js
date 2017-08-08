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
      <p> hello how are you </p>
     </div>
    );
  }
}

export default Response;
