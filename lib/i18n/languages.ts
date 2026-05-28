// Languages offered for on-page ingredient translation. `en` is the verbatim
// source text (no stored translation); every other code is a key inside a
// product's `ingredients_i18n` JSONB. Labels are in the native script so a
// reader recognises their own language without needing English.
export const INGREDIENT_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "bn", label: "বাংলা" },
  { code: "mr", label: "मराठी" },
  { code: "te", label: "తెలుగు" },
  { code: "ta", label: "தமிழ்" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ml", label: "മലയാളം" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "or", label: "ଓଡ଼ିଆ" },
] as const;

// The translatable subset (everything except the English source), used by the
// batch translation script as the set of keys to generate.
export const TRANSLATION_LANGUAGES = INGREDIENT_LANGUAGES.filter(
  (l) => l.code !== "en",
);
