import { getMessages } from "next-intl/server";
import { createTranslator } from "next-intl";

export async function getFormTranslation(formNamespace: string, locale: string) {
  const messages = await getMessages({ locale }); // pulls from current context

  return {
    page: createTranslator({
      locale,
      messages,
      namespace: `${formNamespace}.page`,
    }),
    validation: createTranslator({
      locale,
      messages,
      namespace: `${formNamespace}.validation`,
    }),
    errors: createTranslator({
      locale,
      messages,
      namespace: `${formNamespace}.errors`,
    }),
    toast: createTranslator({
      locale,
      messages,
      namespace: `${formNamespace}.toast`,
    }),
    messages: createTranslator({
      locale,
      messages,
      namespace: `${formNamespace}.messages`,
    }),
    // Create section function to get translators for any section
    section: (sectionName: string) => {
      return createTranslator({
        locale,
        messages,
        namespace: `${formNamespace}.${sectionName}`,
      });
    },
    locale,
  };
}
