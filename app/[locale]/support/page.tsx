import type { Metadata } from "next";
import { Bug, Code2, HandHeart, Share2 } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";
import { getDict } from "@/lib/i18n";
import { REPO_URL } from "@/lib/constants";
import type { Locale } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: getDict(locale).support.title,
    alternates: { canonical: `/${locale}/support/`, languages: { bn: "/bn/support/", en: "/en/support/" } },
  };
}

const content = {
  bn: {
    intro: "QuranEasy সবসময় বিনামূল্যে ও বিজ্ঞাপনমুক্ত থাকবে, ইনশাআল্লাহ। আপনিও এই সাদাকায়ে জারিয়ায় অংশ নিতে পারেন:",
    items: [
      ["দোয়া করুন", "আমাদের জন্য এবং যারা এখান থেকে শিখছেন তাদের জন্য দোয়া করুন।"],
      ["ছড়িয়ে দিন", "পরিবার, বন্ধু ও মসজিদের ভাই-বোনদের সাথে শেয়ার করুন। প্রত্যেকে যা শিখবে, তার সওয়াব আপনিও পাবেন।"],
      ["ভুল জানান", "কোনো অর্থ বা লেখায় ভুল দেখলে GitHub-এ ইস্যু খুলে জানান।"],
      ["কোডে অবদান রাখুন", "ডেভেলপার হলে GitHub-এ অবদান রাখুন — নতুন ফিচার, অনুবাদ বা ডিজাইনে।"],
    ],
    share: "শেয়ার করুন",
    report: "ভুল জানান",
    hadith: "“যে ব্যক্তি কোনো ভালো কাজের পথ দেখায়, সে ঐ কাজ সম্পাদনকারীর সমান সওয়াব পায়।” — সহীহ মুসলিম ১৮৯৩",
  },
  en: {
    intro: "QuranEasy will always stay free and ad-free, in sha Allah. You can take part in this sadaqah jariyah too:",
    items: [
      ["Make dua", "Pray for us and for everyone learning here."],
      ["Spread the word", "Share with family, friends and your masjid community. You share in the reward of everything they learn."],
      ["Report mistakes", "If you find a mistake in a meaning or text, open an issue on GitHub."],
      ["Contribute code", "If you are a developer, contribute on GitHub — features, translations or design."],
    ],
    share: "Share",
    report: "Report a mistake",
    hadith: "“Whoever guides someone to goodness will have a reward like the one who does it.” — Sahih Muslim 1893",
  },
};

const ICONS = [HandHeart, Share2, Bug, Code2];

export default async function SupportPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const c = content[locale];
  return (
    <article className="max-w-3xl mx-auto grid gap-6">
      <header>
        <h1 className="text-3xl font-bold">{t.support.title}</h1>
        <p className="mt-3 text-lg">{c.intro}</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {c.items.map(([title, text], i) => {
          const Icon = ICONS[i];
          return (
            <div key={title} className="card p-6">
              <span className="w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center">
                <Icon className="w-6 h-6" aria-hidden />
              </span>
              <h2 className="font-bold text-lg mt-3">{title}</h2>
              <p className="text-muted mt-1">{text}</p>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3">
        <ShareButton label={c.share} />
        <a href={`${REPO_URL}/issues/new`} target="_blank" rel="noopener" className="btn btn-secondary btn-lg">
          <Bug className="w-5 h-5" aria-hidden /> {c.report}
        </a>
      </div>
      <p className="text-center text-lg font-semibold mt-4">{c.hadith}</p>
    </article>
  );
}
