import React, {Ref, useCallback} from 'react';
import Constants, {Colors, Fonts} from '../utils/Constants';
import {
  View,
  Image,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  TextStyle,
  ViewStyle,
  ImageStyle,
  Dimensions,
  Platform,
  Modal,
  ReturnKeyType,
  KeyboardTypeOptions,
  SafeAreaView,
  TouchableWithoutFeedback,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import StarRating from 'react-native-star-rating';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Feather from 'react-native-vector-icons/Feather';
import CommonStyles from './CommonStyles';
// import HTML from 'react-native-render-html';
import RenderHtml from 'react-native-render-html';
import {
  FormatNumber,
  TimestampToDate,
  DecodeImage,
  FormatCurrency,
  RandomIntBetween,
  OpenUrl,
} from './Functions';
import ImageCarousel from './ImageCarousel';
import ImageCarousel2 from './ImageCarousel2';
// import RangeSlider from 'rn-range-slider';
// import Slider from 'rn-range-slider';
import AutoHeightImage from 'react-native-auto-height-image';
import {ForFunc} from '../context/ThemeProvider';
import ThemeContext from '../context/ThemeProvider';
import {SlideOutLeft} from 'react-native-reanimated';
import {Translation, useTranslation, withTranslation} from 'react-i18next';
import Thumb from '../Slider/Thumb';
import RailSelected from '../Slider/RailSelected';
import Rail from '../Slider/Rail';
import Notch from '../Slider/Notch';
import Labell from '../Slider/Label';
import {Slider} from '@miblanchard/react-native-slider';

const globalAny: any = global;
// const contextType = ThemeContext;

export const Background = ({
  style,
  children,
  containerStyle,
  statusBarStyle,
}) => {
  const theme = ForFunc();
  return (
    <LinearGradient
      locations={[0, 0.65]}
      colors={[Colors.PRIMARY, Colors.SECONDARY]}
      style={{flex: 1, backgroundColor: theme.theme}}>
      <ScrollView
        contentContainerStyle={containerStyle}
        style={{...styles.Background, ...style}}
        bounces={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        <StatusBar
          translucent
          backgroundColor={Colors.OVERLAY}
          barStyle={statusBarStyle || 'light-content'}
        />
        {children}
      </ScrollView>
    </LinearGradient>
  );
};

export const NoScrollBackground = ({
  style,
  children,
  containerStyle,
  statusBarStyle,
}) => {
  const theme = ForFunc();
  // console.log('NoScrollBackground', theme.theme);
  return (
    <View
      style={{
        // flex: 1,
        // backgroundColor: Colors.SECONDARY,
        backgroundColor: theme.theme,
      }}>
      <View style={{...styles.Background, ...style}}>
        <View style={containerStyle}>
          <StatusBar
            translucent
            backgroundColor={Colors.OVERLAY}
            barStyle={statusBarStyle || 'light-content'}
          />
          {children}
        </View>
      </View>
    </View>
  );
};

export const Wrap = ({style = {}, children}) => (
  <View style={{...styles.Wrap, ...style}}>{children}</View>
);

export const HeaderBg = ({style, children}) => {
  const theme = ForFunc();
  return (
    <View
      style={[{...styles.HeaderBg, ...style}, {backgroundColor: theme.theme}]}>
      <SafeAreaView
        style={{
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 40,
        }}>
        <View
          style={{
            paddingVertical: 18,
          }}>
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
};

export const Body = ({style, showLoader = false, children}) => (
  <View
    style={{
      ...styles.Body,
      ...style,
    }}>
    {showLoader ? <Loader /> : children}
  </View>
);

export const ScrollableBody = ({style, showLoader = false, children}) => (
  <ScrollView
    contentContainerStyle={{
      ...styles.Body,
      ...style,
    }}
    showsHorizontalScrollIndicator={false}
    showsVerticalScrollIndicator={false}
    bounces={false}>
    {showLoader ? <Loader /> : children}
  </ScrollView>
);

export const Loader = () => (
  <View style={styles.LoaderWrap}>
    <Image
      source={{uri: DecodeImage(Constants.LOADER)}}
      style={styles.LoaderImage}
    />
  </View>
);

export const ContentOutWrap = props => (
  <View style={styles.ContentOutWrap}>{props.children}</View>
);

type DefaultTextProps = {
  style?: TextStyle;
  children?: any;
  onPress?: any;
};

export const DefaultText = ({style, children, onPress}: DefaultTextProps) => (
  <Text
    style={{
      ...styles.DefaultText,
      ...style,
    }}
    onPress={onPress}>
    {children}
  </Text>
);

export const LinkText = ({style, children, onPress}: DefaultTextProps) => (
  <OnlyTouch onPress={onPress}>
    <Text
      style={{
        ...styles.LinkText,
        ...style,
      }}>
      {children}
    </Text>
  </OnlyTouch>
);

export const WhiteText = ({style, children, onPress}: DefaultTextProps) => (
  <Text
    style={{
      ...styles.WhiteText,
      ...style,
    }}
    onPress={onPress}>
    {children}
  </Text>
);

export const Icon = ({source, style}) => (
  <Image source={source} style={{...styles.Icon, ...style}} />
);

type TouchableIconProps = {
  name: string;
  color?: string;
  size?: number;
  wrapStyle?: ViewStyle;
  style?: TextStyle;
  onPress?: any;
};

export const FontIcon = ({
  name,
  color,
  size,
  wrapStyle,
  style,
}: TouchableIconProps) => (
  <View style={wrapStyle}>
    <FontAwesome5
      solid
      name={name}
      color={color ? color : Colors.WHITE}
      size={size ? size : 22}
      style={{...styles.TouchableIcon, ...style}}
    />
  </View>
);

export const FeatherIcon = ({
  name,
  color,
  size,
  wrapStyle,
  style,
}: TouchableIconProps) => (
  <View style={wrapStyle}>
    <Feather
      name={name}
      color={color ? color : Colors.WHITE}
      size={size ? size : 22}
      style={{...styles.TouchableIcon, ...style}}
    />
  </View>
);

export const TouchableIcon = ({
  name,
  color,
  size,
  wrapStyle,
  style,
  onPress = null,
}: TouchableIconProps) => (
  <View>
    <OnlyTouch onPress={onPress}>
      <View style={wrapStyle}>
        <FontAwesome5
          solid
          name={name}
          color={color ? color : Colors.WHITE}
          size={size ? size : 22}
          style={{...styles.TouchableIcon, ...style}}
        />
      </View>
    </OnlyTouch>
  </View>
);

type OnlyTouchProps = {
  onPress: any;
  style?: ViewStyle;
  children: any;
  clickOpacity?: number;
};

export const OnlyTouch = ({
  onPress,
  children,
  style,
  clickOpacity = Constants.ACTIVE_OPACITY,
}: OnlyTouchProps) => (
  <TouchableOpacity onPress={onPress} activeOpacity={clickOpacity}>
    <View style={style}>{children}</View>
  </TouchableOpacity>
);

export const SearchBarTouchable = ({style, onPress}) => (
  <View style={{...style, ...styles.SearchBarBg}}>
    <OnlyTouch onPress={onPress} style={styles.SearchBarInput}>
      <Feather
        name={'search'}
        color={Colors.OVERLAY}
        size={20}
        style={{marginRight: 10}}
      />
      <DefaultText style={styles.SearchBarTouchableText}>
        {'Search for Products, Brands and More'}
      </DefaultText>
    </OnlyTouch>
  </View>
);

export const SearchBar = ({style, inputStyle = {}, onChange}) => (
  <TextInput
    style={{...styles.SearchBarInput, ...inputStyle}}
    placeholder={'Search for Products, Brands and More'}
    placeholderTextColor={Colors.OVERLAY}
    onChangeText={onChange}
  />
);

export const Label = ({children, style}: DefaultTextProps) => (
  <Text
    style={{
      ...styles.Label,
      ...style,
    }}>
    {children}
  </Text>
);

type InputFieldProps = {
  style?: ViewStyle;
  inputStyle?: TextStyle;
  label?: string;
  placeholder?: string;
  value?: string;
  onInput?: any;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCompleteType?:
    | 'name'
    | 'username'
    | 'password'
    | 'cc-csc'
    | 'cc-exp'
    | 'cc-exp-month'
    | 'cc-exp-year'
    | 'cc-number'
    | 'email'
    | 'postal-code'
    | 'street-address'
    | 'tel'
    | 'off';
  autoCorrect?: boolean;
  maxLength?: number;
  numberOfLines?: number;
  isPassword?: boolean;
  onEyePress?: any;
  onSubmitEditing?: any;
  refKey?: Ref<TextInput>;
  editable?: boolean;
  onPress: any;
  returnKeyType: ReturnKeyType;
  returnKeyLabel: string;
};

export const InputField = ({
  style,
  inputStyle,
  label,
  placeholder,
  value,
  onInput,
  keyboardType,
  autoCapitalize,
  autoCompleteType,
  autoCorrect,
  maxLength,
  numberOfLines = 1,
  isPassword = false,
  onEyePress,
  onSubmitEditing = null,
  refKey,
  editable = true,
  returnKeyType = null,
  returnKeyLabel = null,
}: InputFieldProps) => (
  <View>
    <DefaultText style={styles.InputFieldLabel}>{label}</DefaultText>
    <View style={{...styles.InputFieldWrap, ...style}}>
      <TextInput
        style={{
          ...(numberOfLines > 1
            ? styles.InputFieldTextarea
            : styles.InputFieldInput),
          ...inputStyle,
        }}
        editable={editable}
        placeholder={placeholder}
        placeholderTextColor={Colors.OVERLAY}
        value={value}
        onChangeText={onInput}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCompleteType={autoCompleteType}
        autoCorrect={autoCorrect}
        maxLength={maxLength}
        secureTextEntry={isPassword}
        returnKeyType={
          returnKeyType !== null
            ? returnKeyType
            : onSubmitEditing
            ? 'next'
            : 'default'
        }
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={onSubmitEditing ? false : true}
        ref={refKey}
        numberOfLines={numberOfLines}
        multiline={numberOfLines > 1}
        returnKeyLabel={returnKeyLabel}
      />
      {onEyePress && value.length > 0 && (
        <TouchableIcon
          name={isPassword ? 'eye' : 'eye-slash'}
          color={Colors.OVERLAY}
          wrapStyle={styles.PasswordEye}
          onPress={onEyePress}
        />
      )}
    </View>
  </View>
);

export const InputTextarea = ({
  style,
  inputStyle,
  label,
  value,
  onInput,
  numberOfLines = 5,
  editable = true,
  onPress = null,
}: InputFieldProps) => (
  <OnlyTouch onPress={onPress}>
    <DefaultText style={styles.InputFieldLabel}>{label}</DefaultText>
    <View style={{...styles.InputFieldTextareaWrap, ...style}}>
      <TextInput
        style={{
          ...styles.InputFieldTextarea,
          ...inputStyle,
          minHeight: numberOfLines * 40,
        }}
        editable={editable}
        placeholder={label}
        placeholderTextColor={Colors.OVERLAY}
        value={value}
        onChangeText={onInput}
        numberOfLines={numberOfLines}
        multiline={numberOfLines > 1}
      />
    </View>
  </OnlyTouch>
);

type SelectFieldProps = {
  data: {
    id: number;
    display_name: string;
  }[];
  label: string;
  placeholder: string;
  value: string;
  listStatus: boolean;
  showList: () => void;
  hideList: () => void;
  onListToggle: () => void;
  onSelect: (item) => void;
  style: ViewStyle;
};

const SelectItem = ({item, onSelect}) => (
  <DefaultText
    style={{
      fontSize: 18,
      paddingVertical: 5,
    }}
    onPress={() => onSelect(item)}>
    {item.display_name}
  </DefaultText>
);

export const SelectField = ({
  data,
  label,
  placeholder,
  value,
  listStatus,
  showList,
  hideList,
  onSelect,
  style,
}: SelectFieldProps) => (
  <View>
    <DefaultText style={styles.InputFieldLabel}>{label}</DefaultText>
    <OnlyTouch onPress={showList}>
      <View style={{...styles.InputFieldWrap, ...style}}>
        <DefaultText
          style={{...styles.InputFieldInput, paddingTop: 4, paddingBottom: 11}}>
          {value.length > 0 ? value : placeholder}
        </DefaultText>
        <TouchableIcon
          style={{position: 'absolute', right: 15, marginTop: -30}}
          name={'chevron-down'}
          color={Colors.ACCENT}
          size={18}
        />
      </View>
    </OnlyTouch>
    <Modal visible={listStatus} transparent={true} onRequestClose={hideList}>
      <View style={{height: '100%'}}>
        <TouchableWithoutFeedback onPress={hideList}>
          <View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: Colors.OVERLAY,
            }}
          />
        </TouchableWithoutFeedback>
        <View
          style={{
            height: Dimensions.get('window').height - 70,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 70,
          }}>
          <ScrollView
            contentContainerStyle={{
              width: Dimensions.get('window').width * 0.8,
              paddingHorizontal: 20,
              paddingVertical: 10,
              marginBottom: 120,
              backgroundColor: Colors.WHITE,
            }}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}>
            {data.map(item => (
              <SelectItem
                key={item.display_name}
                item={item}
                onSelect={onSelect}
              />
            ))}
          </ScrollView>
        </View>
      </View>
      <TouchableIcon
        name={'times'}
        color={Colors.OVERLAY}
        size={20}
        wrapStyle={{
          position: 'absolute',
          width: 35,
          height: 35,
          right: 25,
          top: 55,
          zIndex: 999,
          backgroundColor: Colors.WHITE,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 50,
          borderColor: Colors.OVERLAY,
          borderWidth: 2,
          borderStyle: 'solid',
        }}
        onPress={hideList}
      />
    </Modal>
  </View>
);

type SelectWithSearchFieldProps = {
  searchKey: string;
  onSearch: () => void;
  data: {
    id: number;
    display_name: string;
  }[];
  label: string;
  placeholder: string;
  value: string;
  listStatus: boolean;
  showList: () => void;
  hideList: () => void;
  onListToggle: () => void;
  onSelect: (item) => void;
  style: ViewStyle;
};

export const SelectWithSearchField = ({
  searchKey,
  onSearch,
  data,
  label,
  placeholder,
  value,
  listStatus,
  showList,
  hideList,
  onSelect,
  style,
}: SelectWithSearchFieldProps) => (
  <View>
    <DefaultText style={styles.InputFieldLabel}>{label}</DefaultText>
    <OnlyTouch onPress={showList}>
      <View style={{...styles.InputFieldWrap, ...style}}>
        <DefaultText
          style={{...styles.InputFieldInput, paddingTop: 4, paddingBottom: 11}}>
          {value.length > 0 ? value : placeholder}
        </DefaultText>
        <TouchableIcon
          style={{position: 'absolute', right: 15, marginTop: -30}}
          name={'chevron-down'}
          color={Colors.ACCENT}
          size={18}
        />
      </View>
    </OnlyTouch>
    <Modal visible={listStatus} transparent={true} onRequestClose={hideList}>
      <View style={{height: '100%'}}>
        <TouchableWithoutFeedback onPress={hideList}>
          <View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: Colors.OVERLAY,
            }}
          />
        </TouchableWithoutFeedback>
        <View
          style={{
            height: Dimensions.get('window').height - 70,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 70,
          }}>
          <ScrollView
            contentContainerStyle={{
              width: Dimensions.get('window').width * 0.8,
              paddingHorizontal: 20,
              paddingVertical: 10,
              marginBottom: 120,
              backgroundColor: Colors.WHITE,
            }}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}>
            <TextInput value={searchKey} onChangeText={onSearch} style={{}} />
            {data.map(item => (
              <SelectItem
                key={item.display_name}
                item={item}
                onSelect={onSelect}
              />
            ))}
          </ScrollView>
        </View>
      </View>
      <TouchableIcon
        name={'times'}
        color={Colors.OVERLAY}
        size={20}
        wrapStyle={{
          position: 'absolute',
          width: 35,
          height: 35,
          right: 25,
          top: 55,
          zIndex: 999,
          backgroundColor: Colors.WHITE,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 50,
          borderColor: Colors.OVERLAY,
          borderWidth: 2,
          borderStyle: 'solid',
        }}
        onPress={hideList}
      />
    </Modal>
  </View>
);

type CardProps = {
  style?: ViewStyle;
  children?: any;
};

export const Card = ({style, children}: CardProps) => (
  <View key={Math.random()} style={{...styles.Card, ...style}}>
    {children}
  </View>
);

type CategoryProductCardProps = {
  item: {
    product_template_id: number;
    name: string;
    display_name: string;
    image_512: string | boolean;
    list_price: number;
    discounted_price: number;
  };
  productAction: any;
  wrapStyle?: ViewStyle;
};

export const CategoryProductCard = ({
  item,
  productAction,
  wrapStyle,
}: CategoryProductCardProps) => (
  <View style={{...styles.CategoryProductCard, ...wrapStyle}}>
    <OnlyTouch onPress={() => productAction(item.product_template_id)}>
      <View>
        <Image
          source={{
            uri: DecodeImage(item.image_512),
          }}
          style={styles.CategoryProductCardImage}
        />
        <DefaultText style={styles.CategoryProductCardTitle}>
          {item.name}
        </DefaultText>
        <DefaultText style={styles.CategoryProductCardPrice}>
          {FormatCurrency(item.list_price) + ' '}
          {item.discounted_price && (
            <DefaultText style={styles.ProductsListItemRegularPrice}>
              {FormatCurrency(item.list_price)}
            </DefaultText>
          )}
        </DefaultText>
      </View>
    </OnlyTouch>
  </View>
);

export const CategoryProductViewAllCard = ({
  category,
  wrapStyle = {},
  onPress,
}) => (
  <View style={{...styles.CategoryProductCard, ...wrapStyle}}>
    <OnlyTouch onPress={() => onPress(category)}>
      <View
        style={{
          width: '100%',
          height: 135,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <FontAwesome5
          solid
          name={'layer-group'}
          size={50}
          color={Colors.ACCENT_SECONDARY}
        />
        <DefaultText
          style={{
            textAlign: 'center',
            marginTop: 15,
            fontSize: 16,
            fontFamily: Fonts.REGULAR,
          }}>
          {'View All'}
        </DefaultText>
      </View>
    </OnlyTouch>
  </View>
);

export const CategoryNoProductCard = ({text = 'No Products', icon = null}) => (
  <View style={styles.CategoryNoProductCard}>
    {icon ? (
      <TouchableIcon
        name={icon}
        color={Colors.ACCENT_SECONDARY}
        size={50}
        style={{marginBottom: 10}}
      />
    ) : null}
    <DefaultText style={styles.CategoryNoProductText}>{text}</DefaultText>
  </View>
);

export const ImageCategoryTab = ({item, index, activeKey = null, onPress}) => {
  // console.log("ImageCategoryTab", item)
  return (
    <OnlyTouch
      onPress={() => onPress(item)}
      style={{
        marginRight: 10,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor:
          activeKey === null
            ? Colors.ACCENT_SECONDARY
            : index === activeKey
            ? Colors.OVERLAY
            : Colors.ACCENT_SECONDARY,
        backgroundColor: Colors.WHITE,
        borderRadius: 3,
        overflow: 'hidden',
      }}>
      <View>
        <View
          style={{
            width: '100%',
          }}>
          <AutoHeightImage
            source={{
              uri: item.custom_image
                ? item.custom_image
                : item['default_' + item.link_model + '_image']
                ? item['default_' + item.link_model + '_image']
                : DecodeImage(false),
            }}
            width={95}
          />
        </View>
        {item.name ? (
          <DefaultText
            style={{
              fontSize: 15,
              marginVertical: 3,
              textAlign: 'center',
              textTransform: 'uppercase',
              fontFamily: Fonts.LORA,
              fontWeight: '400',
              color: Colors.ACCENT,
            }}>
            {item.name}
          </DefaultText>
        ) : null}
      </View>
    </OnlyTouch>
  );
};

export const CategoryTab = ({item, index, activeKey, changeActiveKey}) => (
  <OnlyTouch onPress={() => changeActiveKey(index)}>
    <View
      style={{
        ...styles.CategoryTab,
        borderBottomColor: index === activeKey ? Colors.ACCENT : 'transparent',
      }}>
      <DefaultText
        style={{
          fontFamily: Fonts.REGULAR,
          color: index === activeKey ? Colors.ACCENT : Colors.OVERLAY,
        }}>
        {item.title}
      </DefaultText>
    </View>
  </OnlyTouch>
);
//Top Horizontal Category Render eg: Men, Kids
export const CategoryHorizontalList = ({
  title = null,
  categories,
  onPress,
  style = {},
}) => (
  <View
    style={{
      paddingVertical: 20,
      marginBottom: 15,
      backgroundColor: Colors.WHITE,
      ...style,
    }}>
    {title ? (
      <DefaultText
        style={{
          fontSize: 14,
          fontFamily: Fonts.REGULAR,
          marginBottom: 15,
          textTransform: 'uppercase',
        }}>
        {title}
      </DefaultText>
    ) : null}
    <FlatList
      style={styles.CategoryTabsList}
      data={categories}
      horizontal={true}
      renderItem={({item, index}) => (
        // console.log('first',item),
        <ImageCategoryTab item={item} index={index} onPress={onPress} />
      )}
      showsHorizontalScrollIndicator={false}
      keyExtractor={item => item.id.toString()}
    />
  </View>
);

export const CategoryTabs = ({
  isLoading,
  categories,
  productAction,
  changeActiveKey,
  onPressViewAllCard,
  products = [],
  activeKey = 0,
  onEndReached = null,
}) => (
  <View>
    <FlatList
      style={styles.CategoryTabsList}
      data={categories}
      horizontal={true}
      renderItem={({item, index}) => (
        <ImageCategoryTab
          key={item.title}
          item={item}
          index={index}
          activeKey={activeKey}
          onPress={changeActiveKey}
        />
      )}
      showsHorizontalScrollIndicator={false}
      keyExtractor={item => item.title}
    />
    {products.length > 0 ? (
      <View>
        {isLoading ? (
          <View style={{height: '100%'}}>
            <Loader />
          </View>
        ) : (
          <View style={styles.CategoryProductCardsList}>
            {products.map((item, index) => (
              <CategoryProductCard
                key={item.display_name}
                item={item}
                productAction={productAction}
              />
            ))}
            <CategoryProductViewAllCard
              category={categories[activeKey]}
              onPress={onPressViewAllCard}
            />
          </View>
        )}
      </View>
    ) : (
      <CategoryNoProductCard />
    )}
  </View>
);

export const Button = ({title, onPress, wrapStyle, style}) => (
  <OnlyTouch onPress={onPress}>
    <View style={{...styles.ButtonWrap, ...wrapStyle}}>
      <DefaultText style={{...styles.Button, ...style}}>{title}</DefaultText>
    </View>
  </OnlyTouch>
);

export const BigButton = ({title, onPress, style}) => (
  <OnlyTouch onPress={onPress}>
    <DefaultText style={{...styles.BigButton, ...style}}>{title}</DefaultText>
  </OnlyTouch>
);

export const FullWidthButton = ({
  enabled = true,
  title,
  onPress,
  style,
  wrapStyle,
}) => (
  <OnlyTouch
    onPress={enabled ? onPress : null}
    style={{opacity: enabled ? 1 : Constants.ACTIVE_OPACITY}}>
    <View style={{...styles.ButtonWrap, ...wrapStyle}}>
      <DefaultText style={{...styles.FullWidthButton, ...style}}>
        {title}
      </DefaultText>
    </View>
  </OnlyTouch>
);

export const IconButton = ({icon, iconStyle = {}, onPress, style}) => (
  <OnlyTouch onPress={onPress} style={{...styles.IconButton, ...style}}>
    <View>
      <OnlyTouch onPress={onPress}>
        <FontAwesome5
          solid
          name={icon}
          color={Colors.WHITE}
          size={18}
          style={{...styles.TouchableIcon, ...iconStyle}}
        />
      </OnlyTouch>
    </View>
  </OnlyTouch>
);

type IconTextButtonProps = {
  title: string;
  icon: string;
  onPress: any;
  iconStyle?: TextStyle;
  textStyle?: TextStyle;
  style?: ViewStyle;
};

export const IconTextButton = ({
  title,
  icon,
  iconStyle,
  textStyle,
  onPress,
  style,
}: IconTextButtonProps) => (
  <OnlyTouch onPress={onPress}>
    <View style={{...styles.IconButton, ...style}}>
      <TouchableIcon
        name={icon}
        size={18}
        style={{
          ...styles.IconButtonTextIcon,
          ...iconStyle,
        }}
      />
      <DefaultText style={{...styles.IconButtonText, ...textStyle}}>
        {title}
      </DefaultText>
    </View>
  </OnlyTouch>
);

export const HProductListItem = ({
  item,
  detailsAction,
  addToBagAction = null,
  addToWishlistAction = null,
}) => (
  <Card style={styles.ProductsListItemCard} key={item.name}>
    <View style={styles.ProductsListItemImageWrap}>
      <OnlyTouch onPress={() => detailsAction(item.product_template_id)}>
        <Image
          source={{
            uri: !item.image_512
              ? DecodeImage(Constants.THUMBNAIL)
              : DecodeImage(item.image_512),
          }}
          style={styles.ProductsListItemImage}
        />
      </OnlyTouch>
    </View>
    <View style={styles.ProductsListItemBodyWrap}>
      <DefaultText
        style={styles.ProductsListItemTitle}
        onPress={() => detailsAction(item.product_template_id)}>
        {item.name}
      </DefaultText>
      <DefaultText
        style={styles.ProductsListItemPrice}
        onPress={() => detailsAction(item.product_template_id)}>
        {FormatCurrency(item.price) + ' '}
        {item.discount && (
          <DefaultText style={styles.ProductsListItemRegularPrice}>
            {FormatCurrency(item.price)}
          </DefaultText>
        )}
      </DefaultText>
      {globalAny.ratingEnabled ? (
        <View style={styles.ProductsListItemRatingWrap}>
          <OnlyTouch onPress={() => detailsAction(item.product_template_id)}>
            <StarRating
              starSize={20}
              disabled={true}
              rating={5 * (item.rating_avg / 10)}
              maxStars={5}
              fullStarColor={Colors.STAR}
              halfStarColor={Colors.STAR}
              emptyStarColor={Colors.ACCENT_SECONDARY}
            />
          </OnlyTouch>
        </View>
      ) : null}
      {addToBagAction || addToWishlistAction ? (
        <View style={styles.ProductsListItemButtonsWrap}>
          {addToBagAction && (
            <IconTextButton
              title={'Add To Bag'}
              icon={'shopping-cart'}
              style={styles.ProductsListItemButton}
              onPress={() => addToBagAction(item.product_template_id)}
            />
          )}
          {addToWishlistAction && (
            <IconButton
              style={{backgroundColor: Colors.ACCENT_SECONDARY}}
              icon={'heart'}
              iconStyle={styles.ProductsListItemButtonIcon}
              onPress={() => addToWishlistAction(item.product_template_id)}
            />
          )}
        </View>
      ) : null}
    </View>
  </Card>
);

export const HWishListProductCard = ({
  item,
  detailsAction,
  addToBagAction = null,
  removeAction = null,
}) => (
  <Card style={styles.ProductsListItemCard} key={item.name}>
    <View style={styles.ProductsListItemImageWrap}>
      <OnlyTouch onPress={() => detailsAction(item.product_template_id)}>
        <Image
          source={{
            uri: !item.image_512
              ? DecodeImage(Constants.THUMBNAIL)
              : DecodeImage(item.image_512),
          }}
          style={styles.ProductsListItemImage}
        />
      </OnlyTouch>
    </View>
    <View style={styles.ProductsListItemBodyWrap}>
      <DefaultText
        style={styles.ProductsListItemTitle}
        onPress={() => detailsAction(item.product_template_id)}>
        {item.name}
      </DefaultText>
      <DefaultText
        style={styles.ProductsListItemPrice}
        onPress={() => detailsAction(item.product_template_id)}>
        {FormatCurrency(item.price) + ' '}
        {item.discount && (
          <DefaultText style={styles.ProductsListItemRegularPrice}>
            {FormatCurrency(item.price)}
          </DefaultText>
        )}
      </DefaultText>
      {globalAny.ratingEnabled ? (
        <View style={styles.ProductsListItemRatingWrap}>
          <OnlyTouch onPress={() => detailsAction(item.product_template_id)}>
            <StarRating
              starSize={20}
              disabled={true}
              rating={5 * (item.rating_avg / 10)}
              maxStars={5}
              fullStarColor={Colors.STAR}
              halfStarColor={Colors.STAR}
              emptyStarColor={Colors.ACCENT_SECONDARY}
            />
          </OnlyTouch>
        </View>
      ) : null}
      {addToBagAction !== null || removeAction !== null ? (
        <View style={styles.ProductsListItemButtonsWrap}>
          {addToBagAction !== null ? (
            <IconTextButton
              title={'Add To Bag'}
              icon={'shopping-cart'}
              style={styles.ProductsListItemButton}
              onPress={() => addToBagAction(item.product_id)}
            />
          ) : null}
          {removeAction !== null ? (
            <IconButton
              style={{backgroundColor: Colors.ACCENT_SECONDARY}}
              icon={'times'}
              iconStyle={styles.WishlistProductsCardButtonIcon}
              onPress={() => removeAction(item.product_id)}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  </Card>
);

export const ProductsList = ({
  data,
  type = 'horizontal',
  detailsAction,
  addToBagAction = false,
  addToWishlistAction = false,
}) => (
  <View>
    {data.map((item, index) =>
      type === 'horizontal'
        ? HProductListItem({
            item,
            detailsAction,
          })
        : HProductListItem({
            item,
            detailsAction,
          }),
    )}
  </View>
);

export const ColorOptions = ({
  positionIndex,
  data,
  onColorChange,
  selected = 0,
}) => (
  <View style={styles.OptionsList}>
    <DefaultText style={styles.OptionsListTitle}>{'Color'}</DefaultText>
    <FlatList
      horizontal
      data={data}
      renderItem={({item, index}) => (
        <OnlyTouch
          key={item.name}
          onPress={() => {
            return selected === index
              ? null
              : onColorChange(positionIndex, index, item.id);
          }}>
          <View
            style={{
              ...styles.OptionsListItem,
              borderColor:
                selected === index ? Colors.PRIMARY : Colors.ACCENT_SECONDARY,
              backgroundColor: item.html_color,
            }}
          />
        </OnlyTouch>
      )}
      keyExtractor={item => {
        return item.name;
      }}
    />
  </View>
);

export const SizeOptions = ({
  positionIndex,
  data,
  onSizeChange,
  selected = 0,
}) => (
  <View style={styles.OptionsList}>
    <DefaultText style={styles.OptionsListTitle}>{'Size'}</DefaultText>
    <FlatList
      horizontal
      data={data}
      renderItem={({item, index}) => (
        <OnlyTouch
          key={item}
          onPress={() => {
            return selected === index
              ? null
              : onSizeChange(positionIndex, index, item.id);
          }}>
          <View
            style={{
              ...styles.OptionsListItem,
              backgroundColor: Colors.WHITE,
              borderColor:
                selected === index ? Colors.PRIMARY : Colors.ACCENT_SECONDARY,
            }}>
            <DefaultText>{item}</DefaultText>
          </View>
        </OnlyTouch>
      )}
      keyExtractor={(item, index) => {
        return item;
      }}
    />
  </View>
);

export const GenderOptions = ({
  positionIndex,
  data,
  onGenderChange,
  selected = 0,
}) => (
  <View style={styles.OptionsList}>
    <DefaultText style={styles.OptionsListTitle}>{'Gender'}</DefaultText>
    <FlatList
      horizontal
      data={data}
      renderItem={({item, index}) => (
        <OnlyTouch
          key={item}
          onPress={() => {
            return selected === index
              ? null
              : onGenderChange(positionIndex, index, item.id);
          }}>
          <View
            style={{
              ...styles.OptionsListItemPill,
              backgroundColor: Colors.WHITE,
              borderColor:
                selected === index ? Colors.PRIMARY : Colors.ACCENT_SECONDARY,
            }}>
            <View
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                ...styles.OptionsListItemPillCircle,
                backgroundColor:
                  selected === index ? Colors.PRIMARY : 'transparent',
                borderColor:
                  selected === index ? Colors.PRIMARY : Colors.ACCENT_SECONDARY,
              }}
            />
            <DefaultText>{item}</DefaultText>
          </View>
        </OnlyTouch>
      )}
      keyExtractor={(item, index) => {
        return item;
      }}
    />
  </View>
);

export const CustomRadioOptions = ({
  positionIndex,
  data,
  title,
  optionKey,
  onOptionChange,
  selected = 0,
}) => {
  // console.log('customRadioOption', positionIndex)
  return (
    <View style={styles.OptionsList}>
      <DefaultText style={styles.OptionsListTitle}>{title}</DefaultText>
      <FlatList
        horizontal
        data={data}
        renderItem={({item, index}) => (
          <View>
            <OnlyTouch
              onPress={() => {
                return selected === index
                  ? null
                  : onOptionChange(positionIndex, index, optionKey, item.id);
              }}>
              <View
                style={{
                  ...styles.OptionsListItemPill,
                  backgroundColor: Colors.WHITE,
                  borderColor:
                    selected === index
                      ? Colors.PRIMARY
                      : Colors.ACCENT_SECONDARY,
                }}>
                <View
                  // eslint-disable-next-line react-native/no-inline-styles
                  style={{
                    ...styles.OptionsListItemPillCircle,
                    backgroundColor:
                      selected === index ? Colors.PRIMARY : 'transparent',
                    borderColor:
                      selected === index
                        ? Colors.PRIMARY
                        : Colors.ACCENT_SECONDARY,
                  }}
                />
                <DefaultText>{item.name}</DefaultText>
              </View>
            </OnlyTouch>
          </View>
        )}
        keyExtractor={item => {
          return item.name + RandomIntBetween(1111, 9999);
        }}
      />
    </View>
  );
};

export const QuantityOption = ({
  max = 'unlimited',
  selected = 0,
  decreaseAction,
  increaseAction,
}) => (
  <View style={styles.QuantityOption}>
    <DefaultText style={styles.OptionsListTitle}>{'Quantity'}</DefaultText>
    <View style={styles.QuantityOptionWrap}>
      <TouchableIcon
        name={'minus'}
        color={Colors.ACCENT}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          opacity: selected <= 1 ? 0.1 : 1,
        }}
        onPress={() => {
          return selected <= 1
            ? null
            : decreaseAction
            ? decreaseAction()
            : null;
        }}
      />
      <DefaultText style={styles.QuantityOptionText}>{selected}</DefaultText>
      <TouchableIcon
        name={'plus'}
        color={Colors.ACCENT}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          opacity: typeof max === 'number' ? (selected <= max ? 1 : 0.1) : 1,
        }}
        onPress={() => {
          return typeof max === 'number'
            ? selected <= max
              ? increaseAction
                ? increaseAction()
                : null
              : null
            : increaseAction();
        }}
      />
    </View>
  </View>
);

export const ProductDescription = ({description}) => (
  <View style={styles.QuantityOption}>
    <DefaultText style={styles.OptionsListTitle}>{'Description'}</DefaultText>
    {/* <HTML
      html={description}
      tagsStyles={{p: {fontFamily: Fonts.LIGHT}, li: {fontFamily: Fonts.LIGHT}}}
    /> */}
    <RenderHtml
      source={description}
      tagsStyles={{p: {fontFamily: Fonts.LIGHT}, li: {fontFamily: Fonts.LIGHT}}}
    />
  </View>
);

export const BottomBar = ({style, children}) => (
  <View style={{...styles.BottomBar, ...style}}>{children}</View>
);

export const CartProductListItem = (
  totalData,
  {item, index, updateAction, removeAction},
) => (
  // console.log('from CartProductListItem', totalData),
  <View style={styles.CartProductsListItemCard} key={index}>
    <View style={styles.CartProductsListItemTopRow}>
      <Image
        source={{
          uri: item.product_image
            ? item.product_image
            : DecodeImage(Constants.THUMBNAIL),
        }}
        style={styles.CartProductsListItemImage}
      />
      <View style={styles.ProductsListItemBodyWrap}>
        <DefaultText style={styles.ProductsListItemTitle}>
          {item.product_name}
        </DefaultText>
        <DefaultText style={styles.ProductsListItemPrice}>
          {/* {FormatCurrency(item.price_unit) + ' '} */}

          {totalData.currency +
            ' ' +
            parseFloat(item.price_unit).toFixed(2) +
            ' '}
          {item.discount > 0 && (
            <DefaultText style={styles.ProductsListItemRegularPrice}>
              {/* {FormatCurrency(item.price_unit)} */}

              {totalData.currency +
                ' ' +
                parseFloat(item.price_unit).toFixed(2) +
                ' '}
            </DefaultText>
          )}
        </DefaultText>
      </View>
      <View style={styles.CartQuantityOptionWrap}>
        <TouchableIcon
          name={'minus'}
          color={Colors.ACCENT}
          style={styles.CartQuantityOptionIcon}
          onPress={() => {
            return item.product_uom_qty === 1
              ? removeAction(index)
              : updateAction(index, -1);
          }}
        />
        <DefaultText style={styles.QuantityOptionText}>
          {item.product_uom_qty}
        </DefaultText>
        <TouchableIcon
          name={'plus'}
          color={Colors.ACCENT}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            ...styles.CartQuantityOptionIcon,
            opacity: 1,
          }}
          onPress={() => {
            return updateAction(index, 1);
          }}
        />
      </View>
    </View>
    <View style={styles.CartProductsListItemRow}>
      <DefaultText style={styles.CartProductsListItemRowTitle}>
        {'Total'}
      </DefaultText>
      <DefaultText style={styles.CartProductsListItemRowTitle}>
        {/* {FormatCurrency(item.product_uom_qty * item.price_unit)} */}
        {totalData.currency +
          ' ' +
          item.product_uom_qty * item.price_unit +
          ' '}
      </DefaultText>
    </View>
  </View>
);

export const CartProductsList = ({cartRowData, updateAction, removeAction}) => {
  let totalData = cartRowData;
  return (
    <View>
      {cartRowData.order_line.map((item, index) =>
        item.is_delivery === false
          ? CartProductListItem(totalData, {
              item,
              index,
              updateAction,
              removeAction,
            })
          : null,
      )}
    </View>
  );
};

export const RadioOptions = ({data, selected, onChange}) => (
  <View
    style={{
      marginBottom: 20,
      paddingVertical: 10,
      paddingHorizontal: '3%',
      backgroundColor: Colors.WHITE,
    }}>
    {data.map((item, index) => (
      <OnlyTouch
        key={item}
        onPress={() => {
          return selected === index ? null : onChange(index);
        }}>
        <View
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            ...styles.RadioOptionsWrap,
            borderBottomWidth: index === data.length - 1 ? 0 : 1,
          }}>
          <View
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              ...styles.OptionsListItemPillCircle,
              backgroundColor:
                selected === index ? Colors.PRIMARY : 'transparent',
              borderColor:
                selected === index ? Colors.PRIMARY : Colors.ACCENT_SECONDARY,
            }}
          />
          <DefaultText>{item}</DefaultText>
        </View>
      </OnlyTouch>
    ))}
  </View>
);

type OptionsMenuProps = {
  data: {
    title: any;
    action: any;
  }[];
};

export const OptionsMenu = ({data}: OptionsMenuProps) => (
  <View
    style={{
      paddingVertical: 10,
      backgroundColor: Colors.WHITE,
    }}>
    {data.map((item, index) => (
      <View
        key={item.title + Math.random()}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          ...styles.RadioOptionsWrap,
          borderBottomWidth: index === data.length - 1 ? 0 : 1,
        }}>
        <OnlyTouch onPress={item.action} clickOpacity={0.5}>
          <View
            style={{
              display: 'flex',
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: '3%',
            }}>
            <DefaultText style={{width: '100%'}}>{item.title}</DefaultText>
            <TouchableIcon
              style={{position: 'absolute', right: 0}}
              name={'chevron-right'}
              color={Colors.ACCENT_SECONDARY}
              size={14}
            />
          </View>
        </OnlyTouch>
      </View>
    ))}
  </View>
);

export const OrderPlacedProductItem = ({item, index}) => (
  <View style={styles.CartProductsListItemCard} key={index}>
    <View style={styles.CartProductsListItemTopRow}>
      <Image
        source={{
          uri: !item.product_image
            ? DecodeImage(Constants.THUMBNAIL)
            : item.product_image,
        }}
        style={styles.CartProductsListItemImage}
      />
      <View style={styles.ProductsListItemBodyWrap}>
        <DefaultText style={styles.ProductsListItemTitle}>
          {item.product_name}
        </DefaultText>
        <DefaultText style={styles.ProductsListItemPrice}>
          {FormatCurrency(item.price_unit) + ' '}
          {item.discount > 0 && (
            <DefaultText style={styles.ProductsListItemRegularPrice}>
              {FormatCurrency(item.price_unit)}
            </DefaultText>
          )}
        </DefaultText>
      </View>
      <DefaultText style={styles.OrderPlacedProdutListQuantity}>
        {'x ' + item.product_uom_qty}
      </DefaultText>
    </View>
    <View style={styles.CartProductsListItemRow}>
      <DefaultText style={styles.CartProductsListItemRowTitle}>
        {'Total'}
      </DefaultText>
      <DefaultText style={styles.CartProductsListItemRowTitle}>
        {FormatCurrency(item.product_uom_qty * item.price_unit)}
      </DefaultText>
    </View>
  </View>
);

export const OrderPlacedProductList = ({cartRowData}) => (
  <View>
    {cartRowData.map((item, index) =>
      item.is_delivery === false
        ? OrderPlacedProductItem({
            item,
            index,
          })
        : null,
    )}
  </View>
);

export const CommentCard = ({comment}) => (
  <View style={styles.CommentCard}>
    <Image
      source={{
        uri: DecodeImage(Constants.ANONYMOUS),
      }}
      style={styles.CommentAvatar}
    />
    <View>
      <DefaultText style={styles.CommentTitle}>
        {comment.author_id[1]}
      </DefaultText>
      <DefaultText style={styles.CommentTime}>
        {'Published on ' + TimestampToDate(comment.date)}
      </DefaultText>
      <StarRating
        starSize={20}
        disabled={true}
        rating={5 * (comment.rating_value / 10)}
        maxStars={5}
        fullStarColor={Colors.STAR}
        halfStarColor={Colors.STAR}
        emptyStarColor={Colors.ACCENT_SECONDARY}
        containerStyle={styles.RatingBoxStars}
      />
      {comment.body !== '' ? (
        // <HTML
        // html={comment.body}
        // tagsStyles={{
        // p: {fontFamily: Fonts.LIGHT},
        //  li: {fontFamily: Fonts.LIGHT},
        //   }}
        //   />
        //  ) : null}
        <RenderHtml
          source={comment.body}
          tagsStyles={{
            p: {fontFamily: Fonts.LIGHT},
            li: {fontFamily: Fonts.LIGHT},
          }}
        />
      ) : null}
    </View>
  </View>
);

export const ViewAllCommentCard = ({ratingCount, action}) => (
  <OnlyTouch onPress={action}>
    <View style={styles.ViewAllComments}>
      <DefaultText style={styles.ViewAllCommentsText}>
        {'All ' + FormatNumber(ratingCount) + ' Comments'}
      </DefaultText>
      <TouchableIcon name={'chevron-right'} color={Colors.ACCENT} />
    </View>
  </OnlyTouch>
);

const RatingBarsCount = (ratings: []) => {
  let RatingBar = ratings.map((rating, index) => {
    return (
      <View key={index + 1} style={styles.RatingBarWrap}>
        <DefaultText style={styles.RatingBarRate}>
          {ratings.length - index}
        </DefaultText>
        <TouchableIcon name={'star'} color={Colors.ACCENT} size={12} />
        <View style={styles.RatingBarBg}>
          <View
            style={{
              width: 110 * (rating / 100),
              ...styles.RatingBarFg,
            }}
          />
        </View>
        <DefaultText style={styles.ProductRatingCount}>
          {parseFloat(rating).toFixed(2) + ' %'}
        </DefaultText>
      </View>
    );
  });

  return RatingBar;
};

export const RatingBars = ({
  title = null,
  titleAction = null,
  productDetail,
  children,
  style = null,
}) => (
  <View style={style}>
    {title !== null ? (
      <View style={styles.RatingBarsTitleWrap}>
        <DefaultText style={styles.RatingBarsTitle}>{title}</DefaultText>
        {titleAction !== null ? (
          <LinkText onPress={titleAction.action}>{titleAction.title}</LinkText>
        ) : null}
      </View>
    ) : null}
    <View style={styles.ReviewAndRatingWrap}>
      <View style={styles.RatingBoxWrap}>
        <DefaultText style={styles.RatingBoxRate}>
          {(parseFloat(productDetail.avgRating) / 2).toFixed(1)}
        </DefaultText>
        <StarRating
          starSize={20}
          disabled={true}
          rating={parseFloat(
            (parseFloat(productDetail.avgRating) / 2).toFixed(1),
          )}
          maxStars={5}
          fullStarColor={Colors.STAR}
          halfStarColor={Colors.STAR}
          emptyStarColor={Colors.ACCENT_SECONDARY}
          containerStyle={styles.RatingBoxStars}
        />
        {productDetail.messageCount > 0 ? (
          <View>
            <TouchableIcon name={'comments'} color={Colors.OVERLAY} size={14} />
            <DefaultText
              style={{color: Colors.OVERLAY, fontFamily: Fonts.REGULAR}}>
              {' ' + FormatNumber(productDetail.messageCount) + ' comments'}
            </DefaultText>
          </View>
        ) : (
          <DefaultText>{'No reviews yet'}</DefaultText>
        )}
      </View>
      <View style={styles.RatingBarsWrap}>
        {RatingBarsCount(productDetail.ratingCounts)}
      </View>
    </View>
    {children}
  </View>
);

type SpotlightBannerProps = {
  image: string;
  action: any;
  style?: ImageStyle;
  width: number | string;
  height: number | string;
};

export const SpotlightBanner = ({
  image,
  action,
  style,
  width = '100%',
  height = 110,
}: SpotlightBannerProps) => (
  <View style={styles.SpotlightBannerWrap}>
    <OnlyTouch onPress={action}>
      <Image
        source={{uri: image}}
        style={{
          ...styles.SpotlightBanner,
          width: width,
          height: height,
          ...style,
        }}
      />
    </OnlyTouch>
  </View>
);

type FeaturedBannersProps = {
  images: string[];
  action: any;
  caption?: string;
  style?: ImageStyle;
  width: number | string;
  height: number | string;
};

export const FeaturedBanners = ({
  caption,
  images,
  action,
  style,
  width = 205,
  height = 272,
}: FeaturedBannersProps) => (
  <View>
    {caption && (
      <DefaultText style={styles.FetauredBannerCaption}>{caption}</DefaultText>
    )}
    <ScrollView
      horizontal
      contentContainerStyle={styles.FeaturedBanner}
      showsHorizontalScrollIndicator={false}>
      {images.map((image, index) => (
        <View
          key={index}
          style={{...styles.FeaturedBannerWrap, width: width, height: height}}>
          <OnlyTouch onPress={action}>
            <Image
              source={{uri: image}}
              style={{...styles.FeaturedBannerImage, ...style}}
            />
          </OnlyTouch>
        </View>
      ))}
    </ScrollView>
  </View>
);

type FeaturedBannersSliderProps = {
  images: string[];
  caption: string;
  width: number | string;
  height: number | string;
};

export const FeaturedBannersSlider = ({
  images,
  caption,
  width = 294,
  height = 400,
}: FeaturedBannersSliderProps) => (
  <View style={styles.FeaturedBannerSlider}>
    {caption && (
      <DefaultText style={styles.FetauredBannerCaption}>{caption}</DefaultText>
    )}
    <ImageCarousel
      imageAction={(index: any) => {}}
      images={images}
      wrapStyle={styles.FeaturedBannerSliderWrap}
      slideStyle={styles.FeaturedBannerSliderSlide}
      imageStyle={{
        ...styles.FeaturedBannerSliderImage,
        width: width,
        height: height,
      }}
    />
  </View>
);

type FourCardsProps = {
  caption: string;
  data: {
    image: string;
    title: string;
    description: string;
  }[];
  expiry: number;
  action: any;
};

export const FourCards = ({caption, expiry, data, action}: FourCardsProps) => (
  <View style={styles.FourCards}>
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: '5%',
      }}>
      <View>
        {caption && (
          <DefaultText style={styles.FourCardsCaption}>{caption}</DefaultText>
        )}
        {expiry && (
          <View style={styles.FourCardsExpiryWrap}>
            <TouchableIcon name={'clock'} color={Colors.OVERLAY} size={12} />
            <DefaultText style={styles.FourCardsExpiry}>
              {' ' + expiry + ' remaining'}
            </DefaultText>
          </View>
        )}
      </View>
      <LinkText>{'View All'}</LinkText>
    </View>
    <Card style={styles.FourCardsCard}>
      {data.map((item, index) => (
        <OnlyTouch key={index} onPress={action}>
          <View
            style={{
              ...styles.FourCardItem,
              borderTopWidth: index <= 1 ? 0 : 1,
              borderRightWidth: (index + 1) % 2 === 0 ? 0 : 1,
            }}>
            <Image
              source={{uri: item.image}}
              style={styles.FourCardsItemImage}
            />
            <DefaultText style={styles.FourCardsItemTitle}>
              {item.title}
            </DefaultText>
            <DefaultText style={styles.FourCardsItemDescription}>
              {item.description}
            </DefaultText>
          </View>
        </OnlyTouch>
      ))}
    </Card>
  </View>
);

export const OrderTotalCard = ({
  cartDetails,
  deliveryFee = null,
  newDeliveryFee = null,
}) => {
  const {t, i18n} = useTranslation();
  return (
    <View style={styles.OrderTotalCard}>
      <View style={styles.OrderTotalCardHeader}>
        <DefaultText style={styles.OrderTotalCardTitle}>
          {i18n.t('Order Total')}
        </DefaultText>
      </View>
      <View style={styles.OrderTotalCardBody}>
        <View
          style={{
            ...styles.OrderTotalCardTableRow,
            ...styles.OrderTotalCardPaddingBottom10,
          }}>
          <DefaultText>{i18n.t('Subtotal')}</DefaultText>
          <DefaultText>
            {/* {FormatCurrency(
              deliveryFee
                ? cartDetails.amount_untaxed - deliveryFee
                : cartDetails.amount_untaxed,
            )} */}
            {deliveryFee
              ? cartDetails.currency +
                ' ' +
                parseFloat(cartDetails.amount_total).toFixed(2) +
                ' '
              : cartDetails.currency + ' ' + cartDetails.amount_untaxed}
          </DefaultText>
        </View>
        <View
          style={{
            ...styles.OrderTotalCardTableRow,
            ...styles.OrderTotalCardPaddingBottom10,
          }}>
          <DefaultText>{i18n.t('Taxes')}</DefaultText>
          <DefaultText>
            {/* {FormatCurrency(cartDetails.amount_tax)} */}
            {cartDetails.currency +
              ' ' +
              parseFloat(cartDetails.amount_tax).toFixed(2)}
          </DefaultText>
        </View>
        {newDeliveryFee !== null ? (
          <View style={styles.OrderTotalCardTableRow}>
            <DefaultText>{i18n.t('Delivery Fee')}</DefaultText>
            <DefaultText>{FormatCurrency(newDeliveryFee)}</DefaultText>
          </View>
        ) : deliveryFee !== null ? (
          <View style={styles.OrderTotalCardTableRow}>
            <DefaultText>{i18n.t('Delivery Fee')}</DefaultText>
            <DefaultText>{FormatCurrency(deliveryFee)}</DefaultText>
          </View>
        ) : null}
      </View>
      <View style={styles.OrderTotalCardFooter}>
        <View style={styles.OrderTotalCardTableRow}>
          <DefaultText style={styles.OrderTotalCardFooterTitle}>
            {i18n.t('Total')}
          </DefaultText>
          <DefaultText style={styles.OrderTotalCardFooterTitle}>
            {/* {FormatCurrency(
              newDeliveryFee !== null
                ? cartDetails.amount_total + newDeliveryFee
                : cartDetails.amount_total + (deliveryFee ? deliveryFee : 0),
            )} */}
            {newDeliveryFee !== null
              ? cartDetails.currency +
                ' ' +
                parseFloat(cartDetails.amount_total + newDeliveryFee).toFixed(2)
              : cartDetails.currency +
                ' ' +
                parseFloat(
                  cartDetails.amount_total + (deliveryFee ? deliveryFee : 0),
                ).toFixed(2)}
          </DefaultText>
        </View>
      </View>
    </View>
  );
};

export const AddressCardNonEditable = ({title, address, onEdit = false}) => (
  <View style={styles.AddressCard}>
    <View style={styles.AddressCardHeader}>
      <DefaultText style={styles.AddressCardTitle}>{title}</DefaultText>
      {onEdit && (
        <TouchableIcon name={'edit'} color={Colors.ACCENT} onPress={onEdit} />
      )}
    </View>
    <View style={styles.AddressCardBody}>
      {address.street ? (
        <View>
          <DefaultText style={styles.AddressCardBodyRow}>
            {address.street +
              ', ' +
              (address.street2 ? address.street2 + ', ' : '')}
          </DefaultText>
          <DefaultText style={styles.AddressCardBodyRow}>
            {address.city +
              (address.state_id ? ', ' + address.state_id[1] : '') +
              ' - ' +
              address.zip}
          </DefaultText>
          <DefaultText style={styles.AddressCardBodyRow}>
            {address.country_id[1]}
          </DefaultText>
        </View>
      ) : (
        <DefaultText style={styles.AddressCardBodyNoAddress}>
          {'No Address Updated'}
        </DefaultText>
      )}
    </View>
  </View>
);

export const GoToIcon = ({
  props,
  route,
  icon,
  badge = 0,
  color = Colors.WHITE,
  params = {},
  style = {},
}) => (
  <OnlyTouch
    style={styles.GoToIcon}
    onPress={() => props.navigation.navigate(route, {params: params})}>
    <Feather name={icon} size={22} color={color} style={style} />
    {badge > 0 ? (
      <View
        style={{
          ...styles.IconBadgeWrap,
          backgroundColor:
            color !== Colors.WHITE ? Colors.PRIMARY : Colors.WHITE,
        }}>
        <DefaultText
          style={{
            ...styles.IconBadge,
            color: color !== Colors.WHITE ? Colors.WHITE : Colors.PRIMARY,
          }}>
          {badge}
        </DefaultText>
      </View>
    ) : null}
  </OnlyTouch>
);

type ImageGridPros = {
  title: string;
  data: {
    name: string;
    link_model: string;
    category: {
      name: string | boolean;
      id: string | boolean;
    };
    product: {
      name: string | boolean;
      id: string | boolean;
    };
    blog: {
      name: string | boolean;
      id: string | boolean;
    };
    default_categoy_image: string | boolean;
    default_product_image: string | boolean;
    default_blog_image: string | boolean;
    custom_image: string | boolean;
  }[];
  onImagePress: (item: {
    name: string;
    link_model: string;
    category: {
      name: string | boolean;
      id: string | boolean;
    };
    product: {
      name: string | boolean;
      id: string | boolean;
    };
    blog: {
      name: string | boolean;
      id: string | boolean;
    };
    default_categoy_image: string | boolean;
    default_product_image: string | boolean;
    default_blog_image: string | boolean;
    custom_image: string | boolean;
  }) => {};
  style?: ViewStyle;
};

export const ImageGrid = ({
  title,
  data,
  onImagePress,
  style,
}: ImageGridPros) => (
  <Wrap
    style={{
      marginBottom: 15,
      paddingVertical: 15,
      backgroundColor: Colors.WHITE,
      ...style,
    }}>
    {title ? (
      <DefaultText
        style={{
          fontSize: 14,
          fontFamily: Fonts.REGULAR,
          marginBottom: 15,
          textTransform: 'uppercase',
        }}>
        {title}
      </DefaultText>
    ) : null}
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
      }}>
      {data.map((item, index) => (
        <OnlyTouch
          key={(index + 1).toString()}
          style={{
            width: Dimensions.get('window').width * 0.299,
            marginRight: (index + 1) % 3 === 0 ? 0 : '3%',
            marginBottom: 10,
            borderWidth: 1,
            borderColor: Colors.ACCENT_SECONDARY,
            borderStyle: 'solid',
            overflow: 'hidden',
          }}
          onPress={() => onImagePress(item)}>
          <AutoHeightImage
            source={{
              uri: item.custom_image
                ? item.custom_image
                : item['default_' + item.link_model + '_image']
                ? item['default_' + item.link_model + '_image']
                : DecodeImage(false),
            }}
            width={Dimensions.get('window').width * 0.299}
          />
          {item.name ? (
            <DefaultText
              style={{
                fontSize: 15,
                marginTop: 6,
                marginBottom: 3,
                textAlign: 'center',
                textTransform: 'uppercase',
                fontFamily: Fonts.LORA,
                fontWeight: '400',
                color: Colors.ACCENT,
                paddingHorizontal: 3,
              }}>
              {item.name}
            </DefaultText>
          ) : null}
        </OnlyTouch>
      ))}
    </View>
  </Wrap>
);

export const VerticalList = ({block, navigateAction}) => (
  <View
    style={{
      paddingVertical: 20,
      backgroundColor: Colors.WHITE,
    }}>
    <Wrap>
      <DefaultText
        style={{
          fontSize: 14,
          fontFamily: Fonts.REGULAR,
          marginBottom: 10,
          textTransform: 'uppercase',
        }}>
        {'Top Searches'}
      </DefaultText>
    </Wrap>
    {block.vertical_list.map((item, index) => (
      <TouchableOpacity
        key={item.name}
        onPress={navigateAction}
        activeOpacity={Constants.ACTIVE_OPACITY}>
        <Wrap
          style={{
            borderStyle: 'solid',
            borderTopWidth: index === 0 ? 0 : 1,
            borderTopColor: Colors.ACCENT_SECONDARY,
          }}>
          <View
            style={{
              flexDirection: 'row',
              paddingVertical: 10,
            }}>
            <View style={{width: 60, height: 80, marginRight: 20}}>
              <Image
                source={{
                  uri: item.custom_image
                    ? item.custom_image
                    : item['default_' + item.link_model + '_image']
                    ? item['default_' + item.link_model + '_image']
                    : DecodeImage(false),
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  resizeMode: 'cover',
                }}
              />
            </View>
            <View style={{justifyContent: 'center'}}>
              <DefaultText
                style={{
                  fontFamily: Fonts.REGULAR,
                  fontSize: 16,
                }}>
                {item.name}
              </DefaultText>
            </View>
          </View>
        </Wrap>
      </TouchableOpacity>
    ))}
  </View>
);

export const GetLayout = ({
  block,
  index,
  navigateAction,
  navigateAdvertisement,
  slideInterval = 5000,
}) => {
  // console.log('GetLayout', block);
  switch (block.section_type) {
    case 'horizontal_list':
      return (
        <CategoryHorizontalList
          title={block.title ? block.title : null}
          categories={block.horizontal_list}
          onPress={navigateAction}
        />
      );
    case 'image_grid':
      return (
        <ImageGrid
          title={block.title ? block.title : null}
          data={block.image_grid}
          onImagePress={navigateAction}
        />
      );
    case 'slider':
      return (
        <View
          style={{
            marginBottom: 15,
            paddingTop: block.title !== false ? 15 : 20,
            paddingBottom: block.title !== false ? 15 : 10,
            backgroundColor: Colors.WHITE,
            // backgroundColor: '#edf7fc',
          }}>
          <ImageCarousel2
            data={block}
            action={navigateAction}
            slideStyle={styles.ImageCarouselSlide}
            wrapStyle={styles.ImageCarouselWrap}
            imageStyle={styles.ImageCarouselImage}
            // indicatorWrapStyle={{
            //   marginTop: -30,
            // }}
            autoScroll={true}
            slideInterval={slideInterval ? slideInterval : false}
          />
        </View>
      );
    case 'vertical_list':
      return <VerticalList block={block} navigateAction={navigateAction} />;
    case 'advertisement':
      return (
        <OnlyTouch
          // onPress={() =>
          //   block.advertisement_url ? OpenUrl(block.advertisement_url) : null

          // }
          onPress={() => navigateAdvertisement(block)}
          style={{marginBottom: 15}}>
          <AutoHeightImage
            source={{uri: block.advertisement_image}}
            width={Dimensions.get('window').width}
          />
        </OnlyTouch>
      );
  }
};

const renderThumb = <Thumb />;
const renderRail = <Rail />;
const renderRailSelected = <RailSelected />;
const renderLabel = <Labell text={'hello'} />;
const renderNotch = <Notch />;

// export const PriceSlider = ({
//   min,
//   max,
//   minVal,
//   maxVal,
//   onChange,
//   style = {},
// }) => (
//   <View style={style}>
//     <Slider
//       style={{width: '100%', height: 20}}
//       min={min}
//       max={max}
//       selectionColor={Colors.PRIMARY}
//       blankColor={Colors.ACCENT_SECONDARY}
//       onValueChanged={onChange}
//       initialLowValue={minVal}
//       initialHighValue={maxVal}
//       labelStyle={'none'}
//       renderThumb={() => {
//         <Thumb />;
//       }}
//       renderRail={() => {
//         <Rail />;
//       }}
//       renderRailSelected={() => {
//         <RailSelected />;
//       }}
//       renderLabel={() => {
//         <Labell text={'hello'} />;
//       }}
//       renderNotch={() => {
//         <Notch />;
//       }}
//     />
//   </View>
// );

const styles = CommonStyles;
