import {Preloader} from '../assets/Preloader';
import {Anonymous} from '../assets/Anonymous';
import {Thumbnail} from '../assets/Thumbnail';
import {Platform} from 'react-native';

export default {
  DEBUG: true,
  ACTIVE_OPACITY: 0.5,
  DEFAULT_PARTNER_ID: 4,
  DEFAULT_CURRENCY: 'INR',
  DEFAULT_LANG: 'en-IN',
  LOCAL_DATA_KEY_PREFIX: 'OdooShoppe_',
  HEADER_HEIGHT: 170,
  SCREEN_HEADER_HEIGHT: Platform.OS === 'ios' ? 95 : 90,
  IMAGE_PREFIX: 'data:image;base64,',
  LOADER: Preloader,
  ANONYMOUS: Anonymous,
  THUMBNAIL: Thumbnail,
  DEFAULT_CATEGORY_ICON: 'cube',
  // GOOGLE_IOS_CLIENT_ID:
  //   '952087924905-tk0hjm4d5upihhmurhvac90es0egsjh0.apps.googleusercontent.com',
    GOOGLE_IOS_CLIENT_ID:
    '1008987592271-nvris1603goctglgkujejfoknbs7dkl7.apps.googleusercontent.com',
  // GOOGLE_ANDROID_CLIENT_ID:
  //   '952087924905-k8cf6gg5qi7ll2a6q4edq23mpm4ouktr.apps.googleusercontent.com',
  GOOGLE_ANDROID_CLIENT_ID:
    '1008987592271-o84qg5vdjtp1tklp024m7ulii14untpc.apps.googleusercontent.com',

  LOGIN_TYPES: {
    FACEBOOK: 'facebook',
    GOOGLE: 'google',
    EMAIL: 'email',
  },
};

export const LocalKeys = {
  USER_DETAILS: 'userDetails',
  CART_DETAILS: 'cartDetails',
};

export const ApiUrls = {
  BASE_URL: 'https://v13.kanakinfosystems.com',
  LOGIN_URL: '/web/session/authenticate',
  LOGOUT_URL: '/api/web/session/logout',
  REGISTER_URL: '/api/signup',
  CREATE_URL: '/web/dataset/call_kw',
  SEARCH_URL: '/web/dataset/search_read',
  READ_URL: '/web/dataset/call_kw',
  WRITE_URL: '/web/dataset/call_kw',
  MAIL_URL: '/web/dataset/call_button',
  CUSTOM_CREATE: '/api/web/dataset/call_kw',
  CUSTOM_SEARCH: '/api/web/dataset/search_read',
  ADD_TO_CART: '/api/shop/cart/update',
  VIEW_CART: '/api/shop/cart/read',
  REMOVE_FROM_CART: '/api/shop/cart/remove',
  UPDATE_CART_PARTNER: '/sale/partner/quick/update',
  PAYMENT_URL: '/shop/app/payment',
  PRICELIST_PRODUCT_TEMPLATE_URL: '/api/get/pricelist/product/template',
  PRICELIST_PRODUCT_URL: '/api/get/pricelist/product',
  SEARCH_PRODUCT: '/api/shop/app',
  ORDERS_LIST: '/api/my/orders',
  INVOICE_URL_API: '/api/download/invoice',
  WISHLIST_CREATE: '/api/shop/wishlist/add',
  WISHLIST_UPDATE: '/api/shop/wishlist/update',
  RESET_PASSWORD: '/api/reset/password',
  ADD_COMMENT: '/web/dataset/call_kw/product.template/message_post',
  VIEW_PRODUCT_COMMENTS: '/mail/chatter_init',
  RATING_STATUS: '/api/check/comment/status',
  COUNT_STATS: '/search/count/quotation/wishlist',
  VIEW_PARTNER: '/get/partner/details',
  VIEW_PROFILE_PIC: '/api/profile/picture/view',
  UPDATE_PARTNER: '/update/partner/name/email',
  UPDATE_PARTNER_ADDRESS: '/create/update/partner/details',
  UPDATE_PROFILE_PIC: '/api/profile/picture/update',
  DELETE_PROFILE_PIC: '/api/profile/picture/remove',
  READ_HOME_BLOCKS: '/get/home/page/data',
  READ_SEARCH_BLOCKS: '/get/search/page/layout/data',
  GET_FILTERS: '/api/get/product/variants',
  GET_INITIAL_VALUES: '/get/all/data',
  SOCIAL_SIGNUP: '/api/auth/social-signup',
  SOCIAL_LOGIN: '/api/auth/social-login',
  VIEW_SHIPPING_METHODS: '/get/delivery/method',
};

export const Models = {
  PRODUCT_TEMPLATE: 'product.template',
  PRODUCT: 'product.product',
  CATEGORY: 'product.public.category',
  ATTRIBUTE: 'product.template.attribute.line',
  ATTRIBUTE_VALUES: 'product.attribute.value',
  RATING: 'rating.rating',
  CART: 'sale.order',
  CART_PRODUCTS: 'sale.order.line',
  USERS: 'res.users',
  PARTNER: 'res.partner',
  COUNTRY: 'res.country',
  STATE: 'res.country.state',
  PAYMENT_METHOD: 'payment.acquirer',
  DELIVERY_METHOD: 'delivery.carrier',
  DELIVERY_METHOD_RULE: 'delivery.price.rule',
  CHOOSE_DELIVERY_METHOD: 'choose.delivery.carrier',
  ORDER: 'sale.order',
  PRICELIST: 'product.pricelist',
  WISHLIST: 'product.wishlist',
  MOBILE_SLIDER: 'mobile.app.slider',
};

export const ApiCredentials = {
  USER_ID: 505136376,
  DB_NAME: 'odoo_shoppe',
  USERNAME: 'admin',
  PASSWORD: 'os@kanak',
  // USERNAME: 'demo',
  // PASSWORD: 'demo',
};

export const Colors = {
  PRIMARY: '#43C0F6',
  SECONDARY: '#f5f5f6',
  ACCENT: '#333333',
  ACCENT_SECONDARY: '#d8d8d8',
  WHITE: '#FFFFFF',
  OVERLAY: 'rgba(0,0,0,0.5)',
  LIGHT_GREY: '#efefef',
  SUCCESS: '#39DD00',
  LINK: '#0f53ff',
  STAR: '#f4d248',
  TRANSPARENT: 'transparent',
  RED: 'red',
};

export const Fonts = {
  LIGHT: 'Lato-Light',
  REGULAR: 'Lato-Regular',
  BOLD: 'Lato-Bold',
  LORA: 'Lora-Regular',
  BETTER: 'BetterGrade',
};

export const Message = {
  INVALID_LOGIN: 'You are not registered, Please sign up',
  ERROR_TRY_AGAIN: 'Error occured, Try again later',
  PRESS_BACK_EXIT: 'Press Back Again To Exit',
  PLEASE_WAIT: 'Please Wait...',
};
