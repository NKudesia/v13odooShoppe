import React, {PureComponent} from 'react';
import {
  HeaderBg,
  Wrap,
  TouchableIcon,
  WhiteText,
  BottomBar,
  FullWidthButton,
  RadioOptions,
  OrderTotalCard,
  NoScrollBackground,
  ScrollableBody,
} from '../components/Common';
import {View, StyleSheet} from 'react-native';
import {Fonts, Models, Message} from '../utils/Constants';
import Online from '../utils/Online';
import {BackWithError, ShowToast} from '../components/Functions';
import {NavigationEvents} from 'react-navigation';
import InternetPopup from '../components/InternetPopup';
import NetInfo from '@react-native-community/netinfo';
import {Translation, useTranslation, withTranslation} from 'react-i18next';
import {useTheme} from '../context/ThemeProvider';

class DeliveryMethod extends PureComponent {
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
      cartDetails: [],
      cartTotalWeight: 0,
      cartTotalVolume: 0,
      cartTotalWeightVolume: 0,
      cartRowDetails: [],
      cartProductDetails: [],
      cartProductsList: [],
      deliveryMethods: [],
      deliveryFee: false,
      newDeliveryFee: null,
      deliveryOptions: [],
      selectedDeliveryOption: null,
      selectedDeliveryId: null,
      showInternetPopup: false,
    };
  }

  componentDidMount() {
    this._is_mounted = true;
    console.log('delivery');
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      // do something
      this.createListeners();
      this.getCartDetails();
      console.log('component Did Mount', this.cartId);
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

    if (!response.result) {
      BackWithError(this.props, Message.ERROR_TRY_AGAIN);
      return;
    }
    console.log('get cart details', response);
    let cartDetails = response.result;
    let deliveryFee = this.state.deliveryFee;
    let cartTotalVolume = 0;
    let cartTotalWeight = 0;
    let cartTotalWeightVolume = 0;

    cartDetails.order_line.forEach((line, i) => {
      if (line.is_delivery && this._is_mounted) {
        deliveryFee = line.price_unit;
        cartTotalVolume += line.volume * line.product_uom_qty;
        cartTotalWeight += line.weight * line.product_uom_qty;
        cartTotalWeightVolume +=
          line.volume * line.weight * line.product_uom_qty;
      }
    });

    if (this._is_mounted) {
      this.setState({
        cartDetails: cartDetails,
        deliveryFee: deliveryFee,
        cartTotalVolume: cartTotalVolume,
        cartTotalWeight: cartTotalWeight,
        cartTotalWeightVolume: cartTotalWeightVolume,
      });
    }

    this.getDeliveryFee();
  };

  getDeliveryFee = async () => {
    let response = await this.Online.viewShippingMethods();

    if (!response.result) {
      BackWithError(this.props, Message.ERROR_TRY_AGAIN);
      return;
    }

    let methods = [];
    let options = [];

    response.result.map(async (method, index) => {
      let baseFee = 0;
      let totalFee = 0;
      switch (true) {
        case method.delivery_type === 'fixed':
          baseFee = method.free_over
            ? this.state.cartDetails.amount_untaxed >= method.amount
              ? 0
              : method.fixed_price
            : method.fixed_price;
          totalFee =
            method.margin > 0
              ? baseFee + (baseFee / 100) * method.margin
              : baseFee;
          methods.push({...method, deliveryFee: totalFee});
          options.push(method.name);
          break;
        case method.delivery_type === 'base_on_rule':
          let rules = method.price_rule_ids;
          let deliveryFee = rules.length > 0 ? null : 0;

          rules.map(rule => {
            let calculatedFee = this.validateDeliveryRule(rule);

            if (typeof calculatedFee === 'undefined') {
              return;
            }

            baseFee = method.free_over
              ? this.state.cartDetails.amount_untaxed >= method.amount
                ? 0
                : calculatedFee
              : calculatedFee;

            totalFee =
              method.margin > 0
                ? baseFee + (baseFee / 100) * method.margin
                : baseFee;

            if (totalFee === 0 && deliveryFee === null) {
              deliveryFee = 0;
              return;
            } else if (totalFee < deliveryFee && deliveryFee !== null) {
              return;
            } else {
              deliveryFee = totalFee;
            }
          });

          methods.push({...method, deliveryFee: totalFee});
          options.push(method.name);
          break;
      }

      if (response.result.length === index + 1 && this._is_mounted) {
        this.setState({
          selectedDeliveryOption:
            method.id === this.state.selectedDeliveryId
              ? index
              : this.state.selectedDeliveryOption,
          deliveryMethods: methods,
          deliveryOptions: options,
          isLoading: false,
        });
      } else {
        if (method.id === this.state.selectedDeliveryId && this._is_mounted) {
          this.setState({selectedDeliveryOption: index});
        }
      }
    });
  };

  validateDeliveryRule = rule => {
    switch (rule.condition) {
      case 'weight':
        if (this.validateDeliveryCondition(this.state.cartTotalWeight, rule)) {
          return this.getDeliveryCost(rule);
        }
        break;
      case 'volume':
        if (this.validateDeliveryCondition(this.state.cartTotalVolume, rule)) {
          return this.getDeliveryCost(rule);
        }
        break;
      case 'wv':
        if (
          this.validateDeliveryCondition(this.state.cartTotalWeightVolume, rule)
        ) {
          return this.getDeliveryCost(rule);
        }
        break;
      case 'price':
        if (
          this.validateDeliveryCondition(
            this.state.cartDetails.amount_untaxed,
            rule,
          )
        ) {
          return this.getDeliveryCost(rule);
        }
        break;
      case 'quantity':
        if (
          this.validateDeliveryCondition(
            this.state.cartDetails.cart_quantity,
            rule,
          )
        ) {
          return this.getDeliveryCost(rule);
        }
        break;
      default:
        return false;
    }
  };

  validateDeliveryCondition = (value, rule) => {
    switch (rule.operator) {
      case '=':
        if (value === rule.max_value) {
          return true;
        }
        break;
      case '<=':
        if (value <= rule.max_value) {
          return true;
        }
        break;
      case '<':
        if (value < rule.max_value) {
          return true;
        }
        break;
      case '>=':
        if (value >= rule.max_value) {
          return true;
        }
        break;
      case '>':
        if (value > rule.max_value) {
          return true;
        }
        break;
      default:
        return false;
    }
  };

  getDeliveryCost = rule => {
    switch (rule.variable_factor) {
      case 'weight':
        return (
          rule.list_base_price + rule.list_price * this.state.cartTotalWeight
        );
      case 'volume':
        return (
          rule.list_base_price + rule.list_price * this.state.cartTotalVolume
        );
      case 'wv':
        return (
          rule.list_base_price +
          rule.list_price * this.state.cartTotalWeightVolume
        );
      case 'price':
        return (
          rule.list_base_price +
          rule.list_price * this.state.cartDetails.amount_untaxed
        );
      case 'quantity':
        return (
          rule.list_base_price + rule.list_price * this.state.cart_quantity
        );
      default:
        return 0;
    }
  };

  updateDeliveryMethod = index => {
    if (this._is_mounted) {
      this.setState({
        selectedDeliveryOption: index,
        newDeliveryFee: this.state.deliveryMethods[index].deliveryFee,
      });
    }
  };

  validateAndNavigate = async () => {
    let selectedMethod = this.state.deliveryMethods[
      this.state.selectedDeliveryOption
    ];

    let response = await this.Online.customCreate(
      Models.CHOOSE_DELIVERY_METHOD,
      [
        {
          order_id: this.state.cartDetails.quotation_id,
          carrier_id: selectedMethod.id,
          delivery_price: selectedMethod.deliveryFee,
        },
      ],
    );

    if (!response.result) {
      ShowToast(Message.ERROR_TRY_AGAIN);
      return;
    }

    let addMethod = await this.Online.addShippingInSo(
      response.result[0],
      selectedMethod.id,
    );

    if (addMethod.error) {
      ShowToast(Message.ERROR_TRY_AGAIN);
      return;
    } else {
      this.props.navigation.navigate('PaymentMethod', {});
    }
  };

  stopLoading = () => {
    if (this._is_mounted) {
      this.setState({isLoading: false});
    }
  };

  render() {
    const {t, i18n} = this.props;
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
                  onPress={() => {
                    this.props.navigation.goBack();
                  }}
                  name={'chevron-left'}
                  style={styles.HeaderRightIcon}
                />
                <WhiteText style={styles.Logo}>
                  {this.props.i18n.t('Delivery Method')}
                </WhiteText>
              </View>
            </Wrap>
          </HeaderBg>
          <ScrollableBody showLoader={this.state.isLoading}>
            <RadioOptions
              data={this.state.deliveryOptions}
              selected={this.state.selectedDeliveryOption}
              onChange={this.updateDeliveryMethod}
            />
            {this.state.cartDetails.quotation_id ? (
              <OrderTotalCard
                cartDetails={(this, this.state.cartDetails)}
                deliveryFee={
                  this.state.selectedDeliveryOption !== null
                    ? this.state.deliveryFee
                    : null
                }
                newDeliveryFee={this.state.newDeliveryFee}
              />
            ) : null}
          </ScrollableBody>
        </NoScrollBackground>
        {this.state.selectedDeliveryOption !== null && (
          <BottomBar>
            <FullWidthButton
              title={this.props.i18n.t('Continue')}
              style={
                (styles.SaveButton,
                {backgroundColor: this.context.theme})
              }
              onPress={this.validateAndNavigate}
            />
          </BottomBar>
        )}
      </View>
    );
  }

  componentWillUnmount() {
    this._is_mounted = false;

    this.removeListeners();
  }
}

export default withTranslation()(DeliveryMethod);

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
