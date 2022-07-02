import {Translation, useTranslation, withTranslation} from 'react-i18next';
import {i18n} from 'i18next';

// const {t} = useTranslation();

export const ShopByBrandData = [
  {
    category: 'International & ',
    category2: 'Premium',
    categoryBrand: [
      {
        brand: 'POLO',
        image: require('./assets/images/polo.png'),
      },
      {
        brand: 'BOSS',
        image: require('./assets/images/U-S-Polo.png'),
      },
      {
        brand: 'DEISEL',
        image: require('./assets/images/Bata.png'),
      },
      {
        brand: 'SCOTCH & SODA',
        image: require('./assets/images/Clarks.png'),
      },
      {
        brand: 'CK',
        image: require('./assets/images/Levis.png'),
      },
      {
        brand: 'MICHEL KORG',
        image: require('./assets/images/Roadster.png'),
      },
      {
        brand: 'LASCOTE',
        image: require('./assets/images/HRX.png'),
      },
      {
        brand: 'GAS',
        image: require('./assets/images/Roadster.png'),
      },
    ],
  },
  {
    category: 'SPORTS',
    category2: ' - Premium',
    categoryBrand: [
      {
        brand: 'NIKE',
        image: require('./assets/images/Nike.png'),
      },
      {
        brand: 'PUMA',
        image: require('./assets/images/Puma.png'),
      },
      {
        brand: 'ADDIDAS',
        image: require('./assets/images/Adidas.png'),
      },
      {
        brand: 'FILA',
        image: require('./assets/images/Fila.png'),
      },
      {
        brand: 'REEBOK',
        image: require('./assets/images/Reebok.png'),
      },
      {
        brand: 'HRX',
        image: require('./assets/images/HRX.png'),
      },
      {
        brand: 'CONVERSE',
        image: require('./assets/images/Reebok.png'),
      },
      {
        brand: 'SUPRA',
        image: require('./assets/images/polo.png'),
      },
    ],
  },
  {
    category: 'CASUAL',
    categoryBrand: [
      {
        brand: 'SUPRA',
        image: require('./assets/images/polo.png'),
      },
      {
        brand: 'UNITTED COLORS',
        image: require('./assets/images/United.png'),
      },
      {
        brand: 'ROADSTAR',
        image: require('./assets/images/Roadster.png'),
      },
      {
        brand: 'JHONE PLAYERS',
        image: require('./assets/images/polo.png'),
      },
      {
        brand: 'LEVIS',
        image: require('./assets/images/polo.png'),
      },
      {
        brand: 'US-POLO',
        image: require('./assets/images/polo.png'),
      },
      {
        brand: 'TOMMY',
        image: require('./assets/images/polo.png'),
      },
      {
        brand: 'H & M',
        image: require('./assets/images/polo.png'),
      },
      {
        brand: 'TFRENCH CORRECTION',
        image: require('./assets/images/polo.png'),
      },
      {
        brand: 'SUPRA',
        image: require('./assets/images/polo.png'),
      },
    ],
  },
  {
    category: 'FORMAL & SMART CASUAL',
    // category2: 'SMART CASUAL',
    categoryBrand: [
      {
        brand: 'INVICTUS',
        image: require('./assets/images/polo.png'),
      },
      {
        brand: 'BLACKBERRY',
        image: require('./assets/images/polo.png'),
      },
      {
        brand: 'LOUIS PHILLPE',
        image: require('./assets/images/polo.png'),
      },
      {
        brand: 'ALLEN SOLLY',
        image: require('./assets/images/John-Players.png'),
      },
      {
        brand: 'VANHEUSAN',
        image: require('./assets/images/Woodland.png'),
      },
      {
        brand: 'ARROW',
        image: require('./assets/images/polo.png'),
      },
    ],
  },
];

export const CategoriesData = [
  {
    bg: '#E21717',
    color: 'black',
    categories: 'Health & Care',
    image: require('./assets/images/1-SpringSummer.png'),
    subCategories: [
      // 'Skin',
      // 'Personal Care',
      // 'Eye Care',
      {
        id: 'Skin',
        subSubCategory: ['lotion', 'bodyWash'],
      },
      {
        id: 'Personal Care',
        subSubCategory: ['Trimmer', 'Razor', 'bodyWash'],
      },
      {
        id: 'Eye Care',
        subSubCategory: ['SunGlasses', 'Lense'],
      },
    ],
  },
  {
    bg: '#F4BE2C',
    color: 'black',
    categories: 'Food & Drink',
    image: require('./assets/images/2-Women.png'),

    subCategories: [
      // 'Fruits',
      // 'Bakery',
      // 'Cold Drink',
      // 'Personal Care',
      // 'Eye Care',
      // subSubCategory = 'Fruits',
      {
        id: 'Fruits',
        subSubCategory: ['banana', 'mango'],
      },
      {
        id: 'Bakery',
        subSubCategory: ['Patty', 'Pastry', 'Cake', 'Cookies'],
      },
      {
        id: 'Cold Drink',
        subSubCategory: ['Coke', 'ThumsUp', 'Pepsi', 'Fanta'],
      },
      {
        id: 'Personal Care',
        subSubCategory: ['FaceWash', 'Deodrants', 'Perfume', 'Bodywash'],
      },
      {
        id: 'Eye Care',
        subSubCategory: ['SunGlasses', 'Lense'],
      },
    ],
  },
  {
    bg: '#E07C24',
    color: 'black',
    categories: 'Men',
    image: require('./assets/images/3-Men.png'),

    subCategories: [
      // 'Fruits',
      // 'Bakery',
      // 'Cold Drink',
      // 'Personal Care',
      // 'Eye Care',
      {
        id: 'Fruits',
        subSubCategory: ['banana', 'mango'],
      },
      {
        id: 'Bakery',
        subSubCategory: ['Patty', 'Pastry', 'Cake', 'Cookies'],
      },
      {
        id: 'Cold Drink',
        subSubCategory: ['Coke', 'ThumsUp', 'Pepsi', 'Fanta'],
      },
      {
        id: 'Personal Care',
        subSubCategory: ['FaceWash', 'Deodrants', 'Perfume', 'Bodywash'],
      },
      {
        id: 'Eye Care',
        subSubCategory: ['SunGlasses', 'Lense'],
      },
    ],
  },
  {
    bg: '#FF6666',
    color: 'black',
    categories: 'kids',
    image: require('./assets/images/4-kids.png'),

    subCategories: [
      // 'Boy',
      // 'Girl',
      // 'Kids Spring Store',
      // 'Festive Store',
      // 'Eye Care',
      {
        id: 'Boy',
        subSubCategory: ['banana', 'mango'],
      },
      {
        id: 'Girl',
        subSubCategory: ['Patty', 'Pastry', 'Cake', 'Cookies'],
      },
      {
        id: 'Kids Spring Store',
        subSubCategory: ['Coke', 'ThumsUp', 'Pepsi', 'Fanta'],
      },
      {
        id: 'Festive Store',
        subSubCategory: ['FaceWash', 'Deodrants', 'Perfume', 'Bodywash'],
      },
      {
        id: 'Eye Care',
        subSubCategory: ['SunGlasses', 'Lense'],
      },
    ],
  },
  {
    bg: '#03C6C7',
    color: 'black',
    categories: 'Women',
    image: require('./assets/images/5-Beauty.png'),

    subCategories: [
      // 'WesternWear',
      // 'Ethenic',
      // 'Footwear',
      // 'Bags',
      // 'Wallert',
      // 'sleepwear',
      // 'sports',
      {
        id: 'WesternWear',
        subSubCategory: ['banana', 'mango'],
      },
      {
        id: 'Ethenic',
        subSubCategory: ['Patty', 'Pastry', 'Cake', 'Cookies'],
      },
      {
        id: 'Footwear',
        subSubCategory: ['Coke', 'ThumsUp', 'Pepsi', 'Fanta'],
      },
      {
        id: 'Bags',
        subSubCategory: ['FaceWash', 'Deodrants', 'Perfume', 'Bodywash'],
      },
      {
        id: 'Wallert',
        subSubCategory: ['SunGlasses', 'Lense'],
      },
      {
        id: 'sleepwear',
        subSubCategory: ['SunGlasses', 'Lense'],
      },
      {
        id: 'sports',
        subSubCategory: ['SunGlasses', 'Lense'],
      },
    ],
  },
  {
    bg: '#6A1B4D',
    color: 'black',
    categories: 'Women',
    image: require('./assets/images/6-Home-and-Living.png'),

    subCategories: [
      // 'WesternWear',
      // 'Ethenic',
      // 'Footwear',
      // 'Bags',
      // 'Wallert',
      // 'sleepwear',
      // 'sports',
      {
        id: 'WesternWear',
        subSubCategory: ['banana', 'mango'],
      },
      {
        id: 'Ethenic',
        subSubCategory: ['Patty', 'Pastry', 'Cake', 'Cookies'],
      },
      {
        id: 'Footwear',
        subSubCategory: ['Coke', 'ThumsUp', 'Pepsi', 'Fanta'],
      },
      {
        id: 'Bags',
        subSubCategory: ['FaceWash', 'Deodrants', 'Perfume', 'Bodywash'],
      },
      {
        id: 'Wallert',
        subSubCategory: ['SunGlasses', 'Lense'],
      },
      {
        id: 'sleepwear',
        subSubCategory: ['SunGlasses', 'Lense'],
      },
      {
        id: 'sports',
        subSubCategory: ['SunGlasses', 'Lense'],
      },
    ],
  },
];
export const SortOptions = [
  {
    type: 'name asc',
    title: 'Name : A to Z',
  },
  {
    type: 'name desc',
    title: 'Name : Z to A',
  },
  {
    type: 'list_price desc',
    title: 'Price : High to Low',
  },
  {
    type: 'list_price asc',
    title: 'Price : Low to High',
  },
];

export const OtherMenu = [
  // {
  //   title: 'Refer & Earn',
  //   icon: 'share-alt',
  //   screen: 'ReferEarn',
  // },
  {
    title: 'Wishlist',
    icon: 'heart',
    screen: 'Wishlist',
  },
  {
    title: 'My Orders',
    icon: 'cubes',
    screen: 'OrderHistory',
  },
  {
    title: 'My Account',
    icon: 'user',
    screen: 'MyAccount',
  },
  {
    title: 'ContactUs',
    icon: 'envelope',
    screen: 'ContactUs',
  },
  {
    title: 'Setting',
    icon: 'cog',
    screen: 'Setting',
  },
];

export const OffersOfTheDay = [
  'https://soniakaphotography.files.wordpress.com/2016/05/16ss_sp_prime_blaze_womens.jpg?w=1140&h=737',
  'https://soniakaphotography.files.wordpress.com/2016/05/16ss_sp_prime_classics_2736.jpg?w=1140&h=760',
  'https://soniakaphotography.files.wordpress.com/2016/05/puma-web-banner.jpg?w=1140&h=633',
];

export const TopCategories = [
  {
    title: 'Men T-shirt',
    image:
      'https://rukminim1.flixcart.com/image/332/398/jw6pifk0/t-shirt/e/v/z/m-61ywn-lewel-original-imafgxd7dfg7uub2.jpeg?q=50',
    type: 'category',
    actionId: 1,
  },
  {
    title: 'Women Tops',
    image:
      'https://rukminim1.flixcart.com/image/332/398/jwi518w0/t-shirt/t/g/b/l-2086-the-dry-state-original-imafbzgzhjvb926m.jpeg?q=50',
    type: 'category',
    actionId: 2,
  },
  {
    title: 'Men Jeans',
    image:
      'https://img5.cfcdn.club/36/82/363a212687d4fdad10e86ba0a05bb882_350x350.jpg',
    type: 'category',
    actionId: 3,
  },
  {
    title: 'Women Jeans',
    image:
      'https://www.harcour.com/Files/115891/Img/11/woman-breeches-SANGRIA-navy-studio1-big.jpg',
    type: 'category',
    actionId: 4,
  },
  {
    title: 'Men Suits',
    image:
      'https://www.drykorn.com/media/catalog/product/cache/common/image/800x/adf26966646dda10c25aeaa351e0de1e/1/0/10_41_113864_41302398_PIRVING_6-01_1555593422.jpg',
    type: 'category',
    actionId: 5,
  },
  {
    title: 'Women Suits',
    image:
      'https://www.drykorn.com/media/catalog/product/cache/common/image/800x/adf26966646dda10c25aeaa351e0de1e/1/0/10_80_113000_80533_emom_1000-01.jpg',
    type: 'category',
    actionId: 6,
  },
];

export const TopBrands = [
  {
    title: 'Phillips',
    image:
      'https://www.harrys.com/harrys-cdnx-prod/assets/images/gallery_images/attachments/775aae5fa2fb7c9d58583e1b974f0e9813adfe63.jpg',
    type: 'category',
    actionId: 1,
  },
  {
    title: 'Mark Spencer',
    image:
      'https://www.hellomagazine.com/imagenes/fashion/news/2019021569819/marks-and-spencer-jeans-best-fit-ever/0-341-631/marks-and-spencer-sienna-jeans-z.jpg',
    type: 'category',
    actionId: 2,
  },
  {
    title: 'HRX',
    image:
      'https://5.imimg.com/data5/MN/WE/MY-8996647/hrx-casual-shoes-500x500.jpg',
    type: 'category',
    actionId: 3,
  },
  {
    title: 'Nike',
    image:
      'https://cms.qz.com/wp-content/uploads/2018/01/nike_rn_react_product_blu_detail1_original-e1516971762656.jpg?quality=75&strip=all&w=1200&h=900&crop=1',
    type: 'category',
    actionId: 1,
  },
  {
    title: 'DressBerry',
    image:
      'https://assets.myntassets.com/dpr_1.5,q_60,w_400,c_limit,fl_progressive/assets/images/2211587/2018/5/28/7d6edb63-8219-4d33-b02a-7d860a4d11711527489620300-DressBerry-Women-Brown-Analogue-Watch-8741527489620072-1.jpg',
    type: 'category',
    actionId: 1,
  },
  {
    title: 'Levis',
    image:
      'https://1099554485.rsc.cdn77.org/upload/products/levis_casual_solid_black_512_taper_sim_jeans_1582202906as1911224_1_512_slim_taper.jpg',
    type: 'category',
    actionId: 1,
  },
];
