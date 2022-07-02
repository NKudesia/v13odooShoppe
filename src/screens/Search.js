/* eslint-disable react-native/no-inline-styles */
import React, {PureComponent} from 'react';
import {
  SearchBar,
  HeaderBg,
  Body,
  Wrap,
  NoScrollBackground,
  DefaultText,
  TouchableIcon,
  OnlyTouch,
  GetLayout,
} from '../components/Common';
import {Dimensions, StyleSheet, View, Image} from 'react-native';
import Online from '../utils/Online';
import Constants, {Colors, Fonts} from '../utils/Constants';
import {Keyboard} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import Feather from 'react-native-vector-icons/Feather';
import {FormatCurrency, DecodeImage} from '../components/Functions';
import StarRating from 'react-native-star-rating';
import InternetPopup from '../components/InternetPopup';
import NetInfo from '@react-native-community/netinfo';
import {NavigationEvents} from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';

const headerHeight = Constants.SCREEN_HEADER_HEIGHT;

export default class Search extends PureComponent {
  constructor(props) {
    super(props);

    this._is_mounted = false;
    this.internetListener = null;

    this.Online = new Online();

    this.limit = 10;

    this.search = global.searchPage;

    this.state = {
      isLoading: false,
      search: '',
      searchKey: '',
      productsList: [],
      pageNo: 0,
      showNothingFound: false,
      showInternetPopup: false,
    };
  }

  componentDidMount() {
    this._is_mounted = true;
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      // do something
      this.createListeners();
    });
  }

  createListeners = () => {
    this.internetListener = NetInfo.addEventListener(state => {
      if (this._is_mounted && !state.isConnected) {
        this.setState({
          showInternetPopup: true,
        });
      }
    });
  };

  removeListeners = () => {
    if (this.internetListener) {
      this.internetListener();
    }
  };

  // old implementation

  // navigateToProduct = id => {
  //   this.props.navigation.navigate({
  //     routeName: 'Product',
  //     params: {
  //       id: id,
  //     },
  //   });
  // };

  // new implementation

  navigateToProduct = id => {
    this.props.navigation.navigate('Product', {id: id});
  };

  typeTimeout = null;

  onSearch = key => {
    if (this._is_mounted) {
      this.setState({
        search: key,
        productsList: [],
      });
    }

    if (this.typeTimeout !== null) {
      clearTimeout(this.typeTimeout);
    }

    if (key.length === 0) {
      return;
    }

    this.typeTimeout = setTimeout(() => {
      Keyboard.dismiss();

      if (this._is_mounted) {
        this.setState({
          isLoading: true,
          pageNo: 1,
          searchKey: key,
        });
      }

      this.loadProducts(key);
    }, 500);
  };

  loadProducts = async key => {
    const curCode = await AsyncStorage.getItem('currencyCode');
    let page = this.state.pageNo + 1;

    let response = await this.Online.searchProduct(
      key,
      '',
      // global.priceListId,
      curCode,
      page,
      this.limit,
    );

    // console.log('loadProduct', response);

    if (!response.result && this._is_mounted) {
      this.setState({
        isLoading: false,
        showNothingFound: page > 1 ? false : true,
      });
      return;
    }

    if (response.result.length > 0 && this._is_mounted) {
      this.setState({
        productsList:
          page === 1
            ? response.result
            : [...this.state.productsList, ...response.result],
        isLoading: false,
        showNothingFound: false,
        pageNo: page,
      });
    } else if (this._is_mounted) {
      this.setState({
        isLoading: false,
        showNothingFound: true,
      });
    }
  };

  emptySearch = () => (
    <Wrap style={styles.EmptyCartWrap}>
      <Feather name={'search'} size={80} color={Colors.ACCENT_SECONDARY} />
      <DefaultText style={styles.EmptyCartTitle}>
        {'What You Wish\nTo Buy Today ?'}
      </DefaultText>
    </Wrap>
  );

  nothingFound = () => (
    <Wrap style={styles.EmptyCartWrap}>
      <Feather name={'search'} size={80} color={Colors.ACCENT_SECONDARY} />
      <DefaultText style={styles.EmptyCartTitle}>
        {'No Products Found'}
      </DefaultText>
    </Wrap>
  );

  navigateAction = item => {
    switch (item.link_model) {
      case 'product':
        this.props.navigation.navigate('Product', {
          // routeName: 'Product',
          params: item.product,
        });
        break;
      case 'category':
        this.props.navigation.navigate('CategoryProducts', {
          // routeName: 'CategoryProducts',
          // params: {
          id: item.category.id,
          title: item.category.name,
          // },
        });
        break;
      case 'blog':
        this.props.navigation.navigate('Blog', {
          // routeName: 'Blog',
          params: item.blog,
        });
        break;
    }
  };

  render() {
    return (
      <NoScrollBackground
        style={{backgroundColor: Colors.WHITE}}
        statusBarStyle={'dark-content'}>
        {/* <NavigationEvents
          onDidFocus={this.createListeners}
          onDidBlur={this.removeListeners}
        /> */}
        <InternetPopup
          showModal={this.state.showInternetPopup}
          retryAction={() => {
            this.setState({
              showInternetPopup: false,
            });
          }}
        />
        <HeaderBg style={{backgroundColor: Colors.WHITE}}>
          <Wrap>
            <View style={styles.HeaderWrap}>
              <TouchableIcon
                name={'chevron-left'}
                color={Colors.ACCENT}
                style={styles.BackIcon}
                onPress={() => {
                  this.props.navigation.navigate('Home');
                }}
              />
              <SearchBar onChange={this.onSearch} />
            </View>
          </Wrap>
        </HeaderBg>
        <Body showLoader={this.state.isLoading} style={styles.Body}>
          {this.state.search.length > 0 &&
          this.state.searchKey.length > 0 &&
          this.state.search === this.state.searchKey ? (
            <View style={styles.Flex1}>
              {this.state.productsList.length > 0 ? (
                <FlatList
                  data={this.state.productsList}
                  keyExtractor={e => e.name}
                  style={styles.BodyScroll}
                  contentContainerStyle={styles.BodyScrollContent}
                  initialNumToRender={10}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  onEndReachedThreshold={0.8}
                  onEndReached={() => {
                    if (this.state.productsList.length < this.limit) {
                      return;
                    }
                    this.loadProducts(this.state.search);
                  }}
                  renderItem={({item, index}) => (
                    <OnlyTouch
                      onPress={() =>
                        this.navigateToProduct(item.product_template_id)
                      }>
                      <Wrap
                        style={{
                          borderStyle: 'solid',
                          borderTopWidth: index === 0 ? 0 : 1,
                          borderTopColor: Colors.ACCENT_SECONDARY,
                        }}>
                        <View
                          key={item.name}
                          style={{
                            flexDirection: 'row',
                            paddingVertical: 10,
                          }}>
                          <View
                            style={{width: 60, height: 80, marginRight: 20}}>
                            <Image
                              source={{
                                uri: !item.image_512
                                  ? DecodeImage(Constants.THUMBNAIL)
                                  : DecodeImage(item.image_512),
                              }}
                              style={{
                                width: '100%',
                                height: '100%',
                                resizeMode: 'contain',
                              }}
                            />
                          </View>
                          <View style={{justifyContent: 'center'}}>
                            <DefaultText
                              style={{
                                fontFamily: Fonts.REGULAR,
                                fontSize: 16,
                              }}>
                              {item.name}
                            </DefaultText>
                            <DefaultText
                              style={{
                                marginTop: 7,
                                fontSize: 18,
                              }}>
                              {/* {FormatCurrency(item.price) + ' '} */}
                              {item.currency +
                                ' ' +
                                parseFloat(item.price).toFixed(2) +
                                ' '}
                              {/* {item.has_discounted_price && ( */}
                              {/* <DefaultText
                                  style={{
                                    fontSize: 12,
                                    fontFamily: Fonts.LIGHT,
                                    textDecorationLine: 'line-through',
                                    textDecorationStyle: 'solid',
                                  }}> */}
                              {/* {FormatCurrency(item.price)} */}
                              {/* {item.currency +
                                  ' ' +
                                  parseFloat(item.list_price).toFixed(2)} */}
                              {/* </DefaultText> */}
                              {/* )} */}

                              {item.price === item.list_price ? null : (
                                <DefaultText
                                  style={{
                                    fontSize: 12,
                                    fontFamily: Fonts.LIGHT,
                                    textDecorationLine: 'line-through',
                                    textDecorationStyle: 'solid',
                                  }}>
                                  {/* {FormatCurrency(item.list_price)} */}
                                  {item.currency +
                                    ' ' +
                                    parseFloat(item.list_price).toFixed(2)}
                                </DefaultText>
                              )}
                            </DefaultText>
                            <View style={{width: 120, marginTop: 7}}>
                              <StarRating
                                starSize={20}
                                disabled={true}
                                rating={5 * (item.rating_avg / 10)}
                                maxStars={5}
                                fullStarColor={Colors.STAR}
                                halfStarColor={Colors.STAR}
                                emptyStarColor={Colors.ACCENT_SECONDARY}
                              />
                            </View>
                          </View>
                        </View>
                      </Wrap>
                    </OnlyTouch>
                  )}
                />
              ) : (
                <this.nothingFound />
              )}
            </View>
          ) : (
            <View>
              {this.search.length > 0 ? (
                <View>
                  {this.search.map((block, index) => (
                    <GetLayout
                      key={block.id}
                      block={block}
                      index={index}
                      navigateAction={this.navigateAction}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          )}
        </Body>
      </NoScrollBackground>
    );
  }

  componentWillUnmount() {
    this._is_mounted = false;

    this.removeListeners();
  }
}

const styles = StyleSheet.create({
  HeaderBg: {
    height: headerHeight,
    backgroundColor: Colors.WHITE,
  },
  HeaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  BackIcon: {
    marginRight: 5,
  },
  Body: {
    height: Dimensions.get('window').height - headerHeight,
    paddingBottom: 0,
    paddingTop: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  Flex1: {
    flex: 1,
  },
  BodyScroll: {
    display: 'flex',
    flex: 1,
  },
  BodyScrollContent: {
    paddingVertical: 10,
    backgroundColor: Colors.WHITE,
    // shadowColor: Colors.ACCENT,
    // shadowOffset: {
    //   width: 0,
    //   height: 3,
    // },
    // shadowOpacity: 0.27,
    // shadowRadius: 4.65,
    // elevation: 4,
  },
  EmptyCartWrap: {
    flex: 0.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  EmptyCartTitle: {
    textAlign: 'center',
    color: Colors.ACCENT_SECONDARY,
    fontFamily: Fonts.REGULAR,
    fontSize: 20,
    marginTop: 15,
    lineHeight: 30,
  },
  EmptyCartButton: {
    paddingVertical: 10,
    fontSize: 14,
  },
});
