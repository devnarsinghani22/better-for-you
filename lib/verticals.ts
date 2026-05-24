// "Better for You" verticals. Foods is the live catalog (served at "/");
// the rest are teaser sections with a "coming soon" page that captures
// interest. Add a vertical by appending one entry here — the header nav and
// the /v/[vertical] route both read from this list.
export type VerticalStatus = "live" | "soon";

export type Vertical = {
  slug: string;
  label: string; // shown in the nav
  href: string;
  status: VerticalStatus;
  tagline?: string; // shown on the coming-soon page
  blurb?: string;
};

export const VERTICALS: Vertical[] = [
  {
    slug: "foods",
    label: "Foods",
    href: "/",
    status: "live",
  },
  {
    slug: "restaurants",
    label: "Restaurants",
    href: "/v/restaurants",
    status: "soon",
    tagline: "Places that cook with ingredients worth trusting.",
    blurb:
      "We are extending the same label-first scrutiny to restaurants and cloud kitchens — what they cook with, not just what they claim. Leave your details and we will tell you the moment it is live.",
  },
  {
    slug: "skincare",
    label: "Skincare",
    href: "/v/skincare",
    status: "soon",
    tagline: "Skincare with ingredient lists worth reading.",
    blurb:
      "Skincare labels can be just as misleading as food labels. We are building the same honest, non-sponsored review for what you put on your skin. Leave your details to hear first.",
  },
];

export function getVertical(slug: string): Vertical | undefined {
  return VERTICALS.find((v) => v.slug === slug);
}

export const comingSoonVerticals = VERTICALS.filter((v) => v.status === "soon");
