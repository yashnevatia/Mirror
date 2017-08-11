import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import axios from 'axios';
import { bounce } from 'react-animations';


import Time from './Time';
import Weather from './Weather';
import Radio from './Radio';
import News from './News';
import Uber from './Uber';
import ToDo from './Reminder';
import Spotify from './Spotify'
import Response from './responseDiv';

class WidgetContainer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      hasResponse: true,
      currentResponse: '',
      socket: props.socket,
    };

    this.startListening = this.props.listen.bind(this);
  }

  componentDidMount() {
    // START SOCKET LISTENERS
    const self = this;
    this.state.socket.on('connect', () => {
      console.log("connected container");
      self.state.socket.emit('join', 'W_CONTAINER');

    });

    this.state.socket.on('invalid_request', () => {
      console.log('WC in invalid request')
      this.setState({currentResponse: "I'm sorry, I did not understand that"});
    });

    this.state.socket.on('custom_msg', ({ resp }) => {
      console.log('WC in custom message')
      this.setState({currentResponse: resp});
    });

    this.state.socket.on('stt_continuing', respObj => {
      console.log('WC received stt continuing', respObj);

      this.setState({currentResponse: respObj.response});
      console.log('WC reset state with current response')
    });

    this.state.socket.on('stt_finished', respObj => {
      console.log('WC received stt finished', respObj);
      const self = this;

      this.setState({currentResponse: respObj.response});
      const timeout = (respObj.category === "news article") ? 6000 : 1000;
      setTimeout(() => {
        console.log('WC in timeout of stt finished');
        self.setState({currentResponse: ''})
      }, timeout)
    });
    // END SOCKET LISTENERS
  }

  // // FUNCTION FOR WIDGET START STT LISTNENING
  // startListening (widgetName) {
  //   console.log('client emitting start listening');
  //   this.state.socket.emit('stt', widgetName.toUpperCase());
  // }


  getWidget(widget, i) {

    switch (widget){
    	case 'radio':
    		return <Radio key={i} socket={this.state.socket} listen={this.startListening} />;
    	case 'news':
    		return <News key={i} socket={this.state.socket} listen={this.startListening} />;
    	case 'uber':
    		return <Uber key={i} socket={this.state.socket} listen={this.startListening} />;
    	case 'reminders':
    		return <ToDo key={i} socket={this.state.socket} listen={this.startListening} />
    	default:
    		return <div key={i} ></div>;
    }

  }

  render () {
    console.log("ACTIVE", this.props.isActive, this.props.widgets);
    return(
      <div className="outerDiv" id="q">

        <div className={this.props.isActive ? 'isActiveDiv' : 'isStandbyDiv'}>
           <ReactCSSTransitionGroup transitionName = "example"
             transitionAppear = {true} transitionAppearTimeout = {2000}
             transitionEnter = {false} transitionLeave = {false}>
             <Time timeState={this.props.isActive}/>
             <Weather weatherState={this.props.isActive}/>
           </ReactCSSTransitionGroup>
        </div>
        <div className={this.props.isActive ? 'responseDiv' : 'widgetsStandby'}>
          { this.state.hasResponse && <div className="rDiv"><Response display={this.state.currentResponse} /></div> }
        </div>

        <div style={{'animation': 'bounce'}} className={this.props.isActive ? 'widgetsActive' : 'widgetsStandby'}>
          {this.props.widgets.map((widget, i) => {
            return this.getWidget(widget, i);
          })}

        </div>
      </div>
    );
  }
}

export default WidgetContainer;
