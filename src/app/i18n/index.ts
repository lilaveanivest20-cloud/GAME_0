import { ukTranslations } from './uk';
import { enTranslations } from './en';
import { ArchipelagoTranslations } from './translations.interface';

export * from './translations.interface';
export * from './uk';
export * from './en';

export const translationsMap: Record<'uk' | 'en', ArchipelagoTranslations> = {
  uk: ukTranslations,
  en: enTranslations,
};
