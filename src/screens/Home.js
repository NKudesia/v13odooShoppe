//* eslint-disable react-native/no-inline-styles */
import React, {PureComponent} from 'react';
import {withNavigation} from 'react-navigation';
import {
  View,
  StyleSheet,
  Dimensions,
  BackHandler,
  Text,
  Platform,
  Alert,
  I18nManager,
  Button,
  TouchableOpacity,
  ToastAndroid,
  PermissionsAndroid,
  Linking,
  Image,
} from 'react-native';
import {
  HeaderBg,
  WhiteText,
  Wrap,
  TouchableIcon,
  NoScrollBackground,
  GoToIcon,
  ScrollableBody,
  GetLayout, 
} from '../components/Common';
import {Fonts, Message} from '../utils/Constants';
import Online from '../utils/Online';
import {ShowToast} from '../components/Functions';
import RNExitApp from 'react-native-exit-app';
import {NavigationEvents} from 'react-navigation';
import InternetPopup from '../components/InternetPopup';
import NetInfo from '@react-native-community/netinfo';
import SwitchSelector from 'react-native-switch-selector';
import {Translation, useTranslation, withTranslation} from 'react-i18next';
import {i18n} from 'i18next';
import Geolocation from 'react-native-geolocation-service';
import * as RNLocalize from 'react-native-localize';
import axios from 'axios';
import Geocoder from 'react-native-geocoding';
import AsyncStorage from '@react-native-community/async-storage';

import {useTheme} from '../context/ThemeProvider';
const width_Check = Dimensions.get('window').width;

const options = [
  {label: 'English', value: 'en'},
  {label: 'French', value: 'fr'},
  {label: 'Italian', value: 'it'},
  {label: 'Arabic', value: 'ar'},
];

// Geocode.fromLatLng('37.785834', ' -122.406417').then(
//   response => {
//     const address = response.results[0].formatted_address;
//     console.log('hacnsdcnkdln', address);
//   },
//   error => {
//     console.error(error);
//   },
// );

class Home extends PureComponent {
  static contextType = useTheme();
  constructor(props) {
    super(props);
    // this.context = context;
    this._is_mounted = false;
    this.internetListener = null;
    this.backPressHandler = null;
    this.backPressCount = 0;

    this.Online = new Online();

    this.limit = 50;

    this.home = global.homePage;

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
      latitude: '',
      longitude: '',
      logoImage: '',
      is: false,
      logoText: '',
    };
  }
  componentDidMount() {
    this._is_mounted = true;
    this.getSearchLayout();

    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      // do something
      this.createListeners();
      this.getlocation();
      this.sendCountry();
      this.getLogo();
      this.setState({
        countStats: global.countStats,
      });
      // console.log('Country', RNLocalize.getCountry());
      // console.log('Time Zone', RNLocalize.getTimeZone());
      // console.log('uses24', RNLocalize.uses24HourClock());
    });
  }

  // getLanguage = async () => {
  //   console.log('start');
  //   try {
  //     const value = await AsyncStorage.getItem('selectedLanguage');
  //     if (value)
  //       console.log('got value', value);
  //       this.props.i18n.language(value);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // sending country short name to retrieve currency

  sendCountry = async () => {
    const deviceCountry = RNLocalize.getCountry();
    console.log('deviceCountry', deviceCountry, typeof deviceCountry);
    try {
      axios
        .post('https://v13.kanakinfosystems.com/api/get/pricelist', {
          jsonrpc: '2.0',
          method: 'call',
          params: {
            country_code: deviceCountry,
          },
          id: 505136376,
        })
        .then(response => {
          console.log('Prilist API', response.data);
          if (response.data.result.success != false) {
            this.updateCurrency(response.data.result.id);
            // const code = response.data.result.id;
          } else this.updateCurrency(4);
        })
        .catch(error => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  updateCurrency = async id => {
    const code = id;
    console.log('Code New', code);
    await AsyncStorage.setItem('currencyCode', code.toString());
  };

  getLogo = () => {
    try {
      axios
        .post('https://v13.kanakinfosystems.com/api/get/logo', {
          jsonrpc: '2.0',
          method: 'call',
          params: {},
          id: 505136376,
        })
        .then(response => {
          console.log('response', response.data);
          if (response.data.result.logo_img != false) {
            this.setState({
              logoImage: response.data.result.logo_img,
              is: true,
            });
          } else if (response.data.result.logo_text != false) {
            this.setState({
              logoText: response.data.result.logo_text,
              is: false,
            });
          } else {
            this.setState({
              logoText: 'No Logo',
              is: false,
            });
          }
        })
        .catch(error => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };
  hasPermissionIOS = async () => {
    const openSetting = () => {
      Linking.openSettings().catch(() => {
        Alert.alert('Unable to open settings');
      });
    };
    const status = await Geolocation.requestAuthorization('whenInUse');

    if (status === 'granted') {
      return true;
    }

    if (status === 'denied') {
      Alert.alert('Location permission denied');
    }

    if (status === 'disabled') {
      Alert.alert(
        `Turn on Location Services to allow "${
          appConfig.displayName
        }" to determine your location.`,
        '',
        [
          {text: 'Go to Settings', onPress: openSetting},
          {text: "Don't Use Location", onPress: () => {}},
        ],
      );
    }

    return false;
  };

  hasLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const hasPermission = await this.hasPermissionIOS();
      return hasPermission;
    }

    if (Platform.OS === 'android' && Platform.Version < 23) {
      return true;
    }

    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (status === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }

    if (status === PermissionsAndroid.RESULTS.DENIED) {
      ToastAndroid.show(
        'Location permission denied by user.',
        ToastAndroid.LONG,
      );
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      ToastAndroid.show(
        'Location permission revoked by user.',
        ToastAndroid.LONG,
      );
    }

    return false;
  };

  getlocation = async () => {
    const locationPermission = await this.hasLocationPermission();

    if (!locationPermission) {
      console.log('No Permission');
      return;
    }

    // Geolocation.getCurrentPosition

    Geolocation.getCurrentPosition(
      position => {
        console.log(position);
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        // Get address from latitude & longitude.
        this.getAddresUsingCoords(
          position.coords.latitude,
          position.coords.longitude,
        );
      },
      error => { 
        // See error code charts below.
        console.log('hhhhhhhh', error.code, error.message);
      }, 
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  getAddresUsingCoords = (lat, long) => {
    // Geocode.setApiKey('AIzaSyBoFc-J7KTZHT2jmMNHzGPKThtLRyyZXbQ');
    // Geocode.setLocationType("ROOFTOP");
    console.log(lat, long);
    // Geocode.fromLatLng(`${lat}`, `${long}`).then(
    //   response => {
    //     const address = response.results[0].formatted_address;
    //     console.log(address);
    //   },
    //   error => {
    //     console.error(error);
    //   },
    // );
  };

  getSearchLayout = async () => {
    let response = await this.Online.readSearchBlocks();

    if (!response.result) {
      ShowToast(Message.ERROR_TRY_AGAIN);
      return;
    }

    if (response.result.length > 0) {
      global.SearchPage = response.result;
    }
  };

  GetCountStats = async () => {
    if (this._is_mounted) {
      this.setState({
        countStats: global.countStats,
      });
    }
  };

  _handleBackPress = () => {
    if (this.backPressCount > 0) {
      this.backPressCount++;
    }
    if (this.backPressCount < 1) {
      if (this.backPressCount === 0) {
        ShowToast(Message.PRESS_BACK_EXIT);
        setTimeout(() => {
          this.backPressCount = 0;
        }, 2000);
      }
      this.backPressCount++;
    } else if (this.backPressCount > 1) {
      RNExitApp.exitApp();
    }
    return true;
  };

  createListeners = () => {
    this.backPressHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this._handleBackPress.bind(this),
    );

    this.internetListener = NetInfo.addEventListener(state => {
      if (this._is_mounted && !state.isConnected) {
        this.setState({
          showInternetPopup: true,
        });
      }
    });
  };

  removeListeners = () => {
    if (this.backPressHandler) {
      this.backPressHandler.remove();
    }

    if (this.internetListener) {
      this.internetListener();
    }
  };

  stopLoading = () => {
    if (this._is_mounted) {
      this.setState({isLoading: false});
    }
  };

  navigateAction = item => {
    // console.log('item', item);
    switch (item.link_model) {
      case 'product':
        this.props.navigation.navigate('Product', {
          // routeName: 'Product',
          // params:
          ...item.product,
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
          // params:
          ...item.blog,
        });
      case 'advertisement':
        this.props.navigation.navigate('AdvertisementScreen', {
          // routeName: 'Blog',
          // params:
          // ...item.blog,
        });
        break;
    }
  };

  navigateAdvertisement = item => {
    console.log('from navigateAdvertisement item', item.id);
    if (item.section_type === 'advertisement') {
      this.props.navigation.navigate('AdvertisementScreen', {
        id: item.id,
      });
    }
  };

  setOptions = op => {
    alert(op);
  };

  render() {
    this.setLanguage = async value => {
      // AsyncStorage.setItem('selectedLanguage', value);
      // console.log('sorted', value);
      // this.getLanguage();
      if (i18n.language == 'ar') {
        await I18nManager.allowRTL(true);
        await I18nManager.forceRTL(true);
        // RNRestart.Restart();
        // i18n.changeLanguage('ar');
      } else {
        await I18nManager.allowRTL(false);
        await I18nManager.forceRTL(false);
      }
    };
    // console.log('context', this.context);

    return (
      <NoScrollBackground>
        <InternetPopup
          showModal={this.state.showInternetPopup}
          retryAction={() => {
            this.setState({
              showInternetPopup: false,
            });

            this.getSearchLayout();
          }}
        />

        {/* <NavigationEvents
          onDidFocus={() => {
            this.createListeners();
            this.GetCountStats();
          }}
          onDidBlur={this.removeListeners}
        /> */}
        <HeaderBg>
          <Wrap>
            <View style={styles.Header}>
              <TouchableIcon
                onPress={() => {
                  this.props.navigation.openDrawer();
                }}
                name={'bars'}
                style={styles.HeaderLeftIcon}
              />
              {this.state.is ? (
                <Image
                  source={{uri: this.state.logoImage}}
                  style={{width: 100, height: 50}}
                />
              ) : (
                // <WhiteText style={styles.Logo}>
                // {/* {'Odoo'} */}
                // {/* {this.props.i18n.t('Odoo')} */}
                <WhiteText style={styles.LogoBoldPart}>
                  {/* {'Shoppe'} */}
                  {/* {this.props.i18n.t('Shoppe')} */}
                  {this.state.logoText}
                </WhiteText>
                // {/* </WhiteText> */}
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
                <GoToIcon
                  props={this.props}
                  icon={'search'}
                  route={'Search'}
                  style={styles.HeaderIcon}
                />
              </View>
              {/* <WhiteText style={styles.Logo}>
                  {t('Odoo')}
                  <WhiteText style={styles.LogoBoldPart}>
                    {t('Shoppe')}  
                  </WhiteText>
                </WhiteText>
                <TouchableIcon
                  onPress={() => { 
                    this.props.navigation.openDrawer();
                  }}
                  name={'bars'}
                  style={styles.HeaderLeftIcon}
                /> */}
            </View>
          </Wrap>
        </HeaderBg>
        {/* <View 
          style={{ 
            backgroundColor: this.context.theme.backgroundColor,
            padding: 10,
          }}
        /> */}
        {/* <Button title="check" onPress={changeTheme} /> */}
        {/* <Text style={{fontSize: 20, color: 'black', marginTop: 10}}>
            {t('test')}
          </Text> */}
        {/* <SwitchSelector
            options={options}
            initial={0}
            // onPress={value => console.log(`Call onPress with value: ${value}`)}
            onPress={value => {
              i18n.changeLanguage(value);
            }}
            selectedColor="red"
            buttonColor="#43C0F6"
          /> */}

        <ScrollableBody showLoader={this.state.isLoading} style={styles.Body}>
          {this.home.length > 0 ? (
            <View>
              {this.home.map((block, index) => (
                // console.log('home', block, index),
                <GetLayout
                  key={block.id}
                  props={this.props}
                  block={block} 
                  index={index}
                  navigateAction={this.navigateAction}
                  navigateAdvertisement={this.navigateAdvertisement}
                />
              ))}
            </View>
          ) : null}
        </ScrollableBody>
      </NoScrollBackground>
    );
  }

  componentWillUnmount() {
    this._is_mounted = false;
    this.removeListeners();
    this._unsubscribe();
  }
}

export default withTranslation()(Home);

const styles = StyleSheet.create({
  Header: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: 'red',
  },
  HeaderLeftIcon: {
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
  HeaderLoginButton: {
    fontSize: 20,
  },
  HeaderRightIcon: {
    marginLeft: 16,
  },
  Logo: {
    fontSize: 20,
    fontFamily: Fonts.LIGHT,
    marginRight: 10,
  },
  LogoBoldPart: {
    fontSize: 20,
    fontFamily: Fonts.BOLD,
    marginRight: 5,
  },
  searchBar: {
    marginTop: 30,
  },
  Body: {
    paddingTop: 0,
    paddingBottom: 100,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    // backgroundColor: 'red',
    // width: '40%',
  },
  ImageCarouselSlide: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width * 0.467,
    padding: 0,
  },
  ImageCarouselWrap: {
    width: '100%',
    marginBottom: 15,
    marginTop: 0,
  },
  ImageCarouselIndicator: {
    marginTop: -30,
  },
});

//   Geocoder.init('AIzaSyBoFc-J7KTZHT2jmMNHzGPKThtLRyyZXbQ', {
//     language: 'en',
//   });
//   Geocoder.from([37.78, -122.4])
//     .then(json => {
//       var addressComponent = json.results[0].address_components[0];
//       console.log(addressComponent);
//     })
//     .catch(error => console.warn(error));
// });
// if (this.hasLocationPermission) {
//   Geolocation.getCurrentPosition(
//       (position) => {
//         console.log(position);
//       },
//       (error) => {
//         // See error code charts below.
//         console.log("hhhhhhhh",error.code, error.message);
//       },
//       { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
//   );
// }
