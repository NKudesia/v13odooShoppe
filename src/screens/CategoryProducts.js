/* eslint-disable react-native/no-inline-styles */
import React, {PureComponent} from 'react';
import {
  HeaderBg,
  Body,
  Wrap,
  CategoryNoProductCard,
  TouchableIcon,
  WhiteText,
  NoScrollBackground,
  GoToIcon,
  OnlyTouch,
  DefaultText,
  FontIcon,
  FeatherIcon,
  PriceSlider,
} from '../components/Common';
import {
  StyleSheet,
  View,
  Image,
  Platform,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  ScrollView,
  SafeAreaView,
  Text,
} from 'react-native';
import axios from 'axios';
import Online from '../utils/Online';
import Constants, {Fonts, Colors} from '../utils/Constants';
import {DecodeImage, FormatCurrency} from '../components/Functions';
import StarRating from 'react-native-star-rating';
import {SortOptions} from '../data';
import AsyncStorage from '@react-native-community/async-storage';
import {
  TouchableOpacity,
  // ScrollView,
  TextInput,
} from 'react-native-gesture-handler';
import {StatusBar} from 'react-native';
import InternetPopup from '../components/InternetPopup';
import NetInfo from '@react-native-community/netinfo';
import {Slider} from '@miblanchard/react-native-slider';


export default class CategoryProducts extends PureComponent {
  constructor(props) {
    super(props);

    this._is_mounted = false;
    this.internetListener = null;

    this.Online = new Online();

    this.limit = 50;

    this.minPriceRange = 0;
    this.maxPriceRange = 10000;
    // this.BottomOptions = this.BottomOptions.bind(this);
    // this.FilterOptionsModal = this.BottomOptions.bind(this);
    this.state = {
      isLoading: true,
      showInternetPopup: false,
      statusbarStyle: 'light-content',
      productsList: [],
      pageNo: 0,
      showNothingFound: false,
      countStats: global.countStats,
      showSortOption: false,
      selectedSortOption: SortOptions[0].type,
      showFilterOption: false,
      allFilters: [],
      selectedFilterIndex: 0,
      filterOptions: [],
      selectedFilterOptions: [],
      appliedFilterOptions: [],
      priceRange: {
        low: this.minPriceRange,
        high: this.maxPriceRange,
      },
      appliedPriceRange: {
        low: this.minPriceRange,
        high: this.maxPriceRange,
      },
      value: [0.1, 0.5],
    };
  }

  componentDidMount() {
    this._is_mounted = true;
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      // do something
      this.createListeners();
      this.getCategoryProducts();
    });
    // this.getCategoryProducts();
    // this.PriceRangeSlider();
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

  GetCountStats = () => {
    if (this._is_mounted) {
      this.setState({
        countStats: global.countStats,
      });
    }
  };
  // this.props.route.params.title
  getCategoryProducts = async () => {
    const curCode = await AsyncStorage.getItem('currencyCode');
    console.log('code', curCode);
    let page = this.state.pageNo + 1;
    if (!this.props.route.params.id) {
      this.props.navigation.goback();
    }

    let response = await this.Online.searchProduct(
      '',
      this.props.route.params.id,
      curCode,
      this.state.pageNo,
      this.limit,
      this.state.selectedSortOption,
      this.state.appliedFilterOptions,
      this.state.appliedPriceRange.low,
      this.state.appliedPriceRange.high,
    );
    // console.log('Category Product Response', response);
    // console.log(
    //   'sending',
    //   this.props.route.params.id,
    //   curCode,
    //   this.state.pageNo,
    //   this.limit,
    //   this.state.selectedSortOption,
    //   this.state.appliedFilterOptions,
    //   this.state.appliedPriceRange.low,
    //   this.state.appliedPriceRange.high,
    //   response
    // );
    // console.log(
    //   'products',
    //   global.priceListId,
    //   this.props.route.params.id,
    //   curCode,
    // );
    if (!response.result) {
      if (this._is_mounted) {
        this.setState({
          productsList: [],
          showNothingFound: true,
          isLoading: false,
          pageNo: this.state.pageNo,
        });
      }
      return;
    }

    if (this._is_mounted) {
      this.setState({
        productsList: response.result ?? [],
        showNothingFound: response.result.length < 1,
        isLoading: false,
        pageNo: response.result ? page : this.state.pageNo,
      });
    }

    this.getCategoryFilters();
    // this.updateCurrency();
  };

  getCategoryFilters = async () => {
    let response = await this.Online.getCategoryFilters(
      this.props.route.params.id,
    );
    console.log('Category Filter', response);
    if (response.result) {
      if (this._is_mounted) {
        this.setState({
          allFilters: [
            {
              type: 'slider',
              title: 'Price Range',
            },
            ...response.result,
          ],
          filterOptions: {
            type: 'slider',
            title: 'Price Range',
          },
        });
      }
    }
  };

  navigateToProduct = id => {
    this.props.navigation.navigate('Product', {
      // routeName: 'Product',
      // params: {
      id: id,
      // },
    });
  };

  NothingFound = ({visibility = false}) => (
    <View>
      {visibility ? <CategoryNoProductCard text={'No Products'} /> : null}
    </View>
  );

  // BottomOptions = ({buttons}) => (
  //   <View
  //     style={{
  //       flexDirection: 'row',
  //       alignItems: 'center',
  //       width: Dimensions.get('screen').width,
  //       paddingTop: 15,
  //       paddingBottom: Platform.OS === 'ios' ? 30 : 15,
  //       backgroundColor: Colors.WHITE,
  //       borderStyle: 'solid',
  //       borderTopWidth: 1,
  //       borderTopColor: Colors.ACCENT_SECONDARY,
  //       // borderTopColor: 'green',
  //       // backgroundColor: 'green',
  //     }}>
  //     {buttons.map((button, index) => (
  //       <OnlyTouch
  //         key={button.title}
  //         onPress={button.action}
  //         style={{
  //           flexDirection: 'row',
  //           alignItems: 'center',
  //           justifyContent: 'center',
  //           width: Dimensions.get('screen').width * 0.5,
  //           borderStyle: 'solid',
  //           borderLeftWidth: index + 1 > 1 ? 1 : 0,
  //           borderLeftColor: Colors.ACCENT_SECONDARY,
  //         }}>
  //         <FontIcon name={button.icon} color={Colors.ACCENT} size={16} />
  //         <DefaultText
  //           style={{
  //             fontSize: 16,
  //             fontFamily: Fonts.REGULAR,
  //             paddingLeft: 10,
  //           }}>
  //           {button.title}
  //         </DefaultText>
  //       </OnlyTouch>
  //     ))}
  //   </View>
  // );

  applySort = type => {
    if (this._is_mounted) {
      this.setState({
        showSortOption: false,
        selectedSortOption: type,
        isLoading: true,
        productsList: [],
        pageNo: 0,
        showNothingFound: false,
      });
    }

    setTimeout(this.getCategoryProducts, 500);
  };

  SortOptionsModal = () => (
    <Modal
      transparent
      animated
      animationType={'fade'}
      visible={this.state.showSortOption}
      onRequestClose={() => {
        this.setState({showSortOption: false});
      }}>
      <View
        style={{
          height: '100%',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}>
        <TouchableWithoutFeedback
          onPress={() => {
            this.setState({showSortOption: false});
          }}>
          <View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: Colors.OVERLAY,
            }}
          />
        </TouchableWithoutFeedback>
        <View
          style={{
            width: '100%',
            paddingBottom: 30,
            backgroundColor: Colors.WHITE,
          }}>
          <View
            style={{
              borderStyle: 'solid',
              borderBottomWidth: 1,
              borderBottomColor: Colors.ACCENT_SECONDARY,
            }}>
            <DefaultText
              style={{
                fontSize: 16,
                fontFamily: Fonts.REGULAR,
                paddingVertical: 15,
                paddingHorizontal: '3%',
              }}>
              {'SORT BY'}
            </DefaultText>
          </View>
          {SortOptions.map(option => (
            <OnlyTouch
              key={option.title}
              onPress={() => this.applySort(option.type)}>
              <DefaultText
                style={{
                  fontSize: 16,
                  paddingVertical: 10,
                  paddingHorizontal: '3%',
                  letterSpacing: 0.4,
                }}>
                {option.title}
              </DefaultText>
            </OnlyTouch>
          ))}
        </View>
      </View>
    </Modal>
  );

  filterClicked = option => {
    let selectedFilterOptions = [...this.state.selectedFilterOptions];

    let selectedFilterOptionIndex = selectedFilterOptions.indexOf(option.id);

    if ([].indexOf(this.state.filterOptions.type) < 0) {
      if (selectedFilterOptionIndex >= 0) {
        selectedFilterOptions = selectedFilterOptions.filter(e => {
          return e !== option.id;
        });
      } else {
        selectedFilterOptions.push(option.id);
      }
    } else {
      this.state.filterOptions.option.map((opt, i) => {
        selectedFilterOptions = selectedFilterOptions.filter(e => {
          return e !== opt.id;
        });

        if (i + 1 === this.state.filterOptions.option.length) {
          selectedFilterOptions.push(option.id);
        }
      });
    }

    if (this._is_mounted) {
      this.setState({
        filterOptions: this.state.filterOptions,
        selectedFilterOptions: selectedFilterOptions,
      });
    }
  };

  // PriceRangeSlider = () => (
  //   <View>
  //     {/* <Text>Hello</Text> */}
  //     {/* {
  //       style={{paddingTop: 10, paddingBottom: 10}}
  //       min={this.minPriceRange}
  //       max={this.maxPriceRange}
  //       minVal={this.state.priceRange.low}
  //       maxVal={this.state.priceRange.high}
  //       onChange={(low, high) => {
  //         this.setState({
  //           priceRange: {
  //             low: low,
  //             high: high,
  //           },
  //         });
  //       }}
  //     // />
  //     {/* <View
  //       style={{
  //         flexDirection: 'row',
  //         alignItems: 'center',
  //         marginBottom: 10,
  //       }}>
  //       <DefaultText
  //         style={{
  //           flex: 1,
  //           fontSize: 16,
  //         }}>
  //         {'Min :'}
  //       </DefaultText>
  //       <DefaultText
  //         style={{
  //           flex: 3,
  //           color: '#000000',
  //           fontSize: 16,
  //           letterSpacing: 0.8,
  //         }}>
  //         {FormatCurrency(this.state.priceRange.low)}
  //       </DefaultText>
  //     </View> */}
  //     {/* <View
  //       style={{
  //         flexDirection: 'row',
  //         alignItems: 'center',
  //         marginBottom: 10,
  //       }}>
  //       <DefaultText
  //         style={{
  //           flex: 1,
  //           fontSize: 16,
  //         }}>
  //         {'Max :'}
  //       </DefaultText>
  //       <DefaultText
  //         style={{
  //           flex: 3,
  //           color: '#000000',
  //           fontSize: 16,
  //           letterSpacing: 0.8,
  //         }}>
  //         {FormatCurrency(this.state.priceRange.high)}
  //       </DefaultText>
  //     </View> */}
  //   </View>
  // );

  FilterOptionsModal = () => {
    const PriceRangeSlider = () => (
      <View>
        {/* <PriceSlider
          style={{
            paddingTop: 10,
            paddingBottom: 10,
            backgroundColor: 'transparent',
          }}
          min={this.minPriceRange}
          max={this.maxPriceRange}
          minVal={this.state.priceRange.low}
          maxVal={this.state.priceRange.high}
          onChange={(low, high) => {
            this.setState({
              priceRange: {
                low: low,
                high: high,
              },
            });
          }}
        /> */}
        <Slider
          value={this.state.value}
          // value={this.state.priceRange.low}
          onValueChange={value => {
            console.log('value', value[0], value[1]);
            this.setState({
              priceRange: {
                low: value[0],
                high: value[1],
              },
            });
          }}
          // thumbImage={require('../assets/images/YouTube.png')}
          // thumbTouchSize={{width: 120, height: 120}}
          // source={require('../assets/images/YouTube.png')}
          thumbTintColor="#43C0F6"
          thumbStyle={{width: 20, height: 20}}
          trackStyle={{backgroundColor: '#43C0F6'}}
          minimumValue={this.minPriceRange}
          maximumValue={this.maxPriceRange}
          // animateTransitions={true}
        />
        <Text>Value: {this.state.priceRange.low}</Text>
        <Text>Value: {this.state.priceRange.high}</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}>
          <DefaultText
            style={{
              flex: 1,
              fontSize: 16,
            }}>
            {'Min :'}
          </DefaultText>
          <DefaultText
            style={{
              flex: 3,
              color: '#000000',
              fontSize: 16,
              letterSpacing: 0.8,
            }}>
            {/* {FormatCurrency(this.state.priceRange.low)} */}
            {parseFloat(this.state.priceRange.low).toFixed(2)}
          </DefaultText>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}>
          <DefaultText
            style={{
              flex: 1,
              fontSize: 16,
            }}>
            {'Max :'}
          </DefaultText>
          <DefaultText
            style={{
              flex: 3,
              color: '#000000',
              fontSize: 16,
              letterSpacing: 0.8,
            }}>
            {FormatCurrency(this.state.priceRange.high)}
          </DefaultText>
        </View>
      </View>
    );

    return (
      <Modal
        // transparent
        animated
        animationType={'fade'}
        visible={this.state.showFilterOption}
        // style={{backgroundColor: 'red', borderRadius: 10}}
        onRequestClose={() => {
          this.setState({
            showFilterOption: false,
            statusbarStyle: 'light-content',
          });
        }}>
        <View
          style={{
            // height: '140%',
            flex: 1,
            backgroundColor: Colors.WHITE,
            // backgroundColor: 'red',
            // marginTop: 15,
          }}>
          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor: 'transparent',
            }}>
            <View
              style={{
                flexDirection: 'row',
                paddingHorizontal: '3%',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderStyle: 'solid',
                borderBottomWidth: 1,
                borderBottomColor: Colors.ACCENT_SECONDARY,
              }}>
              <DefaultText
                style={{
                  fontSize: 16,
                  fontFamily: Fonts.REGULAR,
                  paddingVertical: 15,
                }}>
                {'FILTERS'}
              </DefaultText>
              <TouchableOpacity
                activeOpacity={Constants.ACTIVE_OPACITY}
                onPress={() => {
                  this.setState({
                    showFilterOption: false,
                    statusbarStyle: 'light-content',
                    selectedFilterOptions: this.state.appliedFilterOptions,
                    priceRange: this.state.appliedPriceRange,
                  });
                }}>
                <FeatherIcon name={'x'} color={Colors.ACCENT} />
              </TouchableOpacity>
            </View>

            <View
              style={{
                // height: '95%',
                flex: 1,
                flexDirection: 'column',
                backgroundColor: 'transparent',
              }}>
              {/* Filter view */}
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  height: Dimensions.get('screen').height - 162,
                  backgroundColor: 'transparent',
                }}>
                <ScrollView
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                  style={{
                    width: 150,
                  }}
                  contentContainerStyle={{
                    minHeight: '100%',
                    borderStyle: 'solid',
                    borderRightWidth: 1,
                    borderRightColor: Colors.ACCENT_SECONDARY,
                    // backgroundColor: Colors.SECONDARY,
                    // backgroundColor: 'red',
                  }}>
                  {this.state.allFilters.map((filter, index) => (
                    // console.log('map function', filter),
                    <OnlyTouch
                      key={filter.title}
                      onPress={() =>
                        this.setState({
                          selectedFilterIndex: index,
                          filterOptions: filter,
                        })
                      }
                      style={{
                        backgroundColor:
                          index === this.state.selectedFilterIndex
                            ? Colors.WHITE
                            : 'transparent',
                        borderStyle: 'solid',
                        borderBottomWidth: 1,
                        borderBottomColor: Colors.ACCENT_SECONDARY,
                      }}>
                      <DefaultText
                        style={{
                          fontSize: 16,
                          paddingVertical: 15,
                          paddingHorizontal: 10,
                          fontFamily:
                            index === this.state.selectedFilterIndex
                              ? Fonts.REGULAR
                              : Fonts.LIGHT,
                        }}>
                        {filter.title}
                      </DefaultText>
                    </OnlyTouch>
                  ))}
                </ScrollView>
                <ScrollView
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                  style={{
                    width: Dimensions.get('screen').width - 150,
                    paddingHorizontal: 10,
                  }}
                  contentContainerStyle={{
                    minHeight: '100%',
                  }}
                  nestedScrollEnabled={true}>
                  {1 === 2 && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderColor: Colors.ACCENT_SECONDARY,
                        borderRadius: 5,
                        paddingHorizontal: 10,
                        backgroundColor: Colors.SECONDARY,
                        marginTop: 15,
                      }}>
                      <FeatherIcon
                        name={'search'}
                        color={Colors.ACCENT_SECONDARY}
                        size={18}
                      />
                      <TextInput
                        style={{
                          width: '92%',
                          marginLeft: 10,
                          paddingVertical: 10,
                          borderWidth: 0,
                          fontSize: 16,
                          fontFamily: Fonts.LIGHT,
                          backgroundColor: 'transparent',
                        }}
                        placeholder={
                          'Search by ' + this.state.filterOptions.title
                        }
                      />
                    </View>
                  )}

                  {/* Price range slider filter */}
                  {this.state.filterOptions.type === 'slider' ? (
                    <PriceRangeSlider />
                  ) : null}

                  {this.state.filterOptions.option
                    ? this.state.filterOptions.option.map((option, index) => (
                        // console.log('filterOptions', option),
                        <OnlyTouch
                          key={option.title}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderStyle: 'solid',
                            borderBottomWidth: 1,
                            borderBottomColor: Colors.ACCENT_SECONDARY,
                            paddingVertical: 15,
                          }}
                          onPress={() => this.filterClicked(option)}>
                          <FeatherIcon
                            name={'check'}
                            size={18}
                            color={
                              this.state.selectedFilterOptions.indexOf(
                                option.id,
                              ) >= 0
                                ? Colors.PRIMARY
                                : Colors.ACCENT_SECONDARY
                            }
                          />
                          {this.state.filterOptions.type === 'color' ? (
                            <View
                              style={{
                                width: 20,
                                height: 20,
                                backgroundColor: option.color,
                                borderStyle: 'solid',
                                borderWidth: 1,
                                borderColor: Colors.ACCENT_SECONDARY,
                                marginLeft: 10,
                              }}
                            />
                          ) : null}
                          <DefaultText style={{fontSize: 16, marginLeft: 10}}>
                            {option.title}
                          </DefaultText>
                        </OnlyTouch>
                      ))
                    : null}
                </ScrollView>
              </View>
            </View>

            {/* Bottom options bar */}
            <View
              style={{
                // flex: 0.182,
                // flex: 1,
                position: 'absolute',
                bottom: 0,
                justifyContent: 'center',
                alignSelf: 'center',
                backgroundColor: 'pink',
              }}>
              <BottomOptions
                buttons={[
                  {
                    title: 'APPLY',
                    icon: 'check',
                    action: () => {
                      this.setState({
                        showFilterOption: false,
                        statusbarStyle: 'light-content',
                        appliedFilterOptions: this.state.selectedFilterOptions,
                        isLoading: true,
                        productsList: [],
                        pageNo: 0,
                        showNothingFound: false,
                        appliedPriceRange: this.state.priceRange,
                      });
                      setTimeout(this.getCategoryProducts, 500);
                    },
                  },
                  {
                    title: 'CLEAR ALL',
                    icon: 'times',
                    action: () => {
                      this.setState({
                        showFilterOption: false,
                        statusbarStyle: 'light-content',
                        appliedFilterOptions: [],
                        selectedFilterOptions: [],
                        isLoading: true,
                        productsList: [],
                        pageNo: 0,
                        showNothingFound: false,
                        appliedPriceRange: {
                          low: this.minPriceRange,
                          high: this.maxPriceRange,
                        },
                        priceRange: {
                          low: this.minPriceRange,
                          high: this.maxPriceRange,
                        },
                      });
                      setTimeout(this.getCategoryProducts, 500);
                    },
                  },
                ]}
              />
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    );
  };
  render() {
    return (
      <>
          <View style={styles.RenderWrap}>
            {/* <NavigationEvents
         onDidFocus={() => {
           this.createListeners();
           this.GetCountStats();
         }}
         onDidBlur={this.removeListeners}
       /> */}
            <InternetPopup
              showModal={this.state.showInternetPopup}
              retryAction={() => {
                this.setState({
                  showInternetPopup: false,
                });

                this.getCategoryProducts();
              }}
            />
            <NoScrollBackground statusBarStyle={this.state.statusbarStyle}>
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
                    <WhiteText style={styles.Logo}>
                      {/* {this.props.navigation.state.params.title} */}
                      {this.props.route.params.title}
                    </WhiteText>
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
                    </View>
                  </View>
                </Wrap>
              </HeaderBg>
              <Body showLoader={this.state.isLoading} style={styles.Body}>
                <this.NothingFound visibility={this.state.showNothingFound} />
                {this.state.productsList.length > 0 ? (
                  <FlatList
                    style={styles.BodyScroll}
                    contentContainerStyle={styles.BodyScrollContent}
                    data={this.state.productsList}
                    keyExtractor={e => e.name}
                    onEndReachedThreshold={0.8}
                    onEndReached={() => {
                      if (this.state.productsList.length < this.limit) {
                        return;
                      }
                      this.getCategoryProducts();
                    }}
                    renderItem={({item, index}) => (
                      // console.log('item flatlist', item),

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
                              paddingHorizontal: 10,
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
                                {/* {item.has_discounted_price && (
                             <DefaultText
                               style={{
                                 fontSize: 12, 
                                 fontFamily: Fonts.LIGHT,
                                 textDecorationLine: 'line-through',
                                 textDecorationStyle: 'solid',
                               }}>
                               {FormatCurrency(item.list_price)}
                             </DefaultText>
                           )} */}
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
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                  />
                ) : null}
                {/* Bottom options bar */}
                <View
                  style={{
                    // flex: 0.182,
                    // flex: 1,
                    position: 'absolute',
                    bottom: 0,
                    justifyContent: 'center',
                    alignSelf: 'center',
                    backgroundColor: 'pink',
                  }}>
                  <BottomOptions
                    buttons={[
                      {
                        title: 'SORT',
                        icon: 'sort-alpha-down',
                        action: () => this.setState({showSortOption: true}),
                      },
                      {
                        title: 'FILTER',
                        icon: 'filter',
                        action: () =>
                          this.setState({
                            showFilterOption: true,
                            statusbarStyle: 'dark-content',
                          }),
                      },
                    ]}
                  />
                </View>
              </Body>

              {/* Sort options modal */}
              <this.SortOptionsModal />
              {/* Filter options modal */}
              <this.FilterOptionsModal />
              {/* {this.SortOptionsModal()} */}
              {/* {this.FilterOptionsModal()} */}
            </NoScrollBackground>
          </View>
        
      </>
    );
  }

  componentWillUnmount() {
    this._is_mounted = false;

    this.removeListeners();
  }
}

const heigh = Dimensions.get('screen').height;

const BottomOptions = ({buttons}) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      width: Dimensions.get('screen').width, // paddingTop: 15,
      paddingBottom: Platform.OS === 'ios' ? 20 : 15,
      backgroundColor: Colors.WHITE,
      // backgroundColor: 'transparent',
      borderStyle: 'solid',
      borderTopWidth: 1,
      borderTopColor: Colors.ACCENT_SECONDARY,
    }}>
    {buttons.map((button, index) => (
      <OnlyTouch
        key={button.title}
        onPress={button.action}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          width: Dimensions.get('screen').width * 0.5,
          borderStyle: 'solid',
          borderLeftWidth: index + 1 > 1 ? 1 : 0,
          borderLeftColor: Colors.ACCENT_SECONDARY,
          // marginTop: 10,
        }}>
        <FontIcon name={button.icon} color={Colors.ACCENT} size={16} />
        <DefaultText
          style={{
            fontSize: 16,
            fontFamily: Fonts.REGULAR,
            paddingLeft: 10,
          }}>
          {button.title}
        </DefaultText>
      </OnlyTouch>
    ))}
  </View>
);

const styles = StyleSheet.create({
  RenderWrap: {
    flex: 1,
    // backgroundColor: 'blue',
  },
  Header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  HeaderRightIcon: {
    marginRight: 15,
  },
  HeaderLeftContent: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  HeaderIcon: {
    marginLeft: 15,
  },
  Logo: {
    fontSize: 20,
    fontFamily: Fonts.REGULAR,
  },
  Body: {
    // minHeight:
    //   heigh - ((Platform.OS === 'android' ? StatusBar.currentHeight : 40) + 62),
    flex: 1,
    paddingBottom: 0,
    paddingTop: 0,
    // minHeight: '83%',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    // backgroundColor: 'red',
  },
  BodyScroll: {
    display: 'flex',
    // flex: 1,
  },
  BodyScrollContent: {
    paddingVertical: 10,
    backgroundColor: Colors.WHITE,
    // backgroundColor: 'blue',
    // shadowColor: Colors.ACCENT,
    // shadowOffset: {
    //   width: 0,
    //   height: 3,
    // },
    // shadowOpacity: 0.27,
    // shadowRadius: 4.65,
    // elevation: 4,
  },
});
