import React from 'react';
import SpotifyPlayer from 'react-spotify-player';

class Spotify extends React.Component{
  constructor(props){
    super(props);

  }

  render(){
    return(
      <iframe
        src="https://open.spotify.com/embed?uri=spotify:user:spotify:playlist:3rgsDhGHZxZ9sB9DQWQfuf"
        width="300"
        height="380"
        frameborder="0"
        allowtransparency="true">
      </iframe>
    )
  }
}

export default Spotify;
