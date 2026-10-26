import { Flag } from "lucide-react";
import { getDict } from "@/lib/i18n";
import { REPO_URL, SITE_URL } from "@/lib/constants";
import type { Locale } from "@/lib/types";

/** Opens a pre-filled GitHub issue for a wrong or unclear meaning. Server-safe (plain link). */
export function ReportMistake({ id, ar, bn, en, locale, className = "" }: { id: number; ar: string; bn: string; en: string; locale: Locale; className?: string }) {
  const t = getDict(locale);
  const title = `Meaning: ${ar} (#${id})`;
  const body = [
    `Word: ${ar} (lemma #${id})`,
    `Bangla: ${bn}`,
    `English: ${en}`,
    `Page: ${SITE_URL}/${locale}/w/${id}/`,
    "",
    "What is wrong / suggested correction:",
    "",
  ].join("\n");
  const href = `${REPO_URL}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  return (
    <a href={href} target="_blank" rel="noopener" className={`inline-flex items-center gap-1.5 text-sm text-muted hover:text-danger underline-offset-4 hover:underline ${className}`}>
      <Flag className="w-4 h-4" aria-hidden /> {t.common.report}
    </a>
  );
}
