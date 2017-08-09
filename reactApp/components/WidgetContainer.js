import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import axios from 'axios';

import Time from './Time';
<<<<<<< HEAD

// import Weather from './Weather';
// import Radio from './Radio';

=======
import Weather from './Weather';
import Radio from './Radio';
>>>>>>> amanda
import News from './News';
import ToDo from './ToDo';
import Response from './responseDiv';

class WidgetContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        hasResponse: true,
        currentResponse: '',
        socket: props.socket
    };
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

  // FUNCTION FOR WIDGET START STT LISTNENING
  startListening (widgetName) {
    this.state.socket.emit('stt', widgetName.toUpperCase());
  }

  determineThreeWidgets() {
     // function to determine which widgets show
  }

  render () {
	  console.log("ACTIVE", this.props.isActive, this.props.widget);
    return(
      <div className="outerDiv" id="q">

<<<<<<< HEAD
         <div className={this.props.isActive ? 'isActiveDiv' : 'isStandbyDiv'}>
           <ReactCSSTransitionGroup transitionName = "example"
             transitionAppear = {true} transitionAppearTimeout = {2000}
             transitionEnter = {false} transitionLeave = {false}>
             <Time timeState={this.props.isActive}/>
             {/* <Weather weatherState={this.props.isActive}/> */}
           </ReactCSSTransitionGroup>
        </div>
        <div className={this.props.isActive ? 'responseDiv' : 'widgetsStandby'}>
            { this.state.hasResponse && <div className="rDiv"><Response display={this.state.currentResponse} /></div> }
        </div>
        <div className={this.props.isActive ? 'widgetsActive' : 'widgetsStandby'}>
            <ReactCSSTransitionGroup transitionName = "example"
              transitionAppear = {true} transitionAppearTimeout = {2000}
              transitionEnter = {false} transitionLeave = {false}>

              {this.props.widget === 'news' ? <News socket={this.state.socket} /> : <div></div>}
              {this.props.widget === 'reminder' ? <ToDo /> : <div></div>}

            </ReactCSSTransitionGroup>
        </div>
        {this.props.isActive ? <h1> Active </h1> : <div></div>}


=======
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
          <div className={this.props.isActive ? 'widgetsActive' : 'widgetsStandby'}>
              <ReactCSSTransitionGroup transitionName = "example"
                transitionAppear = {true} transitionAppearTimeout = {2000}
                transitionEnter = {false} transitionLeave = {false}>

				        {this.props.widget === 'radio' ? <Radio socket={this.state.socket} listen={this.startListening} /> : <div></div>}
                {this.props.widget === 'news' ? <News socket={this.state.socket} listen={this.startListening} /> : <div></div>}

              </ReactCSSTransitionGroup>
          </div>
>>>>>>> amanda
	 </div>
    );
  }
}

export default WidgetContainer;
