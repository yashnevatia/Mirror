//React library
import React from 'react';
//Sound component
import Sound from 'react-sound';
//Axios for Ajax
import axios from 'axios';
//Custom components
import Details from './radio/details.component';
import Player from './radio/player.component';
import Progress from './radio/progress.component';
import Search from './radio/search.component';

class Radio extends React.Component {

  constructor(props) {
    super(props);
    this.client_id = '2f98992c40b8edf17423d93bda2e04ab';
    this.state = {
      track: {stream_url: '', title: '', artwork_url: ''},
      tracks: [],
      playStatus: Sound.status.STOPPED,
      elapsed: '00:00',
      total: '00:00',
      position: 0,
      playFromPosition: 0,
      autoCompleteValue: '',
      socket: props.socket
    };
  }

  componentDidMount() {
    this.randomTrack();
    var self = this;
    self.state.socket.emit('join', 'RADIO');
    self.state.socket.on('stt_finished',respObj => {
      console.log("reached radio after processed request", respObj);
      self.processRequest(respObj);
    })
  }

  processRequest(respObj){
    var self = this;
    if(respObj.category === 'radio'){
      if(!respObj.params || ){
        return;
      }
      else if(respObj.params.radioAction === 'play' && !respObj.params.radioSong){
        this.setState({playStatus: Sound.status.PLAYING});
      }
      //else if(respObj.params.radioAction === 'play' && respObj.params.radioSong){
        axios.get(`https://api.soundcloud.com/tracks?client_id=${this.client_id}&q=${respObj.params.radioSong}`)
        .then(resp => {
          console.log(resp);
          self.setState({
            tracks: response.data
          })
        })
        this.setState({playStatus: Sound.status.PLAYING});
      }
      else if(respObj.params.radioAction === 'pause'){
        this.setState({playStatus: Sound.status.PAUSED});
      }
      // else if(respObj.params.radioAction === 'search'){
      //   this.setState({playStatus: Sound.status.PAUSED});
      // }
    }
  }

  prepareUrl(url) {
    //Attach client id to stream url
    return `${url}?client_id=${this.client_id}`;
  }

  togglePlay(){
    // Check current playing state
    if(this.state.playStatus === Sound.status.PLAYING){
      // Pause if playing
      this.setState({playStatus: Sound.status.PAUSED});
    } else {
      // Resume if paused
      this.setState({playStatus: Sound.status.PLAYING});
    }
  }

  stop(){
    // Stop sound
    this.setState({playStatus: Sound.status.STOPPED});
  }

  forward(){
    this.setState({playFromPosition: this.state.playFromPosition+=1000*10});
  }

  backward(){
    this.setState({playFromPosition: this.state.playFromPosition-=1000*10});
  }

  formatMilliseconds(milliseconds) {
    // uncomment the following line if we decide we want hours
    // var hours = Math.floor(milliseconds / 3600000);
    milliseconds = milliseconds % 3600000;
    var minutes = Math.floor(milliseconds / 60000);
    milliseconds = milliseconds % 60000;
    var seconds = Math.floor(milliseconds / 1000);
    milliseconds = Math.floor(milliseconds % 1000);

    return (minutes < 10 ? '0' : '') + minutes + ':' +
        (seconds < 10 ? '0' : '') + seconds;
  }

  handleSongPlaying(audio){
    this.setState({
      elapsed: this.formatMilliseconds(audio.position),
      total: this.formatMilliseconds(audio.duration),
      position: audio.position / audio.duration
    });
  }

  handleSongFinished () {
    this.randomTrack();
  }

  randomTrack () {
    let _this = this;
    //Request for a playlist via Soundcloud using a client id
    axios.get(`https://api.soundcloud.com/playlists/209262931?client_id=${this.client_id}`)
      .then(function (response) {
        // Store the length of the tracks
        const trackLength = response.data.tracks.length;
        // Pick a random number
        const randomNumber = Math.floor((Math.random() * trackLength) + 1);
        //Set the track state with a random track from the playlist
        _this.setState({track: response.data.tracks[randomNumber]});
      })
      .catch(function (err) {
        //If something goes wrong, let us know
        console.log(err);
      });
  }

  render () {
    const scotchStyle = {
      width: '100%',
      height: '33%',
    };
    return (
      <div className="scotch_music" style={scotchStyle}>
        <Details
          title={this.state.track.title}/>
        <Sound
           url={this.prepareUrl(this.state.track.stream_url)}
           playStatus={this.state.playStatus}
           onPlaying={this.handleSongPlaying.bind(this)}
           playFromPosition={this.state.playFromPosition}
           onFinishedPlaying={this.handleSongFinished.bind(this)}/>
       <div className="controlDiv">
           <Progress
             elapsed={this.state.elapsed}
             total={this.state.total}
             position={this.state.position}/>
            <Player
              togglePlay={this.togglePlay.bind(this)}
              playStatus={this.state.playStatus}
              forward={this.forward.bind(this)}
              backward={this.backward.bind(this)}
              random={this.randomTrack.bind(this)}/>
      </div>

      </div>
    );
  }
}

export default Radio;
