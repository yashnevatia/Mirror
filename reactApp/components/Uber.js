import React from 'react';
const axios = require('axios');

class Uber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      home: '1412 Market St, San Francisco, CA 94103, US',
      destination: '',
      products: [],
      service: '',
      prices: [],
      request_id: '',
      driverComing: false,
      socket: props.socket,
      driverDetails: {},
    };

    this.processContinuingRequest = this.processContinuingRequest.bind(this);
    this.processFinishedRequest = this.processFinishedRequest.bind(this);
    this.callUber = this.callUber.bind(this);
    this.cancelUber = this.cancelUber.bind(this);
    this.setState = this.setState.bind(this);
  }

  componentDidMount() {

    // axios.put('http://localhost:3000/sandbox/status', {
    //     request_id: '1c997855-e826-46b9-b8e8-268a9c6919f5',
    //     status: 'driver_canceled',
    //   }).then(resp => console.log('CANCELED', resp))

    // axios.get('http://localhost:3000/current1').then(resp => {
    //   console.log('CURRENT UBER REQUEST ID', resp.data.request_id);
    // });

    // GET AVAILABLE PRODUCTS
    axios.get('http://localhost:3000/products', {
      params: {
        pickup: this.state.home
      }
    })
    .then(resp => {
      this.setState({ products: resp.data });
    })

    //////////////////////////// START SOCKETS ///////////////////////////////// don't touch this works
    const self = this;
    console.log('going to connect to socket', self.state.socket);
    // self.state.socket.on('connect', function() {
    console.log("connected news");

    self.state.socket.emit('join', 'UBER');

    self.state.socket.on('stt_continuing', obj => {
      console.log('STT OBJ continuing', obj)
      self.processContinuingRequest(obj);
    })

    self.state.socket.on('stt_finished', respObj => {
      console.log('received stt finished', respObj);
      if(respObj.category === 'uber')self.processFinishedRequest(respObj)
      else console.log("invalid request");
    });
    // });
    ////////////////////////////// END SOCKETS /////////////////////////////////
  }

  // logic for continuing stt objects
  processContinuingRequest(obj) {
    if (obj.category === 'uber' && obj.params.uberDestination) {
      this.setDestination(obj.params.uberDestination)
    }
    if (obj.category === 'uber' && obj.params.uberService) {
      this.setState({ service: obj.params.uberService });
      console.log(obj.params.uberService)
      console.log('products', this.state.products)
      const thisProduct = this.state.products.filter(car => (car.display_name === obj.params.uberService))
      console.log(thisProduct)
      this.setState({ products: thisProduct });
      console.log('UPDATED PRODUCT', this.state.product);
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
    const self = this
    console.log('CALLING UBER');
    // note: no driver details in sandbox mode
    // CREATE REQUEST
    axios.post('http://localhost:3000/request', {
      product_id: this.state.products.product_id,
      home: this.state.home,
      destination: this.state.destination,
    })
    .then((resp) => {
      console.log('RIDE REQUEST RESPONSE', resp.data);
      self.setState({ request_id: resp.data.request_id });
      // SET REQUEST STATUS TO ACCEPTED
      return axios.put('http://localhost:3000/sandbox/status', {
        request_id: self.state.request_id,
        status: 'accepted',
      });
    }).then((respAccepted) => {
      console.log('ACCEPTED RESPONSE', respAccepted)
      // EMIT 'ACCEPTED' MESSAGE
      self.state.socket.emit('custom_msg', { resp: respAccepted.data });
      // PAUSE FOR 5 SECONDS WHILE MESSAGE SHOWS
      return self.sleep(3000);
    }).then(() => {1
      // CHECK REQUEST DETAILS & GET ETA
      return axios.get('http://localhost:3000/current', {
        params: { request_id: self.state.request_id }
      });
    }).then((respETA) => {
      console.log('ETA RESPONSE', respETA.data.eta);
      // SET ETA IN STATE
      self.setState({ eta: respETA.data.eta });
      // SET REQUEST STATUS TO ARRIVING
      return axios.put('http://localhost:3000/sandbox/status', {
        request_id: self.state.request_id,
        status: 'arriving',
      });
    }).then((respArriving) => {
      console.log('ARRIVING RESPONSE', respArriving);
      // EMIT 'ARRIVING' MESSAGE
      self.state.socket.emit('custom_msg', {resp: respArriving.data });
      // PAUSE FOR 5 SECONDS WHILE MESSAGE SHOWS
      return self.sleep(3000);
    }).then(() => {
      // GET FINAL RESPONSE & DRIVER DETAILS
      return axios.get('http://localhost:3000/current', {
        params: { request_id: self.state.request_id }
      });
    }).then((respDriverDetails) => {
      console.log('WE MADE IT TO THE END!! SUCCESS!!!', respDriverDetails)
      self.setState({ driverComing: true, driverDetails: respDriverDetails.data })
      return self.sleep(5000);
    })
    .then(() => {
      return self.clearUber();
    })
    .catch((err) => {
    console.log('something fucked up lol', err)
    });
  }


sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

clearUber() {
  const self = this;
  console.log('CLEARING')
  axios.put('http://localhost:3000/sandbox/status', {
    request_id: self.state.request_id,
    status: 'driver_canceled',
  }).then(resp => {
    console.log('REQUEST CANCELED', resp)
    return axios.get('http://localhost:3000/products', {
      params: {
        pickup: self.state.home
      }
    });
  }).then(resetProducts => {
    self.state.socket.emit('custom_msg', {resp: ' ' });
    self.setState({ products: resetProducts.data, driverComing: false, service: '', request_id: '', prices: [] });
    self.setDestination('')
  });
}

cancelUber() {
  const self = this
  console.log('uber cancelled');
  // DELETE REQUEST BY ID
  // this.state.socket.emit('custom_msg', {resp: 'Okay, I will cancel your Uber'});
  axios.get('http://localhost:3000/delete', {
    params: {
      request_id: self.state.request_id
    }
  }).then((resp) => {
    console.log('DELETE RESPONSE', resp)
    self.setDestination('')
    self.setState({ driverComing: false, service: '', request_id: '', prices: [] });
  }).then(() => {
    return axios.get('http://localhost:3000/products', {
      params: {
        pickup: self.state.home
      }
    })
  }).then(resetProducts => {
    self.setState({ products: resetProducts.data });
  });
}

setDestination(destination) {
  this.setState({ destination });
  console.log("DESTINATION WAS SET IN STATE", this.state.destination);
  // GET PRICE ESTIMATE FOR EACH PRODUCT
  axios.get('http://localhost:3000/price', {
    params: {
      pickup: this.state.home,
      destination: this.state.destination
    }
  })
  .then(resp => {
    this.setState({ prices: resp.data.prices })
    console.log('price estimate', this.state.prices)
  });
}

render() {
  return (
    <div className="uberDiv right">
      <div className="uberOptions">
        {!this.state.driverComing &&
          <div>
            <img src="https://img.ibxk.com.br///2016/12/16/16151324258090-t1200x480.jpg" style={{height: 70}}></img>
            {this.state.products
              .filter(car => (car.display_name === "POOL" || car.display_name === "uberX" || car.display_name === "uberXL"))
              .sort((a, b) => (a.capacity - b.capacity))
              .map((car, i) => {
                return <div key={i} className='uberType' style={{marginBottom:15, marginRight:30, color:'white'}}>
                  {car.display_name}, {car.capacity} {car.capacity === 1 ? "seat" : "seats"}
                  <div>
                    {this.state.prices.filter(price => (price.display_name === car.display_name))
                      .map(thisPrice => {return thisPrice.estimate})[0]}
                  </div>
                </div>
            })}
          </div>}

          {this.state.driverComing &&
            <div className='uberText'>
              <img src={this.state.driverDetails.driver.picture_url} style={{height:90, width:111, borderRadius:3, margin:10}}></img>
              <img src={this.state.driverDetails.vehicle.picture_url} style={{height:90, width:200, borderRadius:3, marginBottom:10, marginRight:30}}></img>
              <div style={{marginBottom:15, marginRight:30, color:'white'}}>
                Look for {this.state.driverDetails.driver.name} in a {this.state.driverDetails.vehicle.make} {this.state.driverDetails.vehicle.model}! </div>
                <div style={{marginBottom:15, marginRight:30, color:'white'}}>
                Rating: {this.state.driverDetails.driver.rating}/5
                </div>
            </div>
          }
        </div>
      </div>
    )
  }
}

export default Uber;
