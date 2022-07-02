import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  TextInput,
  Image,
} from 'react-native';
import axios from 'axios';
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
import Feather from 'react-native-vector-icons/Feather';
import {DrawerItemList} from '@react-navigation/drawer';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

class BrandScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      brandName: this.props.route.params.brandName,
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
      brandCategories: [],
      newArr: [],
    };
  }

  componentDidMount() {
    this.fetchBrandCategories();
  }

  fetchBrandCategories = () => {
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
        // console.log('brand Categores from brand Screen', response.data)
        this.setState({
          brandCategories: response.data.result,
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  render() {
    const categories = ({item}) => {
      console.log('cate func', item);
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            padding: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('CategoryProducts', {
              id: item.id,
              title: item.name
            })}
            activeOpacity={0.8}
            style={{
              height: 150,
              width: 120,
              backgroundColor: 'white',
              padding: 10,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
              elevation: 1,
              marginTop: 10
            }}>
            <Image source={{uri: item.image}} style={{width: 100, height: 130, borderRadius: 10}} />
          </TouchableOpacity>
          <Text style={{color: 'black', fontSize: 10, marginTop: 10, fontFamily: Fonts.REGULAR}}>{item.name}</Text>

        </View>
      );
    };
    return (
      <View style={{flex: 1, backgroundColor: '#edf7fc'}}>
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
                  {this.state.brandName}
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
        {this.state.brandCategories.map(item => {
          // console.log('item', item.categories);
          if (this.state.brandName === item.name) {
            if (item.categories != null) {
              // console.log('item2', item.categories);
              item.categories.map(item => {
                this.state.newArr.push(item);
                // console.log('pushed', item);
              });
            }
          } else {
            return;
          }
        })}
        <FlatList
          data={this.state.newArr}
          numColumns={2}
          renderItem={item =>
            // console.log('items from flatlist', item)
            categories(item)
          }
        />
      </View>
    );
  }
}

export default BrandScreen;

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
