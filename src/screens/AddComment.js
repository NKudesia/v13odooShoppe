import React, {PureComponent} from 'react';
import {
  HeaderBg,
  Wrap,
  TouchableIcon,
  WhiteText,
  BottomBar,
  FullWidthButton,
  InputTextarea,
  Label,
  NoScrollBackground,
  ScrollableBody,
} from '../components/Common';
import {View, StyleSheet} from 'react-native';
import Constants, {Fonts, Colors, Message} from '../utils/Constants';
import StarRating from 'react-native-star-rating';
import {NavigationEvents} from 'react-navigation';
import Online from '../utils/Online';
import {ShowToast} from '../components/Functions';
import AsyncStorage from '@react-native-community/async-storage';
import {useTheme} from '../context/ThemeProvider';

export default class AddComment extends PureComponent {
  static contextType = useTheme();

  constructor(props) {
    super(props);

    this.state = {
      productId: this.props.route.params.id,
      rating: 0,
      message: '',
    };
  }

  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      // do something
      this.validateProductId();
    });
  }

  validateProductId = () => {
    if (!this.props.route.params.id) {
      this.props.navigation.goBack();
    }
  };

  saveAction = async () => {
    ShowToast(Message.PLEASE_WAIT);

    let API = new Online(global.userDetails.email, global.userDetails.password);

    await API.login();

    let response = await API.addComment(
      this.state.productId,
      this.state.rating * 2,
      this.state.message,
    );
    console.log('from test', response);

    if (!response.result) {
      if (Constants.DEBUG) {
        console.log('Error while adding comment :', response);
      }
      ShowToast(Message.ERROR_TRY_AGAIN);
      console.log('from test');
      return;
    }

    ShowToast('Your rating has been posted.');

    if (this.props.route.params.onBack) {
      this.props.route.params.onBack();
    }

    this.props.navigation.goBack();
  };

  render() {
    return (
      <View style={styles.RenderWrap}>
        {/* <NavigationEvents onDidFocus={this.validateProductId} /> */}
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
                <WhiteText style={styles.Logo}>{'Rate Product'}</WhiteText>
              </View>
            </Wrap>
          </HeaderBg>
          <ScrollableBody style={{backgroundColor: 'transparent'}}>
            <Wrap>
              <View style={styles.MarginBottom20}>
                <Label style={styles.RatingLabel}>{'Rating *'}</Label>
                <StarRating
                  starSize={20}
                  rating={this.state.rating}
                  maxStars={5}
                  fullStarColor={Colors.STAR}
                  halfStarColor={Colors.STAR}
                  emptyStarColor={Colors.ACCENT_SECONDARY}
                  containerStyle={styles.ProductRatingStars}
                  selectedStar={rating => this.setState({rating})}
                />
              </View>
              <InputTextarea
                label={'Comment *'}
                value={this.state.message}
                onInput={message => this.setState({message})}
                style={styles.MarginBottom20}
              />
            </Wrap>
          </ScrollableBody>
        </NoScrollBackground>
        {this.state.message.length > 3 ? (
          <BottomBar>
            <FullWidthButton
              title={'Submit'}
              style={(styles.SaveButton, {backgroundColor: this.context.theme})}
              onPress={() => this.saveAction()}
            />
          </BottomBar>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  RenderWrap: {
    flex: 1,
    // backgroundColor: 'green',
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
  MarginBottom20: {
    marginBottom: 20,
  },
  SaveButton: {
    textAlign: 'center',
    fontSize: 18,
    paddingVertical: 12,
  },
  RatingLabel: {
    marginRight: 15,
  },
  ProductRatingStars: {
    width: 150,
  },
});
