import React from 'react';
import axios from 'axios';
import weatherIcon from '../helperFunctions/weatherIcon.js';
class Weather extends React.Component {
  constructor() {
    super();
    this.state = {
      interval: () => '',
      forecast: [],
      city: 'SanFrancisco'
    };

    this.getWeather = this.getWeather.bind(this);
  }

  componentDidMount() {
    const self=this;
    // set weather at component mount
    self.getWeather();
    self.getForecast();
    //update weather every two minutes
    self.setState({ interval: setInterval(() => {
      self.getWeather()
    }, 60000 * 2)
  });
}

componentWillUnmount() {
  clearInterval(this.state.interval);
  console.log('clearing');
}

getWeather () {
  axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${this.state.city}&units=imperial&APPID=09f1cb63107ddcebcf4b07eca5d86cc0`)
  .then(resp => {
    this.setState({
      description: resp.data.weather[0].description,
      min: resp.data.main.temp_min,
      max: resp.data.main.temp_max,
      current: (resp.data.main.temp).toFixed(0),
      icon: resp.data.weather[0].icon
    });
    // console.log(this.state.icon);
  });
}

getForecast () {
  axios.get(`http://samples.openweathermap.org/data/2.5/forecast?q=${this.state.city},us&APPID=09f1cb63107ddcebcf4b07eca5d86cc0`)
  .then(resp => {
    const fiveDay = resp.data.list.filter(elt => (elt.dt_text.split(' ')[1] === '12:00:00'))
    this.setState({ forecast: fiveDay })
    console.log('FORECAST', this.state.forecast)
  })
}

render() {
  const icon = weatherIcon(this.state.icon);
  // console.log('ICON', icon);
  return (
    <div className={this.props.weatherState ? 'isActiveWeather' : 'isStandbyWeather'}>
      <img src={icon} height="75" width="75"></img>
      <div className={this.props.weatherState ? 'isActiveC' : 'null'}>
        <div className={this.props.weatherState ? 'isActiveCurrent' : 'current'}>
          currently {this.state.current}˚F
        </div>
        <div className={this.props.weatherState ? 'isActiveDescription' : 'description'}>
          {this.state.description}
        </div>
        <div className={this.props.weatherState ? 'isActiveMinMax' : 'min-max'}>
          {this.state.min}˚F  |  {this.state.max}˚F
        </div>
      </div>
    </div>
    {/*heyyyyyyyo*/}
    <div className={this.props.weatherState ? 'isActiveWeather' : 'isStandbyWeather'}>
      <img src={icon} height="75" width="75"></img>
      <div className={this.props.weatherState ? 'isActiveC' : 'null'}>
        <div className={this.props.weatherState ? 'isActiveCurrent' : 'current'}>
          currently {this.state.current}˚F
        </div>
        <div className={this.props.weatherState ? 'isActiveDescription' : 'description'}>
          {this.state.description}
        </div>
      </div>
    </div>
  );
}
}
export default Weather;
