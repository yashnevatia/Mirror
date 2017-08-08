import React from 'react';

class Progress extends React.Component {
  constructor(props) {
    super(props);
  }

  render(){
    return(
      <div className="progress">
        <span className="player__time-elapsed">{this.props.elapsed}</span>
        <progress
           value={this.props.position}
           max="1"></progress>
         <span className="player__time-total">{this.props.total}</span>
      </div>
    )
  }

}

export default Progress
