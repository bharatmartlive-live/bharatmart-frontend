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
  '2 din pehle',
  '4 din pehle',
  '6 din pehle',
  '1 hafte pehle',
  '8 din pehle',
  '10 din pehle',
  '12 din pehle',
  '2 hafte pehle',
  '14 din pehle',
  '15 din pehle',
  '15 din pehle',
  '18 din pehle',
  '20 din pehle',
  '3 hafte pehle',
  '23 din pehle',
  '25 din pehle',
  '26 din pehle',
  '4 hafte pehle',
  '1 mahine ke andar',
  'Recently verified'
];

const faqByType = {
  'Physical Product': [
    ['Delivery kitne din me ho jati hai?', 'Normally physical product 3 se 7 din ke andar pahunch jata hai. Exact time aapki location aur courier route par depend karta hai.'],
    ['COD available hai kya?', 'Haan, eligible pin code par Cash on Delivery available hai. Product page aur checkout par ye clearly show hota hai.'],
    ['Agar stock khatam ho gaya to?', 'Agar item sold out ho jaye to popular physical products ka restock usually 14 din ke around expected hota hai.'],
    ['Return ya replace ho sakta hai kya?', 'Haan, eligible item unused condition aur original packaging ke saath return/replacement review ke liye raise kiya ja sakta hai.'],
    ['Tracking update kahaan dikhega?', 'Order place hone ke baad aapke dashboard me packed, shipped aur delivered status step by step dikhega.']
  ],
  'Plant Based': [
    ['Microgreen kitna fresh milta hai?', 'Plant-based item carefully handle kiya jata hai aur isi liye alag section me show hota hai, taki freshness expectation clear rahe.'],
    ['Delivery ke baad store kaise karein?', 'Best result ke liye refrigeration ya pack par diya gaya storage instruction follow karein.'],
    ['COD microgreen par bhi milega?', 'Haan, serviceable area me mil sakta hai. Perishable nature ki wajah se kuch pin codes par availability differ kar sakti hai.'],
    ['Agar pack damage ho jaye to?', 'Order number aur photo ke saath support ko turant contact karein, team review karke help karegi.'],
    ['Ye alag category me kyun dikh raha hai?', 'Microgreen ko normal gadget ya digital item se alag dikhaya gaya hai, taki buyer ko product nature instantly samajh aaye.']
  ],
  'Digital Product': [
    ['Digital product ka access kaise milega?', 'Digital product ko physical inventory se alag organize kiya gaya hai, taki buyer ko instantly samajh aaye ki ye non-physical purchase hai.'],
    ['Kya ye courier se ghar aayega?', 'Nahi, digital product non-physical hota hai aur normally downloadable ya online-access type use case ke liye hota hai.'],
    ['Coupon apply ho sakta hai kya?', 'Haan, active coupon eligible digital item par bhi checkout ke time apply ho sakta hai.'],
    ['COD yahan kaise kaam karega?', 'Store-wide COD visibility dikh rahi hai, lekin digital fulfillment rule aap future me aur clearly customize kar sakte hain.'],
    ['Purchase record baad me milega?', 'Haan, dashboard aur order history future support aur reference ke liye useful rahegi.']
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

export function getProductFaqs(product) {
  const type = getProductType(product).label;
  return faqByType[type] || faqByType['Physical Product'];
}
