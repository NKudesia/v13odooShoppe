import React, {PureComponent} from 'react';
import {
  HeaderBg,
  Wrap,
  TouchableIcon,
  WhiteText,
  CartProductsList,
  DefaultText,
  BottomBar,
  Button,
  OrderTotalCard,
  NoScrollBackground,
  ScrollableBody,
} from '../components/Common';
import axios from 'axios';
import {View, StyleSheet, Dimensions} from 'react-native';
import Constants, {Fonts, Colors, Message} from '../utils/Constants';
import Feather from 'react-native-vector-icons/Feather';
import Online from '../utils/Online';
import {
  BackWithError,
  FormatCurrency,
  ShowToast,
  GetCartWishlistCount,
} from '../components/Functions';
import {NavigationEvents} from 'react-navigation';
import InternetPopup from '../components/InternetPopup';
import NetInfo from '@react-native-community/netinfo';
import {Translation, useTranslation, withTranslation} from 'react-i18next';
import {i18n} from 'i18next';
import {useTheme} from '../context/ThemeProvider';
import AsyncStorage from '@react-native-community/async-storage';

class Cart extends PureComponent {
  static contextType = useTheme();
  constructor(props) {
    super(props);

    this._is_mounted = false;
    this.internetListener = null;

    this.Online = new Online();

    this.state = {
      isLoading: true,
      partnerId: global.partnerId,
      cartId: global.cartDetails.cart_id,
      cartDetails: global.cartDetails,
      deliveryFee: null,
      showInternetPopup: false,
      visible: false,
    };

    this.getCart();
  }

  componentDidMount() {
    this._is_mounted = true;

    // console.log('Cart id : ', this.state.cartId);
    // console.log('from cart');
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      // do something
      this.createListeners();
      this.setState({
        cartDetails: global.cartDetails,
        cartId: global.cartDetails.cart_id,
        partnerId: global.partnerId,
      });
      this.getCart();
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

  getCart = async () => {
    if (!this.state.cartId) {
      this.stopLoading();
      return;
    }

    let response = await this.Online.viewCart(this.state.cartId);
    console.log(' getCart response', response);
    const curCode = await AsyncStorage.getItem('currencyCode');

    // this.updateCurrency(response.result.quotation_id);
    const id = response.result.quotation_id;
    console.log('code', curCode);

    axios
      .post('https://v13.kanakinfosystems.com/api/update/order/pricelist', {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          order_id: id,
          pricelist_id: parseInt(curCode),
        },
        id: 505136376,
      })
      .then(response => {
        console.log('update Currency from cart', response.data);
        // this.setState({
        //   visible: true
        // })
        // this.getCart();
      })
      .catch(error => {
        console.log(error);
      });

    this.setlOrderId(response.result.quotation_id);

    // if (this._is_mounted) {
    //   await AsyncStorage.setItem(
    //     'orderID',
    //     response.result.quotation_id.toString(),
    //   );
    // }

    if (!response.result) {
      BackWithError(this.props, Message.ERROR_TRY_AGAIN);
      return;
    }

    if (response.result.length < 1) {
      this.stopLoading();
      return;
    }

    let cartDetails = response.result;
    let deliveryFee = this.state.deliveryFee;

    if (cartDetails.order_line) {
      cartDetails.order_line.forEach((line, i) => {
        if (line.is_delivery && this._is_mounted) {
          deliveryFee = line.price_unit;
        }
      });
    }

    if (global.partnerId !== cartDetails.partner_id) {
      await this.updateCartPartner(this.state.cartId, cartDetails.partner_id);
    }

    if (this._is_mounted) {
      this.setState({
        cartDetails: cartDetails,
        deliveryFee: deliveryFee,
      });

      this.stopLoading();
    }
  };

  setlOrderId = async orId => {
    AsyncStorage.setItem('orderID', orId.toString());
  };

  // updateCurrency = async id => {
  //   // const orderId = await AsyncStorage.getItem('orderID');
  //   console.log('orderId from stroage', id);
  //   const curCode = await AsyncStorage.getItem('currencyCode');
  //   console.log('code', curCode);
  //   axios
  //     .post('https://v13.kanakinfosystems.com/api/update/order/pricelist', {
  //       jsonrpc: '2.0',
  //       method: 'call',
  //       params: {
  //         order_id: id,
  //         pricelist_id: parseInt(curCode),
  //       },
  //       id: 505136376,
  //     })
  //     .then(response => {
  //       console.log('update Currency from cart', response.data);
  //       // this.setState({
  //       //   visible: true
  //       // })
  //     })
  //     .catch(error => {
  //       console.log(error);
  //     });
  // };

  updateCartPartner = async (cartId, partnerId) => {
    let response = await this.Online.updateCartPartner(cartId, partnerId);
    console.log('updateCart', response);
    if (response.error) {
      if (Constants.DEBUG) {
        // console.log(response);
      }
      BackWithError(Message.ERROR_TRY_AGAIN);
      return;
    }
  };

  updateQtyTimeout = null;

  removeItem = async index => {
    if (this.updateQtyTimeout !== null) {
      clearTimeout(this.updateQtyTimeout);
    }

    let removeId = this.state.cartDetails.order_line[index].order_line_id;
    let cart = {...this.state.cartDetails};

    let order_line = [];

    this.state.cartDetails.order_line.map((item, idx) => {
      if (index !== idx) {
        order_line.push(item);
      }
    });

    cart.order_line = order_line.length > 0 ? order_line : false;

    if (this._is_mounted) {
      this.setState({
        cartDetails: cart,
      });
    }

    let response = await this.Online.removeFromCart(
      this.state.cartId,
      removeId,
    );
    console.log('remove cart item', response);
    if (response.error) {
      if (Constants.DEBUG) {
        console.log(response.error.data.arguments[0]);
      }
      ShowToast(Message.ERROR_TRY_AGAIN);
      return;
    }

    GetCartWishlistCount().finally(() => {
      ShowToast('Cart Updated');

      this.getCart();
    });
  };

  updateQuantity = async (index, value) => {
    let cart = {...this.state.cartDetails};

    let quantity = cart.order_line[index].product_uom_qty + value;

    cart.order_line[index].product_uom_qty = quantity;

    if (this._is_mounted) {
      this.setState({
        cartDetails: cart,
      });
    }

    if (this.updateQtyTimeout !== null) {
      clearTimeout(this.updateQtyTimeout);
    }

    this.updateQtyTimeout = setTimeout(async () => {
      let rowDetails = this.state.cartDetails.order_line[index];
      let response = await this.Online.addToCart(
        global.partnerId,
        this.state.cartId,
        rowDetails.product_id,
        0,
        quantity,
      );
      if (response.error) {
        if (Constants.DEBUG) {
          console.log(response.error.data.arguments[0]);
        }
        ShowToast(Message.ERROR_TRY_AGAIN);
        return;
      }
      GetCartWishlistCount().finally(() => {
        ShowToast('Cart Updated');
        this.getCart();
      });
    }, 400);
  };

  checkoutAction = () => {
    let routeName = global.isGuest ? 'SignUp' : 'BillingAndShipping';

    this.props.navigation.navigate(routeName, {
      // routeName: routeName,
      // params: {
      cart: true,
      // },
    });
  };

  cartList = () => (
    <View>
      {this.state.cartDetails.order_line ? (
        // console.log('cartList', this.state.cartDetails.order_line),
        <CartProductsList
          cartRowData={this.state.cartDetails}
          // cartRowData={this.state.cartDetails.order_line}
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

  emptyCart = () => (
    <Wrap style={styles.EmptyCartWrap}>
      <Feather name={'shopping-cart'} size={80} color={Colors.OVERLAY} />
      <DefaultText style={styles.EmptyCartTitle}>
        {this.props.i18n.t('Your Shopping Bag Is Empty')}
      </DefaultText>
      <Button
        style={(styles.EmptyCartButton, {backgroundColor: this.context.theme})}
        title={this.props.i18n.t('Go To Homepage')}
        onPress={() => {
          this.props.navigation.navigate('Home');
        }}
      />
    </Wrap>
  );

  stopLoading = () => {
    if (this._is_mounted && this.state.isLoading === true) {
      this.setState({isLoading: false});
    }
  };

  render() {
    return (
      <>
        <View style={styles.RenderWrap}>
          {/* <NavigationEvents
          onDidFocus={this.getCart}
          onDidBlur={this.removeListeners}
        /> */}

          <InternetPopup
            showModal={this.state.showInternetPopup}
            retryAction={() => {
              this.setState({
                showInternetPopup: false,
              });

              this.getCart();
            }}
          />
          {/* <NoScrollBackground> */}
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
                  {this.props.i18n.t('Cart')}
                </WhiteText>
              </View>
            </Wrap>
          </HeaderBg>

          <ScrollableBody showLoader={this.state.isLoading}>
            {this.state.cartDetails.order_line
              ? this.cartList()
              : this.emptyCart()}
          </ScrollableBody>

          {/* </NoScrollBackground> */}
          {this.state.cartDetails.order_line ? (
            <BottomBar style={styles.BottomBar}>
              <DefaultText style={styles.grossText}>
                {/* {this.state.cartDetails.amount_total &&
                // FormatCurrency(this.state.cartDetails.amount_total)}
              } */}
                {this.state.cartDetails.amount_total &&
                  this.state.cartDetails.currency +
                    ' ' +
                    parseFloat(this.state.cartDetails.amount_total).toFixed(2) +
                    ' '}
              </DefaultText>
              <Button
                title={this.props.i18n.t('Checkout')}
                style={
                  (styles.CheckoutButton, {backgroundColor: this.context.theme})
                }
                onPress={this.checkoutAction}
              />
            </BottomBar>
          ) : null}
        </View>
      </>
    );
  }

  componentWillUnmount() {
    this._is_mounted = false;

    this.removeListeners();
  }
}

export default withTranslation()(Cart);

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
  MarginRight8: {
    marginRight: 8,
  },
  HeaderLeftContent: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  HeaderLoginButton: {
    fontSize: 20,
  },
  Logo: {
    fontSize: 20,
    fontFamily: Fonts.REGULAR,
  },
  paddingBottom10: {
    paddingBottom: 10,
  },
  OrderTotalCard: {
    paddingBottom: 20,
  },
  CardHeader: {
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
  BottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  grossText: {
    fontFamily: Fonts.REGULAR,
    fontSize: 26,
  },
  CheckoutButton: {
    width: Dimensions.get('window').width * 0.45,
    textAlign: 'center',
    fontSize: 18,
    paddingVertical: 12,
  },
  FullWidthButton: {
    fontSize: 20,
    paddingVertical: 10,
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
});
