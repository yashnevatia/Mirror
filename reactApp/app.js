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
      widget: [],
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

    socket.on('cancel', function(){
      console.log("cancelled");
      var temp = this.state.widget.slice();
      temp.shift();
      this.setState({
        widget: temp
      })
    })

    socket.on('widget', function(widgetName){
      console.log("widget", widgetName);
      var temp = this.state.widget.slice();
      if(temp.length === 3)temp.pop();
      temp.unshift(widgetName);
      this.setState({
        widget: temp
      })
    })

    // socket.on('radio', function(){
  	//   console.log("widget");
    //   var temp = this.state.widget.slice();
    //   if(temp.length === 3)temp.pop();
    //   temp.unshift("radio");
    //     self.setState({
    //       widget:temp
    //     })
    // })
    //
    // socket.on('news', function(){
  	//   console.log("widget");
    //   var temp = this.state.widget.slice();
    //   if(temp.length === 3)temp.pop();
    //   temp.unshift("news");
    //     self.setState({
    //       widget:temp
    //     })
	  // })
    //
    // socket.on('uber', function(){
  	//   console.log("widget");
    //   var temp = this.state.widget.slice();
    //   if(temp.length === 3)temp.pop();
    //   temp.unshift("uber");
    //     self.setState({
    //       widget:temp
    //     })
	  // })
    //
    // socket.on('todo', function(){
  	//   console.log("widget");
    //   var temp = this.state.widget.slice();
    //   temp.unshift("todo");
    //     self.setState({
    //       widget:temp
    //     })
	  // })

  }

  render () {
    console.log('sending socket', socket);
    return (
      <WidgetContainer isActive={this.state.isActive}
        // widget={this.state.widget}
        widget={'news'}
        className="card2"
        socket={socket}
      />
    );
  }

}


ReactDOM.render(
  <Container />,
   document.getElementById('root'));
