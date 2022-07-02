import React, {PureComponent} from 'react';
import {withNavigation} from 'react-navigation';
import {View, Image, StyleSheet, StatusBar, BackHandler} from 'react-native';
import Offline from '../utils/Offline';
import Constants, {Colors, LocalKeys, Message} from '../utils/Constants';
import Online from '../utils/Online';
import {ShowToast} from '../components/Functions';
import NetInfo from '@react-native-community/netinfo';
import RNExitApp from 'react-native-exit-app';

export default class Splash extends PureComponent {
  constructor(props) {
    super(props);

    this.backPressHandler = null;

    this.Offline = new Offline();
    this.Online = new Online();
  }

  componentDidMount() {
    this.backPressHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this._handleBackPress.bind(this),
    );

    NetInfo.fetch().then(state => {
      if (!state.isConnected) {
        ShowToast('Turn on internet to use the App');
        setTimeout(() => {
          RNExitApp.exitApp();
        }, 2000);
      } else {
        this.checkUser().finally(() => {
          this.getCartDetails().finally(() => {
            this.getInitialValues().finally(() => {
              this.props.navigation.navigate('DrawerScreen');
            });
          });
        });
      }
    });
  }

  _handleBackPress = () => {
    RNExitApp.exitApp();
    return true;
  };

  checkUser = async () => {
    let response = await this.Offline.get(LocalKeys.USER_DETAILS, {});

    if (typeof response === 'string') {
      let user = JSON.parse(response);

      global.loginType = user.type;
      global.partnerId = user.partner_id;
      global.userDetails = user;
      global.isGuest = false;
    }
  };

  getCartDetails = async () => {
    let response = await this.Offline.get(LocalKeys.CART_DETAILS, {});

    global.cartDetails =
      typeof response === 'string' ? JSON.parse(response) : {};
  };

  getInitialValues = async () => {
    let partner_id = global.isGuest ? null : global.partnerId;
    let quotation_id = global.cartDetails.cart_id ?? '';

    let response = await this.Online.getInitialValues(partner_id, quotation_id);

    if (response.error) {
      if (Constants.DEBUG) {
        console.log(response);
      }

      ShowToast(Message.ERROR_TRY_AGAIN);
      RNExitApp.exitApp();
    }

    global.publicUserId = response.result.public_user_id;
    global.partnerId = global.isGuest ? global.publicUserId : global.partnerId;
    global.priceListId = response.result.pricelist_id;
    global.currency = response.result.currency_id;
    global.categories = response.result.categories;
    global.homePage = response.result.homepage_blocks;
    global.profilePic = response.result.profile_picture;
    global.countStats = response.result.count_stats;
    global.ratingEnabled = response.result.comment_status;
  };

  render() {
    return (
      <View style={styles.root}>
        <StatusBar backgroundColor={Colors.PRIMARY} />
        <Image source={require('../assets/logo.png')} style={styles.logo} />
      </View>
    );
  }

  componentWillUnmount() {
    if (this.backPressHandler) {
      this.backPressHandler.remove();
    }
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.PRIMARY,
  },
  logo: {
    width: 150,
    height: 150,
  },
});
