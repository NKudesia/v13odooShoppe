import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  ImageBackground,
  ProgressBarAndroidBase,
  Animated,
  TextInput,
  Easing,
} from 'react-native';
import {
  HeaderBg,
  Wrap,
  TouchableIcon,
  WhiteText,
  GoToIcon,
  OnlyTouch,
} from '../components/Common';
import Constants, {
  Fonts,
  Colors,
  ApiCredentials as Credentials,
} from '../utils/Constants';
import {ShopByBrandData} from '../data';
import {SceneView} from 'react-navigation';
import axios from 'axios';
import Feather from 'react-native-vector-icons/Feather';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

class ShopByBrand extends React.Component {
  constructor(props) {
    super(props);
    this.getAllBrand();
    this.state = {
      isLoading: false,
      showInternetPopup: false,
      topSlider: [],
      sliderImages: [],
      categories: [],
      categoryProducts: [],
      activeCategoryIndex: 0,
      pageNo: 0,
      productsLoading: true,
      countStats: global.countStats,
      brands: [],
      searchAbleData: [],
      clicked: false,
    };
  }

  getAllBrand = () => {
    axios
      .post('https://v13.kanakinfosystems.com/api/all/brand', {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          limit: 20,
          page: 1,
        },
        id: 505136376,
      })
      .then(response => {
        // console.log('All Brands', response.data);
        this.setState({
          brands: response.data.result,
          searchAbleData: response.data.result,
        });
      });
  };

  searchBrands = value => {
    // console.log('from search ', value);
    if (value) {
      const filterData = this.state.searchAbleData.filter(item => {
        // const item_data = `${item.name.toUpperCase()})`;
        const item_data = item.name
          ? item.name.toUpperCase()
          : ''.toUpperCase();
        const text_data = value.toUpperCase();
        return item_data.indexOf(text_data) > -1;
      });
      this.setState({
        brands: filterData,
      });
      // if (filterData == null) {
      //   return <Text style={{color: 'black'}}>Nothing found</Text>;
      // } else {
      //   this.setState({
      //     brands: filterData,
      //   });
      // }
    } else {
      this.setState({
        brands: this.state.searchAbleData,
      });
    }

    // console.log('filter data', filterData);
  };

  render() {
    const brands = ({item}) => {
      // console.log('Brand', item);
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          {/* <View style={styles.brandContainer}>
            <View style={styles.horizontalLine} />
            <View>
              <Text
                style={{
                  color: 'black',
                  textAlign: 'center',
                  fontFamily: Fonts.REGULAR,
                  fontSize: 15,
                  marginLeft: 5,
                  marginRight: 5,
                }}>
                {item.category}
              </Text>
            </View>
            <View style={styles.horizontalLine} />
          </View> */}
          {/* <FlatList
            data={this.state.brands}
            numColumns={3}
            renderItem={data => (
              console.log('data', data),
              ( */}
          <View
            style={{
              flex: 1,
              // flexDirection: 'column',
              backgroundColor: 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
              margin: 2,
              marginTop: 20,
              marginBottom: 20,
            }}>
            <ImageBackground
              style={{
                resizeMode: 'cover',
                // backgroundColor: 'yellow',
                justifyContent: 'center',
                alignItems: 'center',
                width: 80,
                height: 80,
              }}
              source={require('../assets/images/backTest.jpg')}
              imageStyle={{borderRadius: 60}}>
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate('BrandScreen', {brandName: item.name})}
                activeOpacity={0.8}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 60,
                  alignItems: 'center',
                  justifyContent: 'center',
                  elevation: 1,
                }}>
                <View
                  style={{
                    backgroundColor: 'white',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 80,
                  }}>
                  <Image
                    source={{uri: item.logo}}
                    style={{width: 70, height: 70}}
                  />
                  {/* <Text style={{color: 'black', fontSize: 10}}>
                          {data.item.brand}
                        </Text> */}
                </View>
              </TouchableOpacity>
            </ImageBackground>
            <Text style={{color: 'black', fontSize: 10, marginTop: 10}}>
              {item.name}
            </Text>
          </View>
          {/* )} */}
          {/* /> */}
        </View>
      );
    };
    return (
      <View style={{flex: 1, height: height, backgroundColor: '#edf7fc'}}>
        <HeaderBg>
          <Wrap>
            <View style={styles.Header}>
              <TouchableIcon
                onPress={() => {
                  this.props.navigation.navigate('Home');
                }}
                name={'chevron-left'}
                style={styles.HeaderRightIcon}
              />

              {/* search bar implementation  */}

              {this.state.clicked ? (
                <Animated.View
                  style={{
                    backgroundColor: 'white',
                    width: 215,
                    padding: 1,
                    borderRadius: 6,
                    // flexDirection: 'row',
                  }}>
                  <TextInput
                    placeholder="Search"
                    style={{
                      backgroundColor: 'transparent',
                      // width: 200,
                      padding: 5,
                      // borderRadius: 6,
                    }}
                    onChangeText={value => this.searchBrands(value)}
                  />
                </Animated.View>
              ) : (
                <WhiteText style={styles.Logo}>
                  {/* {this.props.i18n.t('ContactUs')} */}
                  {'Brands'}
                </WhiteText>
              )}

              <View style={styles.HeaderLeftContent}>
                <GoToIcon
                  props={this.props}
                  icon={'shopping-cart'}
                  route={'Cart'}
                  style={styles.HeaderIcon}
                  badge={this.state.countStats.total_cart_item ?? 0}
                />
                <GoToIcon
                  props={this.props}
                  icon={'heart'}
                  route={!global.isGuest ? 'Wishlist' : 'Login'}
                  style={styles.HeaderIcon}
                  badge={this.state.countStats.total_wishlist_item ?? 0}
                />
                {/* <GoToIcon
                  props={this.props}
                  icon={'search'}
                  route={'Search'}
                  style={styles.HeaderIcon}
                /> */}

                {/* search icon handled */}

                {this.state.clicked ? (
                  <TouchableOpacity
                    onPress={() => this.setState({clicked: false})}>
                    <Feather
                      name={'x-circle'}
                      size={22}
                      color={Colors.WHITE}
                      style={styles.HeaderIcon}
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => this.setState({clicked: true})}
                    style={{
                      flex: 1,
                      flexDirection: 'row-reverse',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                    }}>
                    <Feather
                      name={'search'}
                      size={22}
                      color={Colors.WHITE}
                      style={styles.HeaderIcon}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Wrap>
        </HeaderBg>
        {/* <Text>From ShopByBrand</Text> */}
        {/* <View> */}
        <FlatList
          data={this.state.brands}
          showsVerticalScrollIndicator={false}
          numColumns={3}
          renderItem={item =>
            // console.log('from shop by brand', item.item);
            brands(item)
          }
        />
        {/* </View> */}
      </View>
    );
  }
}

export default ShopByBrand;

const styles = StyleSheet.create({
  image: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    width: width,
    backgroundColor: 'red',
    // padding:
  },
  Container: {
    backgroundColor: 'transparent',
    marginTop: 4,
  },
  CardContainer: {
    flexGrow: 1,
    // flex: 1,
  },
  card: {
    // flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: width * 0.38,
    padding: 10,
  },
  subCategoriesList: {flexGrow: 1},
  RenderWrap: {
    flex: 1,
  },
  Heading: {
    fontSize: 38,
    // fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: -2,
  },
  subText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20 * 1.5,
  },
  Header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  HeaderRightIcon: {
    marginRight: 15,
    // backgroundColor: 'green',
  },
  //   HeaderLeftContent: {
  //     flex: 1,
  //     alignItems: 'flex-end',
  //   },
  HeaderLeftContent: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    // backgroundColor: 'red',
  },
  HeaderIcon: {
    marginLeft: 15,
  },
  Logo: {
    fontSize: 20,
    fontFamily: Fonts.REGULAR,
  },
  Body: {
    paddingBottom: 0,
    paddingTop: 0,
  },
  BodyScroll: {
    display: 'flex',
    flex: 1,
  },
  BodyScrollContent: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  EmptyCartWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  EmptyCartTitle: {
    textAlign: 'center',
    color: Colors.ACCENT,
    fontFamily: Fonts.REGULAR,
    fontSize: 18,
    marginVertical: 20,
  },
  EmptyCartButton: {paddingVertical: 10, fontSize: 14},
  MarginRight7: {
    marginRight: 7,
  },
  brandContainer: {
    height: width * 0.13,
    // backgroundColor: '#b3e4fb',
    backgroundColor: 'white',
    // padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 0.5,
    borderBottomWidth: 2,
    borderBottomColor: '#43bdf6',
  },
  horizontalLine: {
    flex: 1,
    height: 2,
    // backgroundColor: '#43bdf6',
  },
});
