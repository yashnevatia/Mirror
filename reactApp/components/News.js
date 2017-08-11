import React from 'react';
import axios from 'axios';

const NEWS_API_KEY = 'f6c882d2ff2c4c949ffc69ba6d5c0dac';

class News extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      allSources: [],
      currentSource: {},
      currentArticles: [],
      image: '',
      socket: props.socket
    };

    this.startListening = this.props.listen.bind(this);
    this.selectSource = this.selectSource.bind(this);
  }

  componentDidMount () {
    //api call
    axios.get('https://newsapi.org/v1/sources?language=en')
    .then(resp => {
      const newSources = [...resp.data.sources];
      this.setState({allSources: newSources});
    })
    .catch(console.log);

    const self = this;
    // called only once
    self.state.socket.on('connect', () => {
      console.log('CLIENT news connected to sockets');
      self.state.socket.emit('join', 'NEWS');
    });

    // listen for end of stt
    self.state.socket.on('stt_finished', respObj => {
      console.log('received stt finished', respObj);
      self.processRequest(respObj);
    });

  }

  processRequest(respObj) {
    const self = this;

    if (respObj.category === 'news') {
      // change state of news here from respObj params
      self.selectSource(respObj.params.newsSource)
        .then(() => {
			console.log('going to start listening again');
          // for testing purposes only --- USE HOTWORD INSTEAD TO PROMPT THAT
          //self.startListening('NEWS');
          console.log("CHANGED THE ABOVE LINE");
        })
        .catch( err => {
          console.log('ERROR :(', err);
        });

    } else if (respObj.category === 'news article') {
      // user specifies number of article
      const articleNum = parseInt(respObj.params.number) || parseInt(respObj.params.ordinal) || 1;
      // twilio texts article to user
      self.pinArticle(articleNum - 1)

    } else {
      self.state.socket.emit('invalid_request');
    }
  }

  // function for user to select specific news source
  // sets state with source and headlines, returns null if not found
  selectSource (sourceName) {
    const self = this;
    return new Promise( (resolve, reject) => {

      this.state.allSources.map(source => {
        if (source.name.toLowerCase().startsWith(sourceName.toLowerCase())) {
          console.log('current source', this.state.currentSource);
          this.setState({currentSource: source});
        }
      });

      axios.get(`https://newsapi.org/v1/articles?source=${this.state.currentSource.id}&apiKey=${NEWS_API_KEY}`)
        .then( resp => {
          console.log('in set current articles')
          self.setState({currentArticles: [...resp.data.articles]});
          //   self.setState({image: resp.data.articles[0].urlToImage});
          resolve('success');
        })
        .catch( err => {
          reject('errrorrrrr', err);
        });
    });
  }

  // function that texts user with link to article of their choosing
  pinArticle (articleNum) {
    console.log('CLIENT in send article', articleNum, this.state.currentArticles);

    if (articleNum < this.state.currentArticles.length) {
      this.setState({currentSource: this.state.currentArticles[articleNum]});

      const linkToSend = this.state.currentSource.url;
      console.log('LINK', linkToSend);

      // send link
      axios.post('/sendArticle', {link: linkToSend});

    } else {
      self.state.socket.emit('invalid_request');
      resolve('did nothing');
    }
  }

  render () {
    const newsStyle = {
      width: '100%',
      height: '33%',
    //   backgroundImage: `linear-gradient(
    //     rgba(0, 0, 0, 0.7),
    //     rgba(0, 0, 0, 0)
    // ),   url({this.state.image})`
    };
    // loop through articles for current source and list out article heaadlines
    return (
      <div className="newsContainer" style={newsStyle}>

        {!this.state.currentArticles && <div className="newsList" style={{color: 'white'}}>
          {this.state.allSources.map((source, i) => {
            // SET 4 TO BE HOW EVER MANY Sources YOU WANT TO SHOW // change if get scrolling
            if(i < 4) {
              return (<div className="newsListItem" key={i}>{source.name}</div>);
            }
              return null;
          })}
        </div> }

        {this.state.currentArticles && <div className="newsList" style={{color: 'white'}}>
          {this.state.currentArticles.map((article, i) => {
            // SET 4 TO BE HOW EVER MANY ARTICLES YOU WANT TO SHOW
            if(i < 4) {
              return (<div className="newsListItem" key={i}>{article.title}</div>);
            }
              return null;
          })}
        </div> }
      </div>
    );
  }
}

export default News;
