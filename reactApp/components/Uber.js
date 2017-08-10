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

    // this.startListening = this.props.listen.bind(this);
  }
  componentDidMount() {
    ////////////////////////////START SOCKETS
    const self = this;
    console.log('going to connect to socket', this.state.socket);
    this.state.socket.on('connect', function() {
      console.log("connected news");

      self.state.socket.emit('join', 'UBER');

      self.state.socket.on('stt_continuing', obj => {
        console.log('STT OBJ continuing', obj)
      })
      //result.parameters.uberDestination


      self.state.socket.on('stt_finished', respObj => {
        console.log('received stt finished', respObj);

        // self.processRequest(respObj);
      });
    });
    //////////////////////////////END SOCKETS

    //GET AVAILABLE PRODUCTS
    axios.get('http://localhost:3000/products', {
      params: {
        pickup: this.state.home
      }
    })
    .then(resp => {
      this.setState({ products: resp.data });
      console.log('IMAGES', this.state.products)
    })

    //GET CURRENT RIDE
    // axios.get('http://localhost:3000/current')
    // .then(resp => {
    //   console.log('current ride', resp)
    // })

    //UPDATE DESTINATION
    // axios.get('http://localhost:3000/modify', {
    //   params: {
    //     updatedDestination: //your updated destination
    //   }
    // })
    // .then(resp => {
    //   console.log('modified ride', resp)
    // })
  }

  processRequest(obj) {
    const self = this;
    if (obj.category === 'uber') {
      self.setDestination(obj.parameters.uberDestination)
      .then(() => {
        console.log('UBER UBER UBER DESTINATION')
        self.startListening('UBER');
      })
      .catch(err => {
        console.log('ERROR', err);
      })
    } else if (obj.category === 'uber - yes') {
      //more logic
    }
  }

  setDestination(destination) {
    this.setState({ destination });
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

    //GET ESTIMATES FOR CURRENT RIDE
    axios.get('http://localhost:3000/estimate', {
      params: {
        product_id: this.state.productId.POOL,
        pickup: this.state.home,
        destination: this.state.destination,
      }
    }).then(resp => {
      console.log('general estimates', resp.data)
    })
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
