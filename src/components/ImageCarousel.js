/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {Dimensions, View, Image, StyleSheet, Platform} from 'react-native';
import {Colors, Fonts} from '../utils/Constants';
import {OnlyTouch, DefaultText, Wrap} from './Common';

const DEVICE_WIDTH = Dimensions.get('window').width;

export default class ImageCarousel extends Component {
  scrollRef = React.createRef();

  constructor(props) {
    super(props);

    this._is_mounted = false;

    this.slideInterval = null;

    this.state = {
      currentIndex: 0,
    };
  }

  componentDidMount() {
    this._is_mounted = true;

    // this.initSlider();
  }

  // initSlider = () => {
  //   let autoScroll = this.props.autoscroll;
  //   let slideInterval = this.props.slideInterval;

  //   if (autoScroll === null || slideInterval === null) {
  //     return;
  //   }

  //   this.slideInterval = setInterval(() => {
  //     if (this._is_mounted) {
  //       this.setState(
  //         prev => ({
  //           currentIndex:
  //             prev.currentIndex === this.props.images.length - 1
  //               ? 0
  //               : prev.currentIndex + 1,
  //         }),
  //         () => {
  //           this.scrollRef.current.scrollTo({
  //             animated: true,
  //             y: 0,
  //             x: DEVICE_WIDTH * this.state.currentIndex,
  //           });
  //         },
  //       );
  //     }
  //   }, slideInterval);
  // };

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
    const title = this.props.title ?? null;
    const action = this.props.action ?? null;
    const images = this.props.images;
    const wrapStyle = this.props.wrapStyle;
    const imageStyle = this.props.imageStyle;
    const slideStyle = this.props.slideStyle;
    const {currentIndex} = this.state;
    const indicatorWrapStyle = this.props.indicatorWrapStyle;
    console.log("image carousel", images)

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
        <ScrollView
          scrollEnabled={images.length > 1}
          ref={this.scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={this.setCurrentIndex}
          >
          {images.map((image, index) => (
            // console.log("image carousel", image),
            <View key={image} style={{...styles.ImageWrap, ...slideStyle}}>
              <OnlyTouch
                onPress={() => {
                  if (action !== null) {
                    return action(index);
                  }
                }}>
                <Image
                  source={{uri: image.image}}
                  style={{...styles.Image, ...imageStyle}}
                />
              </OnlyTouch>
            </View>
          ))}
        </ScrollView>
        <View style={{...styles.IndicatorWrap, ...indicatorWrapStyle}}>
          {images.length > 1
            ? images.map((image, i) => (
              console.log("testing", image),
                <View
                  key={i}
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
    this.slideInterval = null;
  }
}

const styles = StyleSheet.create({
  Wrap: {
    width: Dimensions.get('window').width * 0.9,
    marginVertical: Platform.OS === 'ios' ? 15 : 15,
  },
  ImageWrap: {
    width: Dimensions.get('window').width,
    height: 250,
    marginBottom: 10,
  },
  Image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
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
