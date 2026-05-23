/**
 * Brand-onboarding form for "Better for You by Food Pharmer".
 *
 * HOW TO USE (one-time, ~30 seconds):
 *   1. Go to https://script.google.com → "New project"
 *   2. Paste this whole file into Code.gs (replace the default function)
 *   3. Click "Run" (top toolbar) → first run will ask for permissions → Allow
 *   4. After it finishes, open the View → Executions log — it prints two URLs:
 *        - EDIT URL  → for you to tweak the form later
 *        - PUBLISH URL → the public submission link to share with brands
 *   5. The form is now created in your Google Drive (named below). The team
 *      collects responses by clicking the form's "Responses" tab, or you can
 *      wire it to a Google Sheet from there.
 *
 * If you want responses to go straight to a specific Drive folder, replace
 * RESPONSES_FOLDER_ID below with the folder ID from its URL.
 */

const FORM_TITLE = "Brand submission — Better for You by Food Pharmer";
const RESPONSES_FOLDER_ID = ""; // optional: paste a Google Drive folder ID

// Categories must match active categories on foodpharmer.health/criteria
const CATEGORIES = [
  "Biscuits",
  "Noodles",
  "Paneer",
  "Paneer (High Protein)",
  "Tofu",
  "Tempeh",
  "Makhana",
  "Peanut Butter",
  "Yogurt",
  "Other / Not listed",
];

function createBrandSubmissionForm() {
  const form = FormApp.create(FORM_TITLE);
  form.setDescription(
    "We review submissions against our published criteria " +
    "(foodpharmer.health/criteria). Submission does not guarantee a listing — " +
    "if your product meets the rules for its category, we will reach out to " +
    "verify and list it. We do not charge a fee or accept paid placement.\n\n" +
    "BEFORE YOU APPLY — minimum bar for consideration:\n" +
    "  • You own the brand / IP (we do not list re-sellers)\n" +
    "  • FSSAI Central or State licence (not Basic / Registration)\n" +
    "  • GST registered\n" +
    "  • Live listing on at least one of Amazon, Blinkit, Zepto, Instamart, BigBasket, or your own D2C site\n" +
    "  • Product has been on shelves for 6+ months\n\n" +
    "If you do not meet these, please do not apply yet — we will not be able to consider the submission.\n\n" +
    "One submission = one product (one SKU). If you have multiple, submit " +
    "the form once per product. Allow 7–14 working days for a response."
  );
  form.setCollectEmail(true);
  form.setLimitOneResponsePerUser(false);
  form.setShowLinkToRespondAgain(true);
  form.setProgressBar(true);
  form.setConfirmationMessage(
    "Thanks for submitting. We will email you within 7–14 working days. " +
    "If your product meets our category criteria, we will reach out for " +
    "verification (pack photos, lab reports if applicable) before listing."
  );

  // ---------- Section 1: Eligibility (hard gates, asked up front so unqualified brands self-exit) ----------
  form.addSectionHeaderItem()
    .setTitle("1. Eligibility check")
    .setHelpText("All five must be Yes for us to consider the submission.");

  form.addMultipleChoiceItem()
    .setTitle("Do you own this brand / hold the IP? (Re-sellers and distributors should not submit.)")
    .setChoiceValues(["Yes — we are the brand owner / manufacturer", "No — we re-sell someone else's brand"])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("FSSAI licence type")
    .setHelpText("Basic / Registration is for FBOs with turnover under ₹12 lakh and is not enough for us to list.")
    .setChoiceValues(["Central licence", "State licence", "Basic / Registration only"])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("Is the brand GST-registered?")
    .setChoiceValues(["Yes", "No"])
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle("Where is the product live today? (tick at least one)")
    .setHelpText("We will verify every listing you tick. Local kirana / WhatsApp orders do not count.")
    .setChoiceValues([
      "Amazon India",
      "Flipkart",
      "Blinkit",
      "Zepto",
      "Swiggy Instamart",
      "BigBasket",
      "Brand-own D2C website",
    ])
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("How long has the product been on shelves?")
    .setChoiceValues(["Less than 6 months", "6–12 months", "1–2 years", "2+ years"])
    .setRequired(true);

  // ---------- Section 2: Brand contact ----------
  form.addPageBreakItem().setTitle("2. Brand contact").setHelpText("So we can reach you.");

  form.addTextItem().setTitle("Brand name").setRequired(true);
  form.addTextItem().setTitle("Contact person — full name").setRequired(true);
  form.addTextItem().setTitle("Role at the brand")
    .setHelpText("e.g. Founder, Marketing Lead, R&D Head")
    .setRequired(true);
  form.addTextItem().setTitle("Phone (with country code)").setRequired(true);
  form.addTextItem().setTitle("Brand website URL")
    .setHelpText("Your own domain — not a Linktree, Instagram profile, or marketplace page.")
    .setRequired(true);
  form.addTextItem().setTitle("Brand Instagram handle")
    .setHelpText("e.g. @yourbrand");
  form.addTextItem().setTitle("GST number (15 digits)").setRequired(true);

  // ---------- Section 3: Product details ----------
  form.addPageBreakItem().setTitle("3. Product details");
  form.addTextItem()
    .setTitle("Product name (verbatim from pack)")
    .setHelpText("Write it EXACTLY as printed on the front of pack, including descriptors.")
    .setRequired(true);

  form.addListItem()
    .setTitle("Category")
    .setChoiceValues(CATEGORIES)
    .setRequired(true);

  form.addTextItem()
    .setTitle("Variant / pack size")
    .setHelpText('e.g. "1 kg pouch", "350g jar", "200g x 6"')
    .setRequired(true);

  form.addTextItem().setTitle("MRP (₹, all-inclusive)").setRequired(true);

  // ---------- Section 4: Where it's listed ----------
  form.addPageBreakItem().setTitle("4. Where your product is listed");
  form.addParagraphTextItem()
    .setTitle("Paste links — leave blank if not listed there yet")
    .setHelpText("One link per platform. We verify against the live page on each.");

  form.addTextItem().setTitle("Amazon India product URL").setRequired(true);
  form.addTextItem().setTitle("Flipkart product URL");
  form.addTextItem().setTitle("Blinkit product URL");
  form.addTextItem().setTitle("Zepto product URL");
  form.addTextItem().setTitle("Swiggy Instamart product URL");
  form.addTextItem().setTitle("BigBasket product URL");
  form.addTextItem().setTitle("Brand-own website product URL");
  form.addParagraphTextItem()
    .setTitle("Offline / general trade availability")
    .setHelpText("Cities + retail chains where available offline. Leave blank if D2C/online only.");

  // ---------- Section 5: Compliance ----------
  form.addPageBreakItem().setTitle("5. Compliance & manufacturing");

  form.addTextItem()
    .setTitle("FSSAI licence number (14 digits)")
    .setHelpText("Printed on every pack. Must match the licence type you ticked in section 1.")
    .setRequired(true);

  form.addTextItem()
    .setTitle("Manufacturer state + city")
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("Manufacturing model")
    .setChoiceValues([
      "Manufactured in-house",
      "Contract / private-label manufacturing",
      "Imported and re-packed",
    ])
    .setRequired(true);

  form.addTextItem()
    .setTitle("Contract manufacturer name (if applicable)")
    .setHelpText("Leave blank if manufactured in-house");

  // ---------- Section 6: Ingredients + nutrition (the criteria check) ----------
  form.addPageBreakItem()
    .setTitle("6. Ingredients & nutrition")
    .setHelpText("This is what we evaluate against our category criteria. Copy verbatim from the pack — we will verify against your label image.");

  form.addParagraphTextItem()
    .setTitle("Full ingredient list — verbatim from pack")
    .setHelpText("Type EXACTLY as printed, including order, percentages, and brackets. Example: 'Wheat flour (60%), Sugar, Edible vegetable oil (Palm), Salt, Raising agents (E500ii, E503ii), …'")
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle("Nutrition per 100g (verbatim from pack)")
    .setHelpText("Energy (kcal), Protein, Carbs (of which Sugar), Fat (of which Saturated, Trans), Fiber, Sodium, plus anything else listed.")
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle("Certifications (check all that apply)")
    .setChoiceValues([
      "FSSAI Organic (Jaivik Bharat)",
      "USDA Organic",
      "India Organic (NPOP)",
      "Plant-based certified",
      "Gluten-free certified",
      "Halal certified",
      "Kosher certified",
      "None / In progress",
    ]);

  form.addParagraphTextItem()
    .setTitle("Other certifications or quality marks")
    .setHelpText("Any additional certifications not listed above");

  // ---------- Section 7: Verification material ----------
  form.addPageBreakItem()
    .setTitle("7. Verification material (uploads)")
    .setHelpText("We cannot list without these.");

  form.addFileUploadItem()
    .setTitle("Front-of-pack image")
    .setHelpText("Clear photo, full pack visible, label readable")
    .setRequired(true);

  form.addFileUploadItem()
    .setTitle("Back-of-pack — ingredient list + nutrition table")
    .setHelpText("Must be sharp enough to read every line")
    .setRequired(true);

  form.addFileUploadItem()
    .setTitle("Lab test reports (optional, recent only)")
    .setHelpText("NABL-certified lab reports for the product. Boosts trust + may qualify the product as 'Lab tested' on the site.");

  // ---------- Section 8: Brand statement ----------
  form.addPageBreakItem().setTitle("8. In your own words");
  form.addParagraphTextItem()
    .setTitle("Why is this product 'better for you' than the category average?")
    .setHelpText("Max ~200 words. Compare your formulation to typical alternatives in the same category.")
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle("Anything else our team should know?")
    .setHelpText("Awards, recalls, public reformulations, anything relevant.");

  // ---------- Section 9: Acknowledgements ----------
  form.addPageBreakItem().setTitle("9. Acknowledgements");
  form.addCheckboxItem()
    .setTitle("Please confirm — all required to submit")
    .setChoiceValues([
      "I confirm we are NOT paying any fee or providing any consideration to be listed.",
      "I understand the team re-checks listings every 6 months and may de-list on reformulation.",
      "I will notify foodpharmer-approved within 30 days of any formulation or pack change.",
      "I confirm all information above is accurate and matches what is printed on the live, current pack.",
    ])
    .setRequired(true);

  // Move responses into a specific folder if configured
  if (RESPONSES_FOLDER_ID) {
    try {
      const file = DriveApp.getFileById(form.getId());
      DriveApp.getFolderById(RESPONSES_FOLDER_ID).addFile(file);
      DriveApp.getRootFolder().removeFile(file);
    } catch (e) {
      Logger.log("Could not move form to folder: " + e);
    }
  }

  Logger.log("==========================================");
  Logger.log("FORM CREATED.");
  Logger.log("Edit URL    : " + form.getEditUrl());
  Logger.log("Publish URL : " + form.getPublishedUrl());
  Logger.log("Short URL   : " + form.shortenFormUrl(form.getPublishedUrl()));
  Logger.log("==========================================");
}
