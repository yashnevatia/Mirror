import React from 'react';
import axios from 'axios';

const NEWS_API_KEY = 'f6c882d2ff2c4c949ffc69ba6d5c0dac';

class News extends React.Component {

  constructor (props) {
    super(props);

    console.log('props:', props.socket)

    this.state = {
      allSources: [],
      currentSource: {},
      currentArticles: [],
      image: '',
      socket: props.socket
    };
  }

  componentDidMount () {
    axios.get('https://newsapi.org/v1/sources?language=en')
      .then(resp => {
        const newSources = [...resp.data.sources];
        this.setState({allSources: newSources});
      })
      .then(() => {
        // console.log('here', this.state.allSources);
        this.selectSource('BBC News');
      })
      .catch(console.log);

    // this.pinArticle("Trump 'pressed Mexico");

    // START SOCKETS STUFF
    const self = this;
    console.log('going to connect to socket', this.state.socket);
    this.state.socket.on('connect', function() {
      console.log("connected news");

      self.state.socket.emit('join', 'NEWS');

      // next line for testing purposes only:
      // self.state.socket.emit('stt', 'NEWS');

      self.state.socket.on('stt_finished', respObj => {
        console.log('received stt finished', respObj);
      });

      // change state of news here from respObj params

    });
    // END SOCKETS STUFF
  }

  // function for user to select specific news source
  // sets state with source and headlines, returns null if not found
  selectSource (sourceName) {
    this.state.allSources.map(source => {
      if (source.name.toLowerCase().startsWith(sourceName.toLowerCase())) {
        this.setState({currentSource: source});
          // console.log('current source', this.state.currentSource);
      }
    });

    return axios.get(`https://newsapi.org/v1/articles?source=${this.state.currentSource.id}&apiKey=${NEWS_API_KEY}`)
      .then(resp => {
        // console.log('RESP', resp);

        this.setState({currentArticles: [...resp.data.articles]});
        this.setState({image: resp.data.articles[0].urlToImage});
        // console.log('IMAGE HERE', this.state.image);
      })
      .catch(console.log);
  }

  // function from which we'll later send text to user of article url they choose
  pinArticle (articleTitle) {
    this.state.currentArticles.map(article => {
      if (article.title.toLowerCase().startsWith(articleTitle.toLowerCase())) {
        // send twilio message with this article link
        const linkToSend = article.url;
        // console.log('LINK', linkToSend);
      }
    });
  }

  render () {
    const newsStyle = {
      width: '100%',
      height: '33%',
      backgroundImage: `linear-gradient(
        rgba(0, 0, 0, 0.7),
        rgba(0, 0, 0, 0)
    ),   url({this.state.image})`
    };
    // loop through articles for current source and list out article heaadlines
    return (
      <div className="newsContainer" style={newsStyle}>
        <ol className="newsList" style={{color: 'white'}}>
          {this.state.currentArticles.map((article, i) => {
            // SET 4 TO BE HOW EVER MANY ARTICLES YOU WANT TO SHOW
            if(i < 4) {
              return (<li className="newsListItem" key={i}>{article.title}</li>);
            }
            return null;
          })
        }
        </ol>
      </div>
    );
  }
}

export default News;
