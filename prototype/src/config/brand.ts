// Everything brand-specific lives here so the prototype can be renamed in one place.
export const BRAND = {
  name: "Cusp",
  legalName: "Cusp Dental Supply",
  tagline: "Dental student supplies, handled.",
  owner: { name: "Youssef", fullName: "Youssef Adel", role: "Owner" },
  phone: "+20 100 555 0142",
  whatsapp: "+20 100 555 0142",
  email: "hello@cusp.example",
  trackingDomain: "cusp.example/t",
  currency: "EGP",
  city: "Cairo",
  hours: "Sat–Thu · 10:00–22:00",
};

// The prototype runs on a fixed "now" so every number and timeline stays consistent.
export const NOW = new Date(2026, 9, 9, 10, 24); // Fri 9 Oct 2026, 10:24
