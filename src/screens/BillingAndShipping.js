import React, {PureComponent} from 'react';
import {
  Background,
  HeaderBg,
  Wrap,
  TouchableIcon,
  WhiteText,
  Body,
  BottomBar,
  FullWidthButton,
  DefaultText,
  OrderTotalCard,
} from '../components/Common';
import axios from 'axios';
import {View, StyleSheet, Dimensions, FlatList} from 'react-native';
import Constants, {Fonts, Colors, Message} from '../utils/Constants';
import {BackWithError} from '../components/Functions';
import Online from '../utils/Online';
import {NavigationEvents} from 'react-navigation';
import InternetPopup from '../components/InternetPopup';
import NetInfo from '@react-native-community/netinfo';
import {Translation, useTranslation, withTranslation} from 'react-i18next';
import {useTheme} from '../context/ThemeProvider';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import AsyncStorage from '@react-native-community/async-storage';

const headerHeight = Constants.SCREEN_HEADER_HEIGHT;

class BillingAndShipping extends PureComponent {
  static contextType = useTheme();

  constructor(props) {
    super(props);

    this._is_mounted = false;
    this.internetListener = null;

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
      deliveryMethods: [],
      deliveryFee: null,
      showInternetPopup: false,
      shippingIdd: '',
      confirmButtonStatus: false,
      partId: null,
      qouteId: null,
      id: '',
      billingA: '',
      checkedBoxId: '',
    };
  }

  componentDidMount() {
    this._is_mounted = true;
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      // do something
      this.getCartDetails();
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
    if (!this.state.cartId) {
      this.stopLoading();
      return;
    }

    let response = await this.Online.viewCart(this.state.cartId);
    console.log('get cart details', response);
    if (!response.result) {
      BackWithError(this.props, Message.ERROR_TRY_AGAIN);
      return;
    }

    let cartDetails = response.result;
    let deliveryFee = this.state.deliveryFee;

    this.setState({
      partId: response.result.partner_id,
      qouteId: response.result.quotation_id,
    });

    cartDetails.order_line.forEach((line, i) => {
      if (line.is_delivery && this._is_mounted) {
        deliveryFee = line.price_unit;
      }
    });

    if (global.partnerId !== cartDetails.partner_id) {
      await this.updateCartPartner(cartDetails.quotation_id, global.partnerId);
    }

    if (this._is_mounted) {
      this.setState({
        cartDetails: cartDetails,
        deliveryFee: deliveryFee,
      });

      this.stopLoading();
    }

    this.getPartnerDetails();
  };

  updateCartPartner = async (cartId, partnerId) => {
    let response = await this.Online.updateCartPartner(cartId, partnerId);

    if (response.error) {
      if (Constants.DEBUG) {
        console.log(response);
      }
      BackWithError(Message.ERROR_TRY_AGAIN);
      return;
    }
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
            // shippingAddress = address;
            if (address.address_type === 'delivery') {
              let temp_id = address.id;
              console.log('temp_id', temp_id);
              if (address.id === temp_id) {
                shippingAddress.push(address);
                console.log('pushed');
              } else {
                console.log('same');
              }
            }
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

    this.stopLoading();
  };

  confirm = () => {
    this.props.navigation.navigate('DeliveryMethod', {});
  };

  stopLoading = () => {
    if (this._is_mounted) {
      this.setState({isLoading: false});
    }
  };

  yourInfoCard = () => {
    // const {t, i18n} = useTranslation();
    return (
      <View style={{...styles.OrderTotalCard, ...styles.MarginBottom15}}>
        <View style={styles.CardHeader}>
          <DefaultText style={styles.Title}>
            {this.props.i18n.t('Your Info')}
          </DefaultText>
          {global.loginType === Constants.LOGIN_TYPES.EMAIL ? (
            <TouchableIcon
              name={'edit'}
              color={Colors.ACCENT}
              onPress={() => {
                this.props.navigation.navigate('YourInfo', {
                  // routeName: 'YourInfo',
                  // params: {
                  onBack: () => this.getPartnerDetails(),
                  // },
                });
              }}
            />
          ) : null}
        </View>
        <View style={styles.CardBody}>
          <DefaultText style={styles.paddingBottom5}>
            {this.state.userDetails.name}
          </DefaultText>
          <DefaultText style={styles.paddingBottom5}>
            {this.state.userDetails.email}
          </DefaultText>
          {/* <DefaultText>{this.state.yourInfo.phone}</DefaultText> */}
        </View>
      </View>
    );
  };

  removeAddress = id => {
    let temp = this.state.id;
    console.log('id', id);
    if (id == null) {
      Alert.alert('Select the Address First!!');
    } else {
      axios
        .post('https://v13.kanakinfosystems.com/api/remove/partner/address', {
          jsonrpc: '2.0',
          method: 'call',
          params: {
            partner_id: id,
            archive: true,
          },
          id: 505136376,
        })
        .then(response => {
          console.log('removeAddress', response.data);
          this.getPartnerDetails();
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  quickUpdateSelectedAddress = async iid => {
    console.log('idddd', iid);
    const quotation_id = await AsyncStorage.getItem('orderID');
    console.log('qout', quotation_id);
    console.log('bbbbb', this.state.partnerId, iid, this.state.billingA);
    axios
      .post('https://v13.kanakinfosystems.com/sale/partner/quick/update', {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          quotation_id: quotation_id,
          partner_id: this.state.partnerId,
          partner_shipping_id: iid,
          partner_invoice_id: this.state.billingA,
        },
        id: 505136376,
      })
      .then(response => {
        console.log('Response', response.data);
      })
      .catch(error => {
        console.log(error);
      });
  };

  shippingAddressCard = (title, address) => {
    console.log('from shipAdd', address);

    const handleCheckbox = async id => {
      console.log('coming', id);
      await AsyncStorage.setItem('shippingId', id);

      const shipId = await AsyncStorage.getItem('shippingId');
      // console.log('shipId', shipId);

      if (shipId != null) {
        // console.log('from if');
        this.setState({
          shippingIdd: shipId,
        });
      }
      // let sett = await this.Online.updateCartPartner(
      //   id,
      //   this.state.partId,
      // );

      // console.log("sett", sett);
    };

    return (
      <>
        <View
          style={{
            ...styles.OrderTotalCard,
            ...styles.MarginBottom15,
          }}>
          {/* {address.map} */}
          <View style={styles.CardHeader}>
            <View style={{flexDirection: 'row'}}>
              <DefaultText style={styles.Title}>{title}</DefaultText>
            </View>
            <View
              style={{
                backgroundColor: 'transparent',
                flexDirection: 'row',
                padding: 1,
                width: 120,
                justifyContent: 'space-between',
              }}>
              <TouchableIcon
                name={'plus'}
                color={Colors.ACCENT}
                onPress={() => {
                  this.props.navigation.navigate('UpdateAddress', {
                    // routeName: 'UpdateAddress',
                    // params: {
                    // updateType: item.item.id ?? null ? 'add' : 'edit',
                    updateType: 'add',
                    addressType:
                      title === 'Shipping Address' ? 'delivery' : null,
                    addressId: false,
                    onBack: () => this.getPartnerDetails(),
                    // },
                  });
                }}
              />
              <TouchableIcon
                name={'edit'}
                color={Colors.ACCENT}
                onPress={() => {
                  this.props.navigation.navigate('UpdateAddress', {
                    // routeName: 'UpdateAddress',
                    // params: {
                    updateType: this.state.id ?? null ? 'edit' : 'add',

                    addressType:
                      title === 'Billing Address' ? 'invoice' : 'delivery',
                    addressId: this.state.id ?? null,
                    onBack: () => this.getPartnerDetails(),
                    // },
                  });
                }}
              />
              <TouchableIcon
                name={'trash'}
                color={Colors.ACCENT}
                onPress={() => {
                  this.removeAddress(this.state.id);
                }}
              />
            </View>
          </View>
        </View>
        <FlatList
          data={address}
          renderItem={item => {
            // console.log('shippingAddressCard render item', item.item);
            return (
              <View
                style={{
                  ...styles.OrderTotalCard,
                  ...styles.MarginBottom15,
                }}>
                <View style={styles.CardHeader}>
                  <View style={{flexDirection: 'row'}}>
                    <BouncyCheckbox
                      isChecked={
                        this.state.checkedBoxId == item.item.id ? true : false
                      }
                      disableBuiltInState
                      size={18}
                      fillColor="#43C0F6"
                      unfillColor="#FFFFFF"
                      text="Custom Checkbox"
                      iconStyle={{borderColor: '#43C0F6'}}
                      // textStyle={{fontFamily: 'JosefinSans-Regular'}}
                      onPress={() => {
                        handleCheckbox(item.item.id.toString());
                        this.setState({
                          confirmButtonStatus: true,
                          id: item.item.id,
                          checkedBoxId: item.item.id,
                        });
                        this.quickUpdateSelectedAddress(item.item.id);
                      }}
                      disableText={true}
                    />
                    <DefaultText style={styles.Title}>
                      {item.item.address_name}
                    </DefaultText>
                  </View>
                </View>

                <View style={styles.CardBody}>
                  {item.item.street ? (
                    <>
                      <View>
                        <DefaultText style={styles.paddingBottom5}>
                          {item.item.street +
                            ', ' +
                            (item.item.street2 ? item.item.street2 + ', ' : '')}
                        </DefaultText>
                        <DefaultText style={styles.paddingBottom5}>
                          {item.item.city +
                            (item.item.state_id
                              ? ', ' + item.item.state_id[1]
                              : '') +
                            ' - ' +
                            item.item.zip}
                        </DefaultText>
                        <DefaultText style={styles.paddingBottom5}>
                          {item.item.country_id[1]}
                        </DefaultText>
                      </View>
                    </>
                  ) : (
                    <>
                      <DefaultText style={{textAlign: 'center', marginTop: 10}}>
                        {'No Address Updated'}
                      </DefaultText>
                    </>
                  )}
                </View>
              </View>
            );
          }}
        />
      </>
    );
  };

  addressCard = (title, address) => (
    console.log(address),
    this.setState({
      billingA: address.id,
    }),
    (
      <View style={{...styles.OrderTotalCard, ...styles.MarginBottom15}}>
        <View style={styles.CardHeader}>
          <DefaultText style={styles.Title}>
            {this.props.i18n.t(title)}
          </DefaultText>

          <TouchableIcon
            name={'edit'}
            color={Colors.ACCENT}
            onPress={() => {
              this.props.navigation.navigate('UpdateAddress', {
                // routeName: 'UpdateAddress',
                // params: {
                updateType: address.id ?? null ? 'edit' : 'add',
                addressType:
                  title === 'Billing Address' ? 'invoice' : 'delivery',
                addressId: address.id ?? null,
                onBack: () => this.getPartnerDetails(),
              });
            }}
          />
        </View>

        <View style={styles.CardBody}>
          {address.street ? (
            <View>
              <DefaultText style={styles.paddingBottom5}>
                {address.street +
                  ', ' +
                  (address.street2 ? address.street2 + ', ' : '')}
              </DefaultText>
              <DefaultText style={styles.paddingBottom5}>
                {address.city +
                  (address.state_id ? ', ' + address.state_id[1] : '') +
                  ' - ' +
                  address.zip}
              </DefaultText>
              <DefaultText style={styles.paddingBottom5}>
                {address.country_id[1]}
              </DefaultText>
            </View>
          ) : (
            // eslint-disable-next-line react-native/no-inline-styles
            <DefaultText style={{textAlign: 'center', marginTop: 10}}>
              {'No Address Updated'}
            </DefaultText>
          )}
        </View>
      </View>
    )
  );

  render() {
    const {t, i18n} = this.props;
    return (
      <View style={styles.RenderWrap}>
        {/* <NavigationEvents
          onDidFocus={this.getCartDetails}
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
        <Background>
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
                  {this.props.i18n.t('Billing & Shipping')}
                </WhiteText>
              </View>
            </Wrap>
          </HeaderBg>
          <Body
            showLoader={this.state.isLoading}
            style={{
              minHeight: Dimensions.get('window').height - headerHeight,
            }}>
            {/* Your Info Card */}
            {this.state.userDetails.partner_id ? this.yourInfoCard() : null}
            {/* Billing Address Card */}
            {this.addressCard('Billing Address', this.state.billingAddress)}
            {/* Shipping Address Card */}
            {/* {this.addressCard('Shipping Address', this.state.shippingAddress)} */}
            {this.shippingAddressCard(
              'Shipping Address',
              this.state.shippingAddress,
            )}

            {/* Order Total Card */}
            {this.state.cartDetails.quotation_id ? (
              <OrderTotalCard
                cartDetails={this.state.cartDetails}
                deliveryFee={this.state.deliveryFee}
              />
            ) : null}
          </Body>
        </Background>
        {/* // this.state.shippingAddress.id &&  */}

        {this.state.userDetails.partner_id &&
        this.state.billingAddress.id &&
        this.state.shippingIdd &&
        this.state.confirmButtonStatus ? (
          <BottomBar>
            <FullWidthButton
              title={this.props.i18n.t('Confirm')}
              style={(styles.SaveButton, {backgroundColor: this.context.theme})}
              onPress={() => this.confirm()}
            />
          </BottomBar>
        ) : null}
      </View>
    );
  }

  componentWillUnmount() {
    this._is_mounted = false;

    this.removeListeners();
  }
}

export default withTranslation()(BillingAndShipping);

const styles = StyleSheet.create({
  RenderWrap: {
    flex: 1,
  },
  HeaderBg: {height: headerHeight},
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
  paddingBottom5: {
    paddingBottom: 5,
  },
  MarginBottom15: {
    marginBottom: 15,
  },
  CardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ACCENT_SECONDARY,
  },
  Title: {
    fontFamily: Fonts.REGULAR,
    fontSize: 16,
    marginLeft: 7,
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
  OrderTotalCard: {
    paddingHorizontal: '3%',
    paddingVertical: 10,
    backgroundColor: Colors.WHITE,
  },
});
