import React, {PureComponent} from 'react';
import {
  HeaderBg,
  Wrap,
  TouchableIcon,
  WhiteText,
  Body,
  RatingBars,
  CommentCard,
  NoScrollBackground,
  GoToIcon,
} from '../components/Common';
import {View, StyleSheet, Dimensions, FlatList, Text} from 'react-native';
import Constants, {Fonts, Message, Colors} from '../utils/Constants';
import {NavigationEvents} from 'react-navigation';
import {BackWithError} from '../components/Functions';
import Online from '../utils/Online';
import InternetPopup from '../components/InternetPopup';
import NetInfo from '@react-native-community/netinfo';

const headerHeight = Constants.SCREEN_HEADER_HEIGHT;

export default class ViewAllComments extends PureComponent {
  constructor(props) {
    super(props);

    this._is_mounted = false;
    this.internetListener = null;

    this.Online = new Online();

    this.limit = 30;

    this.state = {
      isLoading: true,
      productId: false,
      activeVariantId: false,
      productRatings: [],
      ratingCounts: [],
      messageCount: 0,
      avgRating: 0,
      selectedColor: 0,
      selectedSize: 0,
      selectedGender: 0,
      selectedQuantity: 1,
      pageNo: 0,
      showInternetPopup: false,
    };
  }

  componentDidMount() {
    this._is_mounted = true;
    // console.log('praramid:', this.props.navigation.state.param.id);
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      // do something
      this.createListeners();
      this.getProductRatings();
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

  navigateToProduct = id => {
    this.props.navigation.navigate('Product', {
      // routeName: 'Product',
      // params: {
      id: id,
      // },
    });
  };

  getProductRatings = async () => {
    if (!this.props.route.params.id) {
      this.props.navigation.goBack();
    }

    let page = this.state.pageNo + 1;

    let response = await this.Online.getComments(
      this.props.route.params.id,
      this.limit,
      page,
    );
    console.log('getproductRating', response);
    if (!response.result) {
      BackWithError(this.props, Message.ERROR_TRY_AGAIN);
      return;
    }

    if (page === 1) {
      if (response.result.messages.length < 1) {
        BackWithError(this.props, Message.ERROR_TRY_AGAIN);
        return;
      }

      let ratingCounts = [
        response.result.rating_stats.percent[10],
        response.result.rating_stats.percent[8],
        response.result.rating_stats.percent[6],
        response.result.rating_stats.percent[4],
        response.result.rating_stats.percent[2],
      ];

      if (this._is_mounted) {
        this.setState({
          messageCount: response.result.options.message_count,
          avgRating: response.result.rating_stats.avg,
          productRatings: response.result.messages,
          ratingCounts: ratingCounts,
          isLoading: false,
          pageNo: page,
        });
      }

      return;
    }

    if (this._is_mounted) {
      this.setState({
        productRatings: [
          ...this.state.productRatings,
          ...response.result.messages,
        ],
        isLoading: false,
        pageNo: page,
      });
    }
  };

  render() {
    return (
      <View style={styles.RenderWrap}>
        {/* <NavigationEvents
          onDidFocus={() => {
            this.createListeners();
            this.getProductRatings();
          }}
          onDidBlur={this.removeListeners}
        /> */}
        <InternetPopup
          showModal={this.state.showInternetPopup}
          retryAction={() => {
            this.setState({
              showInternetPopup: false,
            });

            this.getProductRatings();
          }}
        />
        <NoScrollBackground>
          <HeaderBg>
            <Wrap>
              <View style={styles.Header}>
                <TouchableIcon
                  onPress={() => {
                    // if (!this.props.route.params.onBack) {
                    //   this.props.route.params.onBack();
                    // }
                    this.props.navigation.goBack();
                  }}
                  name={'chevron-left'}
                  style={styles.HeaderRightIcon}
                />
                <WhiteText style={styles.Logo}>{'All Comments'}</WhiteText>
                <View style={styles.HeaderLeftContent}>
                  {!global.isGuest ? (
                    <GoToIcon
                      props={this.props}
                      icon={'plus'}
                      route={'AddComment'}
                      params={{
                        id: this.props.route.params.id,
                        onBack: () => {
                          this.setState({
                            isLoading: true,
                            productId: false,
                            activeVariantId: false,
                            productRatings: [],
                            ratingCounts: [],
                            messageCount: 0,
                            avgRating: 0,
                            selectedColor: 0,
                            selectedSize: 0,
                            selectedGender: 0,
                            selectedQuantity: 1,
                            pageNo: 0,
                          });
                        },
                      }}
                    />
                  ) : null}
                </View>
              </View>
            </Wrap>
          </HeaderBg>
          <Body
            showLoader={this.state.isLoading}
            style={{minHeight: Dimensions.get('window').height - headerHeight}}>
            <Wrap style={styles.BodyWrap}>
              {this.state.productRatings.length > 0 ? (
                <View>
                  <RatingBars
                    style={styles.RatingBars}
                    productDetail={{
                      messageCount: this.state.messageCount,
                      avgRating: this.state.avgRating,
                      ratingCounts: this.state.ratingCounts,
                    }}
                  />
                  <FlatList
                    style={styles.BodyScroll}
                    contentContainerStyle={styles.BodyScrollContent}
                    data={this.state.productRatings}
                    initialNumToRender={10}
                    renderItem={
                      ({item}) => <CommentCard comment={item} />
                      // console.log('flatlist items', item)
                    }
                    keyExtractor={comment => {
                      return comment.write_date;
                    }}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    onEndReachedThreshold={0.8}
                    onEndReached={() => {
                      if (
                        this.state.productRatings.length >=
                        this.state.messageCount
                      ) {
                        return;
                      }
                      this.getProductRatings();
                    }}
                  />
                </View>
              ) : null}
            </Wrap>
          </Body>
        </NoScrollBackground>
        {/* <Text>from view all comment</Text> */}
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
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  Logo: {
    fontSize: 20,
    fontFamily: Fonts.REGULAR,
  },
  MarginBottom15: {
    marginBottom: 15,
  },
  BodyWrap: {
    marginTop: -15,
  },
  SaveButton: {
    textAlign: 'center',
    fontSize: 18,
    paddingVertical: 12,
  },
  RatingBars: {
    borderBottomColor: Colors.ACCENT_SECONDARY,
    borderBottomWidth: 1,
  },
  BodyScroll: {
    height: Dimensions.get('window').height - 235,
  },
  BodyScrollContent: {
    paddingBottom: 20,
  },
});
