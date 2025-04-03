import { useLocale, useTranslations } from "next-intl";

export function useFormTranslation(namespace: string) {
  const t = useTranslations(namespace);
  const locale = useLocale();

  return {
    page: (key: string): any => t(`page.${key}`),
    validation: (key: string) => t(`validation.${key}`),
    errors: (key: string) => t(`errors.${key}`),
    toast: (key: string) => t(`toast.${key}`),
    buttons: (key: string) => t(`buttons.${key}`),
    messages: (key: string) => t(`messages.${key}`),
    section: (section: string) => (key: string) => t(`${section}.${key}`),
    locale: locale,
  };
}
