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
	  widget: []
    }
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

    socket.on('cancel', function(){
      console.log("cancelled");
      var temp = self.state.widget.slice();
      if(temp.length !== 0) temp.shift();
      self.setState({
        widget: temp
      })
    })

    socket.on('widget', function(widgetName){
      console.log("widget", widgetName);
      var temp = self.state.widget.slice();
      if(temp.length === 3)temp.pop();
      if(temp.indexOf(widgetName)=== -1){
        temp.unshift(widgetName);
        self.setState({
          widget: temp
        })
      }
    });

  }

  render () {
    console.log('sending socket', socket);
    return (
      <WidgetContainer isActive={this.state.isActive}
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
