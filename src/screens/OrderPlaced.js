import React, {PureComponent} from 'react';
import {
  HeaderBg,
  Wrap,
  TouchableIcon,
  WhiteText,
  BottomBar,
  FullWidthButton,
  DefaultText,
  OrderPlacedProductList,
  CartProductsList,
  OrderTotalCard,
  AddressCardNonEditable,
  ScrollableBody,
  NoScrollBackground,
} from '../components/Common';
import {View, StyleSheet} from 'react-native';
import {Fonts, Colors, Message, LocalKeys} from '../utils/Constants';
import {NavigationEvents} from 'react-navigation';
import {
  BackWithError,
  ShowToast,
  GetCartWishlistCount,
} from '../components/Functions';
import Online from '../utils/Online';
import Offline from '../utils/Offline';
import InternetPopup from '../components/InternetPopup';
import NetInfo from '@react-native-community/netinfo';
import {useTheme} from '../context/ThemeProvider';

export default class OrderPlaced extends PureComponent {
  static contextType = useTheme();
  constructor(props) {
    super(props);

    this._is_mounted = false;
    this.internetListener = null;

    this.Offline = new Offline();
    this.Online = new Online();

    this.state = {
      isLoading: true,
      partnerId: global.partnerId,
      userDetails: global.userDetails,
      cartId: global.cartDetails.cart_id,
      cartDetails: [],
      cartRowDetails: [],
      cartProductDetails: [],
      cartProductsList: [],
      billingAddress: [],
      shippingAddress: [],
      deliveryFee: null,
      showInternetPopup: false,
    };
  }

  componentDidMount() {
    this._is_mounted = true;
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      // do something
      this.getCartDetails();
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
  // vv
  removeListeners = () => {
    if (this.internetListener) {
      this.internetListener();
    }
  };

  getCartDetails = async () => {
    let response = await this.Online.viewCart(this.state.cartId);

    if (!response.result) {
      BackWithError(this.props, Message.ERROR_TRY_AGAIN);
      return;
    }

    let cartDetails = response.result;
    let deliveryFee = this.state.deliveryFee;

    cartDetails.order_line.forEach((line, i) => {
      if (line.is_delivery && this._is_mounted) {
        deliveryFee = line.price_unit;
      }
    });

    if (this._is_mounted) {
      this.setState({
        cartDetails: cartDetails,
        deliveryFee: deliveryFee,
      });
    }

    this.getPartnerDetails();
  };

  getPartnerDetails = async () => {
    let response = await this.Online.viewPartnerDetails(this.state.partnerId);

    if (!response.result || !response.result.partner_id) {
      BackWithError(this.props, Message.ERROR_TRY_AGAIN);
      return;
    }

    let userDetails = response.result;
    let billingAddress = [];
    let shippingAddress = [];

    if (response.result.address.length > 0) {
      response.result.address.map(address => {
        if (this._is_mounted) {
          if (address.address_type === 'invoice') {
            billingAddress = address;
          } else {
            shippingAddress = address;
          }
        }
      });
    }

    if (this._is_mounted) {
      this.setState({
        userDetails: userDetails,
        billingAddress: billingAddress,
        shippingAddress: shippingAddress,
      });
    }

    this.updateLocalCartDetails();
  };

  cartList = () => (
    <View>
      {this.state.cartRowDetails.length ===
      this.state.cartProductDetails.length ? (
        <CartProductsList
          cartRowData={this.state.cartDetails.order_line}
          removeAction={this.removeItem}
          updateAction={this.updateQuantity}
        />
      ) : null}
      <OrderTotalCard
        cartDetails={this.state.cartDetails}
        deliveryFee={this.state.deliveryFee}
      />
    </View>
  );

  updateLocalCartDetails = async () => {
    let response = await this.Offline.set(
      LocalKeys.CART_DETAILS,
      JSON.stringify([]),
    );

    if (response) {
      global.cartDetails = [];
    } else {
      ShowToast(Message.ERROR_TRY_AGAIN);
    }

    GetCartWishlistCount().finally(() => {
      this.stopLoading();
    });
  };

  stopLoading = () => {
    if (this._is_mounted) {
      this.setState({isLoading: false});
    }
  };

  navigateToHome = () => {
    this.props.navigation.navigate('Home', {
      // routeName: 'Home',
    });
  };

  render() {
    return (
      <View style={styles.RenderWrap}>
        {/* <NavigationEvents
          onDidFocus={() => {
            this.createListeners();
            this.getCartDetails();
          }}
          onDidBlur={this.removeListeners}
        /> */}
        <InternetPopup
          showModal={this.state.showInternetPopup}
          retryAction={() => {
            this.setState({
              showInternetPopup: false,
            });

            this.getCartDetails();
          }}
        />
        <NoScrollBackground>
          <HeaderBg>
            <Wrap>
              <View style={styles.Header}>
                <TouchableIcon
                  onPress={this.navigateToHome}
                  name={'chevron-left'}
                  style={styles.HeaderRightIcon}
                />
                <WhiteText style={styles.Logo}>{'Order Confirmed'}</WhiteText>
              </View>
            </Wrap>
          </HeaderBg>
          <ScrollableBody
            // eslint-disable-next-line react-native/no-inline-styles
            style={{paddingBottom: 200}}
            showLoader={this.state.isLoading}>
            {/* Order Confirmed Card */}
            <View style={{...styles.OrderTotalCard, ...styles.MarginBottom15}}>
              <View style={styles.FlexDirectionRow}>
                <TouchableIcon
                  name={'check-circle'}
                  color={Colors.SUCCESS}
                  size={50}
                  style={styles.PaddingRight15}
                />
                <View style={styles.Flex2}>
                  <View style={styles.CardHeader}>
                    <DefaultText style={styles.Title}>
                      {'Order ' + this.state.cartDetails.name + ' Confirmed'}
                    </DefaultText>
                  </View>
                  <View style={styles.CardBody}>
                    <DefaultText style={styles.PaddingBottom5}>
                      {'Thank you for your order.'}
                    </DefaultText>
                    <DefaultText style={styles.PaddingBottom5}>
                      {
                        'Your payment has been successfully processed. Thank You!'
                      }
                    </DefaultText>
                  </View>
                </View>
              </View>
            </View>
            {/* Billing Address Card */}
            <AddressCardNonEditable
              address={this.state.billingAddress}
              title={'Billing Address'}
            />
            {/* Shipping Address Card */}
            <AddressCardNonEditable
              address={this.state.shippingAddress}
              title={'Shipping Address'}
            />
            {/* Products List Cards */}
            <OrderPlacedProductList
              cartRowData={this.state.cartDetails.order_line}
            />
            {/* Order Total Card */}
            <OrderTotalCard
              cartDetails={this.state.cartDetails}
              deliveryFee={this.state.deliveryFee}
            />
          </ScrollableBody>
        </NoScrollBackground>
        <BottomBar>
          <FullWidthButton
            title={'Place Another Order'}
            style={
              (styles.SaveButton,
              {backgroundColor: this.context.theme})
            }
            onPress={this.navigateToHome}
          />
        </BottomBar>
      </View>
    );
  }

  componentWillUnmount() {
    this._is_mounted = false;

    this.removeListeners();
  }
}

const styles = StyleSheet.create({
  RenderWrap: {
    flex: 1,
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
    alignItems: 'flex-end',
  },
  Logo: {
    fontSize: 20,
    fontFamily: Fonts.REGULAR,
  },
  paddingBottom10: {
    paddingBottom: 10,
  },
  MarginBottom15: {
    marginBottom: 15,
  },
  OrderTotalCard: {
    paddingBottom: 20,
    paddingHorizontal: '3%',
    paddingVertical: 10,
    backgroundColor: Colors.WHITE,
  },
  CardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ACCENT_SECONDARY,
  },
  CardHeaderAction: {},
  Title: {
    fontFamily: Fonts.REGULAR,
    fontSize: 16,
  },
  CardBody: {
    paddingVertical: 10,
  },
  CardTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  CardFooter: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.ACCENT_SECONDARY,
  },
  CardFooterTitle: {
    fontFamily: Fonts.REGULAR,
  },
  SaveButton: {
    textAlign: 'center',
    fontSize: 18,
    paddingVertical: 12,
  },
  FlexDirectionRow: {
    flexDirection: 'row',
  },
  PaddingRight15: {
    paddingRight: 15,
  },
  Flex2: {
    flex: 2,
  },
  PaddingBottom5: {
    paddingBottom: 5,
  },
});
