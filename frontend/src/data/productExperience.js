import { getProductType } from '../lib/productTypes';

const reviewers = [
  ['Neha S.', 'Pune'],
  ['Aman K.', 'Delhi'],
  ['Priya M.', 'Mumbai'],
  ['Rahul T.', 'Jaipur'],
  ['Sneha R.', 'Assam'],
  ['Kunal V.', 'Noida'],
  ['Ritika P.', 'Bhopal'],
  ['Dev A.', 'Lucknow'],
  ['Megha J.', 'Bengaluru'],
  ['Suresh V.', 'Ranchi']
];

const ratings = [5, 5, 4, 5, 4, 5, 5, 4, 5, 4];
const dates = [
  '2 days ago',
  '4 days ago',
  '5 days ago',
  '1 week ago',
  '8 days ago',
  '10 days ago',
  '11 days ago',
  '12 days ago',
  '13 days ago',
  '2 weeks ago'
];

const usagePhotosByType = {
  'Physical Product': [
    'https://images.unsplash.com/photo-1661715759582-c792f9f5b280?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1595514535415-dae8dd1f2e43?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80'
  ],
  'Plant Based': [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80'
  ],
  'Digital Product': [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80'
  ]
};

const faqByType = {
  'Physical Product': [
    ['How long does delivery take?', 'Most physical products are dispatched quickly and usually arrive within 3 to 7 days depending on your location.'],
    ['Is COD available?', 'Yes, Cash on Delivery is available for eligible pin codes and shown clearly on the product page.'],
    ['What if stock runs out?', 'If the item sells out, BharatMart usually restocks popular physical products in around 14 days.'],
    ['Can I return the item?', 'Eligible physical products can be returned within 7 days if unused, undamaged, and packed properly.'],
    ['Will I receive tracking updates?', 'Yes, after checkout your dashboard shows packed, shipped, and delivered status updates.']
  ],
  'Plant Based': [
    ['How fresh are microgreen orders?', 'Plant-based microgreen orders are handled carefully and listed separately so freshness expectations stay clear.'],
    ['How should I store them after delivery?', 'Keep plant-based products refrigerated or as instructed on the pack to preserve freshness and texture.'],
    ['Is COD available for microgreens?', 'Yes, where serviceable. Availability may depend on your delivery pin code and perishability window.'],
    ['What if my pack arrives damaged?', 'Contact support quickly with photos and your order number so the team can review and help.'],
    ['Why are microgreens shown separately?', 'They are separated from physical gadgets and digital products so customers can shop by product nature more easily.']
  ],
  'Digital Product': [
    ['How do I receive the digital product?', 'Digital products are meant for instant-access delivery flow and are listed separately from physical inventory.'],
    ['Will this be shipped physically?', 'No. Digital products are non-physical and are intended for downloadable or online access use cases.'],
    ['Can I use coupon codes on digital items?', 'Yes, active coupon codes can still apply if the product is eligible during checkout.'],
    ['Is COD available on digital products?', 'COD labels are used store-wide, but final digital fulfillment rules can be customized later if needed.'],
    ['Can I access it again later?', 'Customer dashboard and order records help keep your purchase trail organized for future support.']
  ]
};

function getReviewCopy(product, index) {
  const type = getProductType(product).label;

  if (type === 'Plant Based') {
    return [
      `Fresh quality was better than expected. ${product.title} looked clean, well packed, and worth reordering.`,
      `I added ${product.title} to my diet plan and the product felt premium, healthy, and carefully handled.`,
      `Very good freshness and packaging. The item reached on time and tasted exactly as described.`,
      `Good plant-based option. I liked the quality, and the listing felt clear compared with other marketplaces.`,
      `The order was neat, fresh, and simple to use right away. I will try more microgreen products from BharatMart.`,
      `${product.title} matched the description well. Nice for health-focused buyers who want something different.`,
      `Delivery and freshness were both solid. I appreciate that microgreen products are shown separately on the site.`,
      `Good value considering the presentation and quality. Customer support also felt trustworthy.`,
      `This was my first microgreen order online and the experience was smooth from checkout to delivery.`,
      `Healthy, fresh, and well packed. Easy product page and good confidence-building details.`
    ][index];
  }

  if (type === 'Digital Product') {
    return [
      `${product.title} felt practical and easy to understand. The listing made it clear what kind of product it was.`,
      `Useful purchase. I like that digital products are separated from physical items on BharatMart.`,
      `The product description was clear and the value felt strong for the price point.`,
      `Simple checkout and a well-organized product page. Good experience overall.`,
      `I bought ${product.title} because the offer looked genuine and the details were easy to scan.`,
      `Neat presentation and straightforward product promise. Perfect for quick digital buying decisions.`,
      `The page answered most of my doubts before purchase. Very smooth storefront experience.`,
      `Looked premium, organized, and more trustworthy than many basic digital stores.`,
      `Clean design and easy-to-read info helped me decide fast.`,
      `Good value and a clear digital-product layout. Would buy again from the same section.`
    ][index];
  }

  return [
    `${product.title} is working really well. Build quality feels solid and the delivery was quick.`,
    `Good purchase for the price. The product matched the description and the offer looked genuine.`,
    `I bought this after seeing the urgency and reviews, and the item actually delivered on expectations.`,
    `Useful product, nice packaging, and easy COD checkout. BharatMart gave a trustworthy feel.`,
    `The quality is better than many marketplace listings I have tried before. Worth ordering.`,
    `Very happy with the purchase. The item looks premium and the tracking updates were clear.`,
    `I liked the product finish and how simple the order process was. Would recommend it.`,
    `The product arrived in good condition and started being useful from day one.`,
    `Strong value for money. The listing, discount, and seller trust badges helped a lot.`,
    `This felt like a safer buy because the site clearly showed stock, offers, and COD information.`
  ][index];
}

export function getProductReviews(product) {
  const type = getProductType(product).label;
  const usagePhotos = usagePhotosByType[type] || usagePhotosByType['Physical Product'];

  return reviewers.map(([name, city], index) => ({
    id: `${product.id || product.slug || product.title}-${index}`,
    name,
    city,
    rating: ratings[index],
    title: `${product.title} review ${index + 1}`,
    body: getReviewCopy(product, index),
    date: dates[index],
    verified: true,
    image: index < 3 ? usagePhotos[index % usagePhotos.length] : ''
  }));
}

export function getAverageRating(product) {
  const reviews = getProductReviews(product);
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  return Number(average.toFixed(1));
}

export function getProductFaqs(product) {
  const type = getProductType(product).label;
  return faqByType[type] || faqByType['Physical Product'];
}
