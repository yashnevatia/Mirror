import React from 'react';
import Autocomplete from 'react-autocomplete';

class Search extends React.Component{
  handleRenderItem(item, isHighlighted){
    const listStyles = {
      item: {
        padding: '2px 6px',
        cursor: 'default'
      },

      highlightedItem: {
        color: 'white',
        background: '#F38B72',
        padding: '2px 6px',
        cursor: 'default'
      }
    };
    return (
      <div
        style={isHighlighted ? listStyles.highlightedItem : listStyles.item}
        key={item.id}
        id={item.id}
      >{item.title}</div>
    )
  }
  render() {
    return (
      <div className="search">
        <Autocomplete
         ref="autocomplete"
         inputProps={{title: "Title"}}
         value={this.props.autoCompleteValue}
         items={this.props.tracks}
         getItemValue={(item) => item.title}
         onSelect={this.props.handleSelect}
         onChange={this.props.handleChange}
         renderItem={this.handleRenderItem.bind(this)}
       />
      </div>
    );
  }
}

export default Search
