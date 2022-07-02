import React, {PureComponent} from 'react';
import {
  HeaderBg,
  Body,
  Wrap,
  CategoryNoProductCard,
  TouchableIcon,
  WhiteText,
  NoScrollBackground,
  DefaultText,
  OnlyTouch,
} from '../components/Common';
import {StyleSheet, View, FlatList} from 'react-native';
import Online from '../utils/Online';
import {Message, Fonts, Colors} from '../utils/Constants';
import {
  ShowToast,
  FormatCurrency,
  DecodeOrderState,
} from '../components/Functions';
import {NavigationEvents} from 'react-navigation';
import InternetPopup from '../components/InternetPopup';
import NetInfo from '@react-native-community/netinfo';

export default class OrderHistory extends PureComponent {
  constructor(props) {
    super(props);

    this._is_mounted = false;
    this.internetListener = null;

    this.Online = new Online();

    this.limit = 50;

    this.state = {
      isLoading: true,
      ordersList: [],
      pageNo: 0,
      showNothingFound: false,
      showInternetPopup: false,
    };
  }

  componentDidMount() {
    this._is_mounted = true;
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      // do something
      this.getOrders();
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

  getOrders = async () => {
    let page = this.state.pageNo + 1;

    let response = await this.Online.ordersList(
      global.partnerId,
      this.state.pageNo,
    );

    if (!response.result) {
      ShowToast(Message.ERROR_TRY_AGAIN);
    }

    if (response.result.length < 1) {
      if (this._is_mounted) {
        this.setState({
          showNothingFound: page === 1 ? true : false,
          isLoading: false,
        });
      }
      return;
    }

    if (this._is_mounted) {
      this.setState({
        ordersList: response.result,
        showNothingFound: false,
        isLoading: false,
        pageNo: response.result.length > 1 ? page : this.state.pageNo,
      });
    }
  };

  navigateToOrder = id => {
    this.props.navigation.navigate('ViewOrder', {
      // routeName: 'ViewOrder',
      // params: {
      id: id,
      // },
    });
    console.log('navigateToOrder', id);
  };

  NothingFound = ({visibility = false}) => (
    <View>
      {visibility ? <CategoryNoProductCard text={'No Orders Yet'} /> : null}
    </View>
  );

  OrderCard = ({item, index}) => (
    <OnlyTouch
      onPress={() => this.navigateToOrder(item.id)}
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        ...styles.OrderCard,
        borderStyle: 'solid',
        borderTopWidth: index === 0 ? 0 : 1,
        borderTopColor: Colors.ACCENT_SECONDARY,
      }}>
      <Wrap>
        <View style={styles.OrderCardRow}>
          <DefaultText style={styles.OrderCardNo}>{item.quotation}</DefaultText>
          <DefaultText>{item.quotation_date}</DefaultText>
        </View>
        <View style={styles.OrderCardRow}>
          <DefaultText style={styles.OrderCardAmount}>
            {FormatCurrency(item.amount_total)}
          </DefaultText>
          <DefaultText>{DecodeOrderState(item.state)}</DefaultText>
        </View>
      </Wrap>
    </OnlyTouch>
  );

  render() {
    return (
      <View style={styles.RenderWrap}>
        {/* <NavigationEvents
          onDidFocus={() => {
            this.getOrders();
            this.createListeners();
          }}
          onDidBlur={this.removeListeners}
        /> */}
        <InternetPopup
          showModal={this.state.showInternetPopup}
          retryAction={() => {
            this.setState({
              showInternetPopup: false,
            });

            this.getOrders();
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
                <WhiteText style={styles.Logo}>{'Your Orders'}</WhiteText>
              </View>
            </Wrap>
          </HeaderBg>
          <Body style={styles.Body} showLoader={this.state.isLoading}>
            {this.state.ordersList.length > 0 ? (
              <FlatList
                style={styles.BodyScroll}
                contentContainerStyle={styles.BodyScrollContent}
                data={this.state.ordersList}
                keyExtractor={e => {
                  return e.quotation_date;
                }}
                onEndReachedThreshold={0.8}
                onEndReached={() => {
                  if (this.state.ordersList.length < this.limit) {
                    return;
                  }
                  this.getOrders();
                }}
                renderItem={({item, index}) => (
                  <this.OrderCard item={item} index={index} />
                )}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
              />
            ) : null}
            <this.NothingFound visibility={this.state.showNothingFound} />
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
    paddingTop: 0,
  },
  BodyScroll: {
    display: 'flex',
    flex: 1,
    paddingTop: 0,
    marginTop: 0,
  },
  BodyScrollContent: {
    paddingVertical: 10,
    backgroundColor: Colors.WHITE,
    // shadowColor: Colors.ACCENT,
    // shadowOffset: {
    //   width: 0,
    //   height: 3,
    // },
    // shadowOpacity: 0.27,
    // shadowRadius: 4.65,
    // elevation: 4,
  },
  OrderCard: {
    paddingVertical: 10,
    // marginBottom: 20,
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
