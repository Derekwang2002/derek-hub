import type { ReactNode } from "react";
import type { ContentLocale } from "../../lib/locale";
import { getHomeNavigationSections } from "./home-navigation-data";
import { HomeNavigation } from "./home-navigation";

export async function PrimaryPageNavigation({ children, locale, current }: { children: ReactNode; locale: ContentLocale; current: string }) {
  return <HomeNavigation key={`${locale}-${current}`} locale={locale} current={current} sections={await getHomeNavigationSections(locale)}>{children}</HomeNavigation>;
}
