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
	    widgets: []
    }
  }

  componentDidMount(){

    const self =this;

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
        widgets:[]
      })
    });

    socket.on('cancel', function(){
      console.log("cancelled");
      var temp = self.state.widgets.slice();
      if(temp.length !== 0) temp.shift();
      self.setState({
        widgets: temp
      })
    })

    socket.on('widget', function(widgetName){
      console.log("widget", widgetName);
      var temp = self.state.widgets.slice();
      if(temp.length === 3)temp.pop();
      if(temp.indexOf(widgetName) === -1){
        temp.unshift(widgetName);
        self.setState({
          widgets: temp
        })
      }

      // TRYING TO FIX SPEECH:
      console.log('widget should startlistening');
      self.startListening(widgetName.toUpperCase())
    });
  }

  // FUNCTION FOR WIDGET START STT LISTNENING
  startListening (widgetName) {
    console.log('client emitting start listening');
    socket.emit('stt', widgetName.toUpperCase());
  }

  render () {
    console.log('sending socket', socket);
    return (
      <WidgetContainer isActive={this.state.isActive}
        widgets={this.state.widgets}
        className="card2"
        socket={socket}
        listen={this.startListening}
      />
    );
  }

}


ReactDOM.render(
  <Container />,
   document.getElementById('root'));
