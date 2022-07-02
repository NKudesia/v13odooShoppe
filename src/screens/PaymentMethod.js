import {
  initPaymentSheet,
  presentPaymentSheet,
  StripeProvider,
  useStripe,
  paymentIntents,
  confirmPaymentSheetPayment,
  confirmPayment,
  retrievePaymentIntent,
  // CardField,
  useConfirmPayment,
} from '@stripe/stripe-react-native';
import React, {PureComponent, useState} from 'react';
import {
  HeaderBg,
  Wrap,
  TouchableIcon,
  WhiteText,
  BottomBar,
  FullWidthButton,
  RadioOptions,
  ScrollableBody,
  NoScrollBackground,
} from '../components/Common';
import {View, StyleSheet, Platform, Alert} from 'react-native';
import Constants, {Fonts, Models, Message, ApiUrls} from '../utils/Constants';
import Online from '../utils/Online';
import {BackWithError, ShowToast} from '../components/Functions';
import {NavigationEvents} from 'react-navigation';
import Browser from '../components/Browser';
import InternetPopup from '../components/InternetPopup';
import NetInfo from '@react-native-community/netinfo';
import {Translation, useTranslation, withTranslation} from 'react-i18next';
import {useTheme} from '../context/ThemeProvider';
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import LottieView from 'lottie-react-native';
import {OrderPlacedLoader} from '../components/orderPlacedLoader';

class PaymentMethod extends PureComponent {
  static contextType = useTheme();

  constructor(props) {
    super(props);

    this._is_mounted = false;
    this.internetListener = null;
    this.Online = new Online();
    this.state = {
      isLoading: true,
      cartId: global.cartDetails.cart_id,
      cartDetails: [],
      selectedPaymentOption: null,
      paymentOptions: [],
      paymentMethods: [],
      paymentModalVisible: false,
      paymentUrl: true,
      is_paypal: false,
      showInternetPopup: false,
      idd: '',
      visible: false,
    };
  }

  componentDidMount() {
    this._is_mounted = true;
    // console.log('Cart Details helo', cartDetails);
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

  removeListeners = () => {
    if (this.internetListener) {
      this.internetListener();
    }
  };

  getCartDetails = async () => {
    let response = await this.Online.viewCart(this.state.cartId);
    console.log('response getCartDetails', response);
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

    this.getPaymentMethods();
  };

  getPaymentMethods = async () => {
    let response = await this.Online.customSearch(
      Models.PAYMENT_METHOD,
      [],
      [['state', 'in', ['enabled', 'test']]],
    );

    if (!response.result) {
      if (Constants.DEBUG) {
        // console.log('Error fetching payment methods', response);
      }
      BackWithError(this.props, Message.ERROR_TRY_AGAIN);
    }

    if (response.result.records.length < 1) {
      if (Constants.DEBUG) {
        // console.log('No payment methods enabled');
      }
      BackWithError(this.props, Message.ERROR_TRY_AGAIN);
    }

    let paymentOptions = [];

    response.result.records.map(pay => {
      // console.log('payement option', pay.name);
      paymentOptions.push(pay.name);
    });

    if (this._is_mounted) {
      this.setState({
        paymentOptions: paymentOptions,
        paymentMethods: response.result.records,
        isLoading: false,
      });
    }
  };

  updatePaymentMethod = index => {
    if (this._is_mounted) {
      this.setState({
        selectedPaymentOption: index,
      });
    }
  };

  processPayment = async () => {
    let method = this.state.paymentMethods[this.state.selectedPaymentOption];

    if (this.state.selectedPaymentOption == 2) {
      // console.log('which method', this.state.selectedPaymentOption);
      this.stripePaymentProcess();
      return;
    } else {
      let url =
        ApiUrls.BASE_URL +
        ApiUrls.PAYMENT_URL +
        '?order_id=' +
        this.state.cartDetails.quotation_id +
        '&acquirer_id=' +
        method.id;
      this.setState({
        idd: method.id,
      });
      // console.log('process url', url);
      if (this._is_mounted) {
        this.setState({
          paymentModalVisible: true,
          paymentUrl: url,
        });
        // console.log('url', url);
      }
    }
  };

  stripePaymentProcess = async () => {
    const so_id = await AsyncStorage.getItem('orderID');
    console.log('so_id from stripe process', so_id);
    try {
      // sending request
      const response = await fetch(
        // 'https://v13.kanakinfosystems.com/web/session/authenticate/payment-sheet',
        'https://v13.kanakinfosystems.com/api/stripe/payment',
        {
          method: 'POST',
          body: JSON.stringify({
            params: {
              // db: 'odoo_shoppe',
              // login: 'admin',
              // password: 'os@kanak',
              so_id: so_id,
            },
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const data = await response.json();
      console.log('data', data);
      if (!response.ok) return Alert.alert(data.message);
      // const clientSecret = data.clientSecret;
      const payment_intent_id = data.result.payment_intent_id;

      const customer_Id = data.result.customer_id;
      const customerEphemeralKeySecret = data.result.ephemeral_secret_key;
      const paymentIntentClientSecret = data.result.client_secret;

      console.log('paymentIntentClientSecret', paymentIntentClientSecret);

      const initSheet = await initPaymentSheet({
        customerId: customer_Id,
        // customerEphemeralKeySecret: customerEphemeralKeySecret,
        paymentIntentClientSecret: paymentIntentClientSecret,
        allowsDelayedPaymentMethods: true,
      });

      if (initSheet.error) return Alert.alert(initSheet.error.message);

      const presentSheet = await presentPaymentSheet(paymentIntentClientSecret);

      if (presentSheet.error) {
        return Alert.alert(presentSheet.error.message);
      }

      const {error} = confirmPaymentSheetPayment(paymentIntentClientSecret);
      if (error) {
        Alert.alert(`Error code: ${error.code}`, error.message);
      } else {
        // this.sendPaymentIntent(data.result.payment_intent_id);
        console.log('py', data.result.payment_intent_id);

        console.log('payment intent', payment_intent_id);

        try {
          axios
            .post(
              'https://v13.kanakinfosystems.com/api/stripe/payment_response',
              {
                jsonrpc: '2.0',
                method: 'call',
                params: {
                  payment_intent: payment_intent_id,
                },
                id: 505136376,
              },
            )
            .then(response => {
              console.log('resposne status', response.data);
              if (response.data.result.Status === 'Done') {
                this.setState({visible: true});
                // this.props.navigation.navigate('OrderPlaced', {});
                setTimeout(() => {
                  this.orderCompletion();
                }, 2200);
              }
            })
            .catch(error => {
              console.log(error);
            });
        } catch (error) {
          console.log(error);
        }

        // Alert.alert(
        //   'Success',
        //   'Your order is confirmed!'
        // );
      }

      // useStripe.retrievePaymentIntent(paymentIntentClientSecret).then((response) => {
      //       if (response.paymentIntent && response.paymentIntent.status === 'succeeded') {
      //         // Handle successful payment here
      //         console.log("gggg", response.paymentIntent.status)
      //       } else {
      //         // Handle unsuccessful, processing, or canceled payments and API errors here
      //         console.log("fffff",response.paymentIntent.status)
      //       }
      //     });

      // Alert.alert('Payment complete, thank you!');
      await AsyncStorage.removeItem('orderID');
    } catch (err) {
      console.error(err);
      // Alert.alert('Something went wrong, try again later!');
    }
  };
  orderCompletion = () => {
    this.props.navigation.navigate('OrderPlaced', {});
    this.setState({visible: false});
  };
  // sendPaymentIntent = intent => {
  //   console.log('check ', intent);
  //   axios
  //     .post('https://v13.kanakinfosystems.com/api/stripe/payment_response', {
  //       jsonrpc: '2.0',
  //       method: 'call',
  //       params: {
  //         payment_intent: intent,
  //       },
  //       id: 505136376,
  //     })
  //     .then(response => {
  //       console.log('resposne status', response.data);
  //     })
  //     .catch(error => {
  //       console.log(error);
  //     });
  // };

  handleResponse = data => {
    // console.log('when hona shuru', data);
    // this.setState({isLoading: true});

    if (
      data.url === ApiUrls.BASE_URL + '/shop' &&
      !data.title.includes('Payment processing page')
    ) {
      this.props.navigation.navigate('OrderPlaced', {});

      if (this._is_mounted) {
        // this.props.navigation.navigate({routeName: 'OrderPlaced'});
        this.setState({
          paymentModalVisible: false,
          paymentUrl: '',
        });
      }

      // {setTimeout(() => {
      //   this.props.navigation.navigate({routeName: 'OrderPlaced'});
      // }, 2000);}

      // this.props.navigation.navigate({routeName: 'OrderPlaced'});
    } else if (data.url === ApiUrls.BASE_URL + '/payment/paypal/cancel/') {
      if (this._is_mounted) {
        this.setState({
          paymentModalVisible: false,
          paymentUrl: '',
        });
      }

      setTimeout(() => {
        ShowToast('Payment Cancelled');
      }, 1000);
    }
  };

  stopLoading = () => {
    if (this._is_mounted) {
      this.setState({isLoading: false});
    }
  };

  render() {
    const {t, i18n} = this.props;
    // const stripe = useStripe();

    return (
      <>
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
                    onPress={() => {
                      this.props.navigation.goBack();
                    }}
                    name={'chevron-left'}
                    style={styles.HeaderRightIcon}
                  />
                  <WhiteText style={styles.Logo}>
                    {this.props.i18n.t('Payment Method')}
                  </WhiteText>
                </View>
              </Wrap>
            </HeaderBg>
            <ScrollableBody showLoader={this.state.isLoading}>
              <Browser
                visible={this.state.paymentModalVisible}
                source={{uri: this.state.paymentUrl}}
                // source={{uri: `https://v13.kanakinfosystems.com`}}

                onNavigate={this.handleResponse}
                onBack={() => {
                  this.setState({paymentModalVisible: false});
                }}
              />
              <RadioOptions
                data={this.state.paymentOptions}
                selected={this.state.selectedPaymentOption}
                onChange={this.updatePaymentMethod}
              />
            </ScrollableBody>
          </NoScrollBackground>
          {this.state.selectedPaymentOption !== null && (
            <BottomBar>
              <FullWidthButton
                title={this.props.i18n.t('Continue')}
                style={
                  (styles.SaveButton, {backgroundColor: this.context.theme})
                }
                onPress={this.processPayment}
                // onPress={this.stripePaymentProcess}
              />
            </BottomBar>
          )}
        </View>
        {this.state.visible ? <OrderPlacedLoader /> : null}
      </>
    );
  }

  componentWillUnmount() {
    this._is_mounted = false;

    this.removeListeners();
  }
}

export default withTranslation()(PaymentMethod);

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
  MarginBottom15: {
    marginBottom: 15,
  },
  SaveButton: {
    textAlign: 'center',
    fontSize: 18,
    paddingVertical: 12,
  },
});
