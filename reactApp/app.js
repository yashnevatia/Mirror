import React from 'react';
import ReactDOM from 'react-dom';
import WidgetContainer from './components/WidgetContainer';
import io from 'socket.io-client';
const socket = io('http://localhost:3000');


class Container extends React.Component {
  constructor() {
    super();
    this.state = {
      isActive: true,
      widget: "news"
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

    socket.on('radio', function(){
	  console.log("widget");
      self.setState({
        widget:"radio"
      })
    })

    socket.on('news', function(){
	  console.log("widget");
      self.setState({
        widget:"news"
      })
	})

  }

  render () {
    console.log('sending socket', socket);
    return (
      <WidgetContainer isActive={this.state.isActive}
        // widget={this.state.widget}
        widget={this.state.widget}
        className="card2"
        socket={socket}
      />
    );
  }
}


ReactDOM.render(
  <Container />,
   document.getElementById('root'));
