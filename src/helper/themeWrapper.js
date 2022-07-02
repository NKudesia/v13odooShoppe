import React from 'react';
import {useTheme} from '../context/ThemeProvider';
class ThemeWrapper extends React.Component {
  static contextType = useTheme();

  render() {
    if (this.context.status === 'false') return null;
    return this.props.children;
  }
}

export default ThemeWrapper;
