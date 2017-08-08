import React from 'react';
import ReactDOM from 'react-dom';
import WidgetContainer from './components/WidgetContainer';
import io from 'socket.io-client';
const socket = io('http://localhost:3000');


class Container extends React.Component {
  constructor() {
    super();
    this.state = {
      isActive: false,
      widget: ""
    };
    this.isMirrorActive = this.isMirrorActive.bind(this);
  }

  isMirrorActive() {
     // function passed down to voice component to determine if
     // mirror is standby or active
    return;
  }

  componentDidMount(){

    var self =this;

    console.log("this app was mounted.");

    socket.on('connect', function(){
      console.log("connected");
    });

    socket.on('wakeup', function(){
      console.log("wakeup");
      self.setState({
        isActive: true,
      });
    })

    socket.on('sleep', function(){
      console.log("sleep");
      self.setState({
        isActive: false,
      })
    });

    socket.on('widget', function(howtword){
      self.setState({
        widget:hotword
      })
    })

  }

  render () {
    return (
      <WidgetContainer isActive={this.state.isActive} widget={this.state.widget} className="card2"/>
    );
  }
}


ReactDOM.render(
  <Container />,
   document.getElementById('root'));
