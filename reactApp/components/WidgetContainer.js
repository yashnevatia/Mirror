import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import axios from 'axios';
import { bounce } from 'react-animations';

// widgets imports
import Time from './Time';
import Weather from './Weather';
// import Radio from './Radio';
import News from './News';
import Uber from './Uber';
import ToDo from './Reminder';
import Response from './responseDiv';


class WidgetContainer extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      hasResponse: true,    // bool to determine if Iris should be showing text
      currentResponse: this.props.currentResponse || '',  // response for Iris
      socket: props.socket, // socket for widget & WC interactions w/ server
      isListening: false    // bool to show animation for when GSpeech listening
    };

  }

  componentDidMount() {
    // SOCKET LISTENERS
    const self = this;

    // join WC when connected to backend socket
    this.state.socket.on('connect', () => {
      console.log("connected container");
      self.state.socket.emit('join', 'W_CONTAINER');
    });

    // handle a user's invalid request
    this.state.socket.on('invalid_request', () => {
      console.log('WC in invalid request')
      this.setState({currentResponse: "I'm sorry, I did not understand that"});
    });

    // show small talk response if applicable, else resemble invalid request
    this.state.socket.on('other_category', respObj => {
      console.log('WC in NOT RELEVANT', respObj)
      // if small talk category, show response
      if (respObj.category.startsWith('smalltalk') && respObj.response) {
        this.setState({currentResponse: respObj.response});

      // else is not understandable request
      } else {
        this.setState({currentResponse: "I'm sorry, I did not understand that"});
      }
    });

    // have Iris show custom message
    this.state.socket.on('custom_msg', ({ resp }) => {
      console.log('WC in custom message')
      this.setState({ currentResponse: resp });
    });

    // update Iris response with new info from continued STT cycle
    this.state.socket.on('stt_continuing', respObj => {
      console.log('WC received stt continuing', respObj);

      this.setState({currentResponse: respObj.response});
      console.log('WC reset state with current response')
    });

    // show final Iris response after STT cycle, and disappear after timeout
    this.state.socket.on('stt_finished', respObj => {
      console.log('WC received stt finished', respObj);
      const self = this;

      this.setState({currentResponse: respObj.response});
      const timeout = (respObj.category === "news article") ? 6000 : 3000;
      setTimeout(() => {
        console.log('WC in timeout of stt finished');
        self.setState({currentResponse: ''})
      }, timeout)
    });

    // show listening animation when GSpeech listening to user
    this.state.socket.on('listening', isListening => {
      console.log('chaning is listening to be', isListening);
      self.setState({isListening});
    })
    // END SOCKET LISTENERS
  }

  getWidget(widget) {
  	console.log('**********************************',widget,'**********************************');

    switch (widget){
    	// case 'radio':
    	// 	return <Radio key={widget} socket={this.state.socket}  />;
    	case 'news':
    		return <News key={widget} socket={this.state.socket}  />;
    	case 'uber':
    		return <Uber key={widget} socket={this.state.socket} />;
    	case 'reminders':
    		return <ToDo key={widget} socket={this.state.socket}  />
    	default:
    		return <div key={'empty'} ></div>;
    }
  }

  render () {
    console.log('isActive', this.props.isActive, 'isListening', this.state.isListening);

    return(
      <div className="outerDiv" id="q">

        {/* show time and weather as different sizes when on standby / active */}
        <div className={this.props.isActive ? 'isActiveDiv' : 'isStandbyDiv'}>
           <ReactCSSTransitionGroup transitionName = "example"
             transitionAppear = {true} transitionAppearTimeout = {2000}
             transitionEnter = {false} transitionLeave = {false}>
             <Time timeState={this.props.isActive}/>
             <Weather weatherState={this.props.isActive}/>
             {this.props.isActive && this.state.isListening &&
               <div id="ellipsis">
                 <h5 id="one"> •</h5> {/* animation for GSpeech listening */}
               </div>
             }
           </ReactCSSTransitionGroup>
        </div>

        {/* component for Iris response */}
        <div className={this.props.isActive ? 'responseDiv' : 'widgetsStandby'}>
          { this.state.hasResponse && <Response display={this.state.currentResponse || this.props.currentResponse} /> }
        </div>

        {/* show current widgets being used */}
        <div className={this.props.isActive ? 'widgetsActive' : 'widgetsStandby'}>
          {this.props.widgets.map((widget) => {
            return this.getWidget(widget);
          })}

          {/* BUG button for testing on not Pi only BUG */}
          <button onClick={() => this.props.listen('NEWS')}> listen again </button>
          {/* BUG button for testing on not Pi only BUG */}

        </div>

      </div>
    );
  }
}

export default WidgetContainer;
