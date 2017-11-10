import React from 'react';
const Particle = require('particle-api-js');
const particle = new Particle();
import config from '../.././backend/config';

const USERNAME = config.USERNAME;
const PASSWORD = config.PASSWORD;

export default class Lights extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      lightsOn: false,
      socket: props.socket,
      particleID: '',
      particleToken: '',
      automatedLights: false,
      automatedLightsCheck: 0,
      intensity: 10000,

      maxIntensity: Number.MIN_SAFE_INTEGER,
      minIntensity: Number.MAX_SAFE_INTEGER
    };

    console.log('lights rendered,', USERNAME);
    this.getMinMaxIntensity = this.getMinMaxIntensity.bind(this);
    this.getAdjustedLightVal = this.getAdjustedLightVal.bind(this);
    this.intensityAlgorithm = this.intensityAlgorithm.bind(this);
    this.loopLights = this.loopLights.bind(this);
    this.dimLights = this.dimLights.bind(this);
  }

  componentDidMount () {
    const self = this;
    let USERNAME = null;
    let PASSWORD = null;

    clearInterval(self.state.automatedLightsCheck);

    // called only once
    this.state.socket.on('connect', () => {
      console.log('CLIENT lights connected to sockets');
      self.state.socket.emit('join', 'LIGHTS');
    });

    // get particle login info from backend
    this.state.socket.on('config', ({username, password}) => {
      USERNAME = username;
      PASSWORD = password;
      console.log('USERNAME', USERNAME, 'PASSWORD', PASSWORD);

      // particle auth
      particle.login({username: USERNAME, password: PASSWORD})
      .then(data => {
        console.log('API call completed on promise resolve: ', data.body.access_token);

        var token = data.body.access_token; // from result of particle.login
        self.setState({particleToken: token});

        return particle.listDevices({auth: token})
      })
      .then(devices => {
        console.log('Devices: ', devices);

        devices.body.map((dev, i) => {
          console.log('dev ', i, ': ', dev);

        if (dev.name.toLowerCase() === 'lil_pj' /*|| dev.name.toLowerCase() === 'happy'*/) {
          self.setState({particleID: dev.id});
          console.log('found pj!', dev);

          return particle.claimDevice({ deviceId: self.state.particleID, auth: self.state.particleToken });
        }
        });
      })

      .then(resp => {
        console.log('YO ',resp);
        if (resp == 'here') {
          console.log('did not do because lil pj not found', resp);
          return;
        }
        console.log('device claim data:', resp);
        console.log('LIL PJ HAS BEEN CLAIMED');

        //   // return particle.callFunction({ deviceId: self.state.particleID, name: 'led', argument: 'off', auth: self.state.particleToken });
        // })
        // .then(data => {
        //   console.log('final result:', data);

        self.turnOffLights();

        // .then(result => {
        //   console.log('called func turn on lights, ', result);
        // })


        })

        // BUG - TESTING PURPOSES ONLY BUG
        .then( () => {
          console.log('after turn off lights -- going to automate');
          self.automateLights(this.getMinMaxIntensity);

        })
        .then( () => {
          return new Promise((res, rej) => {
            setTimeout(() => {
              clearInterval(self.state.automatedLightsCheck);
              console.log('turned off automation');
              res(1);
            }, 30 * 1000);
          });

        })

        .then( (val) => {
          console.log('ROUND 2 after turn off lights -- going to automate');
          self.automateLights();

        })
        .then( () => {
          setTimeout(() => {
            clearInterval(self.state.automatedLightsCheck);
            console.log('turned off automation');
          }, 30 * 1000);
        })


        // BUG - END TESTING
        .catch(err => {
          console.log("ERROR", err);
        });
    });

    // listen for end of stt
    self.state.socket.on('stt_finished', respObj => {
      const cat = respObj.category.indexOf('news');
      console.log('LIGHTS BABY received stt finished', respObj, cat);
      if (respObj.params && respObj.category && respObj.category.indexOf('lights') >= 0) {
        self.processRequest(respObj);
      } else {
        console.log('invalid lights request')
      }
    });

  }

  processRequest(respObj) {
    const self = this;

    console.log('in process request');

    if (respObj.params && respObj.params.dormLights) {
      if (respObj.params.dormLights == "on") {
        self.turnOnLights();

      } else if (respObj.params.dormLights == "off") {
        self.turnOffLights();

      } else if (respObj.params.dormLights == "blink") {
        self.blinkLights();

      } else if (respObj.params.dormLights == "automate") {
        self.automateLights();

      }
    }
  }

  // particle code to blink lights
  blinkLights() {
    const self = this;
    if (self.state.automatedLights && self.state.automatedLightsCheck) {
      clearInterval(self.state.automatedLightsCheck);
    }

    particle.callFunction({ deviceId: self.state.particleID, name: 'blink', argument: 'null', auth: self.state.particleToken })
      .then(data => {
        console.log('Function called succesfully:', data);
      })
      .catch(err => {
        console.log('Encountered error:', err);
      });
  }

  // particle code to turn on lights
  turnOnLights () {
    console.log('turning on lights');
    const self = this;
    if (self.state.automatedLights && self.state.automatedLightsCheck) {
      clearInterval(self.state.automatedLightsCheck);
    }
    particle.callFunction({ deviceId: self.state.particleID, name: 'led', argument: 'on', auth: self.state.particleToken })
      .then(data => {
        console.log('Function called succesfully:', data);
        self.setState({lightsOn: true});
      })
      .catch(err => {
        console.log('Encountered error:', err);
      });
  }

  // particle code to turn off lights
  turnOffLights () {
    const self = this;
    if (self.state.automatedLights && self.state.automatedLightsCheck) {
      clearInterval(self.state.automatedLightsCheck);
    }
    particle.callFunction({ deviceId: self.state.particleID, name: 'led', argument: 'off', auth: self.state.particleToken })
      .then(data => {
        console.log('Function called succesfully:', data);
        self.setState({lightsOn: false});
      })
      .catch(err => {
        console.log('Encountered error:', err);
      });
  }

  // particle code to turn on lights to specific intensity
  turnOnLightsToValue (intensity) {
    const self = this;
    intensity = intensity + "";

    particle.callFunction({ deviceId: self.state.particleID, name: 'ledtovalue', argument: intensity, auth: self.state.particleToken })
      .then(data => {
        console.log('Function called succesfully:', data);
        self.setState({lightsOn: true, intensity });
      })
      .catch(err => {
        console.log('Encountered error:', err);
      });
  }

  // particle code to turn on specific port
  turnOnSpecificLight (port) {
    const self = this;

    particle.callFunction({ deviceId: self.state.particleID, name: 'specific', argument: port, auth: self.state.particleToken })
      .then(data => {
        console.log('Function called succesfully:', data);
        self.setState({lightsOn: true, port });
      })
      .catch(err => {
        console.log('Encountered error:', err);
      });
  }

  intensityAlgorithm (intensity) {
    if (intensity > this.state.maxIntensity - 100) {
      intensity = 0;
    } else if (intensity > this.state.maxIntensity - 200) {
      intensity = 25;
    } else {
      intensity = 55;
    }

    return intensity + '';
  }

  getParticleLightSensor () {
    const self = this;

    return new Promise(function(resolve, reject) {
      console.log('now checking for light sensor val:');
      resolve(particle.getVariable({ deviceId: self.state.particleID, name: 'analogvalue', auth: self.state.particleToken })
        .then(resp => {
          if (resp && resp.body && resp.body.result) {
            console.log('analogvalue: ', resp.body.result);
            return resp.body.result;
          } else {
            console.log('after got variable, but no val', resp);
            return null;
          }
        })
        .catch(err => {
          console.log("error in getting val:" + err);
          return null;
        }));
    });

  }

  dimLights(start, end) {
    const self = this;
    // self.turnOnLightsToValue(intensity);
    start = parseInt(start);
    end = parseInt(end);

    console.log('reached dim lights');

    const temp = setInterval(() => {
      console.log('in temp interval', start, end);
      if (Math.abs(end-start) < 5) {
        clearInterval(temp);
        console.log('clearing temp, calling automate');
        self.automateLights();
      } else {
        start = (start > end) ? start - 5 : start + 5;
        self.turnOnLightsToValue(start + '');
      }

    }, 1000);

    // clearInterval(temp);

  }

  // function that sets interval to automate lights of photon
  // interval is saved to state as automatedLightsCheck - so that it can be cancelled elsewhere
  automateLights(fn) {
    const self = this;

    let minIntensity = Number.MAX_SAFE_INTEGER;
    let maxIntensity = -1;

    let err;
    if (fn) {
      err = self.loopLights(self.getMinMaxIntensity);
    } else {
      err = self.loopLights(self.getAdjustedLightVal);
    }
    if (err == -1) {
      console.log("error in looping lights");
    }

    // self.setState({automatedLights: true});
    // const lightCheck = setInterval(() => {
    //   self.setState({automatedLightsCheck: lightCheck});
    //
    //   self.getParticleLightSensor()
    //   .then(resp => {

        // let intensity = resp;
        // console.log('intensity:', intensity);

        // if (intensity < minIntensity) {
        //   minIntensity = intensity;
        //   console.log("~~~new min: ", minIntensity);
        // } else if (intensity > maxIntensity) {
        //   maxIntensity = intensity;
        //   console.log("~~~new max: ", maxIntensity);
        // }

        // intensity = self.intensityAlgorithm(intensity);
        // console.log('received intensity:', intensity);
        //
        // if (intensity !== self.state.intensity) {
        //   // dimLights
        //   clearInterval(lightCheck);
        //   self.dimLights(self.state.intensity, intensity);
        // }
        // self.turnOnLightsToValue(intensity);

      // })
    //   .catch(err => {
    //     console.log("err :( ", err);
    //   })
    // }, 800);
  }

  getMinMaxIntensity(resp) {
    let intensity = resp;
    console.log('intensity:', intensity);
    console.log('max intensity:', this.state.maxIntensity);
    console.log('min intensity:', this.state.minIntensity);


    if (intensity < this.state.minIntensity) {
      this.setState({minIntensity: intensity});
      console.log("~~~new min: ", minIntensity);
    } else if (intensity > this.state.maxIntensity) {
      this.setState({maxIntensity: intensity});
      console.log("~~~new max: ", maxIntensity);
    }
  }

  getAdjustedLightVal(intensity) {
    console.log('intensity:', intensity);
    intensity = this.intensityAlgorithm(intensity);
    let this_intensity = intensity;
    console.log('received intensity:', intensity, this.state.intensity, intensity !== this.state.intensity);
    // this.setState({intensity: intensity});
    // this.turnOnLightsToValue(intensity + "");
    if (intensity !== this.state.intensity) {
      this.turnOnLightsToValue(intensity);

    //   // dimLights
    //   clearInterval(lightCheck);
    //   this.dimLights(this.state.intensity, intensity);
    }

    this.setState({ intensity: this_intensity });
    console.log("state intensity:", this.state.intensity);
  }

  loopLights(callback) {
    this.setState({automatedLights: true});
    const lightCheck = setInterval(() => {
      this.setState({automatedLightsCheck: lightCheck});

      this.getParticleLightSensor()
      .then(resp => {
        callback = callback.bind(this);
        callback(resp);
      })
      .catch(err => {
        return -1;
      });
    }, 1000);
  }

  render () {
    const newsStyle = {
      width: '100%',
    };
    const self = this;

    return (
      <div className="newsContainer right widget" style={newsStyle} style={{color: 'white'}}>
	     <h2 className='right uberOptions widgetTitle' style={{color: 'white'}}> LIGHTS :)</h2>

       {this.state.lightsOn &&
       <h2 className="center newsListItem"> lights are f*ing on :D:D:D </h2>}

       {!this.state.lightsOn &&
       <h2 className="center newsListItem"> lights have been turned off! </h2>}

       {/* BUG button for testing ON MAC only -- INSERT WIDGET NAME TO LISTEN TO BUG */}
       <button onClick={() => self.turnOnSpecificLight('one')}> blue </button>
       {/* BUG button for testing ON MAC only -- INSERT WIDGET NAME TO LISTEN TO BUG */}
       {/* BUG button for testing ON MAC only -- INSERT WIDGET NAME TO LISTEN TO BUG */}
       <button onClick={() => self.turnOnSpecificLight('two')}> green </button>
       {/* BUG button for testing ON MAC only -- INSERT WIDGET NAME TO LISTEN TO BUG */}
       {/* BUG button for testing ON MAC only -- INSERT WIDGET NAME TO LISTEN TO BUG */}
       <button onClick={() => self.turnOnSpecificLight('both')}> both </button>
       {/* BUG button for testing ON MAC only -- INSERT WIDGET NAME TO LISTEN TO BUG */}
     </div>
   )
 }

}
