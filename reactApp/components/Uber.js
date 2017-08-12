// import React from 'react';
// const axios = require('axios');
//
// class Uber extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       home: '1412 Market St, San Francisco, CA 94103, US',
//       destination: '',
//       service: 'POOL',
//       request_id: '',
//       products: [],
//       prices: [],
//       estimates: [],
//       socket: props.socket,
//     };
//
//     this.startListening = this.props.listen.bind(this);
//     this.processRequest = this.processRequest.bind(this);
//     this.callUber = this.callUber.bind(this);
//     this.setDestination = this.setDestination.bind(this);
//   }
//   componentDidMount() {
//     //  GET AVAILABLE PRODUCTS
//     axios.get('http://localhost:3000/products', {
//       params: {
//         pickup: this.state.home
//       }
//     })
//     .then(resp => {
//       this.setState({ products: resp.data });
//     })
//
//     ////////////////////////////START SOCKETS/////////
//     const self = this;
//     console.log('going to connect to socket', this.state.socket);
//     this.state.socket.on('connect', function() {
//       console.log("connected uber");
//
//       self.state.socket.emit('join', 'UBER');
//
//       self.state.socket.on('stt_continuing', obj => {
//         console.log('STT OBJ continuing', obj)
//         self.processRequest(obj);
//       })
//
//       self.state.socket.on('stt_finished', respObj => {
//         console.log('received stt finished', respObj);
//         self.processFinishedRequest(respObj)
//       });
//     });
//
//     //////////////////////////////END SOCKETS/////////
//   }
//
//   processRequest(obj) {
//     const self = this;
//     if (obj.category === 'uber' && obj.params.uberDestination) {
//       self.setDestination(obj.params.uberDestination)
//     }
//     if (obj.category === 'uber' && obj.params.uberService) {
//       this.setState({ service: obj.params.uberService })
//     }
//   }
//
//   processFinishedRequest(obj) {
//     const self = this;
//     if(obj.params.uberConfirmation === 'yes') {
//       self.callUber()
//     } else {
//       self.cancelUber()
//       self.state.socket.emit('custom_msg', {resp: 'Okay, I will cancel your Uber'});
//       self.setState({destination: '', prices: [], request_id: ''});
//     }
//   }
//
//   callUber() {
//     console.log('home', this.state.home);
//     console.log('destination', this.state.destination);
//     axios.get('http://localhost:3000/request', {
//       params: {
//         pickup: this.state.home,
//         destination: this.state.destination,
//       }
//     })
//     .then(function(resp) {
//       console.log('uber called RESP:', resp);
//       this.setState({ request_id: resp.data.request_id })
//     })
//   }
//
//   cancelUber(){
//     axios.get('http://localhost:3000/delete', {
//       params: {
//         request_id: this.state.request_id
//       }
//     })
//     .then(function(resp){
//       console.log('uber deleted RESP:', resp);
//     })
//   }
//
//   setDestination(destination) {
//     this.setState({ destination });
//     console.log("DESTINATION WAS SET IN STATE")
//     //GET PRICE ESTIMATE FOR PRODUCTS
//     axios.get('http://localhost:3000/price', {
//       params: {
//         pickup: this.state.home,
//         destination: this.state.destination
//       }
//     }).then(resp => {
//       console.log('price estimate', resp.data.prices)
//       this.setState({ prices: resp.data.prices })
//     })
//   }
//
// // here, if this.state.service => show this.state.service only
//   render() {
//     return (
//       <div>
//       <img src="http://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-uberx.png"></img>
//       <div className="uberOptions">
//       {this.state.products
//         .filter(car => (car.display_name === "POOL" || car.display_name === "uberX" || car.display_name === "uberXL"))
//         .sort((a, b) => (a.capacity - b.capacity))
//         .map((car, i) => {
//         return <div key={i} style={{color:"white"}}>
//           {car.display_name}, {car.capacity} {car.capacity === 1 ? "seat" : "seats"}
//           <div>
//             {this.state.prices.filter(price => (price.display_name === car.display_name))
//               .map(thisPrice => { return thisPrice.estimate })[0]}
//           </div>
//           </div>
//           })
//         }
//       </div>
//     </div>
//     )
//   }
// }
//
// export default Uber;
