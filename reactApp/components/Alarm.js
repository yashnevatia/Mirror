import React from 'react';
import axios from 'axios';

const NEWS_API_KEY = 'f6c882d2ff2c4c949ffc69ba6d5c0dac';

class News extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      socket: props.socket
    };

    console.log('alarm rendered');
  }

  componentDidMount () {
    const self = this;

    //api call

    // called only once
    self.state.socket.on('connect', () => {
      console.log('CLIENT news connected to sockets');
      self.state.socket.emit('join', 'ALARM');
    });

    // listen for end of stt
    self.state.socket.on('stt_finished', respObj => {
      const cat = respObj.category.indexOf('alarm');
      console.log('ALARM received stt finished', respObj, cat);
      if (respObj.params && respObj.category && respObj.category.indexOf('alarm') >= 0) {
        self.processRequest(respObj);
      } else {
        console.log('invalid news request')
      }
    });

  }

  processRequest(respObj) {
    const self = this;

    if (respObj.category === 'alarm' && respObj.params.newsAction && respObj.params.newsAction==='scroll down' ) {
      self.nextArticles();
    } else if (respObj.category === 'news' && respObj.params.newsSource) {
      // change state of news here from respObj params
      self.selectSource(respObj.params.newsSource)
      .then(() => {
        console.log('going to start listening again');
      })
      .catch( err => {
        console.log('ERROR :(', err);
      });
    } else if (respObj.category === 'news article') {
      console.log('in news article with article: ', respObj.params.number, respObj.params.ordinal);
      // user specifies number of article
      const articleNum = parseInt(respObj.params.number) || parseInt(respObj.params.ordinal) || 1;
      // send wContainer back message
      self.state.socket.emit('custom_msg', { resp: "Great! Article link sent to your phone" })
      // twilio texts article to user
      self.pinArticle(articleNum - 1);

    }

  }

  render () {
    const newsStyle = {
      width: '100%',
    };
    return (
      <div className="newsContainer right widget" style={newsStyle} style={{color: 'white'}}>
	     <h2 className='right uberOptions' style={{color: 'white'}}> Alarm</h2>


      </div>
    );
  }
}

export default News;
