import { siteConfig } from "../config";
import type I18nKey from "./i18nKey";
import { en } from "./languages/en";
import { zh_CN } from "./languages/zh_CN";

export type Translation = {
	[K in I18nKey]: string;
};

const defaultTranslation = zh_CN;

const map: { [key: string]: Translation } = {
	zh: zh_CN,
	zh_cn: zh_CN,
	zh_tw: zh_CN,
	zh_hk: zh_CN,
	en: en,
	en_us: en,
	en_gb: en,
	en_au: en,
};

export function getTranslation(lang: string): Translation {
	return map[lang.toLowerCase()] || defaultTranslation;
}

export function i18n(key: I18nKey): string {
	const lang = siteConfig.lang || "zh_CN";
	return getTranslation(lang)[key];
}
