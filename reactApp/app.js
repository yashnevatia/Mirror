import React from 'react';
import ReactDOM from 'react-dom';
import WidgetContainer from './components/WidgetContainer';
import io from 'socket.io-client';
const socket = io('http://localhost:3000');


class Container extends React.Component {
  constructor() {
    super();
    this.state = {
      // BUG : FOR TESTING ON MAC, UNCOMMENT THESE LINES : BUG
      // isActive: true,
      // widgets: ['lights', 'reminders', 'news'],

      // BUG : FOR TESTING ON MAC, COMMENT OUT THE BELOW TWO LINES : BUG
      isActive: false,
	    widgets: [],

      initialResponses: {
        radio: 'Would you like to play, pause or search for songs?',
        news: 'Which news source would you like to view?',
        uber: "Prompt 'call me an Uber' to order a ride!",
        reminders: '',
      }
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
      console.log("widget", widgetName, 'called');
      // if widget is not already active, bring it to top of array
      if (widgetName !== self.state.widgets[0]) {
        console.log('bringing widget to top place')
        var temp = self.state.widgets.slice();
        if(temp.length === 3)temp.pop();
        if(temp.indexOf(widgetName) === -1){
          temp.unshift(widgetName);
          console.log('new widget order', temp);
          self.setState({
            widgets: temp
          })
        }
        // show initial prompt for widget
        self.setState({currentResponse: self.state.initialResponses[widgetName.toLowerCase()]})

      // else if widget active, set current response to be empty
      } else {
        console.log('not bringing widget to top', widgetName, self.state.widgets);
        self.setState({currentResponse: null})
      }

      // START GOOGLE SPEECH AFTER HOTWORD CALLED:
      console.log('widget should startlistening');
      socket.emit('stt', widgetName.toUpperCase());
      //self.startListening(widgetName.toUpperCase())
    });
  }

  // FUNCTION FOR WIDGET START STT LISTNENING
  startListening (widgetName) {
    console.log('client emitting start listening');
    socket.emit('stt', widgetName.toUpperCase());
  }

  // FUNCTION TO CHANGE CHANGE WIDGET MESSAGE
  changeWidgetReponse (widgetName, message) {
    if (this.state.initialResponses[widgetName]) {
      console.log('YES, THERE IS A WIDGET WITH THIS NAME IN RESPONSES');
      let newObj;
      newObj[widgetName] = message;
      Object.assign(initialResponses, newObj);
      this.setState(initialResponses);
      console.log('state changed so that ', initialResponses);
    }
  }

  render () {
    console.log('sending socket', socket);
    return (
      <WidgetContainer isActive={this.state.isActive}
        widgets={this.state.widgets}
        className="card2"
        socket={socket}
        listen={this.startListening}
        currentResponse={this.state.currentResponse}
        changeWidgetReponse={this.state.changeWidgetReponse}
      />
    );
  }
}

ReactDOM.render(
  <Container />,
   document.getElementById('root'));
