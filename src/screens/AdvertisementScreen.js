import React, {PureComponent, useRoute} from 'react';

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
  DefaultText,
  GetLayout,
} from '../components/Common';
import Constants, {
  Colors,
  Fonts,
  Models,
  Message,
  LocalKeys,
} from '../utils/Constants';

import {OpenUrl} from '../components/Functions';

import Online from '../utils/Online';
import InternetPopup from '../components/InternetPopup';
import {Translation, useTranslation, withTranslation} from 'react-i18next';
import {useTheme} from '../context/ThemeProvider';
import NetInfo from '@react-native-community/netinfo';
import Offline from '../utils/Offline';
import Feather from 'react-native-vector-icons/Feather';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

class AdvertisementScreen extends PureComponent {
  static contextType = useTheme();

  constructor(props) {
    super(props);
    this._is_mounted = false;
    this.internetListener = null;

    this.Online = new Online();
    this.Offline = new Offline();
    this.home = global.homePage;
    this.state = {
      isLoading: true,
      productId: false,
      productTemplateDetails: [],
      activeVariantId: false,
      activeVariantDetails: [],
      productDetails: [],
      productAttributes: [],
      currentSelectedAttributes: [],
      selectedColor: null,
      selectedSize: null,
      selectedGender: null,
      selectedQuantity: 1,
      productRatings: [],
      ratingCounts: [],
      messageCount: 0,
      avgRating: 0,
      cartDetails: global.cartDetails,
      countStats: global.countStats,
      showInternetPopup: false,
      AdvertisementBanner: '',
      AdvertisementUrl: '',
      AdvertisementDescription: '',
    };
  }

  componentDidMount() {
    // this._is_mounted = true;
    // this.getSearchLayout();
    // console.log('this Home', this.home);
    // this._unsubscribe = this.props.navigation.addListener('focus', () => {
    //   console.log('this Home', this.home);
    // });

    this.getLink();
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

  getLink = () => {
    {
      this.home.map(i => {
        console.log('i', i.id);
        if(this.props.route.params.id == i.id){
          console.log("iddddddddddd matched ", i.id, i.name);
          this.setState({
            AdvertisementBanner: i.advertisement_banner,
            AdvertisementUrl: i.advertisement_url,
            AdvertisementDescription: i.advertisement_description,
          });
        }
        // if (i.section_type === 'advertisement') {
        //   console.log('advrt', i);

        //   if (i.advertisement_banner != false) {
        //     console.log('i.advertisement_banner', i.advertisement_banner);

        //     this.setState({
        //       AdvertisementBanner: i.advertisement_banner,
        //     });
        //   }
        //   if (i.advertisement_url != false) {
        //     console.log('i.advertisement_url', i.advertisement_url);
        //     this.setState({
        //       AdvertisementUrl: i.advertisement_url,
        //     });
        //   }
        //   if (i.advertisement_description != false) {
        //     console.log(
        //       'i.advertisement_description',
        //       i.advertisement_description,
        //     );
        //     this.setState({
        //       AdvertisementDescription: i.advertisement_description,
        //     });
        //   }
        // }
      });
    }
  };

  render() {
    // const route = useRoute();
    const {navigation} = this.props;
    // const user_name = navigation;
    console.log('user_name ', this.props.route.params.id)
    return (
      <NoScrollBackground>
        <InternetPopup
          showModal={this.state.showInternetPopup}
          retryAction={() => {
            this.setState({
              showInternetPopup: false,
            });

            // this.getSearchLayout();
          }}
        />
        <HeaderBg style={styles.HeaderBg}>
          <Wrap>
            <View style={{...styles.Header}}>
              <TouchableIcon
                name={'chevron-left'}
                color={Colors.ACCENT}
                onPress={() => {
                  // this.props.navigation.navigate('CategoryProducts');
                  this.props.navigation.goBack();
                }}
              />
              <WhiteText style={styles.Logo}>
                {/* {'Odoo'} */}
                {this.props.i18n.t('Odoo')}
                <WhiteText style={styles.LogoBoldPart}>
                  {/* {'Shoppe'} */}
                  {this.props.i18n.t('Shoppe')}
                </WhiteText>
              </WhiteText>
              {/* <WhiteText style={styles.Logo}>{'Rate Product'}</WhiteText> */}

              <View style={styles.HeaderLeftContent}>
                {/* <GoToIcon
                    props={this.props}
                    icon={'share-2'}
                    // route={!global.isGuest ? 'Wishlist' : 'Login'}
                    color={Colors.ACCENT}
                    style={styles.HeaderRightIcon}
                    badge={this.state.countStats.total_wishlist_item}
                    // onPress={() => fun()}
                  /> */}
                <TouchableOpacity activeOpacity={0.9} onPress={() => fun()}>
                  <Feather
                    name={'share-2'}
                    size={22}
                    color={Colors.ACCENT}
                    style={styles.HeaderRightIcon}
                  />
                </TouchableOpacity>
                <GoToIcon
                  props={this.props}
                  icon={'shopping-cart'}
                  route={'Cart'}
                  color={Colors.ACCENT}
                  style={styles.HeaderRightIcon}
                  badge={this.state.countStats.total_cart_item}
                />
                <GoToIcon
                  props={this.props}
                  icon={'heart'}
                  route={!global.isGuest ? 'Wishlist' : 'Login'}
                  color={Colors.ACCENT}
                  badge={this.state.countStats.total_wishlist_item}
                />
              </View>
            </View>
          </Wrap>
        </HeaderBg>
        <View>
          <Image
            // source={require('../assets/images/1-SpringSummer.png')}
            source={{uri: this.state.AdvertisementBanner}}
            style={{width: width, height: height * 0.18}}
          />
        </View>
        <View
          style={{
            width: width,
            height: height,
            backgroundColor: 'tranparent',
            padding: 10,
          }}>
          <View
            style={{
              height: height * 0.5,
              backgroundColor: 'white',
              borderRadius: 6,
              marginTop: 10,
              padding: 14,
            }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: Fonts.BOLD,
                textAlign: 'justify',
              }}>
              {this.state.AdvertisementDescription}
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: Fonts.REGULAR,
                marginTop: 10,
                lineHeight: 25,
                textAlign: 'justify',
              }}>
              10% Instant Discount up to a maximum of Rs. 1,000 with Cananra
              Bank Credit and Debit on a minimum spend of Rs. 2,000.
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: Fonts.BOLD,
                marginTop: 10,
                textAlign: 'justify',
              }}>
              - What is the offer ?
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: Fonts.REGULAR,
                marginTop: 10,
                lineHeight: 25,
                textAlign: 'justify',
              }}>
              10% Instant Discount up to a maximum of Rs. 1,000 with Cananra
              Bank Credit and Debit on a minimum spend of Rs. 2,000.
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: Fonts.BOLD,
                marginTop: 10,
                textAlign: 'justify',
              }}>
              - What is the offer ?
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontFamily: Fonts.REGULAR,
                marginTop: 10,
                lineHeight: 25,
                textAlign: 'justify',
              }}>
              10% Instant Discount up to a maximum of Rs. 1,000 with Cananra
              Bank Credit and Debit on a minimum spend of Rs. 2,000.
            </Text>
            <TouchableOpacity
              style={{
                width: width * 0.7,
                backgroundColor: Colors.ACCENT_SECONDARY,
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                marginTop: 20,
                padding: 10,
                borderRadius: 10,
              }}
              onPress={() => {
                this.state.AdvertisementUrl
                  ? OpenUrl(this.state.AdvertisementUrl)
                  : null;
              }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: Fonts.BOLD,
                  lineHeight: 25,
                  textAlign: 'justify',
                  color: Colors.ACCENT,
                }}>
                Click here for more Information
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </NoScrollBackground>
    );
  }
}

export default withTranslation()(AdvertisementScreen);

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
