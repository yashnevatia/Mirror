
import React from 'react';
import axios from 'axios';

import { getCurrentWeather, getForecastWeather } from '../helperFunctions/getWeather.js';
import weatherIcon from '../helperFunctions/weatherIcon.js';

import config from '../.././backend/config/personalConfig.js';
const WEATHER_API = config.WEATHER_API_ID || '';


class Forecast extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      dates: [],
      ready: false,

      /* TODO FIND YOUR CITY ID FROM city.list.json FROM http://bulk.openweathermap.org/sample/ TODO */
      /* eg: this id is for Las Vegas, NV */
      cityId: '5506956',
    };
  }

  getDay (date) {
    const dayNum = date.getDay();
    if (dayNum === 0) {
      // return 'Sunday';
      return 'SUN';
    } else if (dayNum === 1) {
      // return 'Monday';
      return 'MON';

    } else if (dayNum === 2) {
      // return 'Tuesday';
      return 'TUES';

    } else if (dayNum === 3) {
      // return 'Wednesday';
      return 'WED';

    } else if (dayNum === 4) {
      // return 'Thursday';
      return 'THURS';

    } else if (dayNum === 5) {
      // return 'Friday';
      return 'FRI ';

    } else {
      // return 'Saturday';
      return 'SAT';

    }
  }

  componentDidMount () {
    console.log('testing weather forecast');
    getForecastWeather(this.state.cityId, WEATHER_API)
    .then( resp => {
      console.log('response to weather forecast', resp);
      console.log('resp list', resp.data.list);
      this.setState({ready: false});
      // let dates = [];
      resp.data.list.map(itm => {
        if (this.state.dates.length && this.state.dates.length >= 4 && this.state.dates[3].night) {
          return;
        }

        const dt = new Date(itm.dt_txt);
        const hrs = dt.getHours();
        if (hrs === 9 ) {
          const newDate = {
            date: dt,
            morn: { temp: itm.main.temp, descrip: itm.weather[0].main,
                    wind: itm.wind.speed, humidity: itm.main.humidity }
          };
          this.setState({dates: [...this.state.dates, newDate]});
          console.log('added morning date', newDate, this.state.dates);
        } else if (hrs === 18) {
          if (!this.state.dates.length) {
            return;
          }
          let changeDate = this.state.dates[this.state.dates.length-1];
          changeDate.night = { temp: itm.main.temp, descrip: itm.weather[0].main,
                               wind: itm.wind.speed, humidity: itm.main.humidity }
          let newDates = this.state.dates.slice(0, this.state.dates.length-1);
          newDates.push(changeDate);

          this.setState({dates: newDates});
          console.log('added night date', changeDate, this.state.dates)
        } else if (hrs === 12) {
          if (!this.state.dates.length) {
            return;
          }
          console.log('TWELVE');
          let changeDate = this.state.dates[this.state.dates.length-1];
          changeDate.icon = itm.weather[0].icon;

          let newDates = this.state.dates.slice(0, this.state.dates.length-1);
          newDates.push(changeDate);

          this.setState({dates: newDates});
          console.log('added day icon', changeDate, this.state.dates)
        }
      })
    })
    .then(() => {
      console.log('DATES', this.state.dates);
      this.setState({ready: true})
    })
    .catch( err => {
      console.log('errorr ', err);
    })

      // if (this.state.dates.length > 4) {
      //   this.setState({dates: this.state.dates(0,3)});
      // }



  }

  render () {
    return (
      <div id="forecastContainer" className='widget'>
        <h2 className='widgetTitle'> Forecast</h2>
          {/* on {this.state.days[0].}˚F */}
        <div id='days' style={{color: 'white'}}>
          {this.state.ready && this.state.dates.map(day => {
            console.log('day', day, '\n m', day.morn, '\n n', day.night);

            const dt = this.getDay(day.date);

            const winds = (day.morn.wind > day.night.wind) ?
              day.night.wind + '-' + day.morn.wind + ' mph' :
              day.morn.wind + '-' + day.night.wind + ' mph' ;

            const humid = (day.morn.humidity > day.night.humidity) ?
              day.night.humidity + '% to ' + day.morn.humidity + '%' :
              day.morn.humidity + '% to ' + day.night.humidity + '%' ;

            const descrip = (day.morn.descrip === day.night.descrip ) ?
              day.morn.descrip : day.morn.descrip+' then '+day.night.descrip;

            const dayScript1 = day.morn.temp+'˚ F | '+day.night.temp+'˚ F';
            const dayScript2 = descrip;
            const dayScript3 = 'h: '+humid+' w: '+winds;

            return (
              <div key={dt} className='forecast_day'>
                <div className='forecast_part'>{dt}</div>
                <br/>
                <div className='forecast_part'> {day.morn.temp} ˚ F | {day.night.temp} ˚ F</div>
                <br/>

                <img className='forecast_part' src={weatherIcon(day.icon)} height="50" width="50"></img>
                <div className='forecast_part flex_center'>{dayScript2}</div>
                <div className='forecast_part'>{dayScript3}</div>
              </div>
            )
          })}
        </div>

      </div>
    )
  }
}

export default Forecast;
