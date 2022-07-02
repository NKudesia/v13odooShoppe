import React, {useContext} from 'react';

import {View, Text} from 'react-native';
import {
  defaultTheme,
  darkMode,
  hotRed,
  parrotGreen,
  organge,
  pinky,
} from '../helper/theme';
import AsyncStorage from '@react-native-community/async-storage';

export const ThemeContext = React.createContext();

class ThemeProvider extends React.Component {
  state = {
    theme: "#43C0F6",
    // setTheme: ' ',
    isLoadingTheme: true,
  };
  componentDidMount() {
    this.findPrevTheme();
  }

  findPrevTheme = async () => {
    const themeMode = await AsyncStorage.getItem('themeMode');
    console.log('findPrevTheme', themeMode);
    if(themeMode != null){
      this.setState({theme: themeMode});
    }
    // if (themeMode != null) {
    //   if (themeMode == 'defaultTheme') {
    //     this.setState({theme: defaultTheme});
    //   } else if (themeMode == 'darkMode') {
    //     this.setState({theme: darkMode});
    //   } else if (themeMode == 'hotRed') {
    //     this.setState({theme: hotRed});
    //   } else if (themeMode == 'parrotGreen') {
    //     this.setState({theme: parrotGreen});
    //   } else if (themeMode == 'organge') {
    //     this.setState({theme: organge});
    //   } else if (themeMode == 'pinky') {
    //     this.setState({theme: pinky});
    //   }
    // }
    this.setState.isLoadingTheme(false);
  };

  updateTheme = async currentThemeMode => {
    // const newTheme = currentThemeMode === 'defaultTheme' ? hotRed : null;
    // console.log('new Theme', currentThemeMode);
    // this.setState({theme: newTheme});
    // await AsyncStorage.setItem('themeMode', newTheme.themeMode);

    if (currentThemeMode != null) {
      console.log('new Theme', currentThemeMode);
      this.setState({theme: currentThemeMode});
      await AsyncStorage.setItem('themeMode', currentThemeMode);
      
    }

    // if (currentThemeMode == 'defaultTheme') {
    //   console.log('new Theme', currentThemeMode);
    //   this.setState({theme: defaultTheme});
    //   await AsyncStorage.setItem('themeMode', 'defaultTheme');
    //   // this.context.status(false);
    //   // return defaultTheme;
    // } else if (currentThemeMode == 'darkMode') {
    //   console.log('new Theme', darkMode);
    //   this.setState({theme: darkMode});
    //   await AsyncStorage.setItem('themeMode', 'darkMode');
    //   // this.context.status(false);
    //   // return darkMode;
    // }
    //  else if (currentThemeMode == 'hotRed') {
    //   console.log('new Theme', hotRed);
    //   this.setState({theme: hotRed});
    //   await AsyncStorage.setItem('themeMode', 'hotRed');
    //   // this.context.status(false);
    //   // return hotRed;
    // } else if (currentThemeMode == 'parrotGreen') {
    //   console.log('new Theme', parrotGreen);
    //   this.setState({theme: parrotGreen});
    //   await AsyncStorage.setItem('themeMode', 'parrotGreen');
    //   // this.context.status(false);
    //   // return parrotGreen;
    // } else if (currentThemeMode == 'organge') {
    //   console.log('new Theme', organge);
    //   this.setState({theme: organge});
    //   await AsyncStorage.setItem('themeMode', 'organge');
    //   // this.context.status(false);
    //   // return organge;
    // } else if (currentThemeMode == 'pinky') {
    //   console.log('new Theme', pinky);
    //   this.setState({theme: pinky});
    //   await AsyncStorage.setItem('themeMode', 'pinky');
    //   // this.context.status(false);
    //   // return pinky;
    // }
    // this.context.status(false);
  };
  //
  render() {
    return (
      <ThemeContext.Provider
        value={{
          theme: this.state.theme,
          status: this.state.isLoadingTheme,
          func: this.updateTheme,
        }}>
        {this.props.children}
      </ThemeContext.Provider>
    );
  }
}

export const useTheme = () => {
  return ThemeContext;
};

export const ForFunc = () => {
  const context = useContext(ThemeContext);
  return context;
};
export default ThemeProvider;
