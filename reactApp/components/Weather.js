import React from 'react';
import axios from 'axios';
import weatherIcon from '../helperFunctions/weatherIcon.js';
import { getCurrentWeather, getForecastWeather } from '../helperFunctions/getWeather.js';

/* TODO GET API KEY FROM http://openweathermap.org/appid & STORE IN personalConfig.js TODO */
import config from '../.././backend/config/personalConfig.js';
const WEATHER_API = config.WEATHER_API_ID || '';

class Weather extends React.Component {
  constructor() {
    super();
    this.state = {
      interval: () => '',

      /* TODO FIND CITY ID FROM city.list.json FROM http://bulk.openweathermap.org/sample/ TODO */
      /* eg: this id is for Las Vegas, NV */
      // cityId: '5506956'
      /* eg: this id is for New Haven, CT */
      cityId: '4839373'

    };
    // bind function to get weather to Weather component
    // this.getWeather = getCurrentWeather.bind(this);
    this.getWeather = this.getWeather.bind(this);

  }

  componentDidMount() {
    const self=this;
    // set weather at component mount
    self.getWeather(this.state.cityId, WEATHER_API);

    // update weather every two minutes
    self.setState({ interval: setInterval(() => {
        self.getWeather(this.state.cityId, WEATHER_API)
      }, 60000 * 2)
    });

  }

  componentWillUnmount() {
    clearInterval(this.state.interval);
    console.log('clearing');
  }

  getWeather () {
    getCurrentWeather(this.state.cityId, WEATHER_API)
    .then(resp => {
      this.setState({
        description: resp.data.weather[0].description,
        min: resp.data.main.temp_min,
        max: resp.data.main.temp_max,
        current: (resp.data.main.temp).toFixed(0),
        icon: resp.data.weather[0].icon
      });
    });
  }

  render() {
    const icon = weatherIcon(this.state.icon);

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
    );
  }
}

export default Weather;




// getWeather () {
//   let link = 'http://api.openweathermap.org/data/2.5/weather?';
//   link += `id=${this.state.cityId}`;  // id for city for which you want weather
//   link += '&units=imperial';          // comment out for Celsius; leave here for Fahrenheit
//   link += `&APPID=${WEATHER_API}`;    // personal weather api key
//
//   axios.get(link)
//   .then(resp => {
//     this.setState({
//       description: resp.data.weather[0].description,
//       min: resp.data.main.temp_min,
//       max: resp.data.main.temp_max,
//       current: (resp.data.main.temp).toFixed(0),
//       icon: resp.data.weather[0].icon
//     });
//   });
// }
