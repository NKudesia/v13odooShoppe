import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Dimensions,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  FlatList,
  ImageBackground,
  Animated,
} from 'react-native';
import {
  HeaderBg,
  Wrap,
  TouchableIcon,
  WhiteText,
  GoToIcon,
} from '../components/Common';
import {DecodeImage} from '../components/Functions';
import Constants, {
  Message,
  Fonts,
  Models,
  LocalKeys,
  Colors,
  ApiCredentials as Credentials,
} from '../utils/Constants';
import Online from '../utils/Online';
import {CategoriesData} from '../data';
import {Transition, Transitioning} from 'react-native-reanimated';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

// const transition = (
//   <Transition.Together>
//     <Transition.in type={'fade'} durationMs={200} />
//     <Transition.change />
//     <Transition.out type={'fade'} durationMs={200} />
//   </Transition.Together>
// );

class Categories extends React.Component {
  constructor(props) {
    super(props);
    console.log('width', width);
    this._is_mounted = false;
    this.internetListener = null;

    this.Online = null;
    // this.Online = new Online();
    // this.Offline = new Offline();
    this.selectorRef = React.createRef();
    this.state = {
      isLoading: true,
      wishlistDetails: [],
      wishlistIds: [],
      productsList: [],
      showNothingFound: false,
      cartDetails: global.cartDetails,
      countStats: global.countStats,
      showInternetPopup: false,
      userDetails: global.userDetails,
      query: '',
      description: '',
      setModalVisible: false,
      setCurrentIndex: false,
      setCurrentSubCategory: '',
      fadeAnim: new Animated.Value(0),
      level1: {
        visible: false,
        title: null,
        data: [],
      },
      level2: {
        visible: false,
        title: null,
        data: [],
      },
      records: [],
    };
  }

  componentDidMount() {
    this._is_mounted = true;
    // console.log('width', width_Check, this.context);
    // this.setState({
    //   fadeAnim: new Animated.Value(0),
    // });
  }

  fadeIn = () => {
    // Will change fadeAnim value to 1 in 5 seconds

    // console.log('fadeAnim fadeIn', this.state.fadeAnim);

    Animated.timing(this.state.fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  fadeOut = () => {
    // Will change fadeAnim value to 0 in 3 seconds
    // console.log('fadeAnim', this.state.fadeAnim);

    Animated.timing(this.state.fadeAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true,
    }).start();
    // console.log('fadeAnim', this.state.fadeAnim);
  };

  render() {
    // console.log('global', global.categories);
    const MainMenuItemAction = item => {
      // console.log('MainMenuItemAction item', item);
      if (item?.item?.child_id?.length > 0 || null) {
        GetMenuData(item).then(data => {
          if (!data) {
            return;
          }
          // console.log('data', data);
          if (this._is_mounted) {
            this.setState({
              level1: {
                visible: true,
                title: item.name,
                data: data,
              },
            });
          }
        });
        return;
      }

      // if (this.state.level1.visible) {
      //   this.CloseLevel1();
      // }

      // this.props.navigation.navigate('CategoryProducts', {
      //   // routeName: 'CategoryProducts',
      //   // params: {
      //   id: item.id,
      //   title: item.name,
      //   // },
      // });
    };

    const MainMenuItemAction2 = item => {
      // console.log('MainMenuItemAction2 item', item.child_id);
      if (item?.child_id?.length > 0 || null) {
        GetMenuData2(item).then(data => {
          if (!data) {
            return;
          }
          console.log('data', data);
          if (this._is_mounted) {
            this.setState({
              level1: {
                visible: true,
                title: item.name,
                data: data,
              },
            });
          }
        });
        return;
      }

      // if (this.state.level1.visible) {
      //   this.CloseLevel1();
      // }

      this.props.navigation.navigate('CategoryProducts', {
        // routeName: 'CategoryProducts',
        // params: {
        id: item.id,
        title: item.name,
        // },
      });
    };

    const GetMenuData2 = async item => {
      if (this.Online === null) {
        this.Online = new Online();
      }

      let response = await this.Online.search(
        Models.CATEGORY,
        [],
        [['id', 'in', item?.child_id]],
      );
      // console.log('GetMenu data response', response);
      if (response.error) {
        if (Constants.DEBUG) {
          console.log(response);
        }

        ShowToast(Message.ERROR_TRY_AGAIN);
        return false;
      }

      if (response.result.records.length > 0) {
        return response.result.records;
      } else {
        return false;
      }
    };

    const GetMenuData = async item => {
      if (this.Online === null) {
        this.Online = new Online();
      }

      let response = await this.Online.search(
        Models.CATEGORY,
        [],
        [['id', 'in', item?.item?.child_id]],
      );
      // console.log('GetMenu data response', response);
      if (response.error) {
        if (Constants.DEBUG) {
          console.log(response);
        }

        ShowToast(Message.ERROR_TRY_AGAIN);
        return false;
      }

      if (response.result.records.length > 0) {
        return response.result.records;
      } else {
        return false;
      }
    };
    return (
      <>
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
                {/* {this.props.i18n.t('ContactUs')} */}
                {'Categories'}
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
        {/* <Text>From Categories</Text> */}
        <FlatList
          showsVerticalScrollIndicator={false}
          // data={CategoriesData}
          data={global.categories}
          // contentContainerStyle={{backgroundColor: 'black', flex: 1}}
          renderItem={item => {
            // console.log('render items', item);
            return (
              <>
                {item.item.icon ? (
                  <Transitioning.View
                    // ref={this.props.selectorRef}
                    // Transition={transition}
                    style={styles.Container}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => {
                        this.state.fadeAnim ? this.fadeIn() : this.fadeOut(),
                          this.setState({
                            setCurrentIndex:
                              item.index == this.state.setCurrentIndex
                                ? null
                                : item.index,
                          });
                        MainMenuItemAction(item);
                      }}
                      style={styles.CardContainer}>
                      <ImageBackground
                        source={{uri: DecodeImage(item.item.icon)}}
                        style={styles.image}>
                        <View
                          style={[
                            styles.card,
                            //  {backgroundColor: item.item.bg}
                          ]}>
                          {/* <Text style={styles.Heading}>{item.item.name}</Text> */}
                        </View>
                      </ImageBackground>
                      {item.index == this.state.setCurrentIndex && (
                        <Animated.View
                          style={[
                            styles.subCategoriesList,
                            {
                              opacity: this.state.fadeAnim,
                              transform: [
                                {
                                  translateY: this.state.fadeAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [150, 0], // 0 : 150, 0.5 : 75, 1 : 0
                                  }),
                                },
                              ],
                              extrapolate: 'clamp',
                            },
                          ]}>
                          {this.state.level1.data.map(
                            sub => (
                              console.log('from subCategory', sub),
                              (
                                <TouchableOpacity
                                  onPress={() => {
                                    this.setState({
                                      setCurrentSubCategory:
                                        sub.id ==
                                        this.state.setCurrentSubCategory
                                          ? null
                                          : sub.id,
                                    },
                                    MainMenuItemAction2(sub)

                                    );
                                    // console.log('state', this.setCurrentSubCategory)
                                  }}
                                  style={{
                                    // flexGrow: 1,
                                    backgroundColor: '#f6f6f6',
                                    // backgroundColor: 'red',
                                    padding: 10,
                                    marginTop: 5,
                                    // flexDirection: 'row',
                                    justifyContent: 'space-between',
                                  }}>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      justifyContent: 'space-between',
                                    }}>
                                    <Text style={styles.subText}>
                                      {sub.name}
                                    </Text>
                                    <Image
                                      source={require('../assets/images/down-arrow.png')}
                                      style={{
                                        width: width * 0.05,
                                        height: width * 0.05,
                                        justifyContent: 'center',
                                        alignSelf: 'center',
                                      }}
                                    />
                                  </View>
                                  {/* {sub.id ==
                                  this.state.setCurrentSubCategory ? (
                                    <View
                                      style={
                                        {
                                          // padding: 5,
                                          // marginTop: 5,
                                          // backgroundColor: '#ececec',
                                        }
                                      }>
                                      {sub.subSubCategory.map(h => (
                                        console.log("subsub", h),
                                        <TouchableOpacity
                                          style={{
                                            backgroundColor: '#ececec',
                                            padding: 8,
                                            marginTop: 5,
                                          }}>
                                          <Text
                                            style={{
                                              fontSize: 15,
                                              textAlign: 'center',
                                              lineHeight: 20 * 1.5,
                                            }}>
                                            {h}
                                          </Text>
                                        </TouchableOpacity>
                                      ))}
                                    </View>
                                  ) : null} */}
                                </TouchableOpacity>
                              )
                            ),
                          )}
                        </Animated.View>
                      )}
                    </TouchableOpacity>
                  </Transitioning.View>
                ) : null}
              </>
            );
          }}
        />
      </>
    );
  }
}

export default Categories;

const styles = StyleSheet.create({
  image: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    width: width,
    // backgroundColor: 'red',
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
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 20 * 1.5,
    fontFamily: Fonts.REGULAR,
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
});
