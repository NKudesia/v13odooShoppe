import React from 'react';

import {View, Text, StyleSheet, Dimensions} from 'react-native';

import LottieView from 'lottie-react-native';
import Constants, {Fonts, Models, Message, ApiUrls} from '../utils/Constants';
const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

export const BucketLoader = () => {
  return (
    <View style={[StyleSheet.absoluteFillObject, styles.container]}>
      <LottieView
        source={require('../assets/images/addToCart.json')}
        style={{
          width: width * 0.6,
          height: width * 0.6,
          alignSelf: 'center',
          backgroundColor: 'transparent',
          justifyContent: 'center',
        }}
        autoPlay
        loop>
        {/* <LottieView
        source={require('../assets/images/submit.json')}
        style={{
          width: width * 0.9,
          height: width * 0.9,
          alignSelf: 'center',
          backgroundColor: 'transparent',
        }}
        autoPlay
        loop
      >

      <Text style={{
        color: 'black',
        fontSize: 25,
        textAlign: 'center',
        fontFamily: Fonts.BOLD,
        color: 'red'
        }}>Order Confirmed</Text>
         <Text style={{
        color: 'black',
        fontSize: 15,
        textAlign: 'center',
        fontFamily: Fonts.REGULAR,
        marginTop: 5
        }}>Thank you for ordering</Text>
      </LottieView> */}
      </LottieView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0,0,0,0.3)',
    backgroundColor: 'rgba(255,255,255, 0.9)',
    zIndex: 1,
  },
});
