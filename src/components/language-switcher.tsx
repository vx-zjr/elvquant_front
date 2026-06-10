import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { dictionaries } from "@/lib/i18n";

type LanguageSwitcherProps = {
  locale: Locale;
  pathname: string;
};

export function LanguageSwitcher({ locale, pathname }: LanguageSwitcherProps) {
  const dictionary = dictionaries[locale];
  return (
    <div className="language-switcher" aria-label={dictionary.languageLabel}>
      <Link className={locale === "zh" ? "active" : ""} href={`${pathname}?lang=zh`}>
        {dictionary.switchToChinese}
      </Link>
      <Link className={locale === "en" ? "active" : ""} href={`${pathname}?lang=en`}>
        {dictionary.switchToEnglish}
      </Link>
    </div>
  );
}
