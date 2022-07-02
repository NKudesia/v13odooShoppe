import Constants, {
  ApiCredentials as Credentials,
  ApiUrls,
  Models,
} from './Constants';

export default class Online {
  email;
  password;
  db;
  loginType;

  constructor(
    email = Credentials.USERNAME,
    password = Credentials.PASSWORD,
    db = Credentials.DB_NAME,
    loginType = global.loginType,
  ) {
    this.email = email;
    this.password = password;
    this.db = db;
    this.loginType = loginType;
  }

  getSession = async () => {
    try {
      if (global.uid && global.loginType === this.loginType) {
        return true;
      } else {
        this.loginType = global.loginType;
        let userDetails = global.userDetails;
        let response = null;

        switch (this.loginType) {
          case Constants.LOGIN_TYPES.FACEBOOK:
            response = await this.facebookLogin(
              userDetails.dataAccessExpirationTime,
              userDetails.expirationTime,
              userDetails.accessToken,
            );
            break;
          case Constants.LOGIN_TYPES.GOOGLE:
            response = await this.googleLogin(userDetails.accessToken);
            break;
          default:
            response = await this.login();
        }

        if (response.result) {
          let user = response.result;

          if (user.user_context.uid) {
            global.lang = user.user_context.lang;
            global.tz = user.user_context.tz;
            global.uid = user.user_context.uid;
            global.loggedInId = user.partner_id;
            return true;
          } else {
            if (Constants.DEBUG) {
              console.log(response);
            }
            return false;
          }
        } else {
          if (Constants.DEBUG) {
            console.log(response, userDetails);
          }
          return false;
        }
      }
    } catch (error) {
      if (Constants.DEBUG) {
        console.log(error.message);
      }
      return false;
    }
  };

  processRequest = async (body, url) => {
    const response = await fetch(ApiUrls.BASE_URL + url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: body,
    });
    const json = await response.json();
    return json;
  };

  login = async (email = null, password = null) => {
    try {
      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          db: this.db,
          login: email ?? this.email,
          password: password ?? this.password,
        },
        id: Credentials.USER_ID,
      });
      // console.log('body', body);
      return await this.processRequest(body, ApiUrls.LOGIN_URL);
    } catch (error) {
      if (Constants.DEBUG) {
        console.log('Connection error - ' + error.message);
      }
      return false;
    }
  };

  logout = async () => {
    try {
      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.LOGOUT_URL);
    } catch (error) {
      if (Constants.DEBUG) {
        console.log('Connection error - ' + error.message);
      }
      return false;
    }
  };

  register = async (email, name, password) => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          login: email,
          name: name,
          password: password,
        },
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.REGISTER_URL);
    } catch (error) {
      if (Constants.DEBUG) {
        console.log('Registration error :', error.message);
      }
      return false;
    }
  };

  create = async (model, args) => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          args: [args],
          model: model,
          method: 'create',
          kwargs: {
            context: {
              lang: global.lang,
              tz: global.tz,
              uid: global.uid,
            },
          },
        },
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.CREATE_URL);
    } catch (error) {
      return error.message;
    }
  };

  search = async (model, fields, domain = [], limit = 80, sort = '') => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model: model,
          domain: domain,
          fields: fields,
          limit: limit,
          sort: sort,
          context: {
            lang: global.lang,
            tz: global.tz,
            uid: global.uid,
          },
        },
        id: Credentials.USER_ID,
      });
      // console.log('body of search', body);
      return await this.processRequest(body, ApiUrls.SEARCH_URL);
    } catch (error) {
      return error;
    }
  };

  read = async (model, args) => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          args: args,
          model: model,
          method: 'read',
          kwargs: {
            context: {
              lang: global.lang,
              tz: global.tz,
              uid: global.uid,
            },
          },
        },
        id: Credentials.USER_ID,
      });

      // console.log(body);

      return await this.processRequest(body, ApiUrls.READ_URL);
    } catch (error) {
      return error;
    }
  };

  write = async (model, args) => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          args: args,
          model: model,
          method: 'write',
          kwargs: {
            context: {
              lang: global.lang,
              tz: global.tz,
              uid: global.uid,
            },
          },
        },
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.READ_URL);
    } catch (error) {
      return error;
    }
  };

  delete = async (model, id) => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          args: [[id]],
          model: model,
          method: 'unlink',
          kwargs: {
            context: {
              lang: global.lang,
              tz: global.tz,
              uid: global.uid,
            },
          },
        },
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.READ_URL);
    } catch (error) {
      return error;
    }
  };

  customCreate = async (model, args) => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          args: args,
          model: model,
          method: 'create',
          kwargs: {
            context: {
              lang: global.lang,
              tz: global.tz,
              uid: global.uid,
            },
          },
        },
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.CUSTOM_CREATE);
    } catch (error) {
      return error;
    }
  };

  customSearch = async (model, fields, domain = [], limit = 80, sort = '') => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model: model,
          domain: domain,
          fields: fields,
          limit: limit,
          sort: sort,
          context: {
            lang: global.lang,
            tz: global.tz,
            uid: global.uid,
          },
        },
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.CUSTOM_SEARCH);
    } catch (error) {
      return error;
    }
  };

  addToCart = async (
    partnerId,
    quotationId,
    productId,
    addQuantity,
    setQuantity,
  ) => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          partner_id: partnerId,
          product_id: productId,
          add_qty: addQuantity,
          set_qty: setQuantity,
          so_id: quotationId,
        },
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.ADD_TO_CART);
    } catch (error) {
      return error;
    }
  };

  viewCart = async cartId => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          so_id: cartId,
        },
        id: Credentials.USER_ID,
      });
      console.log('so_id', body);
      return await this.processRequest(body, ApiUrls.VIEW_CART);
    } catch (error) {
      return error;
    }
  };

  removeFromCart = async (cartId, cartRowId) => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          so_id: cartId,
          order_line_id: cartRowId,
        },
        id: Credentials.USER_ID,
      });
      console.log('remove from cart body', body);
      return await this.processRequest(body, ApiUrls.REMOVE_FROM_CART);
    } catch (error) {
      return error;
    }
  };

  updateCartPartner = async (
    cartId,
    partnerId,
    partner_shipping_id,
    partner_invoice_id,
  ) => {
    // console.log('updateCartPartner', cartId, partnerId);
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          quotation_id: cartId,
          partner_id: partnerId,
          partner_shipping_id: partnerId,
          partner_invoice_id: partnerId,
        },
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.UPDATE_CART_PARTNER);
    } catch (error) {
      return error;
    }
  };

  addShippingInSo = async (careerId, orderId) => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          args: [[careerId]],
          kwargs: {
            context: {
              lang: global.lang,
              tz: global.tz,
              uid: global.uid,
              active_model: Models.ORDER,
              carrier_recompute: true,
              active_id: orderId,
              active_ids: [orderId],
            },
          },
          method: 'button_confirm',
          model: Models.CHOOSE_DELIVERY_METHOD,
        },
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.READ_URL);
    } catch (error) {
      return error;
    }
  };

  getProdTempWithPricelist = async (
    pricelistId,
    productIds = [],
    categoryId = [],
    limit = '',
    pageNo = 0,
  ) => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          product_id: productIds,
          public_categ_ids: categoryId,
          pricelist_id: pricelistId === null ? 1 : pricelistId,
          limit: limit,
          offset: pageNo === 1 ? 0 : pageNo * limit - limit,
        },
        id: Credentials.USER_ID,
      });
      console.log('getProdTempWithPricelist', body);
      return await this.processRequest(
        body,
        ApiUrls.PRICELIST_PRODUCT_TEMPLATE_URL,
      );
    } catch (error) {
      return error;
    }
  };

  getProdWithPricelist = async (
    pricelistId,
    productIds = [],
    categoryId = [],
    limit = '',
  ) => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          product_id: productIds,
          public_categ_ids: categoryId,
          pricelist_id: pricelistId === null ? 1 : pricelistId,
          limit: limit,
        },
        id: Credentials.USER_ID,
      });
      // console.log('getProdWithPricelist', body);
      return await this.processRequest(body, ApiUrls.PRICELIST_PRODUCT_URL);
    } catch (error) {
      return error;
    }
  };

  searchProduct = async (
    search,
    categoryId,
    pricelistId,
    pageNo = 1,
    limit = 50,
    sort = '',
    filters = [],
    minPrice = '',
    maxPrice = '',
  ) => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          pricelist_id: pricelistId === null ? 1 : pricelistId,
          ppg: limit,
          page: pageNo,
          search: search,
          category: categoryId,
          attrib_sort: sort,
          attrib: filters,
          min_value: minPrice,
          max_value: maxPrice,
        },
        id: Credentials.USER_ID,
      });
      console.log('search body', body);
      return await this.processRequest(body, ApiUrls.SEARCH_PRODUCT);
    } catch (error) {
      return error;
    }
  };

  ordersList = async (partnerId, pageNo) => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          page: pageNo,
          partner_id: partnerId,
        },
        id: Credentials.USER_ID,
      });
      // console.log('order list', body);
      return await this.processRequest(body, ApiUrls.ORDERS_LIST);
    } catch (error) {
      return error;
    }
  };

  invoiceUrl = async orderId => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          so_id: orderId,
        },
        id: Credentials.USER_ID,
      });
      // console.log('invoice body', body, orderId);
      return await this.processRequest(body, ApiUrls.INVOICE_URL_API);
    } catch (error) {
      return error;
    }
  };

  createWishlist = async productId => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          product_id: productId,
        },
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.WISHLIST_CREATE);
    } catch (error) {
      return error;
    }
  };

  resetPassword = async email => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          email: email,
        },
        id: Credentials.USER_ID,
      });
      // console.log('resetPass', body);
      return await this.processRequest(body, ApiUrls.RESET_PASSWORD);
    } catch (error) {
      return error;
    }
  };

  addComment = async (productId, rating, message) => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          args: [productId],
          model: Models.PRODUCT_TEMPLATE,
          method: 'message_post',
          kwargs: {
            body: message,
            rating_value: rating,
            context: {
              default_res_id: productId,
              default_model: Models.PRODUCT_TEMPLATE,
              lang: global.lang,
              tz: global.tz,
              uid: global.uid,
            },
            message_type: 'comment',
            subtype: 'mail.mt_comment',
          },
        },
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.ADD_COMMENT);
    } catch (error) {
      return error;
    }
  };

  viewComment = async (productId, domain = [], limit = 0, pageNo = 0) => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          res_model: Models.PRODUCT_TEMPLATE,
          res_id: productId,
          limit: limit,
          offset: pageNo === 1 ? 0 : pageNo * limit - limit,
          allow_composer: 1,
          domain: domain,
        },
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.COMMENT);
    } catch (error) {
      return error;
    }
  };

  getComments = async (productId, limit = 0, pageNo = 0) => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          res_model: Models.PRODUCT_TEMPLATE,
          res_id: productId,
          limit: limit,
          offset: pageNo === 1 ? 0 : pageNo * limit - limit,
          allow_composer: 1,
          domain: [],
          rating_include: true,
        },
        id: Credentials.USER_ID,
      });

      // console.log('here getComments', body);

      return await this.processRequest(body, ApiUrls.VIEW_PRODUCT_COMMENTS);
    } catch (error) {
      return error;
    }
  };

  getRatingStatus = async () => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {},
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.RATING_STATUS);
    } catch (error) {
      return error;
    }
  };

  getCountStats = async (partner_id = null, quotation_id = null) => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          partner_id: partner_id,
          quotation_id: quotation_id,
        },
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.COUNT_STATS);
    } catch (error) {
      return error;
    }
  };

  viewPartnerDetails = async partnerId => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          partner_id: partnerId,
        },
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.VIEW_PARTNER);
    } catch (error) {
      return error;
    }
  };

  updatePartnerDetails = async (partnerId, name, email) => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          partner_id: partnerId,
          name: name,
          email: email,
        },
        id: Credentials.USER_ID,
      });
      // console.log('userinfo updatePartnerDetails', body);
      return await this.processRequest(body, ApiUrls.UPDATE_PARTNER);
    } catch (error) {
      return error;
    }
  };

  updatePartnerAddress = async (
    address_name,
    partnerId,
    addressId = '',
    addressType,
    street,
    street2 = '',
    city,
    stateId,
    countryId,
    zip,
  ) => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          address_name: address_name,
          partner_id: partnerId,
          address_id: addressId,
          address_type: addressType,
          street: street,
          street2: street2,
          city: city,
          state_id: stateId,
          country_id: countryId,
          zip: zip,
        },
        id: Credentials.USER_ID,
      });

      // console.log('updatePartnerAddress', body);

      return await this.processRequest(body, ApiUrls.UPDATE_PARTNER_ADDRESS);
    } catch (error) {
      return error;
    }
  };

  viewProfilePic = async partnerId => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          partner_id: partnerId,
        },
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.VIEW_PROFILE_PIC);
    } catch (error) {
      return error;
    }
  };

  updateProfilePic = async (partnerId, base64_image) => {
    // console.log('base64_image', base64_image, partnerId);

    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          partner_id: partnerId,
          partner_image: base64_image,
        },
        id: Credentials.USER_ID,
      });
      // console.log('from updateProfile', body);
      return await this.processRequest(body, ApiUrls.UPDATE_PROFILE_PIC);
    } catch (error) {
      return error;
    }
  };

  removeProfilePic = async partnerId => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          partner_id: partnerId,
        },
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.DELETE_PROFILE_PIC);
    } catch (error) {
      return error;
    }
  };

  readHomeBlocks = async () => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {},
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.READ_HOME_BLOCKS);
    } catch (error) {
      return error;
    }
  };

  readSearchBlocks = async () => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {},
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.READ_SEARCH_BLOCKS);
    } catch (error) {
      return error;
    }
  };

  getCategoryFilters = async categoryId => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          category_id: categoryId,
        },
        id: Credentials.USER_ID,
      });
      console.log('get all category body', body);
      return await this.processRequest(body, ApiUrls.GET_FILTERS);
    } catch (error) {
      return error;
    }
  };

  getInitialValues = async (partnerId = '', quotationId = '') => {
    try {
      await this.getSession();

      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          partner_id: partnerId,
          quotation_id: quotationId,
        },
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.GET_INITIAL_VALUES);
    } catch (error) {
      return error;
    }
  };

  facebookSignup = async (name, email, authUserId, accessToken) => {
    try {
      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          provider: 2,
          name: name,
          login: email,
          oauth_uid: authUserId,
          oauth_access_token: accessToken,
          profile_picture: `http://graph.facebook.com/${authUserId}/picture?width=200&height=200`,
        },
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.SOCIAL_SIGNUP);
    } catch (error) {
      return error;
    }
  };

  viewShippingMethods = async () => {
    try {
      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.VIEW_SHIPPING_METHODS);
    } catch (error) {
      return error;
    }
  };

  facebookLogin = async (
    dataExpirationTime,
    tokenExpirationTime,
    accessToken,
  ) => {
    try {
      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          provider: 2,
          // data_access_expiration_time: dataExpirationTime,
          // expires_in: tokenExpirationTime,
          access_token: accessToken,
        },
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.SOCIAL_LOGIN);
    } catch (error) {
      return error;
    }
  };

  googleSignup = async (
    name,
    email,
    authUserId,
    accessToken,
    profilePicture = '',
  ) => {
    try {
      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          provider: 3,
          name: name,
          login: email,
          oauth_uid: authUserId,
          oauth_access_token: accessToken,
          profile_picture: profilePicture,
        },
        id: Credentials.USER_ID,
      });

      return await this.processRequest(body, ApiUrls.SOCIAL_SIGNUP);
    } catch (error) {
      return error;
    }
  };

  googleLogin = async accessToken => {
    try {
      var body = JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          provider: 3,
          access_token: accessToken,
        },
        id: Credentials.USER_ID,
      });
      console.log('sending body data googleLogin', body);
      return await this.processRequest(body, ApiUrls.SOCIAL_LOGIN);
    } catch (error) {
      console.log('error', error);
      return error;
    }
  };
}
