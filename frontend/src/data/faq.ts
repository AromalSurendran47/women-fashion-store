import type { Faq } from "@/types";

export const faqs: Faq[] = [
  { id: "faq-1", category: "Sizing", question: "How do I find my correct size?", answer: "Every product page has a detailed size chart with measurements in inches and centimetres. If you're between sizes, we recommend sizing up for a relaxed fit." },
  { id: "faq-2", category: "Returns", question: "What is your return policy?", answer: "We offer easy 7-day returns and exchanges on unworn items with original tags. Refunds are processed to the original payment method within 5–7 business days." },
  { id: "faq-3", category: "Shipping", question: "How long does delivery take?", answer: "Standard delivery takes 4–6 business days, while express delivery arrives in 2–3 days. Metro cities are usually faster." },
  { id: "faq-4", category: "Shipping", question: "Do you offer free shipping?", answer: "Yes! Orders above ₹1,499 ship free. A flat ₹99 applies to orders below that." },
  { id: "faq-5", category: "Payments", question: "Which payment methods do you accept?", answer: "We accept UPI, all major credit and debit cards, net banking and Cash on Delivery, all secured via Razorpay." },
  { id: "faq-6", category: "Payments", question: "Is Cash on Delivery available?", answer: "COD is available on orders up to ₹5,000 across most serviceable pincodes." },
  { id: "faq-7", category: "Orders", question: "How can I track my order?", answer: "Once shipped, you'll receive a tracking link by SMS and email. You can also track it under Profile → Orders." },
  { id: "faq-8", category: "Orders", question: "Can I cancel or modify my order?", answer: "Orders can be cancelled or modified within 12 hours of placing them, as long as they haven't been packed." },
  { id: "faq-9", category: "Products", question: "Are the product colours accurate?", answer: "We photograph in natural light for accuracy, but slight variations can occur due to screen settings." },
  { id: "faq-10", category: "Products", question: "How should I care for my garments?", answer: "Care instructions are listed on each product page. In general, gentle cold washes and shade drying keep colours vibrant." },
  { id: "faq-11", category: "Products", question: "Do you restock sold-out items?", answer: "Popular styles are restocked regularly. Tap 'Notify Me' on the product page to get an alert." },
  { id: "faq-12", category: "Shipping", question: "Do you ship internationally?", answer: "Currently we ship across India. International shipping is coming soon — join our newsletter for updates." },
  { id: "faq-13", category: "Payments", question: "How do I apply a coupon code?", answer: "Enter your code in the 'Apply Coupon' box at checkout and the discount will reflect in your order summary." },
  { id: "faq-14", category: "Payments", question: "Is my payment information secure?", answer: "Absolutely. We never store card details — all transactions are encrypted and processed through Razorpay." },
  { id: "faq-15", category: "General", question: "How do I contact customer support?", answer: "Reach us on WhatsApp, email support@sruvalle.in, or call us between 10am–7pm, Monday to Saturday." },
];

export const faqCategories = Array.from(new Set(faqs.map((f) => f.category)));
