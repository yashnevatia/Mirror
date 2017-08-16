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
      request_id: '0c2efbd9-4c9e-4bc7-b320-a9e59112930e',
      socket: props.socket
    };

    //this.startListening = this.props.listen.bind(this);
    this.processContinuingRequest = this.processContinuingRequest.bind(this);
    this.processFinishedRequest = this.processFinishedRequest.bind(this);
    this.callUber = this.callUber.bind(this);
    this.cancelUber = this.cancelUber.bind(this);
  }

  componentDidMount() {
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
    // if (obj.category === 'uber' && obj.notFinished) {
    //   this.startListening('UBER')
    // }
    // if (obj.category.startsWith('smalltalk') {
    //   this.startListening('UBER')
    // }
    if (obj.category !== 'uber') {
      this.state.socket.emit('invalid_request');
    }
  }

  // logic for finished stt objects
  processFinishedRequest(obj) {
    this.state.socket.emit('custom_msg', { resp: obj.response });
    if (obj.params.uberConfirmation === 'yes') {
      this.callUber();
    } else if (obj.params.uberConfirmation === 'no') {
      this.cancelUber();
    }
  }

  callUber() {
    console.log('uber called')
    // note: no driver details in sandbox mode
    // CREATE REQUEST
    axios.post('http://localhost:3000/request')
    .then(function(resp) {
      console.log('RIDE REQUEST RESPONSE', resp.data)
      this.setState({ request_id: resp.data.request_id, eta: resp.data.eta })
    })
    .catch(function(err) {
      console.log('something fucked up lol', err)
    });
  }

//   axios.post('http://localhost:3000/request')
//   .then(function(resp) {
//     console.log('RIDE REQUEST RESPONSE', resp.data)
//     this.setState({ request_id: resp.data.request_id })
//     // SET RIDE STATUS TO ACCEPTED
//     axios.put('http://localhost:3000/sandbox/status', {
//       params: {
//         'request_id': this.state.request_id,
//         'status': accepted,
//       }
//     }).then(resp => {
//         this.setState({ interval: setInterval(() => {
//           // GET RIDE REQUEST DETAILS
//           // note: no driver details in sandbox mode
//           axios.get('http://localhost:3000/request', {
//             params: {
//               'request_id': this.state.request_id,
//             }
//           })
//           .then(function(resp) {
//             console.log('UPDATED RIDE REQUEST RESPONSE', resp.data)
//             this.setState({ eta: resp.data.eta })
//           })
//           .catch(function(err) {
//             console.log('something fucked up even more', err)
//           });
//         }, 10*1000)
//       });
//     });
//   })
//   .catch(function(err) {
//     console.log('something fucked up lol', err)
//   })
// }

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
      this.setState({ service: '', request_id: '' });
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
      <div className="uberOptions" >
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
          })
        }
      </div>
    </div>
    )
  }
}

export default Uber;
