import React from 'react';
const axios = require('axios');

class Uber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      home: '1412 Market St, San Francisco, CA 94103, US',
      destination: '1080 Folsom St, San Francisco, CA 94103, US',
      products: [],
      service: '',
      prices: [],
      request_id: 'd3eead6b-e996-4ba2-a2d5-d7149485af64',
      socket: props.socket,
      driverDetails: {
        "driver": {
        "phone_number": "690-040-1939",
        "sms_number": "",
        "rating": 5,
        "picture_url": "https://upload.wikimedia.org/wikipedia/en/1/13/Stick_figure.png",
        "name": "Bob"
        },
      "vehicle": {
        "make": "Bugatti",
        "model": "Veyron",
        "license_plate": "",
        "picture_url": "https://webnews.bg/uploads/images/40/2740/222740/640x.jpg?_=1457704132"
        },
      },
    };

    this.startListening = this.props.listen.bind(this);
    this.processContinuingRequest = this.processContinuingRequest.bind(this);
    this.processFinishedRequest = this.processFinishedRequest.bind(this);
    this.callUber = this.callUber.bind(this);
    this.cancelUber = this.cancelUber.bind(this);
  }

  componentDidMount() {
    axios.get('http://localhost:3000/current', {
      params: { request_id: this.state.request_id }
    }).then(resp => {
      console.log('NEW DEETS', resp.data)
    }).catch((err) => console.log('ERRRRROR', err))
    axios.get('http://localhost:3000/sandbox/drivers')
    .then(resp => {
      console.log('available drivers')
    })
    // GET AVAILABLE PRODUCTS
    axios.get('http://localhost:3000/products', {
      params: {
        pickup: this.state.home
      }
    })
    .then(resp => {
      this.setState({ products: resp.data });
    })

    //////////////////////////// START SOCKETS /////////////////////////////////
    const self = this;
    console.log('going to connect to socket', this.state.socket);
    self.state.socket.on('connect', function() {
      console.log("connected news");

      self.state.socket.emit('join', 'UBER');

      self.state.socket.on('stt_continuing', obj => {
        console.log('STT OBJ continuing', obj)
        self.processContinuingRequest(obj);
      })

      self.state.socket.on('stt_finished', respObj => {
        console.log('received stt finished', respObj);
        self.processFinishedRequest(respObj)
      });
    });
    ////////////////////////////// END SOCKETS /////////////////////////////////
  }

  // logic for continuing stt objects
  processContinuingRequest(obj) {
    if (obj.category === 'uber' && obj.params.uberDestination) {
      this.setDestination(obj.params.uberDestination)
    }
    if (obj.category === 'uber' && obj.params.uberService) {
      this.setState({ service: obj.params.uberService })
    }
    if (obj.category !== 'uber') {
      this.state.socket.emit('invalid_request');
    }
  }

  // logic for finished stt objects
  processFinishedRequest(obj) {
    if (obj.params.uberConfirmation === 'yes') {
      this.callUber();
      this.state.socket.emit('custom_msg', { resp: "Will do!" });
    } else if (obj.params.uberConfirmation === 'no') {
      this.cancelUber();
      this.state.socket.emit('custom_msg', { resp: "Uber cancelled" });
    }
  }

  callUber() {
    console.log('uber called');
    this.setState({ request_id: 'hi' })
    // note: no driver details in sandbox mode
    // CREATE REQUEST
    axios.post('http://localhost:3000/request', {
      home: this.state.home,
      destination: this.state.destination
    })
    .then(function(resp) {
      console.log('RIDE REQUEST RESPONSE', resp.data)
      const thisProduct = this.state.products.filter(car => (car.display_name === this.state.service))
      this.setState({ products: thisProduct, request_id: resp.data.request_id, driverDetails: {
        driver: {
          "phone_number": "(415)555-1212",
          "sms_number": "(415)555-1212",
          "rating": 5,
          "picture_url": "https://upload.wikimedia.org/wikipedia/en/1/13/Stick_figure.png",
          "name": "Bob"
        },
        vehicle: {
          "make": "Bugatti",
          "model": "Veyron",
          "license_plate": "I<3Uber",
          "picture_url": "https://webnews.bg/uploads/images/40/2740/222740/640x.jpg?_=1457704132"
        },
      }
      });
    })
    .catch(function(err) {
      console.log('something fucked up lol', err)
    });
  }

  cancelUber() {
    console.log('uber cancelled');
    // DELETE REQUEST BY ID
    this.state.socket.emit('custom_msg', {resp: 'Okay, I will cancel your Uber'});
    axios.get('http://localhost:3000/delete', {
      params: {
        request_id: this.state.request_id
      }
    })
    .then(function(resp) {
      console.log(resp)
      this.setDestination('')
      this.setState({ service: '', request_id: '', prices: [] });
    });
  }

  setDestination(destination) {
    this.setState({ destination });
    console.log("DESTINATION WAS SET IN STATE")
    // GET PRICE ESTIMATE FOR EACH PRODUCT
    axios.get('http://localhost:3000/price', {
      params: {
        pickup: this.state.home,
        destination: this.state.destination
      }
    })
    .then(resp => {
      console.log('price estimate', resp.data.prices)
      this.setState({ prices: resp.data.prices })
    });
  }

  render() {
    return (
      <div className="uberDiv">
      <div className="uberOptions">
      {!this.state.request_id &&
      <div>
      <img src="http://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-uberx.png"></img>
      {this.state.products
        .filter(car => (car.display_name === "POOL" || car.display_name === "uberX" || car.display_name === "uberXL"))
        .sort((a, b) => (a.capacity - b.capacity))
        .map((car, i) => {
        return <div key={i} style={{color:"white"}}>
          {car.display_name}, {car.capacity} {car.capacity === 1 ? "seat" : "seats"}
          <div>
            {this.state.prices.filter(price => (price.display_name === car.display_name))
              .map(thisPrice => {return thisPrice.estimate})[0]}
          </div>
          </div>
        })}
      </div>}

        {this.state.request_id &&
          <div>
          <img src={this.state.driverDetails.driver.picture_url} style={{height:70, width:60, borderRadius:3, margin:5}}></img>
          <img src={this.state.driverDetails.vehicle.picture_url} style={{height:70, width:100, borderRadius:3, margin:5,}}></img>
          <div> Your Uber is arriving soon!  </div>
          <div>
            Be on the lookout for {this.state.driverDetails.driver.name} in a {this.state.driverDetails.vehicle.make} {this.state.driverDetails.vehicle.model} </div>
          <div> Rating: {this.state.driverDetails.driver.rating}/5 </div>
        </div>
          }
        </div>
      </div>
    )
  }
}

export default Uber;
