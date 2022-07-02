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
  OrderTotalCard,
  AddressCardNonEditable,
  NoScrollBackground,
  ScrollableBody,
} from '../components/Common';
import {
  View,
  StyleSheet,
  Linking,
  PermissionsAndroid,
  Alert,
  Platform,
} from 'react-native';
import {Fonts, Colors, Message} from '../utils/Constants';
import {NavigationEvents} from 'react-navigation';
import {
  BackWithError,
  ShowToast,
  FormatCurrency,
  DecodeOrderState,
} from '../components/Functions';
import Online from '../utils/Online';
import Offline from '../utils/Offline';
import InternetPopup from '../components/InternetPopup';
import NetInfo from '@react-native-community/netinfo';
import RNFetchBlob from 'rn-fetch-blob';
import {WebView} from 'react-native-webview';
import axios from 'axios';
import {useTheme} from '../context/ThemeProvider';

export default class ViewOrder extends PureComponent {
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
      cartId: null,
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
      this.createListeners();
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
    if (!this.props.route.params.id) {
      this.props.navigation.goBack();
    }

    let cartId = this.props.route.params.id;

    let response = await this.Online.viewCart(cartId);
    console.log('response view cart', response, cartId);
    if (!response.result) {
      BackWithError(this.props, Message.ERROR_TRY_AGAIN);
      return;
    }

    let cartDetails = response.result;
    let deliveryFee = this.state.deliveryFee;

    if (cartDetails.order_line.length > 0) {
      cartDetails.order_line.forEach((line, i) => {
        if (line.is_delivery && this._is_mounted) {
          deliveryFee = line.price_unit;
        }
      });
    }

    if (this._is_mounted) {
      this.setState({
        cartDetails: cartDetails,
        deliveryFee: deliveryFee,
      });
    }
    console.log('cartDetails', cartDetails);
    this.getPartnerDetails();
  };

  getPartnerDetails = async () => {
    let response = await this.Online.viewPartnerDetails(this.state.partnerId);
    console.log('get partner details', response, this.state.partnerId);
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

    this.stopLoading();
  };

  stopLoading = () => {
    if (this._is_mounted) {
      this.setState({isLoading: false});
    }
  };

  downloadInvoice = async orderId => {
    // let response = await this.Online.invoiceUrl(orderId);
    // console.log('invoice', response, orderId);
    // if (!response.result) {
    //   ShowToast(Message.ERROR_TRY_AGAIN);
    //   return;
    // }

    // let url = response.result[0].urls;
    // console.log('url', url);
    // this.setState({
    //   url: this.url,
    // });

    if (Platform.OS == 'ios') {
      this.actualDownload(this.state.cartDetails.quotation_id);
    } else {
      if (Platform.OS == 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            this.actualDownload(this.state.cartDetails.quotation_id);
          } else {
            Alert.alert(
              'Permission Denied!',
              'You need to give storage permission to download the file',
            );
          }
        } catch (err) {
          console.warn(err);
        }
      }
    }

    // this.downloadFile();
    // axios.get(`${url}`, {}).then(response => {
    //   console.log(JSON.stringify(response.data));
    // });
    // Linking.canOpenURL(response.result[0].urls)
    //   // console.log('check', check);
    //   .then(supported => {
    //     if (supported) {
    //       Linking.openURL(url);

    //       // Linking.downloadFile(url);
    //     } else {
    //       Linking.openURL(url);
    //       // Linking.downloadFile(url);

    //       // ShowToast('Failed, Try again later');
    //     }
    //   });
  };

  actualDownload = async orderId => {
    // console.log('from actual download', this.url);
    let response = await this.Online.invoiceUrl(orderId);
    console.log('invoice', response, orderId);
    if (!response.result) {
      ShowToast(Message.ERROR_TRY_AGAIN);
      return;
    }

    let url = response.result[0].urls;
    console.log('url', url);

    const {dirs} = RNFetchBlob.fs;
    const dirToSave =
      Platform.OS == 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
    // RNFetchBlob.config({
    //   fileCache: true,
    //   addAndroidDownloads: {
    //     useDownloadManager: true,
    //     notification: true,
    //     mediaScannable: true,
    //     title: `test.pdf`,
    //     // path: `${dirs.DownloadDir}/test.pdf`,
    //     path: `${dirToSave}/${pdfInfo.pdf}`
    //   },
    // })

    const configfb = {
      fileCache: true,
      useDownloadManager: true,
      notification: true,
      mediaScannable: true,
      title: `t.pdf`,
      path: `${dirToSave}/t.pdf`,
    };

    const configOption = Platform.select({
      ios: {
        fileCache: configfb.fileCache,
        title: configfb.title,
        path: configfb.path,
        appendExt: 'pdf',
      },
      android: configfb,
    });
    console.log('The file saved to 23233', configfb);
    RNFetchBlob.config(configOption)
      .fetch('GET', `${url}`, {})
      .then(res => {
        if (Platform.OS == 'ios') {
          RNFetchBlob.fs.writeFile(configfb.path, res.data, 'base64');
          RNFetchBlob.ios.previewDocument(configfb.path);
          // RNFetchBlob.ios.actionViewIntent(res.path());
          console.log('The file saved to ', res.data);

          Alert.alert('Invoice!', 'You can save or share the invoice');
        }
        if (Platform.OS == 'android') {
          RNFetchBlob.android.actionViewIntent(res.path());
          console.log('The file saved to ', res.path());

          Alert.alert(
            'File Downloaded!',
            // 'You need to give storage permission to download the file',
          );
        }
      })
      .catch(e => {
        // setisdownloaded(true);
        console.log(e);
      });
    // };

    // downloadFile = async () => {
    //   // console.log('dwf', url);
    //   try {
    //     const granted = await PermissionsAndroid.request(
    //       PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    //     );
    //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    //       this.actualDownload(this.url);
    //     } else {
    //       Alert.alert(
    //         'Permission Denied!',
    //         'You need to give storage permission to download the file',
    //       );
    //     }
    //   } catch (err) {
    //     console.warn(err);
    //   }
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
                  onPress={() => this.props.navigation.navigate('OrderHistory')}
                  name={'chevron-left'}
                  style={styles.HeaderRightIcon}
                />
                <WhiteText style={styles.Logo}>
                  {'View Order Details'}
                </WhiteText>
              </View>
            </Wrap>
          </HeaderBg>
          <ScrollableBody
            // eslint-disable-next-line react-native/no-inline-styles
            style={{paddingBottom: 200}}
            showLoader={this.state.isLoading}>
            {/* Order Confirmed Card */}
            <View style={styles.OrderCard}>
              <View style={styles.OrderCardRow}>
                <DefaultText style={styles.OrderCardNo}>
                  {this.state.cartDetails.name}
                </DefaultText>
                <DefaultText>{this.state.cartDetails.date_order}</DefaultText>
              </View>
              <View style={styles.OrderCardRow}>
                <DefaultText style={styles.OrderCardAmount}>
                  {FormatCurrency(this.state.cartDetails.amount_total)}
                </DefaultText>
                <DefaultText>
                  {DecodeOrderState(this.state.cartDetails.status)}
                </DefaultText>
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
            {this.state.cartDetails.order_line ? (
              <OrderPlacedProductList
                cartRowData={this.state.cartDetails.order_line}
              />
            ) : null}
            {/* Order Total Card */}
            <OrderTotalCard
              cartDetails={this.state.cartDetails}
              deliveryFee={this.state.deliveryFee}
            />
          </ScrollableBody>
        </NoScrollBackground>
        {/* {this.state.cartDetails.invoice_count > 0 && */}
        {/* this.state.isLoading === false ? ( */}
        <BottomBar>
          <FullWidthButton
            title={'Download Invoice'}
            style={
              (styles.SaveButton,
              {backgroundColor: this.context.theme})
            }
            onPress={() =>
              this.downloadInvoice(this.state.cartDetails.quotation_id)
            }
          />
        </BottomBar>
        {/* ) : null} */}
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
  OrderCard: {
    marginBottom: 15,
    paddingHorizontal: '3%',
    paddingVertical: 10,
    backgroundColor: Colors.WHITE,
  },
  OrderCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  OrderCardNo: {
    fontFamily: Fonts.REGULAR,
    fontSize: 16,
    marginBottom: 3,
  },
  OrderCardAmount: {
    fontSize: 18,
    marginBottom: 3,
  },
});
