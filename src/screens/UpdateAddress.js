import React, {PureComponent} from 'react';
import {
  HeaderBg,
  Wrap,
  TouchableIcon,
  WhiteText,
  BottomBar,
  FullWidthButton,
  InputField,
  SelectField,
  NoScrollBackground,
  ScrollableBody,
} from '../components/Common';
import {View, StyleSheet} from 'react-native';
import Constants, {Fonts, Models, Message} from '../utils/Constants';
import Online from '../utils/Online';
import {BackWithError, ShowToast} from '../components/Functions';
import InternetPopup from '../components/InternetPopup';
import NetInfo from '@react-native-community/netinfo';
import {NavigationEvents} from 'react-navigation';
import AllAddress from './AllAddress';

export default class UpdateAddress extends PureComponent {
  constructor(props) {
    super(props);

    this._is_mounted = false;
    this.internetListener = null;

    this.Online = new Online();


    this.state = {
      partnerId: global.partnerId,
      userDetails: global.userDetails,
      address_name: '',
      updateType: this.props.route.params.updateType ?? null,
      addressType: this.props.route.params.addressType ?? null,
      addressId: this.props.route.params.addressId ?? null,
      countries: [],
      states: [],
      street: '',
      street2: '',
      city: '',
      zip: '',
      country_id: null,
      country: '',
      state_id: null,
      state: '',
      showCountriesModal: false,
      showStatesModal: false,
      isLoading: true,
      showInternetPopup: false,
    };
  }

  componentDidMount() {
    this._is_mounted = true;

    this.init();
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      // do something
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

  init = () => {
    if (!this.state.updateType) {
      this.props.navigation.goBack();
    }

    if (this.state.updateType === 'edit' && this.state.addressId === null) {
      this.props.navigation.goBack();
    } else if (this.state.updateType === 'edit') {
      this.getAddressDetails();
    } else {
      this.getCountiesList();
    }
  };

  getAddressDetails = async () => {
    let response = await this.Online.viewPartnerDetails(this.state.partnerId);
    console.log('details address', response);
    if (!response.result) {
      BackWithError(this.props, Message.ERROR_TRY_AGAIN);
      return;
    }

    let address = response.result.address.find(item => {
      return item.id === this.state.addressId;
    });

    if (this._is_mounted) {
      this.setState({
        street: address.street,
        street2: address.street2,
        city: address.city,
        zip: address.zip,
        country_id: address.country_id ? address.country_id[0] : null,
        country: address.country_id ? address.country_id[1] : '',
        state_id: address.state_id ? address.state_id[0] : null,
        state: address.state_id ? address.state_id[1] : '',
      });
    }

    this.getCountiesList();
  };

  getCountiesList = async () => {
    let response = await this.Online.search(
      Models.COUNTRY,
      ['id', 'display_name'],
      [],
      '',
      'display_name',
    );

    if (!response.result) {
      BackWithError(this.props, Message.ERROR_TRY_AGAIN);
      return;
    }

    if (response.result.records.length < 1 && this._is_mounted) {
      this.setState({
        countries: [],
      });
    } else {
      if (this._is_mounted) {
        this.setState({
          countries: response.result.records,
        });
      }

      if (this.state.country_id) {
        this.getStatesList();
      }
    }

    this.stopLoading();
  };

  getStatesList = async (country_id = this.state.country_id) => {
    let response = await this.Online.search(
      Models.STATE,
      ['id', 'display_name'],
      [['country_id', '=', country_id]],
      '',
      'display_name',
    );

    if (!response.result) {
      BackWithError(this.props, Message.ERROR_TRY_AGAIN);
      return;
    }

    if (response.result.records.length < 1 && this._is_mounted) {
      this.setState({
        states: [],
      });
    } else if (this._is_mounted) {
      this.setState({
        states: response.result.records,
      });
    }
  };

  updateSelectedCountry = country => {
    if (this._is_mounted) {
      this.setState({
        country_id: country.id,
        country: country.display_name,
        state_id: null,
        state: '',
        showCountriesModal: false,
      });
    }

    this.getStatesList(country.id);
  };

  updateSelectedState = state => {
    if (this._is_mounted) {
      this.setState({
        state_id: state.id,
        state: state.display_name,
        showStatesModal: false,
      });
    }
  };

  addNewAdd = () => {
    axios
      .post('', {})
      .then(response => {
        console.log('addNew Address', response.data);
      })
      .catch(error => {
        console.log(error);
      });
  };

  validateForm = async () => {
    if (this.state.street.length < 1) {
      ShowToast('Enter address line 1');
      return false;
    }
    if (this.state.city.length < 1) {
      ShowToast('Enter city');
      return false;
    }
    if (this.state.zip.length < 1) {
      ShowToast('Enter zipcode');
      return false;
    }
    if (!this.state.country_id) {
      ShowToast('Select country');
      return false;
    }
    if (!this.state.state_id) {
      ShowToast('Select state');
      return false;
    }

    return true;
  };

  validateAndUpdate = async () => {
    let canUpdate = await this.validateForm();

    if (!canUpdate) {
      return;
    }

    this.updateAddress();
  };

  updateAddress = async () => {
    let response = await this.Online.updatePartnerAddress(
      this.state.address_name,
      global.partnerId,
      this.state.addressId,
      this.state.addressType,
      this.state.street,
      this.state.street2,
      this.state.city,
      this.state.state_id,
      this.state.country_id,
      this.state.zip,
    );

    console.log('response update address', response);

    if (!response.result) {
      if (Constants.DEBUG) {
        console.log(response);
      }
      ShowToast(Message.ERROR_TRY_AGAIN);
      return;
    }

    ShowToast('Address updated successfully');
    // this.props.navigation.state.params.onBack();
    this.props.route.params.onBack();
    this.props.navigation.goBack();
  };

  stopLoading = () => {
    if (this._is_mounted) {
      this.setState({isLoading: false});
    }
  };

  render() {
    return (
      <View style={styles.RenderWrap}>
        {/* <NavigationEvents
          onDidFocus={this.createListeners}
          onDidBlur={this.removeListeners}
        /> */}
        <InternetPopup
          showModal={this.state.showInternetPopup}
          retryAction={() => {
            this.setState({
              showInternetPopup: false,
            });
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
                  {this.state.updateType === 'edit'
                    ? 'Update Address'
                    : 'Add New Address'}
                </WhiteText>
              </View>
            </Wrap>
          </HeaderBg>
          <ScrollableBody showLoader={this.state.isLoading}>
            <Wrap>
            <InputField
                label={'Address Type'}
                value={this.state.address_name}
                onInput={address_name => this.setState({address_name: address_name})}
                autoCompleteType={'street-address'}
                style={styles.MarginBottom15}
                placeholder={'Home / Office etc...'}

              />
              <InputField
                label={'Address Line 1'}
                value={this.state.street}
                onInput={street => this.setState({street})}
                autoCompleteType={'street-address'}
                style={styles.MarginBottom15}
              />
              <InputField
                label={'Address Line 2'}
                value={this.state.street2}
                onInput={street2 => this.setState({street2})}
                autoCompleteType={'street-address'}
                style={styles.MarginBottom15}
              />
              {this.state.countries.length > 0 && (
                <SelectField
                  data={this.state.countries}
                  label={'Country'}
                  placeholder={'Select country'}
                  value={this.state.country}
                  listStatus={this.state.showCountriesModal}
                  showList={() => this.setState({showCountriesModal: true})}
                  hideList={() => this.setState({showCountriesModal: false})}
                  onSelect={this.updateSelectedCountry}
                  style={styles.MarginBottom15}
                />
              )}
              {this.state.states.length > 0 && (
                <SelectField
                  data={this.state.states}
                  label={'State'}
                  placeholder={'Select state'}
                  value={this.state.state}
                  listStatus={this.state.showStatesModal}
                  showList={() => this.setState({showStatesModal: true})}
                  hideList={() => this.setState({showStatesModal: false})}
                  onSelect={this.updateSelectedState}
                  style={styles.MarginBottom15}
                />
              )}
              <InputField
                label={'City'}
                value={this.state.city}
                onInput={city => this.setState({city})}
                style={styles.MarginBottom15}
              />
              <InputField
                label={'Zipcode'}
                value={this.state.zip}
                onInput={zip => this.setState({zip})}
                keyboardType={'numeric'}
                autoCompleteType={'postal-code'}
                maxLength={6}
                style={styles.MarginBottom15}
              />
            </Wrap>
          </ScrollableBody>
        </NoScrollBackground>
        {this.state.isLoading === false ? (
          <BottomBar>
            <FullWidthButton
              title={'Save'}
              style={styles.SaveButton}
              onPress={() => this.validateAndUpdate()}
            />
            {/* <FullWidthButton
              title={'Add New'}
              style={styles.SaveButton}
              // onPress={() => this.validateAndUpdate()}
              onPress={() => this.addNewAdd()}
            /> */}
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
