import React from 'react';
const axios = require('axios');

class Uber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      home: '1412 Market St, San Francisco, CA 94103, US',
      destination: '1080 Folsom St, San Francisco, CA 94103, US',
      products: [],
      prices: [],
      estimates: [],
      socket: props.socket
    };

    this.startListening = this.props.listen.bind(this);
    this.processRequest = this.processRequest.bind(this);
  }
  componentDidMount() {
    //GET AVAILABLE PRODUCTS
    axios.get('http://localhost:3000/products', {
      params: {
        pickup: this.state.home
      }
    })
    .then(resp => {
      this.setState({ products: resp.data });
    })
    ////////////////////////////START SOCKETS
    const self = this;
    console.log('going to connect to socket', this.state.socket);
    this.state.socket.on('connect', function() {
      console.log("connected news");

      self.state.socket.emit('join', 'UBER');

      self.state.socket.on('stt_continuing', obj => {
        console.log('STT OBJ continuing', obj)
        self.processRequest(obj);
      })

      self.state.socket.on('stt_finished', respObj => {
        console.log('received stt finished', respObj);
        self.processRequest(respObj)
      });
    });

    //////////////////////////////END SOCKETS

    // starts listening!!
    this.startListening('UBER')
  }

  processRequest(obj) {
    const self = this;
    if (obj.category === 'uber' && obj.params.uberDestination && obj.notFinished) {
      self.setDestination(obj.params.uberDestination)
    }
    // else if (obj.category === 'uber - yes') {
    //   self.callUber();
    // } else if (obj.category === 'uber - no') {
    //   self.cancelUber();
    // }
    else if (obj.params && obj.params.uberConfirmation && obj.params.uberConfirmation === 'no') {
      self.state.socket.emit('custom_msg', {resp: 'Okay, I will cancel your Uber'});
      self.setState({destination: '', prices: []});
    }
    else if (obj.category.startsWith('smalltalk') || (obj.category === 'uber' && obj.notFinished)) {
      self.startListening('UBER')
    } else {
      self.state.socket.emit('invalid_request');
    }
  }

  callUber() {
    console.log('uber called')
  }

  cancelUber(){
    console.log('uber cancelled');
  }

  setDestination(destination) {
    this.setState({ destination });
    console.log("DESTINATION WAS SET IN STATE")
    //GET PRICE ESTIMATE FOR PRODUCTS
    axios.get('http://localhost:3000/price', {
      params: {
        pickup: this.state.home,
        destination: this.state.destination
      }
    }).then(resp => {
      console.log('price estimate', resp.data.prices)
      this.setState({ prices: resp.data.prices })
    })
    // //GET ESTIMATES FOR CURRENT RIDE
    // axios.get('http://localhost:3000/estimate', {
    //   params: {
    //     product_id: this.state.productId.POOL,
    //     pickup: this.state.home,
    //     destination: this.state.destination,
    //   }
    // }).then(resp => {
    //   console.log('general estimates', resp.data)
    // })
  }

  render() {
    return (
      <div>
      <img src="http://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-uberx.png"></img>
      <div className="uberOptions">
      {this.state.products
        .filter(car => (car.display_name === "POOL" || car.display_name === "uberX" || car.display_name === "uberXL"))
        .sort((a, b) => (a.capacity - b.capacity))
        .map(car => {
        return <div style={{color:"white"}}>
          {car.display_name}, {car.capacity} {car.capacity === 1 ? "seat" : "seats"}
          <div>
            {this.state.prices.filter(price => (price.display_name === car.display_name))
              .map(thisPrice => { return thisPrice.estimate })[0]
            }
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
