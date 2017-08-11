import React from 'react';
import axios from 'axios';

class SpotifyPlayer extends React.Component{

  constructor(props){
    console.log("reached spotify");
    super(props);
    this.state = {
      songName : "congratulations",
      accessToken : "",
      refreshToken : "AQAqVj-OUFmdlh_3TfEuqFcZcMv-2R1vXhMcsPlFqun8l2TdBKAKcmX6oZqpnbP-5PRQV7J6rpU45FuNn9BdTOWNRU_7cXXTu_YX6-rExeeGU_8_rGN67VSRHgbc7DKvRLk",
      socket: props.socket
    }
    //this.startListening = this.props.listen.bind(this);

  }

  componentDidMount(){
	  console.log("component did mount");
    var self = this;
    self.state.socket.on('connect', () => {
      console.log('CLIENT spotify connected to sockets');
      self.state.socket.emit('join', 'SPOTIFY');
      //socket.emit('getToken', self.state.refreshToken);
      //self.startListening('SPOTIFY');
    });
	self.state.socket.emit('getToken', self.state.refreshToken);
    // self.state.socket.on('stt_finished', respObj => {
    //   console.log('received stt finished', respObj);
    //   self.processRequest(respObj);
    // });

    self.state.socket.on('setNewAccessToken', token => {
      console.log("accesstoken was received", token);
      self.setState({
        accessToken: token
      }, function(){
        axios({
          method:'get',
          url: `https://api.spotify.com/v1/search?q=congratulations&type=track&market=US`,
          headers: {
            'Authorization': 'Bearer ' + self.state.accessToken,
            'Content-Type': "application/json"
          },
          success: function(data){
            var songURI = data.items[0].album.artists[0].uri;
            console.log(songURI);
            axios({
              method:'put',
              url: 'https://api.spotify.com/v1/me/player/play',
              headers: {
                'Authorization': 'Bearer ' + self.state.accessToken,
                'Content-Type': "application/json"
              },
              data: JSON.stringify({
                "uris": [songURI]
              }),
              dataType: "JSON",
              success: function(data){
                console.log("song successfully changed");
              }
            })
          }
        })
      })
    })
  }

  processRequest(respObj){
    var self = this;
    if(respObj.song){
      axios({
        method:'get',
        url: `https://api.spotify.com/v1/search?q=${respObj.song}&type=track&market=US`,
        headers: {
          'Authorization': 'Bearer ' + self.state.accessToken,
          'Content-Type': "application/json"
        },
        success: function(data){
          var songURI = data.items[0].album.artists[0].uri;
          console.log(songURI);
          axios({
            method:'put',
            url: 'https://api.spotify.com/v1/me/player/play',
            headers: {
              'Authorization': 'Bearer ' + self.state.accessToken,
              'Content-Type': "application/json"
            },
            data: JSON.stringify({
              "uris": [songURI]
            }),
            dataType: "JSON",
            success: function(data){
              console.log("song successfully changed");
            }
          })
        }
      })
    }
  }

  render(){
    return(
      <div style={{color:"white"}}>Spotify: {this.state.songName}</div>
    )
  }
}

export default SpotifyPlayer;
