import type { Metadata } from "next";
import { getDict, num } from "@/lib/i18n";
import { REPO_URL, TOTAL_LEMMAS, TOTAL_WORDS } from "@/lib/constants";
import type { Locale } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: getDict(locale).about.title,
    alternates: { canonical: `/${locale}/about/`, languages: { bn: "/bn/about/", en: "/en/about/" } },
  };
}

const content = {
  bn: {
    intro: "QuranEasy একটি সম্পূর্ণ বিনামূল্যের ওয়েবসাইট, যেখানে বাংলা ও ইংরেজিভাষীরা কুরআনের প্রতিটি শব্দের অর্থ সহজে শিখতে পারেন। এটি আল্লাহর সন্তুষ্টি ও সাদাকায়ে জারিয়ার নিয়তে তৈরি।",
    methodTitle: "শেখার পদ্ধতি",
    method: [
      ["বেশি ব্যবহৃত শব্দ আগে", `কুরআনে মোট ${num("bn", TOTAL_WORDS)}টি শব্দ আছে, কিন্তু মূল শব্দ মাত্র ${num("bn", TOTAL_LEMMAS)}টি। সবচেয়ে বেশি ব্যবহৃত ৩০০টি মূল শব্দ জানলেই কুরআনের প্রায় ৭৪% শব্দ চিনতে পারবেন।`],
      ["স্পেসড রিপিটিশন (FSRS)", "আধুনিক FSRS অ্যালগরিদম হিসাব করে কোন শব্দ কখন ভুলে যেতে পারেন, এবং ঠিক তার আগেই শব্দটি আবার দেখায়। এতে কম সময়ে বেশি মনে থাকে।"],
      ["সক্রিয় স্মরণ", "উত্তর দেখার আগে নিজে মনে করার চেষ্টা (active recall) গবেষণায় প্রমাণিত সবচেয়ে কার্যকর শেখার উপায়গুলোর একটি।"],
      ["প্রসঙ্গসহ শেখা", "প্রতিটি শব্দ আসল আয়াতের ভেতরে, তিলাওয়াত ও উচ্চারণসহ দেখানো হয়। মূল অক্ষর (root) দেখে একই পরিবারের শব্দগুলো সহজে চেনা যায়।"],
    ],
    sourcesTitle: "তথ্যসূত্র",
    sources: [
      ["শব্দে শব্দে অর্থ, উচ্চারণ ও তিলাওয়াত", "Quran.com (Quran Foundation) API ও QuranCDN"],
      ["শব্দের মূল রূপ (lemma) ও মূল অক্ষর (root)", "Quranic Arabic Corpus — corpus.quran.com (GNU GPL)"],
      ["বাংলা অনুবাদ", "তাইসীরুল কুরআন — তাওহীদ পাবলিকেশন্স"],
      ["ইংরেজি অনুবাদ", "Saheeh International"],
    ],
    accuracyTitle: "নির্ভুলতা সম্পর্কে",
    accuracy: "প্রতিটি মূল শব্দের সংক্ষিপ্ত অর্থ কুরআনে শব্দটি যেভাবে বেশি এসেছে তার অর্থ থেকে স্বয়ংক্রিয়ভাবে বাছাই করা হয়েছে। কোথাও ভুল চোখে পড়লে GitHub-এ জানাবেন — আমরা দ্রুত সংশোধন করব, ইনশাআল্লাহ। গভীর অধ্যয়নের জন্য অবশ্যই নির্ভরযোগ্য আলেম ও তাফসীরের সাহায্য নিন।",
    privacyTitle: "গোপনীয়তা",
    privacy: "কোনো অ্যাকাউন্ট বা লগইন নেই। আপনার শেখার সব তথ্য শুধু আপনার ডিভাইসের ব্রাউজারে থাকে — আমাদের কোনো সার্ভারে যায় না। কোনো বিজ্ঞাপন বা ট্র্যাকিং কুকি নেই।",
    openTitle: "ওপেন সোর্স",
    open: "এই প্রজেক্টের সম্পূর্ণ কোড GitHub-এ উন্মুক্ত। যে কেউ উন্নয়নে অংশ নিতে পারেন।",
  },
  en: {
    intro: "QuranEasy is a completely free website that helps Bangla and English speakers learn the meaning of every word in the Qur'an. It is built seeking the pleasure of Allah, as sadaqah jariyah.",
    methodTitle: "The learning method",
    method: [
      ["Most frequent words first", `The Qur'an has ${num("en", TOTAL_WORDS)} words but only ${num("en", TOTAL_LEMMAS)} base words (lemmas). Knowing the 300 most frequent lemmas lets you recognise about 74% of all the words in the Qur'an.`],
      ["Spaced repetition (FSRS)", "The modern FSRS algorithm predicts when you are about to forget a word and shows it again just before that moment, so you remember more in less time."],
      ["Active recall", "Trying to remember before seeing the answer is one of the most effective learning techniques known from research."],
      ["Learning in context", "Every word is shown inside a real ayah, with recitation and pronunciation. Root letters help you recognise whole families of related words."],
    ],
    sourcesTitle: "Sources",
    sources: [
      ["Word-by-word meanings, transliteration and recitation", "Quran.com (Quran Foundation) API and QuranCDN"],
      ["Lemmas and root letters", "Quranic Arabic Corpus — corpus.quran.com (GNU GPL)"],
      ["Bangla translation", "Taisirul Quran — Tawheed Publication"],
      ["English translation", "Saheeh International"],
    ],
    accuracyTitle: "About accuracy",
    accuracy: "Each lemma's short meaning is chosen automatically from how the word is most often translated in the Qur'an. If you spot a mistake, please report it on GitHub and we will fix it quickly, in sha Allah. For deeper study, always consult trustworthy scholars and tafsir.",
    privacyTitle: "Privacy",
    privacy: "No account or login. All your learning data stays in your own browser on your device — it never reaches our servers. No ads, no tracking cookies.",
    openTitle: "Open source",
    open: "The complete source code is open on GitHub. Anyone is welcome to contribute.",
  },
};

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const c = content[locale];
  const h2 = "text-2xl font-bold mb-3";
  return (
    <article className="max-w-3xl mx-auto grid gap-8">
      <header>
        <h1 className="text-3xl font-bold">{t.about.title}</h1>
        <p className="mt-3 text-lg">{c.intro}</p>
      </header>
      <section>
        <h2 className={h2}>{c.methodTitle}</h2>
        <div className="grid gap-3">
          {c.method.map(([title, text]) => (
            <div key={title} className="card p-5">
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-muted mt-1">{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section id="sources" className="scroll-mt-24">
        <h2 className={h2}>{c.sourcesTitle}</h2>
        <ul className="card divide-y divide-border">
          {c.sources.map(([what, who]) => (
            <li key={what} className="p-4">
              <span className="block font-semibold">{what}</span>
              <span className="block text-muted">{who}</span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className={h2}>{c.accuracyTitle}</h2>
        <p className="text-lg">{c.accuracy}</p>
      </section>
      <section>
        <h2 className={h2}>{c.privacyTitle}</h2>
        <p className="text-lg">{c.privacy}</p>
      </section>
      <section>
        <h2 className={h2}>{c.openTitle}</h2>
        <p className="text-lg">{c.open}</p>
        <a href={REPO_URL} target="_blank" rel="noopener" className="btn btn-secondary mt-3">GitHub</a>
      </section>
    </article>
  );
}
