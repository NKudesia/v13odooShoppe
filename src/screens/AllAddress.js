import React, {PureComponent} from 'react';
import {
  Background,
  HeaderBg,
  Wrap,
  TouchableIcon,
  WhiteText,
  Body,
  Card,
  DefaultText,
  RadioOptions,
} from '../components/Common';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  FlatList,
  Alert,
} from 'react-native';
import Constants, {Fonts, Colors, Message} from '../utils/Constants';
import {BackWithError} from '../components/Functions';
import Online from '../utils/Online';
import {NavigationEvents} from 'react-navigation';
import InternetPopup from '../components/InternetPopup';
import NetInfo from '@react-native-community/netinfo';
import {TouchableOpacity} from 'react-native-gesture-handler';
import axios from 'axios';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import AsyncStorage from '@react-native-community/async-storage';
import {add} from 'react-native-reanimated';

const headerHeight = Constants.SCREEN_HEADER_HEIGHT;

export default class AllAddress extends PureComponent {
  constructor(props) {
    super(props);

    this._is_mounted = false;
    this.internetListener = null;

    this.Online = new Online();

    this.state = {
      isLoading: true,
      partnerId: global.partnerId,
      userDetails: global.userDetails,
      billingAddress: [],
      shippingAddress: [],
      showInternetPopup: false,
      userAdd: [],
      modData: [],
      bilModData: [],
      defaultAddress: false,
      deleteId: '',
      billingA: '',
    };
  }

  componentDidMount() {
    this._is_mounted = true;
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      // do something
      this.getPartnerDetails();
    });
    // console.log('update type accessing from another class', this.props.name);
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

  // getAllAddress = async () => {
  //   let response = await this.Online.updatePartnerAddress(

  //   )
  // }

  getPartnerDetails = async () => {
    let response = await this.Online.viewPartnerDetails(this.state.partnerId);
    console.log('All address', response.result);
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
            // console.log('invoice', billingAddress);
            // this.state.bilModData.push(address);
          } else {
            // shippingAddress = address;
            // console.log('delivery', shippingAddress);
            // this.state.modData.push(address);
            // shippingAddress.push(address);
            if (address.address_type === 'delivery') {
              let temp_id = address.id;
              console.log('temp_id', temp_id);
              if (address.id === temp_id) {
                // this.setState({modData: this.state.modData.push(shipAdd)});
                shippingAddress.push(address);
                console.log('pushed');
              } else {
                console.log('same');
                // return;
              }
            }
          }
        }
      });
    }
    // if (response.result.address.length > 0) {
    //   response.result.address.map(shipAdd => {
    //     if (shipAdd.address_type === 'delivery') {
    //       let temp_id = shipAdd.id;
    //       console.log('temp_id', temp_id);
    //       if (shipAdd.id != temp_id) {
    //         // this.setState({modData: this.state.modData.push(shipAdd)});
    //         // shippingAddress.push(shipAdd);
    //       } else {
    //         console.log('same');
    //         // return;
    //       }
    //     }
    //   });
    // }
    if (this._is_mounted) {
      this.setState({
        userDetails: userDetails,
        billingAddress: billingAddress,
        shippingAddress: shippingAddress,
        userAdd: response.result.address,
      });
    }

    this.stopLoading();
  };

  confirm = () => {
    this.props.navigation.navigate({routeName: 'DeliveryMethod'});
  };

  stopLoading = () => {
    if (this._is_mounted) {
      this.setState({isLoading: false});
    }
  };

  removeAddress = id => {
    let temp = this.state.deleteId;
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

  quickUpdateSelectedAddress = async (iid) => {
    console.log("idddd", iid);
    const quotation_id = await AsyncStorage.getItem('orderID');
    console.log('qout', quotation_id);
    console.log(
      'bbbbb',
      this.state.partnerId,
      iid,
      this.state.billingA,
    );
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

    let tempShippingAddress = address;
    // tempShippingAddress.push(address)

    return (
      <>
        <View
          style={{
            ...styles.OrderTotalCard,
            ...styles.MarginBottom15,
          }}>
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
                    // updateType: address.id ?? null ? 'add' : 'edit',
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
                    updateType: this.state.deleteId ?? null ? 'edit' : 'add',

                    addressType:
                      title === 'Billing Address' ? 'invoice' : 'delivery',
                    addressId: this.state.deleteId ?? null,
                    onBack: () => this.getPartnerDetails(),
                    // },
                  });
                }}
              />

              <TouchableIcon
                name={'trash'}
                color={Colors.ACCENT}
                onPress={() => {
                  // this.props.navigation.navigate('UpdateAddress', {
                  //   updateType: 'edit',
                  //   addressType: 'delivery',
                  //   addressId: this.state.deleteId ?? null,
                  //   onBack: () => this.getPartnerDetails()
                  // })
                  this.removeAddress(this.state.deleteId);
                }}
              />
            </View>
          </View>
        </View>
        <FlatList
          data={address}
          renderItem={item => {
            console.log('shippingAddressCard render item', item.item.id);
            return (
              <View
                style={{
                  ...styles.OrderTotalCard,
                  ...styles.MarginBottom15,
                }}>
                <View style={{flexDirection: 'row'}}>
                  <BouncyCheckbox
                    // isChecked={}
                    size={18}
                    fillColor="#43C0F6"
                    unfillColor="#FFFFFF"
                    text="Custom Checkbox"
                    iconStyle={{borderColor: '#43C0F6'}}
                    // textStyle={{fontFamily: 'JosefinSans-Regular'}}
                    onPress={
                      (() =>
                        // this.setState({
                        //   defaultAddress: true,
                        //   deleteId: item.item.id,
                        // }),
                      this.quickUpdateSelectedAddress(item.item.id)
                      )
                    }
                    disableText={true}
                  />
                  <DefaultText style={styles.Title}>
                    {item.item.address_name}
                  </DefaultText>
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

  handleBillingAddress = () => {};

  addressCard = (title, address) => {
    console.log('billing address id', address.id);
    this.setState({
      billingA: address.id,
    });
    let tempBillingAddress = [];

    tempBillingAddress.push(address);

    // console.log('address id', this.state.userDetails),
    // (console.log(
    //   'this.state.userDetails.address',
    //   this.state.userDetails.address,
    // ),
    return (
      <>
        <View
          style={{
            ...styles.OrderTotalCard,
            ...styles.MarginBottom15,
          }}>
          <View style={styles.CardHeader}>
            <DefaultText style={styles.Title}>{title}</DefaultText>
            <View
              style={{
                backgroundColor: 'transparent',
                flexDirection: 'row',
                padding: 1,
                width: 80,
                justifyContent: 'space-between',
              }}>
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
                    // },
                  });
                }}
              />
              <TouchableIcon
                name={'trash'}
                color={Colors.ACCENT}
                onPress={() => {
                  this.removeAddress(item.item.id);
                }}
              />
            </View>
          </View>

          <View style={styles.CardBody}>
            {address.street ? (
              <>
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
              </>
            ) : (
              // eslint-disable-next-line react-native/no-inline-styles
              <DefaultText style={{textAlign: 'center', marginTop: 10}}>
                {'No Address Updated'}
              </DefaultText>
            )}
          </View>
        </View>
      </>
    );
  };

  render() {
    return (
      <View style={styles.RenderWrap}>
        {/* <NavigationEvents
          onDidFocus={this.getPartnerDetails}
          onDidBlur={this.removeListeners}
        /> */}
        <InternetPopup
          showModal={this.state.showInternetPopup}
          retryAction={() => {
            this.setState({
              showInternetPopup: false,
            });

            this.getPartnerDetails();
          }}
        />
        <HeaderBg>
          <Wrap>
            <View style={styles.Header}>
              <TouchableIcon
                onPress={() => {
                  this.props.navigation.navigate('MyAccount');
                }}
                name={'chevron-left'}
                style={styles.HeaderRightIcon}
              />
              <WhiteText style={styles.Logo}>{'Manage Address'}</WhiteText>
            </View>
          </Wrap>
        </HeaderBg>
        <Background>
          <Body
            showLoader={this.state.isLoading}
            style={{
              minHeight: Dimensions.get('window').height - headerHeight,
            }}>
            {/* Billing Address Card */}
            {this.addressCard('Billing Address', this.state.billingAddress)}

            {/* Shipping Address Card */}

            {/* {this.addressCard('Shipping Address', this.state.shippingAddress)} */}

            {this.shippingAddressCard(
              'Shipping Address',
              this.state.shippingAddress,
            )}
          </Body>
        </Background>
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
    marginBottom: 20,
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

// addressCard = (title, address) => {
//   // console.log('address id', address);

//   // console.log('address id', this.state.userDetails),
//   // (console.log(
//   //   'this.state.userDetails.address',
//   //   this.state.userDetails.address,
//   // ),
//   return (
//     <View
//       style={{
//         ...styles.OrderTotalCard,
//         ...styles.MarginBottom15,
//       }}>
//       <View style={styles.CardHeader}>
//         <DefaultText style={styles.Title}>{title}</DefaultText>
//         <TouchableIcon
//           name={'plus'}
//           color={Colors.ACCENT}
//           onPress={() => {
//             this.props.navigation.navigate('UpdateAddress', {
//               // routeName: 'UpdateAddress',
//               // params: {
//               // updateType: address.id ?? null ? 'edit' : 'add',
//               updateType: address.id ?? null ? 'add' : null,
//               addressType:
//                 title === 'Shipping Address' ? 'invoice' : 'delivery',
//               addressId: false,
//               onBack: () => this.getPartnerDetails(),
//               // },
//             });
//           }}
//         />
//         <TouchableIcon
//           name={'edit'}
//           color={Colors.ACCENT}
//           onPress={() => {
//             this.props.navigation.navigate('UpdateAddress', {
//               // routeName: 'UpdateAddress',
//               // params: {
//               updateType: address.id ?? null ? 'edit' : 'add',

//               addressType:
//                 title === 'Billing Address' ? 'invoice' : 'delivery',
//               addressId: address.id ?? null,
//               onBack: () => this.getPartnerDetails(),
//               // },
//             });
//           }}
//         />
//       </View>

//       <View style={styles.CardBody}>
//         {address.street ? (
//           <View>
//             <DefaultText style={styles.paddingBottom5}>
//               {address.street +
//                 ', ' +
//                 (address.street2 ? address.street2 + ', ' : '')}
//             </DefaultText>
//             <DefaultText style={styles.paddingBottom5}>
//               {address.city +
//                 (address.state_id ? ', ' + address.state_id[1] : '') +
//                 ' - ' +
//                 address.zip}
//             </DefaultText>
//             <DefaultText style={styles.paddingBottom5}>
//               {address.country_id[1]}
//             </DefaultText>
//           </View>
//         ) : (
//           <DefaultText style={{textAlign: 'center', marginTop: 10}}>
//             {'No Address Updated'}
//           </DefaultText>
//         )}
//       </View>

//       {/* <View style={styles.CardBody}>
//                   {address.street ? (
//                     <>
//                       <View>
//                         <DefaultText style={styles.paddingBottom5}>
//                           {address.street +
//                             ', ' +
//                             (address.street2 ? address.street2 + ', ' : '')}
//                         </DefaultText>
//                         <DefaultText style={styles.paddingBottom5}>
//                           {address.city +
//                             (address.state_id
//                               ? ', ' + address.state_id[1]
//                               : '') +
//                             ' - ' +
//                             address.zip}
//                         </DefaultText>
//                         <DefaultText style={styles.paddingBottom5}>
//                           {address.country_id[1]}
//                         </DefaultText>
//                       </View>
//                     </>
//                   ) : (
//                     // eslint-disable-next-line react-native/no-inline-styles
//                     <DefaultText style={{textAlign: 'center', marginTop: 10}}>
//                       {'No Address Updated'}
//                     </DefaultText>
//                   )}
//                 </View> */}
//     </View>
//   );
// };
