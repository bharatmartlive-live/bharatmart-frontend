import { getProductType } from '../lib/productTypes';

const reviewerPool = [
  ['Neha S.', 'Pune'],
  ['Aman K.', 'Delhi'],
  ['Priya M.', 'Mumbai'],
  ['Rahul T.', 'Jaipur'],
  ['Sneha R.', 'Assam'],
  ['Kunal V.', 'Noida'],
  ['Ritika P.', 'Bhopal'],
  ['Dev A.', 'Lucknow'],
  ['Megha J.', 'Bengaluru'],
  ['Suresh V.', 'Ranchi'],
  ['Rohit M.', 'Indore'],
  ['Pooja T.', 'Nagpur'],
  ['Vikas P.', 'Patna'],
  ['Anjali K.', 'Gurugram'],
  ['Mohit R.', 'Varanasi'],
  ['Simran D.', 'Chandigarh'],
  ['Deepak N.', 'Surat'],
  ['Komal A.', 'Ahmedabad'],
  ['Nitin J.', 'Kanpur'],
  ['Aarti V.', 'Hyderabad']
];

const ratingsPool = [5, 5, 4, 5, 4, 5, 5, 4, 5, 4, 5, 4, 5, 5, 4, 5, 4, 5, 4, 5];
const datesPool = [
  '2 days ago',
  '4 days ago',
  '6 days ago',
  '1 week ago',
  '8 days ago',
  '10 days ago',
  '12 days ago',
  '2 weeks ago',
  '14 days ago',
  '15 days ago',
  '16 days ago',
  '18 days ago',
  '20 days ago',
  '3 weeks ago',
  '23 days ago',
  '25 days ago',
  '26 days ago',
  '4 weeks ago',
  'Within the last month',
  'Recently verified'
];

const faqByType = {
  'Physical Product': [
    ['How long does delivery usually take?', 'Most physical products arrive within 3 to 7 days. The exact timeline depends on your location and courier route.'],
    ['Is Cash on Delivery available?', 'Yes, Cash on Delivery is available for eligible pin codes and is clearly shown on the product page and at checkout.'],
    ['What happens if the item goes out of stock?', 'If a popular item sells out, restocking is usually expected in around 14 days.'],
    ['Can I request a return or replacement?', 'Yes, eligible items can be reviewed for return or replacement when they are unused and kept in the original packaging.'],
    ['Where will I see tracking updates?', 'After the order is placed, your dashboard will show packed, shipped, and delivered updates step by step.']
  ],
  'Plant Based': [
    ['How fresh are the microgreens?', 'Plant-based items are handled carefully and shown in a separate section so freshness expectations stay clear from the start.'],
    ['How should I store the product after delivery?', 'For the best experience, follow refrigeration guidance or the storage instructions mentioned on the pack.'],
    ['Is COD available for microgreens too?', 'Yes, it may be available in serviceable areas. Because these items are perishable, availability can vary by pin code.'],
    ['What if the pack arrives damaged?', 'Contact support immediately with your order number and a photo, and the team will review the issue and help you quickly.'],
    ['Why is this shown in a separate category?', 'Microgreens are shown separately from gadgets or digital items so the product type is instantly clear to the buyer.']
  ],
  'Digital Product': [
    ['How do I access a digital product?', 'Digital products are organized separately from physical inventory so buyers can immediately understand that the purchase is non-physical.'],
    ['Will this be delivered by courier?', 'No, digital products are non-physical and are generally meant for download or online access.'],
    ['Can I apply a coupon here too?', 'Yes, active coupons can also be applied to eligible digital products during checkout.'],
    ['How does COD work for digital products?', 'Store-wide COD visibility may still appear, but digital fulfillment rules can be customized further depending on your future workflow.'],
    ['Will I get a purchase record later?', 'Yes, your dashboard and order history will remain useful for future reference and support.']
  ]
};

function makeSeed(product) {
  return String(product?.slug || product?.title || product?.id || 'bharatmart')
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function isCoolerProduct(product) {
  const text = `${product?.title || ''} ${product?.description || ''}`.toLowerCase();
  return text.includes('cooler') || text.includes('fan') || text.includes('cooling');
}

function getReviewTemplates(product) {
  const type = getProductType(product).label;

  if (type === 'Plant Based') {
    return [
      `${product.title} fresh aaya, packaging bhi clean thi. Healthy option laga and taste bhi expected jaisa tha.`,
      `Maine first time online plant-based item order kiya and honestly kaafi accha experience raha.`,
      `Quality genuine lagi, bilkul random marketplace jaisa nahi. Freshness maintained thi.`,
      `Diet plan ke liye liya tha, kaam aa raha hai. Product page pe jo likha tha woh mostly same mila.`,
      `Packing achhi thi aur item fresh feel hua. Family ko bhi pasand aaya.`,
      `Plant based section alag dikhana smart hai, buyer ko clear rehta hai kya order kar rahe hain.`,
      `Value for money laga. Support aur delivery dono smooth the.`,
      `Fresh product, decent pricing, aur trust feel aaya website se.`,
      `Quality expected se better thi. Next time bhi yahi section se try karunga.`,
      `Healthy choice ke liye accha option hai, especially jab clear description mil jaye.`,
      `Delivery on time thi aur product dekhkar confidence aaya ki listing genuine hai.`,
      `Mujhe freshness aur clean packing dono pasand aaye.`
    ];
  }

  if (type === 'Digital Product') {
    return [
      `${product.title} ka page clear tha, samajh aa gaya ye digital item hai. Confusion nahi hua.`,
      `Presentation premium lagi. Product details short but useful thi.`,
      `Digital section alag hai, isse shopping easy ho jati hai.`,
      `Checkout simple laga and product ka value proposition clear tha.`,
      `Mujhe ye isliye pasand aaya kyunki page overpromise nahi kar raha tha.`,
      `Clean layout, easy understanding, aur genuine feel aayi.`,
      `Product description readable thi aur purchase decision jaldi ho gaya.`,
      `Digital item ke liye trust important hota hai, yahan woh feel aaya.`,
      `Store ka design accha hai aur digital listing random nahi lagti.`,
      `Kaafi organized experience tha, especially compared to basic template stores.`
    ];
  }

  return [
    `${product.title} sach me useful nikla. Price ke hisaab se kaafi accha product hai.`,
    `Build quality expected se better lagi. Delivery bhi fast thi aur COD easy tha.`,
    `Maine offer dekh ke order kiya tha, but product genuinely accha nikla.`,
    `Cooling aur daily use dono ke liye kaafi practical hai. Paisa vasool laga.`,
    `Jo description me dikhaya tha woh same mila. Fake ya low quality feel nahi aayi.`,
    `Packaging theek thi aur product start se hi kaam kar raha hai, no issue till now.`,
    `Is range me ye best laga. Website pe urgency aur details dono useful the.`,
    `Mummy ke liye liya tha aur unko bhi pasand aaya. Simple use and helpful product.`,
    `Product lightweight hai but cheap feel nahi hota. Worth buying if you need it.`,
    `Expected se accha nikla, especially discount price pe.`,
    `Summer use ke liye mast hai. Cooling decent hai aur overall quality bhi sahi lagi.`,
    `Office desk use ke liye liya tha, kaafi kaam ka nikla.`,
    `Fan/cooler category me ye better option laga compared to random sellers.`,
    `Stock aur reviews dekh ke liya tha, decision sahi nikla.`,
    `Color, finish aur performance teenon achhe lage. Return karne ki zarurat nahi padi.`,
    `Website genuine lagi and product bhi waise hi nikla. Recommend karunga.`,
    `Kaafi logon ne liya hai, reason samajh aa gaya after using it.`,
    `Size compact hai but kaam bada karta hai. Daily use me accha chal raha hai.`
  ];
}

export function getProductReviews(product) {
  const seed = makeSeed(product);
  const templates = getReviewTemplates(product);
  const reviewCount = isCoolerProduct(product) ? 18 : 10;

  return Array.from({ length: reviewCount }).map((_, index) => {
    const reviewer = reviewerPool[(seed + index) % reviewerPool.length];
    const rating = ratingsPool[(seed + index) % ratingsPool.length];
    const date = datesPool[(seed + index) % datesPool.length];
    const template = templates[index % templates.length];

    return {
      id: `${product.id || product.slug || product.title}-${index}`,
      name: reviewer[0],
      city: reviewer[1],
      rating,
      body: template,
      date,
      verified: true
    };
  });
}

export function getAverageRating(product) {
  const reviews = getProductReviews(product);
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  return Number(average.toFixed(1));
}

export function getVisibleReviewCount(product) {
  return getProductReviews(product).length;
}

export function getReviewVolume(product) {
  const seed = makeSeed(product);
  return 1049 + ((seed * 7) % 1700);
}

function normalizePercentages(values) {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (!total) return values.map(() => 0);

  const rawPercentages = values.map((value) => (value / total) * 100);
  const floored = rawPercentages.map((value) => Math.floor(value));
  let remainder = 100 - floored.reduce((sum, value) => sum + value, 0);

  const rankedIndexes = rawPercentages
    .map((value, index) => ({ index, fraction: value - floored[index] }))
    .sort((left, right) => right.fraction - left.fraction);

  for (let index = 0; index < rankedIndexes.length && remainder > 0; index += 1) {
    floored[rankedIndexes[index].index] += 1;
    remainder -= 1;
  }

  return floored;
}

export function getGlobalRatingCount(product) {
  const seed = makeSeed(product);
  const reviewVolume = getReviewVolume(product);
  const multiplier = 1.14 + ((seed % 5) * 0.03);
  return Math.round(reviewVolume * multiplier);
}

export function getRatingBreakdown(product) {
  const seed = makeSeed(product);
  const type = getProductType(product).label;
  const baselineByType = {
    'Physical Product': [74, 16, 5, 2, 3],
    'Plant Based': [71, 18, 6, 2, 3],
    'Digital Product': [69, 20, 6, 2, 3]
  };

  const baseline = baselineByType[type] || baselineByType['Physical Product'];
  const values = [...baseline];

  values[0] += seed % 4;
  values[1] += (seed % 3) - 1;
  values[2] += seed % 2;
  values[4] += (seed % 5) === 0 ? 1 : 0;

  const percentages = normalizePercentages(values.map((value) => Math.max(1, value)));
  const totalRatings = getGlobalRatingCount(product);

  return [5, 4, 3, 2, 1].map((stars, index) => ({
    stars,
    percentage: percentages[index],
    count: Math.round((totalRatings * percentages[index]) / 100)
  }));
}

export function getProductFaqs(product) {
  const type = getProductType(product).label;
  return faqByType[type] || faqByType['Physical Product'];
}
