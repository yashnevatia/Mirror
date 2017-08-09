//React library
import React from 'react';
//Sound component
import Sound from 'react-sound';
//Axios for Ajax
import Axios from 'axios';
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
      autoCompleteValue: ''
    };
  }

  componentDidMount() {
    this.randomTrack();
  }

  prepareUrl(url) {
    //Attach client id to stream url
    return `${url}?client_id=${this.client_id}`;
  }

  xlArtwork(url){
    console.log('URL', url);
    return url.replace(/large/, 't500x500');
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

  handleSelect(value, item){
    this.setState({ autoCompleteValue: value, track: item });
  }

  handleChange(event, value){
    // Update input box
    this.setState({autoCompleteValue: event.target.value});
    let _this = this;
    //Search for song with entered value
    Axios.get(`https://api.soundcloud.com/tracks?client_id=${this.client_id}&q=${value}`)
      .then(function (response) {
        // Update track state
        _this.setState({tracks: response.data});
      })
      .catch(function (err) {
        console.log(err);
      });
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
    Axios.get(`https://api.soundcloud.com/playlists/209262931?client_id=${this.client_id}`)
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
      backgroundImage: `linear-gradient(
      rgba(0, 0, 0, 0.7),
      rgba(0, 0, 0, 0)
    ),   url(${this.xlArtwork(this.state.track.artwork_url)})`
    };
    return (
      <div className="scotch_music" style={scotchStyle}>
        <Search
          clientId={this.state.client_id}
          autoCompleteValue={this.state.autoCompleteValue}
          tracks={this.state.tracks}
          handleSelect={this.handleSelect.bind(this)}
          handleChange={this.handleChange.bind(this)}/>
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
