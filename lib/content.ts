import type { Lang } from "./i18n";
import { site } from "./site";
import { siteEs } from "./site.es";

// Server-only: keeps both copies of the long-form content out of client bundles.
export const getSite = (lang: Lang) => (lang === "es" ? siteEs : site);
