/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import {Dimensions, View, StyleSheet, Text} from 'react-native';
import {Colors, Fonts} from '../utils/Constants';
import {OnlyTouch, DefaultText, Wrap} from './Common';
import AutoHeightImage from 'react-native-auto-height-image';
import {useNetInfo} from '@react-native-community/netinfo';

const DEVICE_WIDTH = Dimensions.get('window').width;

export default class ImageCarousel2 extends Component {
  scrollRef = React.createRef();

  constructor(props) {
    super(props);

    this.slideInterval = null;

    this.state = {
      currentIndex: 0,
    };
  }

  componentDidMount() {
    this._is_mounted = true;

    this.initSlider();
  }

  initSlider = () => {
    let autoScroll = this.props.autoscroll;
    let slideInterval = this.props.slideInterval;

    if (autoScroll === null || slideInterval === null) {
      return;
    }

    this.slideInterval = setInterval(() => {
      if (this._is_mounted) {
        this.setState(
          prev => ({
            currentIndex:
              prev.currentIndex === this.props.data.slider.length - 1
                ? 0
                : prev.currentIndex + 1,
          }),
          () => {
            this.scrollRef.current.scrollTo({
              animated: true,
              y: 0,
              x: DEVICE_WIDTH * this.state.currentIndex,
            });
          },
        );
      }
    }, slideInterval);
  };

  setCurrentIndex = event => {
    // Width of the viewSize
    const viewSize = event.nativeEvent.layoutMeasurement.width;
    // Get current postion of the scroll view
    const contentOffset = event.nativeEvent.contentOffset.x;

    const currentIndex = Math.floor(contentOffset / viewSize);

    if (this._is_mounted) {
      this.setState({currentIndex: currentIndex});
    }
  };

  render() {
    const data = this.props.data;
    // console.log("from carousel", data);
    const title = data.title !== false ? data.title : null;
    const action = this.props.action;
    // console.log('from carousel', action());
    const images = data.slider;
    // console.log("images", images);
    const wrapStyle = this.props.wrapStyle;
    const imageStyle = this.props.imageStyle;
    const slideStyle = this.props.slideStyle;
    const {currentIndex} = this.state;
    const indicatorWrapStyle = this.props.indicatorWrapStyle;
    const slideInterval = this.props.slideInterval;

    return (
      <View style={{...styles.Wrap, ...wrapStyle}}>
        {title ? (
          <Wrap>
            <DefaultText
              style={{
                fontSize: 14,
                fontFamily: Fonts.REGULAR,
                marginBottom: 15,
                textTransform: 'uppercase',
              }}>
              {title}
            </DefaultText>
          </Wrap>
        ) : null}
        {/* <TouchableOpacity onPress={() => action}>
          <Text>Test</Text>
        </TouchableOpacity> */}
        <ScrollView
          scrollEnabled={images.length > 1}
          ref={this.scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={this.setCurrentIndex}>
          {images.map(image => (
    // console.log("images", image),
            <View key={image.id} style={{...styles.ImageWrap, ...slideStyle}}>
              <OnlyTouch
                onPress={() => {
                  if (action !== null) {
                    // console.log("action(image)",action(image));
                    return action(image);
                  }
                  // this.props.navigation.navigate('OffersScreen');
                }}>
                <AutoHeightImage
                  onError={error => {
                    console.log(error);
                  }}
                  source={{uri: image.image}}
                  width={Dimensions.get('window').width}
                  style={imageStyle}
                />
              </OnlyTouch>
            </View>
          ))}
        </ScrollView>
        <View style={{...styles.IndicatorWrap, ...indicatorWrapStyle}}>
          {images.length > 1
            ? images.map((e, i) => (
                <View
                  key={e.id}
                  style={{
                    ...styles.Indicator,
                    backgroundColor:
                      currentIndex === i
                        ? Colors.PRIMARY
                        : Colors.ACCENT_SECONDARY,
                  }}
                />
              ))
            : null}
        </View>
      </View>
    );
  }

  componentWillUnmount() {
    this._is_mounted = false;

    clearInterval(this.slideInterval);
  }
}

const styles = StyleSheet.create({
  ImageWrap: {
    width: Dimensions.get('window').width,
    marginBottom: 10,
  },
  IndicatorWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  Indicator: {
    width: 7,
    height: 7,
    marginHorizontal: 3,
    borderRadius: 30,
    backgroundColor: Colors.ACCENT_SECONDARY,
  },
});
