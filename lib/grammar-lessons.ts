// Grammar mini-lessons. Every Arabic example must occur in the Qur'an: it is looked up at build
// time (lib/quran-index.ts) to show its Uthmani spelling and recitation, and a unit test fails if
// any example cannot be found. Bangla comes first; Arabic grammar terms are given in brackets.

export type Text = { bn: string; en: string };

export interface GrammarExample {
  ar: string;
  gloss: Text;
}

export interface GrammarQuestion {
  prompt: Text;
  ar?: string;
  /** options[0] is the correct answer; options are shuffled when shown */
  options: Text[];
}

export interface GrammarLesson {
  slug: string;
  title: Text;
  summary: Text;
  body: { bn: string[]; en: string[] };
  examples: { title: Text; items: GrammarExample[] }[];
  tip?: Text;
  quiz: GrammarQuestion[];
}

const T = (bn: string, en: string): Text => ({ bn, en });
const ex = (ar: string, bn: string, en: string): GrammarExample => ({ ar, gloss: T(bn, en) });

export const GRAMMAR_LESSONS: GrammarLesson[] = [
  {
    slug: "word-types",
    title: T("শব্দের তিন ধরন: ইসম, ফে'ল, হরফ", "Three kinds of words: ism, fiʿl, ḥarf"),
    summary: T("আরবির প্রতিটি শব্দ এই তিনটির একটি।", "Every Arabic word is one of these three."),
    body: {
      bn: [
        "আরবিতে প্রতিটি শব্দ তিন ধরনের যেকোনো একটি: ইসম (নাম বা বিশেষ্য), ফে'ল (কাজ বা ক্রিয়া) অথবা হরফ (অব্যয়)।",
        "ইসম — কোনো ব্যক্তি, বস্তু, স্থান বা গুণের নাম। যেমন: কিতাব, রহমত।",
        "ফে'ল — এমন কাজ যা কোনো সময়ের সাথে যুক্ত। যেমন: সে বলল, সে সৃষ্টি করল।",
        "হরফ — যা একা পুরো অর্থ দেয় না, অন্য শব্দের সাথে মিলে অর্থ দেয়। যেমন: মধ্যে, থেকে, উপর।",
      ],
      en: [
        "Every Arabic word is one of three kinds: ism (a name or noun), fiʿl (an action or verb) or ḥarf (a particle).",
        "Ism — the name of a person, thing, place or quality. For example: book, mercy.",
        "Fiʿl — an action tied to a time. For example: he said, he created.",
        "Ḥarf — a word that does not give full meaning alone but links other words. For example: in, from, on.",
      ],
    },
    examples: [
      { title: T("ইসম (নাম)", "Ism (noun)"), items: [ex("الْكِتَابُ", "কিতাবটি", "the Book"), ex("رَحْمَةً", "রহমত, দয়া", "mercy")] },
      { title: T("ফে'ল (ক্রিয়া)", "Fiʿl (verb)"), items: [ex("قَالَ", "সে বলল", "he said"), ex("خَلَقَ", "সে সৃষ্টি করল", "he created")] },
      { title: T("হরফ (অব্যয়)", "Ḥarf (particle)"), items: [ex("فِي", "মধ্যে", "in"), ex("مِنْ", "থেকে", "from"), ex("عَلَى", "উপর", "on")] },
    ],
    quiz: [
      { prompt: T("এটি কোন ধরনের শব্দ?", "What kind of word is this?"), ar: "خَلَقَ", options: [T("ফে'ল (ক্রিয়া)", "Fiʿl (verb)"), T("ইসম (নাম)", "Ism (noun)"), T("হরফ (অব্যয়)", "Ḥarf (particle)")] },
      { prompt: T("এটি কোন ধরনের শব্দ?", "What kind of word is this?"), ar: "فِي", options: [T("হরফ (অব্যয়)", "Ḥarf (particle)"), T("ফে'ল (ক্রিয়া)", "Fiʿl (verb)"), T("ইসম (নাম)", "Ism (noun)")] },
      { prompt: T("এটি কোন ধরনের শব্দ?", "What kind of word is this?"), ar: "الْكِتَابُ", options: [T("ইসম (নাম)", "Ism (noun)"), T("হরফ (অব্যয়)", "Ḥarf (particle)"), T("ফে'ল (ক্রিয়া)", "Fiʿl (verb)")] },
    ],
  },
  {
    slug: "roots",
    title: T("মূল অক্ষর: একটি মূল, অনেক শব্দ", "Roots: one root, many words"),
    summary: T("তিনটি মূল অক্ষর চিনলে পুরো শব্দ-পরিবার চেনা যায়।", "Know three root letters, recognise a whole family of words."),
    body: {
      bn: [
        "অধিকাংশ আরবি শব্দ তিনটি মূল অক্ষর (রুট) থেকে তৈরি। মূল অক্ষরগুলো একটি মৌলিক অর্থ বহন করে।",
        "এই মূলকে বিভিন্ন ছাঁচে ঢাললে নতুন নতুন শব্দ তৈরি হয়, কিন্তু মৌলিক অর্থটি থেকে যায়।",
        "যেমন ع ل م (জানা) থেকে: عَلِمَ (সে জানল), عِلْم (জ্ঞান), عَلِيم (সর্বজ্ঞ), يَعْلَمُونَ (তারা জানে)।",
      ],
      en: [
        "Most Arabic words are built from three root letters. The root carries a basic meaning.",
        "Pouring the root into different patterns makes new words, but the basic meaning stays.",
        "For example, from ع ل م (to know): عَلِمَ (he knew), عِلْم (knowledge), عَلِيم (All-Knowing), يَعْلَمُونَ (they know).",
      ],
    },
    examples: [
      {
        title: T("মূল ع ل م — জানা", "Root ع ل م — to know"),
        items: [ex("عَلِمَ", "সে জানল", "he knew"), ex("عِلْمٌ", "জ্ঞান", "knowledge"), ex("عَلِيمٌ", "সর্বজ্ঞ", "All-Knowing"), ex("يَعْلَمُونَ", "তারা জানে", "they know")],
      },
      { title: T("মূল ك ت ب — লেখা", "Root ك ت ب — to write"), items: [ex("كَتَبَ", "সে লিখল / নির্ধারণ করল", "he wrote / decreed"), ex("كِتَابٌ", "কিতাব, লিখিত গ্রন্থ", "a book")] },
    ],
    tip: T("প্রতিটি শব্দের পাতায় “একই মূলের শব্দ” অংশটি দেখুন।", "See “Words from the same root” on every word page."),
    quiz: [
      { prompt: T("এই শব্দের মূল অক্ষর কোনটি?", "Which are the root letters of this word?"), ar: "عَلِيمٌ", options: [T("ع ل م", "ع ل م"), T("ع م ل", "ع م ل"), T("ل م ع", "ل م ع")] },
      { prompt: T("এই শব্দের অর্থ কী?", "What does this word mean?"), ar: "عِلْمٌ", options: [T("জ্ঞান", "knowledge"), T("কাজ", "work"), T("দুনিয়া", "the world")] },
      { prompt: T("একটি মূল থেকে কয়টি শব্দ তৈরি হতে পারে?", "How many words can come from one root?"), options: [T("অনেকগুলো", "Many"), T("মাত্র একটি", "Only one"), T("ঠিক দুটি", "Exactly two")] },
    ],
  },
  {
    slug: "al",
    title: T("আল (ال): নির্দিষ্ট করা", "Al (ال): making it definite"),
    summary: T("ال মানে “টি/টা” — ইংরেজির the।", "ال means “the”."),
    body: {
      bn: [
        "ال শব্দের শুরুতে বসে শব্দটিকে নির্দিষ্ট করে — বাংলায় “টি/টা”, ইংরেজিতে “the”।",
        "كِتَابٌ = একটি কিতাব; الْكِتَابُ = কিতাবটি (নির্দিষ্ট)।",
        "সূর্য অক্ষর (শামসী): ال-এর পরে এই অক্ষর এলে ل উচ্চারিত হয় না, পরের অক্ষরে তাশদীদ পড়ে — যেমন الرَّحْمَٰن (আর-রাহমান)।",
        "চাঁদ অক্ষর (কামারী): ل স্পষ্ট উচ্চারিত হয় — যেমন الْحَمْد (আল-হামদ)।",
      ],
      en: [
        "ال at the start of a word makes it definite — like “the” in English.",
        "كِتَابٌ = a book; الْكِتَابُ = the Book.",
        "Sun letters (shamsī): after ال the ل is silent and the next letter is doubled — e.g. الرَّحْمَٰن (ar-Raḥmān).",
        "Moon letters (qamarī): the ل is pronounced clearly — e.g. الْحَمْد (al-ḥamd).",
      ],
    },
    examples: [
      { title: T("অনির্দিষ্ট ও নির্দিষ্ট", "Indefinite and definite"), items: [ex("كِتَابٌ", "একটি কিতাব", "a book"), ex("الْكِتَابُ", "কিতাবটি", "the Book")] },
      { title: T("সূর্য অক্ষর — ل চুপ", "Sun letters — silent ل"), items: [ex("الرَّحْمَنُ", "আর-রাহমান (পরম করুণাময়)", "ar-Raḥmān (the Most Gracious)"), ex("النَّاسُ", "আন-নাস (মানুষ)", "an-nās (the people)")] },
      { title: T("চাঁদ অক্ষর — ل উচ্চারিত", "Moon letters — ل pronounced"), items: [ex("الْحَمْدُ", "আল-হামদ (সব প্রশংসা)", "al-ḥamd (all praise)"), ex("الْكِتَابُ", "আল-কিতাব", "al-kitāb")] },
    ],
    quiz: [
      { prompt: T("এর অর্থ কী?", "What does this mean?"), ar: "الْكِتَابُ", options: [T("কিতাবটি (নির্দিষ্ট)", "the Book (definite)"), T("একটি কিতাব", "a book"), T("কিতাবগুলো", "books")] },
      { prompt: T("এখানে ল (ل) উচ্চারিত হয় কি?", "Is the ل pronounced here?"), ar: "النَّاسُ", options: [T("না — এটি সূর্য অক্ষর", "No — it is a sun letter"), T("হ্যাঁ — এটি চাঁদ অক্ষর", "Yes — it is a moon letter")] },
      { prompt: T("এখানে ল (ل) উচ্চারিত হয় কি?", "Is the ل pronounced here?"), ar: "الْحَمْدُ", options: [T("হ্যাঁ — এটি চাঁদ অক্ষর", "Yes — it is a moon letter"), T("না — এটি সূর্য অক্ষর", "No — it is a sun letter")] },
    ],
  },
  {
    slug: "gender",
    title: T("পুংলিঙ্গ ও স্ত্রীলিঙ্গ", "Masculine and feminine"),
    summary: T("শেষে ة থাকলে সাধারণত স্ত্রীলিঙ্গ।", "A final ة usually means feminine."),
    body: {
      bn: [
        "আরবিতে প্রতিটি ইসম হয় পুংলিঙ্গ (মুযাক্কার) নয়তো স্ত্রীলিঙ্গ (মুয়ান্নাস)।",
        "সহজ নিয়ম: শব্দের শেষে ة (গোল তা) থাকলে শব্দটি সাধারণত স্ত্রীলিঙ্গ।",
        "مُؤْمِن (মু'মিন পুরুষ) শব্দে ة যোগ করলে হয় مُؤْمِنَة (মু'মিন নারী)।",
        "কিছু শব্দ কোনো চিহ্ন ছাড়াই স্ত্রীলিঙ্গ — যেমন أَرْض (জমিন), نَار (আগুন), شَمْس (সূর্য)।",
      ],
      en: [
        "Every Arabic noun is either masculine (mudhakkar) or feminine (muʾannath).",
        "Simple rule: a word ending in ة (tāʾ marbūṭa) is usually feminine.",
        "Adding ة to مُؤْمِن (a believing man) gives مُؤْمِنَة (a believing woman).",
        "Some words are feminine without any marker — e.g. أَرْض (earth), نَار (fire), شَمْس (sun).",
      ],
    },
    examples: [
      { title: T("ة যোগ করে স্ত্রীলিঙ্গ", "Feminine by adding ة"), items: [ex("مُؤْمِنٌ", "মু'মিন (পুরুষ)", "a believer (m)"), ex("مُؤْمِنَةٌ", "মু'মিন (নারী)", "a believer (f)"), ex("جَنَّةٌ", "জান্নাত, বাগান", "a garden, Paradise")] },
      { title: T("চিহ্ন ছাড়াই স্ত্রীলিঙ্গ", "Feminine without a marker"), items: [ex("الْأَرْضِ", "জমিন", "the earth"), ex("النَّارِ", "আগুন", "the Fire"), ex("الشَّمْسَ", "সূর্য", "the sun")] },
    ],
    quiz: [
      { prompt: T("এই শব্দটি কোন লিঙ্গ?", "What gender is this word?"), ar: "مُؤْمِنَةٌ", options: [T("স্ত্রীলিঙ্গ", "Feminine"), T("পুংলিঙ্গ", "Masculine")] },
      { prompt: T("جَنَّة (জান্নাত) কেন স্ত্রীলিঙ্গ?", "Why is جَنَّة (garden) feminine?"), options: [T("শেষে ة আছে", "It ends in ة"), T("এটি একটি ক্রিয়া", "It is a verb"), T("শুরুতে ال আছে", "It starts with ال")] },
      { prompt: T("أَرْض (জমিন) কোন লিঙ্গ?", "What gender is أَرْض (earth)?"), options: [T("স্ত্রীলিঙ্গ — চিহ্ন ছাড়াই", "Feminine — without a marker"), T("পুংলিঙ্গ", "Masculine")] },
    ],
  },
  {
    slug: "number",
    title: T("একবচন, দ্বিবচন, বহুবচন", "Singular, dual, plural"),
    summary: T("আরবিতে “দুই”-এর জন্যও আলাদা রূপ আছে।", "Arabic has a special form for “two”."),
    body: {
      bn: [
        "একবচন (মুফরাদ): একজন বা একটি।",
        "দ্বিবচন (তাসনিয়া): দুইজন বা দুটি — শেষে ـَانِ বা ـَيْنِ যুক্ত হয়। যেমন جَنَّتَانِ (দুটি বাগান)।",
        "পুংলিঙ্গ বহুবচন: শেষে ـُونَ বা ـِينَ — যেমন الْمُؤْمِنُونَ (মু'মিনগণ)।",
        "স্ত্রীলিঙ্গ বহুবচন: শেষে ـَات — যেমন الْمُؤْمِنَات (মু'মিন নারীগণ)।",
        "ভাঙা বহুবচন (জমা তাকসীর): শব্দের ভেতরের গঠন বদলে যায় — قَلْب → قُلُوب, رَسُول → رُسُل। এগুলো আলাদা করে মনে রাখতে হয়।",
      ],
      en: [
        "Singular (mufrad): one.",
        "Dual (muthannā): two — ends in ـَانِ or ـَيْنِ. For example جَنَّتَانِ (two gardens).",
        "Masculine plural: ends in ـُونَ or ـِينَ — e.g. الْمُؤْمِنُونَ (the believers).",
        "Feminine plural: ends in ـَات — e.g. الْمُؤْمِنَات (the believing women).",
        "Broken plural (jamʿ taksīr): the inside of the word changes — قَلْب → قُلُوب, رَسُول → رُسُل. These are learned one by one.",
      ],
    },
    examples: [
      { title: T("দ্বিবচন", "Dual"), items: [ex("جَنَّتَانِ", "দুটি বাগান", "two gardens")] },
      { title: T("সুস্থ বহুবচন", "Sound plurals"), items: [ex("الْمُؤْمِنُونَ", "মু'মিনগণ", "the believers"), ex("الْمُؤْمِنِينَ", "মু'মিনগণ", "the believers"), ex("الْمُؤْمِنَاتِ", "মু'মিন নারীগণ", "the believing women")] },
      { title: T("ভাঙা বহুবচন", "Broken plurals"), items: [ex("قَلْبٌ", "একটি অন্তর", "a heart"), ex("الْقُلُوبُ", "অন্তরসমূহ", "the hearts"), ex("رَسُولٌ", "একজন রাসূল", "a messenger"), ex("الرُّسُلُ", "রাসূলগণ", "the messengers")] },
    ],
    quiz: [
      { prompt: T("এখানে কয়টি বাগানের কথা?", "How many gardens?"), ar: "جَنَّتَانِ", options: [T("দুটি", "Two"), T("একটি", "One"), T("অনেকগুলো", "Many")] },
      { prompt: T("এটি কোন রূপ?", "Which form is this?"), ar: "الْمُؤْمِنُونَ", options: [T("পুংলিঙ্গ বহুবচন", "Masculine plural"), T("দ্বিবচন", "Dual"), T("একবচন", "Singular")] },
      { prompt: T("قُلُوب কোন ধরনের বহুবচন?", "What kind of plural is قُلُوب?"), options: [T("ভাঙা বহুবচন (قَلْب থেকে)", "Broken plural (from قَلْب)"), T("সুস্থ স্ত্রীলিঙ্গ বহুবচন", "Sound feminine plural"), T("দ্বিবচন", "Dual")] },
    ],
  },
  {
    slug: "attached-pronouns",
    title: T("যুক্ত সর্বনাম: আমার, তোমার, তার", "Attached pronouns: my, your, his"),
    summary: T("“আমার রব”, “তোমার রব” — শব্দের শেষে ছোট্ট অংশ।", "“my Lord”, “your Lord” — a small ending on the word."),
    body: {
      bn: [
        "আরবিতে “আমার”, “তোমার”, “তার” আলাদা শব্দ হিসেবে আসে না — শব্দের শেষে ছোট্ট অংশ হিসেবে জুড়ে বসে।",
        "ـِي = আমার · ـكَ = তোমার · ـكُمْ = তোমাদের · ـهُ = তার (পুরুষ) · ـهَا = তার (নারী)/এর · ـهُمْ = তাদের · ـنَا = আমাদের",
        "এই সাতটি ছোট্ট অংশ চিনলে কুরআনের হাজারো শব্দ সহজ হয়ে যায়।",
      ],
      en: [
        "In Arabic, “my”, “your”, “his” are not separate words — they attach as a small ending.",
        "ـِي = my · ـكَ = your · ـكُمْ = your (plural) · ـهُ = his · ـهَا = her/its · ـهُمْ = their · ـنَا = our",
        "Knowing these seven endings unlocks thousands of words in the Qur'an.",
      ],
    },
    examples: [
      {
        title: T("رَبّ (রব) শব্দের সাথে", "With رَبّ (Lord)"),
        items: [
          ex("رَبِّي", "আমার রব", "my Lord"),
          ex("رَبُّكَ", "তোমার রব", "your Lord"),
          ex("رَبُّكُمْ", "তোমাদের রব", "your Lord (plural)"),
          ex("رَبُّهُ", "তার রব", "his Lord"),
          ex("رَبُّهُمْ", "তাদের রব", "their Lord"),
          ex("رَبَّنَا", "হে আমাদের রব", "our Lord"),
        ],
      },
      { title: T("ـهَا — তার (নারী) / এর", "ـهَا — her / its"), items: [ex("فِيهَا", "তার মধ্যে / এর মধ্যে", "in it")] },
    ],
    quiz: [
      { prompt: T("এর অর্থ কী?", "What does this mean?"), ar: "رَبُّكُمْ", options: [T("তোমাদের রব", "your Lord (plural)"), T("আমাদের রব", "our Lord"), T("তাদের রব", "their Lord")] },
      { prompt: T("শেষের ـنَا মানে কী?", "What does the ending ـنَا mean?"), ar: "رَبَّنَا", options: [T("আমাদের", "our"), T("তোমার", "your"), T("তার", "his")] },
      { prompt: T("এর অর্থ কী?", "What does this mean?"), ar: "رَبُّهُ", options: [T("তার রব", "his Lord"), T("আমার রব", "my Lord"), T("তোমার রব", "your Lord")] },
    ],
  },
  {
    slug: "pronouns",
    title: T("পৃথক সর্বনাম: সে, তুমি, আমি", "Separate pronouns: he, you, I"),
    summary: T("সাতটি ছোট শব্দ, কুরআনে অসংখ্যবার।", "Seven short words, countless times in the Qur'an."),
    body: {
      bn: [
        "সর্বনাম কুরআনে বারবার আসে, তাই এগুলো আগে শিখলে অনেক আয়াত সহজ হয়ে যায়।",
        "উদাহরণ: قُلْ هُوَ اللَّهُ أَحَدٌ — বলো, তিনিই আল্লাহ, এক (সূরা ইখলাস ১১২:১)।",
      ],
      en: [
        "Pronouns appear again and again in the Qur'an, so learning them early makes many ayat easier.",
        "Example: قُلْ هُوَ اللَّهُ أَحَدٌ — Say, He is Allah, the One (Surah al-Ikhlāṣ 112:1).",
      ],
    },
    examples: [
      {
        title: T("সর্বনাম", "Pronouns"),
        items: [
          ex("هُوَ", "সে / তিনি (পুরুষ)", "he"),
          ex("هِيَ", "সে (নারী) / এটি", "she / it"),
          ex("هُمْ", "তারা", "they"),
          ex("أَنْتَ", "তুমি", "you"),
          ex("أَنْتُمْ", "তোমরা", "you (plural)"),
          ex("أَنَا", "আমি", "I"),
          ex("نَحْنُ", "আমরা", "we"),
        ],
      },
    ],
    quiz: [
      { prompt: T("এর অর্থ কী?", "What does this mean?"), ar: "نَحْنُ", options: [T("আমরা", "we"), T("তারা", "they"), T("তোমরা", "you (plural)")] },
      { prompt: T("এর অর্থ কী?", "What does this mean?"), ar: "هُمْ", options: [T("তারা", "they"), T("সে", "he"), T("আমি", "I")] },
      { prompt: T("এর অর্থ কী?", "What does this mean?"), ar: "أَنْتَ", options: [T("তুমি", "you"), T("আমি", "I"), T("সে (নারী)", "she")] },
    ],
  },
  {
    slug: "tenses",
    title: T("ক্রিয়ার কাল: মাযী, মুযারে, আমর", "Verb tenses: māḍī, muḍāriʿ, amr"),
    summary: T("বলল · বলে · বলো — একই মূল, তিন রূপ।", "said · says · say! — one root, three forms."),
    body: {
      bn: [
        "মাযী (অতীত): কাজটি হয়ে গেছে — قَالَ (সে বলল)।",
        "মুযারে (বর্তমান/ভবিষ্যৎ): কাজটি হচ্ছে বা হবে — শুরুতে সাধারণত يَ / تَ / أَ / نَ থাকে। যেমন يَقُولُ (সে বলে)।",
        "আমর (আদেশ): কাজ করার নির্দেশ — قُلْ (বলো)।",
      ],
      en: [
        "Māḍī (past): the action is done — قَالَ (he said).",
        "Muḍāriʿ (present/future): the action is happening or will happen — usually begins with يَ / تَ / أَ / نَ. E.g. يَقُولُ (he says).",
        "Amr (command): an instruction — قُلْ (say!).",
      ],
    },
    examples: [
      { title: T("ق و ل — বলা", "ق و ل — to say"), items: [ex("قَالَ", "সে বলল (মাযী)", "he said (past)"), ex("يَقُولُ", "সে বলে (মুযারে)", "he says (present)"), ex("قُلْ", "বলো (আমর)", "say! (command)")] },
      { title: T("খ ল ক — সৃষ্টি করা", "خ ل ق — to create"), items: [ex("خَلَقَ", "সে সৃষ্টি করল", "he created"), ex("يَخْلُقُ", "সে সৃষ্টি করে", "he creates")] },
      { title: T("ع ل م — জানা", "ع ل م — to know"), items: [ex("عَلِمَ", "সে জানল", "he knew"), ex("يَعْلَمُ", "সে জানে", "he knows"), ex("اعْلَمُوا", "জেনে রাখো", "know! (plural)")] },
    ],
    quiz: [
      { prompt: T("এটি কোন কাল?", "Which tense is this?"), ar: "يَقُولُ", options: [T("মুযারে (বর্তমান/ভবিষ্যৎ)", "Muḍāriʿ (present/future)"), T("মাযী (অতীত)", "Māḍī (past)"), T("আমর (আদেশ)", "Amr (command)")] },
      { prompt: T("এটি কোন কাল?", "Which tense is this?"), ar: "قُلْ", options: [T("আমর (আদেশ) — বলো", "Amr (command) — say!"), T("মাযী (অতীত) — সে বলল", "Māḍī (past) — he said"), T("মুযারে — সে বলে", "Muḍāriʿ — he says")] },
      { prompt: T("এটি কোন কাল?", "Which tense is this?"), ar: "خَلَقَ", options: [T("মাযী (অতীত) — সে সৃষ্টি করল", "Māḍī (past) — he created"), T("আমর (আদেশ)", "Amr (command)"), T("মুযারে (বর্তমান)", "Muḍāriʿ (present)")] },
    ],
  },
  {
    slug: "past-endings",
    title: T("অতীত ক্রিয়া: কে করল?", "Past verbs: who did it?"),
    summary: T("শেষের অংশ বলে দেয় — সে, তারা, আমি, আমরা।", "The ending tells you — he, they, I, we."),
    body: {
      bn: [
        "অতীত ক্রিয়ার শেষে যে অংশ যুক্ত হয়, তা বলে দেয় কাজটি কে করেছে।",
        "কোনো অংশ নেই = সে (পুরুষ) · ـَتْ = সে (নারী) · ـُوا = তারা · ـْتُ = আমি · ـْتُمْ = তোমরা · ـْنَا = আমরা",
      ],
      en: [
        "The ending added to a past verb tells you who did the action.",
        "No ending = he · ـَتْ = she · ـُوا = they · ـْتُ = I · ـْتُمْ = you (plural) · ـْنَا = we",
      ],
    },
    examples: [
      {
        title: T("ق و ل — বলা", "ق و ل — to say"),
        items: [
          ex("قَالَ", "সে (পুরুষ) বলল", "he said"),
          ex("قَالَتْ", "সে (নারী) বলল", "she said"),
          ex("قَالُوا", "তারা বলল", "they said"),
          ex("قُلْتُ", "আমি বললাম", "I said"),
          ex("قُلْتُمْ", "তোমরা বললে", "you (plural) said"),
          ex("قُلْنَا", "আমরা বললাম", "we said"),
        ],
      },
    ],
    quiz: [
      { prompt: T("এর অর্থ কী?", "What does this mean?"), ar: "قَالُوا", options: [T("তারা বলল", "they said"), T("আমরা বললাম", "we said"), T("সে বলল", "he said")] },
      { prompt: T("এর অর্থ কী?", "What does this mean?"), ar: "قُلْنَا", options: [T("আমরা বললাম", "we said"), T("তোমরা বললে", "you said"), T("আমি বললাম", "I said")] },
      { prompt: T("শেষের ـَتْ কী বোঝায়?", "What does the ending ـَتْ show?"), ar: "قَالَتْ", options: [T("সে (নারী)", "she"), T("তারা", "they"), T("আমি", "I")] },
    ],
  },
  {
    slug: "present-prefixes",
    title: T("বর্তমান ক্রিয়া: শুরুর অক্ষর", "Present verbs: the first letter"),
    summary: T("يَ · تَ · أَ · نَ — শুরু দেখেই বোঝা যায় কে।", "يَ · تَ · أَ · نَ — the start shows who."),
    body: {
      bn: [
        "মুযারে (বর্তমান/ভবিষ্যৎ) ক্রিয়ার প্রথম অক্ষর বলে দেয় কাজটি কে করছে।",
        "يَ = সে (পুরুষ) · تَ = তুমি / সে (নারী) · أَ = আমি · نَ = আমরা",
        "শেষে ـُونَ যুক্ত হলে বহুবচন: يَعْلَمُونَ (তারা জানে), تَعْلَمُونَ (তোমরা জানো)।",
      ],
      en: [
        "The first letter of a muḍāriʿ (present/future) verb tells you who is doing the action.",
        "يَ = he · تَ = you / she · أَ = I · نَ = we",
        "An ending ـُونَ makes it plural: يَعْلَمُونَ (they know), تَعْلَمُونَ (you all know).",
      ],
    },
    examples: [
      {
        title: T("ع ل م — জানা", "ع ل م — to know"),
        items: [
          ex("يَعْلَمُ", "সে জানে", "he knows"),
          ex("يَعْلَمُونَ", "তারা জানে", "they know"),
          ex("تَعْلَمُونَ", "তোমরা জানো", "you (plural) know"),
          ex("أَعْلَمُ", "আমি জানি", "I know"),
          ex("نَعْلَمُ", "আমরা জানি", "we know"),
        ],
      },
    ],
    quiz: [
      { prompt: T("এর অর্থ কী?", "What does this mean?"), ar: "نَعْلَمُ", options: [T("আমরা জানি", "we know"), T("আমি জানি", "I know"), T("সে জানে", "he knows")] },
      { prompt: T("এর অর্থ কী?", "What does this mean?"), ar: "تَعْلَمُونَ", options: [T("তোমরা জানো", "you (plural) know"), T("তারা জানে", "they know"), T("আমরা জানি", "we know")] },
      { prompt: T("أَ দিয়ে শুরু হলে কে কাজটি করছে?", "Who acts when the verb starts with أَ?"), options: [T("আমি", "I"), T("আমরা", "we"), T("সে", "he")] },
    ],
  },
  {
    slug: "participles",
    title: T("ইসমে ফায়েল ও ইসমে মাফউল", "Ism fāʿil and ism mafʿūl"),
    summary: T("যে করে আর যার উপর করা হয়।", "The doer and the one it is done to."),
    body: {
      bn: [
        "ইসমে ফায়েল (কর্তা-বাচক): যে কাজটি করে। মূল ছাঁচ فَاعِل — যেমন ظَالِم (যে জুলুম করে, জালিম), خَالِق (যিনি সৃষ্টি করেন, স্রষ্টা)।",
        "ইসমে মাফউল (কর্ম-বাচক): যার উপর কাজটি করা হয়। মূল ছাঁচ مَفْعُول — যেমন مَظْلُوم (যার উপর জুলুম করা হয়েছে)।",
        "বড় ক্রিয়ার (বাব) ইসমে ফায়েল সাধারণত مُ দিয়ে শুরু হয় — যেমন مُؤْمِن (যে ঈমান আনে), مُسْلِم (যে আত্মসমর্পণ করে)।",
      ],
      en: [
        "Ism fāʿil (active participle): the one who does the action. Basic pattern فَاعِل — e.g. ظَالِم (one who does wrong), خَالِق (the Creator).",
        "Ism mafʿūl (passive participle): the one the action is done to. Basic pattern مَفْعُول — e.g. مَظْلُوم (one who is wronged).",
        "For longer verb forms the active participle usually starts with مُ — e.g. مُؤْمِن (one who believes), مُسْلِم (one who submits).",
      ],
    },
    examples: [
      { title: T("ইসমে ফায়েল — কর্তা", "Ism fāʿil — the doer"), items: [ex("ظَالِمٌ", "জালিম, যে অন্যায় করে", "one who does wrong"), ex("خَالِقُ", "স্রষ্টা", "the Creator"), ex("مُؤْمِنٌ", "মু'মিন, যে ঈমান আনে", "a believer"), ex("مُسْلِمًا", "মুসলিম, আত্মসমর্পণকারী", "one who submits")] },
      { title: T("ইসমে মাফউল — যার উপর কাজ", "Ism mafʿūl — done to"), items: [ex("مَظْلُومًا", "অত্যাচারিত, যার উপর জুলুম করা হয়েছে", "wronged")] },
    ],
    quiz: [
      { prompt: T("এর অর্থ কী?", "What does this mean?"), ar: "ظَالِمٌ", options: [T("যে জুলুম করে (জালিম)", "one who does wrong"), T("যার উপর জুলুম করা হয়েছে", "one who is wronged"), T("জুলুম", "wrongdoing")] },
      { prompt: T("এর অর্থ কী?", "What does this mean?"), ar: "مَظْلُومًا", options: [T("যার উপর জুলুম করা হয়েছে", "one who is wronged"), T("যে জুলুম করে", "one who does wrong"), T("সে জুলুম করল", "he did wrong")] },
      { prompt: T("فَاعِل ছাঁচ কী বোঝায়?", "What does the pattern فَاعِل show?"), options: [T("যে কাজটি করে", "the one who does the action"), T("যার উপর কাজটি করা হয়", "the one it is done to"), T("কাজের সময়", "the time of the action")] },
    ],
  },
  {
    slug: "particles",
    title: T("সবচেয়ে বেশি আসা ছোট শব্দ (হরফ)", "The most common small words (particles)"),
    summary: T("অল্প কয়েকটি শব্দ, কুরআনে হাজার হাজার বার।", "A few words, thousands of times in the Qur'an."),
    body: {
      bn: [
        "এই অল্প কয়েকটি ছোট শব্দ কুরআনে হাজার হাজার বার এসেছে। এগুলো চিনলে আয়াতের গঠন সহজে বোঝা যায়।",
        "কিছু হরফ আলাদা লেখা হয় না, শব্দের শুরুতে জুড়ে বসে: وَ (এবং), بِ (দিয়ে/সাথে), لِ (জন্য), فَ (সুতরাং/তারপর)।",
      ],
      en: [
        "These few small words occur thousands of times in the Qur'an. Knowing them makes the structure of an ayah easy to see.",
        "Some particles are not written separately but attach to the start of a word: وَ (and), بِ (with/by), لِ (for), فَ (so/then).",
      ],
    },
    examples: [
      {
        title: T("আলাদা হরফ", "Separate particles"),
        items: [
          ex("فِي", "মধ্যে", "in"),
          ex("مِنْ", "থেকে", "from"),
          ex("إِلَى", "দিকে, প্রতি", "to, towards"),
          ex("عَلَى", "উপর", "on"),
          ex("عَنْ", "থেকে, সম্পর্কে", "from, about"),
          ex("لَا", "না", "no, not"),
          ex("إِنَّ", "নিশ্চয়ই", "indeed"),
          ex("ثُمَّ", "তারপর", "then"),
        ],
      },
      {
        title: T("শব্দের শুরুতে জোড়া হরফ", "Particles joined to a word"),
        items: [ex("بِسْمِ", "নামে (بِ = দিয়ে/সাথে)", "in the name (بِ = with)"), ex("لِلَّهِ", "আল্লাহর জন্য (لِ = জন্য)", "for Allah (لِ = for)"), ex("وَالْأَرْضِ", "এবং জমিন (وَ = এবং)", "and the earth (وَ = and)"), ex("فَاتَّقُوا", "সুতরাং তাকওয়া অবলম্বন করো (فَ = সুতরাং)", "so fear (Allah) (فَ = so)")],
      },
    ],
    quiz: [
      { prompt: T("এর অর্থ কী?", "What does this mean?"), ar: "مِنْ", options: [T("থেকে", "from"), T("উপর", "on"), T("মধ্যে", "in")] },
      { prompt: T("এর অর্থ কী?", "What does this mean?"), ar: "عَلَى", options: [T("উপর", "on"), T("দিকে", "towards"), T("না", "not")] },
      { prompt: T("লিল্লাহ — শুরুর لِ মানে কী?", "In لِلَّهِ, what does لِ mean?"), ar: "لِلَّهِ", options: [T("জন্য", "for"), T("এবং", "and"), T("থেকে", "from")] },
    ],
  },
];

export const grammarLesson = (slug: string) => GRAMMAR_LESSONS.find((l) => l.slug === slug);
