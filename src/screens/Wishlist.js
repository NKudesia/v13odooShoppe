import React, {PureComponent} from 'react';
import {
  HeaderBg,
  Body,
  Wrap,
  TouchableIcon,
  WhiteText,
  NoScrollBackground,
  HWishListProductCard,
  DefaultText,
  Button,
  GoToIcon,
} from '../components/Common';
import {StyleSheet, View, FlatList} from 'react-native';
import Online from '../utils/Online';
import Constants, {
  Message,
  Fonts,
  Models,
  LocalKeys,
  Colors,
} from '../utils/Constants';
import {
  BackWithError,
  ShowToast,
  GetCartWishlistCount,
} from '../components/Functions';
// import {NavigationEvents, FlatList} from 'react-navigation';
import Offline from '../utils/Offline';
import Feather from 'react-native-vector-icons/Feather';
import InternetPopup from '../components/InternetPopup';
import NetInfo from '@react-native-community/netinfo';
import {Translation, useTranslation, withTranslation} from 'react-i18next';
import {i18n} from 'i18next';
import {useTheme} from '../context/ThemeProvider';


class Wishlist extends PureComponent {
  static contextType = useTheme();
  constructor(props) {
    super(props);

    this._is_mounted = false;
    this.internetListener = null;

    this.Online = new Online();
    this.Offline = new Offline();

    this.state = {
      isLoading: true,
      wishlistDetails: [],
      wishlistIds: [],
      productsList: [],
      showNothingFound: false,
      cartDetails: global.cartDetails,
      countStats: global.countStats,
      showInternetPopup: false,
    };
  }

  componentDidMount() {
    this._is_mounted = true;
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      // do something
      this.createListeners();
      this.GetCountStats();
      this.getWishlistIds();
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

  GetCountStats = async () => {
    if (this._is_mounted) {
      this.setState({
        countStats: global.countStats,
      });
    }
  };

  getWishlistIds = async () => {
    let response = await this.Online.customSearch(
      Models.WISHLIST,
      [],
      [['partner_id', '=', global.loggedInId]],
    );

    if (!response.result) {
      BackWithError(this.props, Message.ERROR_TRY_AGAIN);
    }

    let wishlistIds = [];
    let productIds = [];

    if (response.result.records.length < 1) {
      if (this._is_mounted) {
        this.setState({
          isLoading: false,
          showNothingFound: true,
        });
      }
      return;
    }

    response.result.records.map(e => {
      wishlistIds.push(e.id);
      productIds.push(e.product_id[0]);
    });

    if (this._is_mounted) {
      this.setState({
        wishlistIds: wishlistIds,
        wishlistDetails: response.result.records,
      });
    }

    this.getProducts(productIds);
  };

  getProducts = async productIds => {
    let response = await this.Online.getProdWithPricelist(
      global.priceListId,
      productIds,
    );

    if (!response.result || response.result.length < 1) {
      BackWithError(this.props, Message.ERROR_TRY_AGAIN);
      return;
    }

    if (this._is_mounted) {
      this.setState({
        isLoading: false,
        showNothingFound: false,
        wishlistIds: this.state.wishlistIds,
        productsList: response.result,
      });
    }
  };

  navigateToProduct = id => {
    this.props.navigation.navigate('Product', {
      // routeName: 'Product',
      // params: {
      id: id,
      // },
    });
  };

  emptyWishlist = () => (
    <Wrap style={styles.EmptyCartWrap}>
      <Feather name={'heart'} size={80} color={Colors.OVERLAY} />
      <DefaultText style={styles.EmptyCartTitle}>
        {this.props.i18n.t('Your Wshlist Is Empty')}
      </DefaultText>
      <Button
        style={styles.EmptyCartButton, {backgroundColor: this.context.theme}}
        title={this.props.i18n.t('Go To Homepage')}
        onPress={() => {
          this.props.navigation.navigate('Home', {});
        }}
      />
    </Wrap>
  );

  addToBagAction = async productId => {
    if (this.state.cartDetails.cart_id) {
      this.updateQuotation(productId);
    } else {
      this.createQuotation(productId);
    }
  };

  createQuotation = async productId => {
    let response = await this.Online.customCreate(Models.CART, [
      {
        partner_id: global.partnerId,
        order_line: [
          [
            0,
            0,
            {
              product_id: productId,
              product_uom_qty: 1,
            },
          ],
        ],
      },
    ]);

    if (!response.result) {
      if (Constants.DEBUG) {
        console.log(response);
      }

      ShowToast(Message.ERROR_TRY_AGAIN);
      return;
    }

    let cartId = response.result;

    let updateCartDetails = await this.Offline.set(LocalKeys.CART_DETAILS, {
      cart_id: cartId,
    });

    if (updateCartDetails) {
      global.cartDetails = {
        cart_id: cartId,
      };
    }

    if (this._is_mounted) {
      this.setState({
        cartDetails: global.cartDetails,
      });
    }

    if (!updateCartDetails) {
      ShowToast(Message.ERROR_TRY_AGAIN);
      return;
    }

    this.removeWishlishtAction(productId);
  };

  updateQuotation = async productId => {
    let response = await this.Online.addToCart(
      global.partnerId,
      this.state.cartDetails.cart_id,
      productId,
      1,
    );

    if (!response.result) {
      if (Constants.DEBUG) {
        console.log(response);
      }

      ShowToast(Message.ERROR_TRY_AGAIN);
    }

    this.removeWishlishtAction(productId);
  };

  removeWishlishtAction = async productId => {
    let wishRow = this.state.wishlistDetails.find(wish => {
      return wish.product_id[0] === productId;
    });

    if (wishRow === null) {
      ShowToast(Message.ERROR_TRY_AGAIN);
      return;
    }

    let response = await this.Online.delete(Models.WISHLIST, wishRow.id);

    if (response.error) {
      if (Constants.DEBUG) {
        console.log(response.error.data.arguments[0]);
      }
      ShowToast(Message.ERROR_TRY_AGAIN);
      return;
    }

    GetCartWishlistCount().finally(() => {
      this.GetCountStats();
      ShowToast('Wishlist Updated');

      let productsList = [];
      this.state.productsList.forEach((product, index) => {
        if (product.product_id !== productId) {
          productsList.push(product);
        }

        if (index + 1 === this.state.productsList.length && this._is_mounted) {
          this.setState({
            productsList: productsList,
          });
        }
      });
    });
  };

  render() {
    return (
      <View style={styles.RenderWrap}>
        {/* <NavigationEvents
          onDidFocus={() => {
            this.createListeners();
            this.GetCountStats();
            this.getWishlistIds();
          }}
          onDidBlur={this.removeListeners}
        /> */}
        <InternetPopup
          showModal={this.state.showInternetPopup}
          retryAction={() => {
            this.setState({
              showInternetPopup: false,
            });

            this.GetCountStats();
            this.getWishlistIds();
          }}
        />
        <NoScrollBackground>
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
                  {this.props.i18n.t('Your Wishlist')}
                </WhiteText>
                <View style={styles.HeaderLeftContent}>
                  <GoToIcon
                    props={this.props}
                    icon={'shopping-cart'}
                    route={'Cart'}
                    badge={this.state.countStats.total_cart_item}
                  />
                </View>
              </View>
            </Wrap>
          </HeaderBg>
          <Body showLoader={this.state.isLoading} style={styles.Body}>
            {this.state.productsList.length > 0 ? (
              <FlatList
                style={styles.BodyScroll}
                contentContainerStyle={styles.BodyScrollContent}
                data={this.state.productsList}
                keyExtractor={e => e.name}
                renderItem={({item}) => (
                  <Wrap>
                    <HWishListProductCard
                      item={item}
                      detailsAction={this.navigateToProduct}
                      addToBagAction={this.addToBagAction}
                      removeAction={this.removeWishlishtAction}
                    />
                  </Wrap>
                )}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <this.emptyWishlist />
            )}
          </Body>
        </NoScrollBackground>
      </View>
    );
  }

  componentWillUnmount() {
    this._is_mounted = false;

    this.removeListeners();
  }
}

export default withTranslation()(Wishlist);

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
  Body: {
    flex: 1,
    // paddingBottom: 0,
    // paddingTop: 0,
    // backgroundColor: 'red',
    minHeight: '100%',
  },
  BodyScroll: {
    display: 'flex',
    // flex: 1,
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
