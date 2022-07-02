import React, {PureComponent} from 'react';
import {StyleSheet, View, Dimensions, linking, Platform} from 'react-native';
import StarRating from 'react-native-star-rating';
import {
  HeaderBg,
  Wrap,
  DefaultText,
  ColorOptions,
  SizeOptions,
  GenderOptions,
  CustomRadioOptions,
  QuantityOption,
  TouchableIcon,
  ProductDescription,
  BottomBar,
  IconTextButton,
  IconButton,
  RatingBars,
  CommentCard,
  ViewAllCommentCard,
  LinkText,
  GoToIcon,
  NoScrollBackground,
  ScrollableBody,
  OnlyTouch,
  WhiteText,
} from '../components/Common';
import {
  FormatNumber,
  FormatCurrency,
  DecodeImage,
  ShowToast,
  BackWithError,
  GetCartWishlistCount,
} from '../components/Functions';
import Constants, {
  Colors,
  Fonts,
  Models,
  Message,
  LocalKeys,
} from '../utils/Constants';
import ImageCarousel from '../components/ImageCarousel';
import Online from '../utils/Online';
import Offline from '../utils/Offline';
import {NavigationEvents} from 'react-navigation';
import InternetPopup from '../components/InternetPopup';
import NetInfo from '@react-native-community/netinfo';
import {withTranslation} from 'react-i18next';
import {i18n} from 'i18next';
import AsyncStorage from '@react-native-community/async-storage';
import {useTheme} from '../context/ThemeProvider';
import Share from 'react-native-share';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Feather from 'react-native-vector-icons/Feather';
import {BucketLoader} from '../components/BucketLoader';

class Product extends PureComponent {
  static contextType = useTheme();
  constructor(props) {
    super(props);

    this._is_mounted = false;
    this.internetListener = null;

    this.Online = new Online();
    this.Offline = new Offline();

    this.state = {
      isLoading: true,
      productId: false,
      productTemplateDetails: [],
      activeVariantId: false,
      activeVariantDetails: [],
      productDetails: [],
      productAttributes: [],
      currentSelectedAttributes: [],
      selectedColor: null,
      selectedSize: null,
      selectedGender: null,
      selectedQuantity: 1,
      productRatings: [],
      ratingCounts: [],
      messageCount: 0,
      avgRating: 0,
      cartDetails: global.cartDetails,
      countStats: global.countStats,
      showInternetPopup: false,
    };
  }

  componentDidMount() {
    this._is_mounted = true;
    // this.getProductTemplateDetails();
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      // do something
      this.setState({
        isLoading: true,
        productId: false,
        productTemplateDetails: [],
        activeVariantId: false,
        activeVariantDetails: [],
        productDetails: [],
        productAttributes: [],
        currentSelectedAttributes: [],
        selectedColor: null,
        selectedSize: null,
        selectedGender: null,
        selectedQuantity: 1,
        productRatings: [],
        ratingCounts: [],
        messageCount: 0,
        avgRating: 0,
        showInternetPopup: false,
        noProduct: false,
        shareImage: [],
        sharingProductName: '',
        socialImageSharing: '',
        visible: false,
        sharingUrl: '',
      });
      this.createListeners();
      this.getProductTemplateDetails();
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

  getProductTemplateDetails = async () => {
    const curCode = await AsyncStorage.getItem('currencyCode');
    console.log('Prduct getProductTemplateDetails', curCode);
    if (!this.props.route.params.id) {
      this.props.navigation.goBack();
    }

    let productId = this.props.route.params.id;
    if (this._is_mounted) {
      this.setState({productId: productId});
    }

    let response = await this.Online.getProdTempWithPricelist(
      // global.priceListId,
      curCode,
      [productId],
    );

    console.log('from getproduct detail', response.result);

    // const setProductUrl = response.result;

    response.result.map(i => {
      // if (i == 'product_url') console.log('url', i.product_url);
      console.log('url', i.product_url);
      const url = i.product_url;
      this.setState({sharingUrl: url});
    });

    // console.log('tamplate', response);
    if (response.result.length < 1) {
      this.props.navigation.goBack();
    }

    let productTemplateDetails = response.result[0];

    response.result.map(item => {
      // console.log("result", item)
      item.extra_media.map((item, index) => {
        console.log('images', item, index);
        // this.setState({shareImage: item.image})
        this.state.shareImage.push(item);
      });
    });
    // console.log('productTemplateDetails', productTemplateDetails);

    if (this._is_mounted) {
      this.setState({
        productTemplateDetails: response.result[0],
        activeVariantId: response.result[0].product_variant_ids[0],
        // shareImage: response.result[0].image_1920,
        socialImageSharing: response.result[0].image_1920,
        sharingProductName: response.result[0].name,
      });
      // console.log('image', response.result[0].product_variant_ids[0]);
    }

    if (productTemplateDetails.product_variant_ids.length > 0) {
      this.getProductDetails(productTemplateDetails.product_variant_ids);
    } else {
      this.props.navigation.goBack();
    }
  };

  getProductDetails = async productVariantsIds => {
    const curCode = await AsyncStorage.getItem('currencyCode');
    let response = await this.Online.getProdWithPricelist(
      // global.priceListId,
      curCode,
      productVariantsIds,
    );

    console.log('getProdWithPricelist', response);

    if (!response.result || response.result.length < 1) {
      BackWithError(this.props, Message.ERROR_TRY_AGAIN);
      return;
    }

    let activeVariantDetails = response.result.find(e => {
      return e.product_id === this.state.activeVariantId;
    });

    console.log('activeVariantDetails', activeVariantDetails);
    if (this._is_mounted) {
      this.setState({
        productDetails: response.result,
        activeVariantDetails: activeVariantDetails,
        // currentSelectedAttributes: activeVariantDetails.product_template_attribute_value_ids,
      });
    }

    if (this.state.productTemplateDetails.attribute_line_ids.length > 0) {
      this.getProductAttributes(
        this.state.productTemplateDetails.attribute_line_ids,
      );
    } else {
      this.stopLoading();
    }

    if (
      this.state.productTemplateDetails.rating_count > 0 &&
      global.ratingEnabled
    ) {
      this.getProductRatings(this.state.productTemplateDetails.rating_ids);
    }
  };

  getProductAttributes = async attributeIds => {
    let response = await this.Online.search(
      Models.ATTRIBUTE,
      ['id', 'display_name', 'value_ids'],
      [['id', 'in', attributeIds], ['active', '=', true]],
    );
    // console.log('search', response);
    if (!response.result || response.result.records.length < 1) {
      BackWithError(this.props, Message.ERROR_TRY_AGAIN);
      return;
    }

    let attributes = [];

    response.result.records.map((v, i) => {
      if (v.value_ids.length < 1) {
        return;
      } else {
        this.getProductAttributeValues(v.value_ids)
          .then(attributeValues => {
            if (attributeValues) {
              attributes.push({
                ...v,
                attribute_values: attributeValues,
              });
            }

            if (i === response.result.records.length - 1) {
              if (this._is_mounted) {
                this.setState({
                  productAttributes: attributes,
                });
              }

              this.stopLoading();
            }
          })
          .catch(error => {
            if (Constants.DEBUG) {
              console.log(
                'Error while fetching attribute values',
                error.message,
              );
            }
            ShowToast(Message.ERROR_TRY_AGAIN);
            return;
          });
      }
    });
  };

  getProductAttributeValues = async attributeValueIds => {
    let response = await this.Online.search(
      Models.ATTRIBUTE_VALUES,
      ['id', 'name', 'html_color', 'display_type'],
      [['id', 'in', attributeValueIds], ['is_custom', '=', false]],
    );

    if (!response.result || response.result.records.length < 1) {
      BackWithError(this.props, Message.ERROR_TRY_AGAIN);
      return;
    }

    return response.result.records;
  };

  populateAttributes = () => (
    <View>
      {this.state.productAttributes.map((attribute, index) => {
        let selectedAttr = 0;

        attribute.attribute_values.forEach((e, i) => {
          if (e.id === this.state.currentSelectedAttributes[index]) {
            selectedAttr = i;
          }
        });

        switch (attribute.display_name.toLowerCase()) {
          // case 'color':
          //   return (
          //     <ColorOptions
          //       positionIndex={index}
          //       data={attribute.attribute_values}
          //       onColorChange={this.colorChange}
          //       selected={this.state.selectedColor || selectedAttr}
          //     />
          //   );
          // case 'size':
          //   return (
          //     <SizeOptions
          //       positionIndex={index}
          //       data={attribute.attribute_values}
          //       onSizeChange={this.sizeChange}
          //       selected={this.state.selectedSize || selectedAttr}
          //     />
          //   );
          // case 'gender':
          //   return (
          //     <GenderOptions
          //       positionIndex={index}
          //       data={attribute.attribute_values}
          //       onGenderChange={this.genderChange}
          //       selected={this.state.selectedGender || selectedAttr}
          //     />
          //   );
          default:
            switch (attribute.attribute_values[0].display_type) {
              case 'radio':
                return (
                  <CustomRadioOptions
                    positionIndex={index}
                    data={attribute.attribute_values}
                    title={attribute.display_name}
                    optionKey={'customSelected' + index}
                    onOptionChange={this.customRadioOptionChange}
                    selected={
                      this.state['customSelected' + index] || selectedAttr
                    }
                  />
                );
            }
        }
      })}
    </View>
  );

  getProductRatings = async () => {
    let response = await this.Online.getComments(
      this.state.productTemplateDetails.product_template_id,
      3,
      1,
    );
    console.log('getProductRatings response', response);
    if (!response.result) {
      BackWithError(this.props, Message.ERROR_TRY_AGAIN);
      return;
    }
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
    // console.log('ratingCounts', ratingCounts);
    if (this._is_mounted) {
      this.setState({
        messageCount: response.result.options.message_count,
        avgRating: response.result.rating_stats.avg,
        productRatings: response.result.messages,
        ratingCounts: ratingCounts,
      });
    }
    // console.log('avgRating', avgRating);
  };
  updateActiveVariant = () => {
    let selectedAttr = this.state.currentSelectedAttributes;
    // console.log('selectedAttr', selectedAttr);

    let newVariantDetails = null;

    this.state.productDetails.forEach(e => {
      // let productAttr = e.product_template_attribute_value_ids;
      // let productAttr = e.product_template_id;
      newVariantDetails = e;

      // console.log('productAttr', e);
      // if (selectedAttr.toString() === productAttr.toString()) {
      //   newVariantDetails = e;
      //   return;
      // }
    });

    if (newVariantDetails && this._is_mounted) {
      this.setState({
        activeVariantId: newVariantDetails.product_id,
        activeVariantDetails: newVariantDetails,
      });
    }
  };

  colorChange = (positionIndex, index, id) => {
    let currentSelectedAttributes = this.state.currentSelectedAttributes;
    currentSelectedAttributes[positionIndex] = id;
    if (this._is_mounted) {
      this.setState({
        currentSelectedAttributes: currentSelectedAttributes,
        selectedColor: index,
      });
    }

    this.updateActiveVariant();
  };

  sizeChange = (positionIndex, index, id) => {
    let currentSelectedAttributes = this.state.currentSelectedAttributes;
    currentSelectedAttributes[positionIndex] = id;
    if (this._is_mounted) {
      this.setState({
        currentSelectedAttributes: currentSelectedAttributes,
        selectedSize: index,
      });
    }

    this.updateActiveVariant();
  };

  genderChange = (positionIndex, index, id) => {
    let currentSelectedAttributes = this.state.currentSelectedAttributes;
    currentSelectedAttributes[positionIndex] = id;
    if (this._is_mounted) {
      this.setState({
        currentSelectedAttributes: currentSelectedAttributes,
        selectedGender: index,
      });
    }

    this.updateActiveVariant();
  };

  customRadioOptionChange = (positionIndex, index, key, id) => {
    let currentSelectedAttributes = this.state.currentSelectedAttributes;
    currentSelectedAttributes[positionIndex] = id;
    if (this._is_mounted) {
      this.setState({
        currentSelectedAttributes: currentSelectedAttributes,
        [key]: index,
      });
    }

    this.updateActiveVariant();
  };

  updateQuantity = value => {
    let quantity = this.state.selectedQuantity + value;
    if (this._is_mounted) {
      this.setState({
        selectedQuantity: quantity,
      });
    }
  };

  goToCart = () => {
    {
      setTimeout(() => {
        this.setState({
          visible: false,
        });
        this.props.navigation.navigate(
          'Cart',
          // {
          // routeName: 'Cart',
          // }
        );
      }, 2200);
    }
  };

  addToBagAction = async () => {
    if (this.state.cartDetails.cart_id) {
      this.setState({
        visible: true,
      });

      this.updateQuotation();

      console.log('UpdateQuotation');
    } else {
      this.setState({
        visible: true,
      });
      this.createQuotation();
      console.log('CreateQuotation');
    }
  };

  createQuotation = async () => {
    console.log('createQuotation');
    let response = await this.Online.customCreate(Models.CART, [
      {
        partner_id: global.partnerId,
        order_line: [
          [
            0,
            0,
            {
              product_id: this.state.activeVariantId,
              product_uom_qty: this.state.selectedQuantity,
            },
          ],
        ],
      },
    ]);
    console.log('createQuotation api resonse', response);
    if (!response.result) {
      if (Constants.DEBUG) {
        // console.log(response);
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

    GetCartWishlistCount().finally(() => {
      this.GetCountStats();
      ShowToast('Cart Updated');

      this.goToCart();
    });
  };

  updateQuotation = async () => {
    console.log('updateQuotation');
    let response = await this.Online.addToCart(
      global.partnerId,
      this.state.cartDetails.cart_id,
      this.state.activeVariantId,
      this.state.selectedQuantity,
    );
    console.log('updateQuotation', response);

    if (!response.result) {
      if (Constants.DEBUG) {
        // console.log(response);
      }

      ShowToast(Message.ERROR_TRY_AGAIN);
    }

    GetCartWishlistCount().finally(() => {
      this.GetCountStats();
      ShowToast('Cart Updated');

      this.goToCart();
    });
  };

  addToWishlistAction = async () => {
    if (global.isGuest === true) {
      this.props.navigation.navigate({
        routeName: 'Login',
      });
      return;
    }

    let response = await this.Online.createWishlist(this.state.activeVariantId);

    if (response.error) {
      ShowToast(
        response.error
          ? response.error.data.arguments[0] ===
            'Duplicated wishlisted product for this partner.'
            ? 'Already added to wishlist'
            : response.error.data.arguments[0]
          : Message.ERROR_TRY_AGAIN,
      );
      return;
    }

    let wishlistIds = [];
    wishlistIds.push(response.result.wish_id);

    let updateWishlistIds = await this.Offline.set(
      LocalKeys.WISHLIST_IDS,
      JSON.stringify(wishlistIds),
    );

    if (!updateWishlistIds) {
      ShowToast(Message.ERROR_TRY_AGAIN);
      return;
    }

    if (updateWishlistIds) {
      GetCartWishlistCount().finally(() => {
        this.GetCountStats();
        ShowToast('Wishlist Updated');
      });
    }
  };

  stopLoading = () => {
    if (this._is_mounted) {
      this.setState({isLoading: false});
    }
  };

  render() {
    // console.log('test', test);
    // const deep = linking('deepLinking://');
    const shareOptions = {
      // title: 'Share via',
      url: `data:image/jpeg;base64,${this.state.socialImageSharing}`,
      message: `Check this out: ${this.state.sharingProductName} on ${
        this.state.sharingUrl
      }`,
      // const fun = async () => {
      //   const shareResponse = await Share.shareSingle(shareOptions);
      // };
    };
    const fun = async () => {
      try {
        const shareResponse = await Share.open(shareOptions);
        // console.log('fun', shareResponse);
      } catch (error) {
        console.log(error);
      }
    };
    return (
      <>
        <View style={styles.RenderWrap}>
          {/* <NavigationEvents
          onDidFocus={() => {
            this.createListeners();
            this.GetCountStats();
          }}
          onDidBlur={this.removeListeners}
        /> */}
          <InternetPopup
            showModal={this.state.showInternetPopup}
            retryAction={() => {
              this.setState({
                showInternetPopup: false,
              });

              this.getProductTemplateDetails();
            }}
          />
          <NoScrollBackground
            statusBarStyle={'dark-content'}
            containerStyle={styles.BackgroundContainer}
            style={styles.Background}>
            <HeaderBg style={styles.HeaderBg}>
              <Wrap>
                <View style={{...styles.Header}}>
                  <TouchableIcon
                    name={'chevron-left'}
                    color={Colors.ACCENT}
                    onPress={() => {
                      // this.props.navigation.navigate('CategoryProducts');
                      this.props.navigation.goBack();
                    }}
                  />
                  {/* <WhiteText style={styles.Logo}>{'Rate Product'}</WhiteText> */}
                  <DefaultText style={styles.HeaderTitle}>
                    {/* {this.state.activeVariantDetails.display_name} */}
                    {this.props.i18n.t(this.state.productTemplateDetails.name)}
                  </DefaultText>

                  <View style={styles.HeaderLeftContent}>
                    {/* <GoToIcon
                    props={this.props}
                    icon={'share-2'}
                    // route={!global.isGuest ? 'Wishlist' : 'Login'}
                    color={Colors.ACCENT}
                    style={styles.HeaderRightIcon}
                    badge={this.state.countStats.total_wishlist_item}
                    // onPress={() => fun()}
                  /> */}
                    <TouchableOpacity activeOpacity={0.9} onPress={() => fun()}>
                      <Feather
                        name={'share-2'}
                        size={22}
                        color={Colors.ACCENT}
                        style={styles.HeaderRightIcon}
                      />
                    </TouchableOpacity>
                    <GoToIcon
                      props={this.props}
                      icon={'shopping-cart'}
                      route={'Cart'}
                      color={Colors.ACCENT}
                      style={styles.HeaderRightIcon}
                      badge={this.state.countStats.total_cart_item}
                    />
                    <GoToIcon
                      props={this.props}
                      icon={'heart'}
                      route={!global.isGuest ? 'Wishlist' : 'Login'}
                      color={Colors.ACCENT}
                      badge={this.state.countStats.total_wishlist_item}
                    />
                  </View>
                </View>
              </Wrap>
            </HeaderBg>
            <ScrollableBody
              style={styles.Body}
              showLoader={this.state.isLoading}>
              {!this.state.isLoading && (
                // <ImageCarousel
                //   images={[
                //     this.state.activeVariantDetails.image_1920
                //       ? DecodeImage(this.state.activeVariantDetails.image_1920)
                //       : DecodeImage(Constants.THUMBNAIL),
                //   ]}
                //   wrapStyle={styles.CarouselWrapStyle}
                //   slideStyle={styles.CarouselSlideStyle}
                // />
                // (console.log(
                //   'carousel',
                //   this.state.activeVariantDetails.display_image,
                // ),

                <ImageCarousel
                  // images={[
                  //   this.state.activeVariantDetails.display_image
                  //     ? DecodeImage(this.state.shareImage)
                  //     : DecodeImage(Constants.THUMBNAIL),
                  // ]}
                  images={this.state.shareImage}
                  wrapStyle={styles.CarouselWrapStyle}
                  slideStyle={styles.CarouselSlideStyle}
                />
              )}
              <Wrap>
                <DefaultText style={styles.ProductTitle}>
                  {/* {this.state.activeVariantDetails.display_name} */}
                  {this.props.i18n.t(this.state.productTemplateDetails.name)}
                </DefaultText>
                <DefaultText style={styles.ProductPrice}>
                  {/* {this.state.activeVariantDetails.list_price &&
                  FormatCurrency(
                    parseFloat(
                      this.state.activeVariantDetails.list_price,
                    ).toFixed(2),
                  ) + ' '} */}

                  {/* => currency undefined due to update in api -> this.state.activeVariantDetails.currency   */}

                  {this.state.productTemplateDetails.currency +
                    ' ' +
                    parseFloat(this.state.activeVariantDetails.price).toFixed(
                      2,
                    ) +
                    ' '}
                  {/* {this.state.activeVariantDetails.list_price && (
                  <DefaultText style={styles.ProductsListItemRegularPrice}>
                    {FormatCurrency(
                      parseFloat(
                        this.state.activeVariantDetails.list_price,
                      ).toFixed(2),
                    )}
                  </DefaultText>
                )} */}
                  <DefaultText style={styles.ProductsListItemRegularPrice}>
                    {/* => currency undefined due to update in api -> this.state.activeVariantDetails.currency   */}

                    {this.state.productTemplateDetails.currency +
                      ' ' +
                      parseFloat(
                        this.state.activeVariantDetails.list_price,
                      ).toFixed(2)}
                  </DefaultText>
                </DefaultText>
                {global.ratingEnabled ? (
                  <View style={styles.ProductRatingRow}>
                    <View style={styles.ProductRating}>
                      <StarRating
                        starSize={20}
                        disabled={true}
                        rating={
                          5 *
                          (this.state.productTemplateDetails.rating_avg / 10)
                        }
                        maxStars={5}
                        fullStarColor={Colors.STAR}
                        halfStarColor={Colors.STAR}
                        emptyStarColor={Colors.ACCENT_SECONDARY}
                        containerStyle={styles.ProductRatingStars}
                      />
                      <DefaultText style={styles.ProductRatingCount}>
                        {FormatNumber(this.state.messageCount) + ' ratings'}
                      </DefaultText>
                    </View>
                    {!global.isGuest ? (
                      <View>
                        <LinkText
                          // eslint-disable-next-line react-native/no-inline-styles
                          style={{marginTop: 7}}
                          onPress={() => {
                            this.props.navigation.navigate('AddComment', {
                              // routeName: 'AddComment',
                              // params: {
                              id: this.state.productTemplateDetails
                                .product_template_id,
                              onBack: this.getProductRatings,
                              // },
                            });
                          }}>
                          {this.props.i18n.t('Rate Product')}
                        </LinkText>
                      </View>
                    ) : null}
                  </View>
                ) : null}
                {this.state.productAttributes.length > 0
                  ? this.populateAttributes()
                  : null}
                <QuantityOption
                  selected={this.state.selectedQuantity}
                  increaseAction={() => this.updateQuantity(1)}
                  decreaseAction={() => this.updateQuantity(-1)}
                />
                {this.state.productTemplateDetails.description_sale && (
                  <ProductDescription
                    description={
                      this.state.productTemplateDetails.description_sale
                    }
                  />
                )}
                {this.state.productTemplateDetails.rating_count > 0 &&
                this.state.ratingCounts.length > 0 &&
                global.ratingEnabled ? (
                  <View>
                    <RatingBars
                      style={styles.RatingBars}
                      title={this.props.i18n.t('Rating & Comments')}
                      productDetail={{
                        messageCount: this.state.messageCount,
                        avgRating: this.state.avgRating,
                        ratingCounts: this.state.ratingCounts,
                      }}
                    />
                    {this.state.productTemplateDetails.rating_count > 0 &&
                    this.state.productRatings.length > 0
                      ? this.state.productRatings.map((comment, index) =>
                          index < 3 ? (
                            <CommentCard
                              key={comment.write_date}
                              comment={comment}
                            />
                          ) : null,
                        )
                      : null}
                    {this.state.productTemplateDetails.rating_count > 3 ? (
                      <ViewAllCommentCard
                        ratingCount={this.state.messageCount}
                        action={
                          () =>
                            this.props.navigation.navigate('ViewAllComments', {
                              // routeName: 'ViewAllComments',
                              // params: {
                              id: this.state.productTemplateDetails
                                .product_template_id,
                              onBack: this.getProductRatings(),
                              // },
                            })
                          // console.log(
                          //   '----------',
                          //   this.state.productTemplateDetails.product_template_id,
                          // ))
                        }
                      />
                    ) : null}
                  </View>
                ) : null}
              </Wrap>
            </ScrollableBody>
          </NoScrollBackground>
          {this.state.isLoading === false ? (
            <BottomBar style={styles.BottomBar}>
              <IconTextButton
                title={this.props.i18n.t('Add To Cart')}
                icon={'shopping-cart'}
                style={
                  (styles.AddToCartButton,
                  {backgroundColor: this.context.theme})
                }
                iconStyle={styles.AddToCartButtonIcon}
                textStyle={styles.AddToCartButtonText}
                onPress={this.addToBagAction}
              />
              <IconButton
                icon={'heart'}
                style={styles.AddToWishlistButton}
                iconStyle={
                  (styles.AddToWishlistButtonIcon, {color: this.context.theme})
                }
                onPress={this.addToWishlistAction}
              />
            </BottomBar>
          ) : null}
        </View>

        {this.state.visible ? <BucketLoader /> : null}
      </>
    );
  }

  // componentWillUnmount() {
  //   this._is_mounted = false;

  //   this.removeListeners();
  // }
}

export default withTranslation()(Product);

const styles = StyleSheet.create({
  RenderWrap: {flex: 1},
  Background: {
    backgroundColor: Colors.WHITE,
  },
  BackgroundContainer: {
    paddingBottom: 10,
  },
  HeaderBg: {
    backgroundColor: Colors.WHITE,
    shadowColor: 'transparent',
    elevation: 0,
  },
  HeaderTitle: {
    fontFamily: Fonts.BOLD,
    fontSize: 18,
    color: Colors.WHITE,
  },
  Body: {
    paddingTop: 0,
    marginTop: 0,
    paddingBottom: 180,
  },
  CarouselWrapStyle: {
    width: Dimensions.get('window').width,
    marginTop: 0,
    backgroundColor: Colors.WHITE,
    paddingBottom: 20,
  },
  CarouselSlideStyle: {
    marginBottom: 0,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  Header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  HeaderLeftIcon: {
    marginRight: 15,
  },
  HeaderLeftContent: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    // justifyContent: 'space-between',
    // backgroundColor: 'red',
  },
  HeaderRightIcon: {
    marginLeft: 16,
  },
  FlexRow: {
    flexDirection: 'row',
  },
  BackIcon: {
    tintColor: Colors.ACCENT,
  },
  ProductTitle: {
    fontFamily: Fonts.BOLD,
    fontSize: 18,
  },
  ProductPrice: {
    marginTop: 7,
    fontSize: 18,
  },
  ProductRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ProductRating: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 7,
  },
  ProductRatingStars: {
    width: 120,
  },
  ProductRatingCount: {
    fontFamily: Fonts.REGULAR,
    fontSize: 12,
    color: Colors.OVERLAY,
    marginLeft: 10,
  },
  ProductsListItemRegularPrice: {
    fontSize: 14,
    fontFamily: Fonts.REGULAR,
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  BottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  AddToCartButton: {
    width: Dimensions.get('window').width * 0.6,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 12,
  },
  AddToCartButtonIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  AddToCartButtonText: {
    fontSize: 18,
  },
  AddToWishlistButton: {
    width: Dimensions.get('window').width * 0.25,
    justifyContent: 'center',
    alignSelf: 'flex-end',
    paddingVertical: 12,
    backgroundColor: Colors.ACCENT_SECONDARY,
  },
  AddToWishlistButtonIcon: {
    fontSize: 18,
    color: Colors.PRIMARY,
  },
  RatingBars: {
    borderBottomColor: Colors.ACCENT_SECONDARY,
    borderBottomWidth: 1,
  },
});
