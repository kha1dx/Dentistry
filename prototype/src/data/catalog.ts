import type { Category, Kit, Product, ServicePartner, Subject, Supplier, University, YearOfStudy } from "./types";

export const UNIVERSITIES: University[] = [
  { id: "cu", name: "Cairo University", short: "Cairo Uni", campus: "Kasr Al Ainy gate, Manial", area: "Manial" },
  { id: "asu", name: "Ain Shams University", short: "Ain Shams", campus: "Faculty gate, Abbasia", area: "Abbasia" },
  { id: "azhar", name: "Al-Azhar University", short: "Al-Azhar", campus: "Nasr City campus", area: "Nasr City" },
  { id: "fue", name: "Future University in Egypt", short: "FUE", campus: "Main gate, New Cairo", area: "New Cairo" },
  { id: "bue", name: "British University in Egypt", short: "BUE", campus: "Gate 2, El Shorouk", area: "El Shorouk" },
  { id: "msa", name: "MSA University", short: "MSA", campus: "Dentistry building, 6th of October", area: "6th of October" },
  { id: "miu", name: "Misr International University", short: "MIU", campus: "Main gate, Obour road", area: "Obour" },
];

export const uni = (id: string) => UNIVERSITIES.find((u) => u.id === id)!;

export const YEAR_LABEL: Record<YearOfStudy, string> = {
  1: "1st year",
  2: "2nd year",
  3: "3rd year",
  4: "4th year",
  5: "5th year",
  6: "Intern",
};

export const CATEGORIES: Category[] = [
  "Handpieces & motors",
  "Hand instruments",
  "Burs & rotary",
  "Typodonts & teeth",
  "Materials",
  "Endo",
  "Lab & PPE",
];

export const SUBJECTS: Subject[] = [
  "Anatomy & carving",
  "Operative",
  "Removable prosth",
  "Fixed prosth",
  "Endodontics",
  "Periodontics",
  "Oral surgery",
  "Clinic",
  "Lab",
];

const all: YearOfStudy[] = [1, 2, 3, 4, 5, 6];

// prettier-ignore
export const PRODUCTS: Product[] = [
  // Handpieces & motors
  { id: "p01", sku: "HP-NSK-PMX", name: "Pana-Max high-speed handpiece", brand: "NSK", category: "Handpieces & motors", subject: "Operative", years: [2,3,4,5,6], cost: 3900, price: 4950, stock: 6, reorderPoint: 5, supplierId: "s1", art: "handpiece", description: "Push-button chuck, single spray, standard head. The workhorse for preclinical and clinic.", warrantyMonths: 12, serviceable: true },
  { id: "p02", sku: "HP-CX207", name: "CX207 high-speed handpiece", brand: "COXO", category: "Handpieces & motors", subject: "Operative", years: [2,3], cost: 1450, price: 1950, stock: 11, reorderPoint: 6, supplierId: "s3", art: "handpiece", description: "Budget push-button turbine for preclinical lab work.", warrantyMonths: 6, serviceable: true },
  { id: "p03", sku: "HP-NSK-EX203", name: "EX-203 low-speed set (contra, straight, air motor)", brand: "NSK", category: "Handpieces & motors", subject: "Operative", years: [2,3,4,5], cost: 5200, price: 6600, stock: 3, reorderPoint: 4, supplierId: "s1", art: "contra", description: "1:1 contra-angle, straight nose and air motor in one set.", warrantyMonths: 12, serviceable: true },
  { id: "p04", sku: "MM-S204", name: "Strong 204 micromotor, 35,000 rpm", brand: "Saeshin", category: "Handpieces & motors", subject: "Lab", years: [1,2,3], cost: 4300, price: 5450, stock: 2, reorderPoint: 4, supplierId: "s2", art: "micromotor", description: "Lab micromotor with foot pedal. Standard for prosth and carving labs.", warrantyMonths: 12, serviceable: true },
  { id: "p05", sku: "MM-N7", name: "Marathon N7 lab micromotor", brand: "Marathon", category: "Handpieces & motors", subject: "Lab", years: [1,2,3], cost: 2250, price: 2950, stock: 9, reorderPoint: 4, supplierId: "s3", art: "micromotor", description: "Lighter-duty lab micromotor, good first motor.", warrantyMonths: 6, serviceable: true },
  { id: "p06", sku: "CL-LEDB", name: "LED.B curing light", brand: "Woodpecker", category: "Handpieces & motors", subject: "Clinic", years: [3,4,5,6], cost: 2600, price: 3350, stock: 7, reorderPoint: 4, supplierId: "s2", art: "curing", description: "Cordless LED curing light with 3 modes.", warrantyMonths: 12, serviceable: true },
  { id: "p07", sku: "EM-SMART", name: "Endo Smart+ endo motor", brand: "Woodpecker", category: "Handpieces & motors", subject: "Endodontics", years: [4,5,6], cost: 4800, price: 6100, stock: 4, reorderPoint: 2, supplierId: "s2", art: "endomotor", description: "Cordless endo motor with auto-reverse.", warrantyMonths: 12, serviceable: true },
  { id: "p08", sku: "SC-UDSK", name: "UDS-K ultrasonic scaler", brand: "Woodpecker", category: "Handpieces & motors", subject: "Periodontics", years: [4,5,6], cost: 5900, price: 7400, stock: 2, reorderPoint: 2, supplierId: "s2", art: "scaler", description: "Ultrasonic scaler with 5 tips.", warrantyMonths: 12, serviceable: true },

  // Hand instruments
  { id: "p09", sku: "IN-DIAG", name: "Diagnostic set: mirror, probe, tweezer", brand: "Medesy", category: "Hand instruments", subject: "Clinic", years: [2,3,4,5,6], cost: 260, price: 380, stock: 34, reorderPoint: 15, supplierId: "s1", art: "mirror", description: "Stainless steel, autoclavable." },
  { id: "p10", sku: "IN-OP12", name: "Operative hand instrument set, 12 pcs", brand: "Medesy", category: "Hand instruments", subject: "Operative", years: [2,3], cost: 1650, price: 2250, stock: 8, reorderPoint: 8, supplierId: "s1", art: "instruments", description: "Excavators, chisels, hatchets, gingival margin trimmers." },
  { id: "p11", sku: "IN-AMAL", name: "Amalgam carrier and condensers", brand: "Medesy", category: "Hand instruments", subject: "Operative", years: [2,3], cost: 290, price: 420, stock: 21, reorderPoint: 10, supplierId: "s1", art: "instruments", description: "Double-ended carrier with two condensers." },
  { id: "p12", sku: "IN-COMP5", name: "Composite instrument set, 5 pcs", brand: "Medesy", category: "Hand instruments", subject: "Operative", years: [3,4,5], cost: 520, price: 760, stock: 14, reorderPoint: 8, supplierId: "s1", art: "instruments", description: "Non-stick coated placement instruments." },
  { id: "p13", sku: "IN-PKT", name: "Le Cron carver and PKT waxing set", brand: "Medesy", category: "Hand instruments", subject: "Anatomy & carving", years: [1,2], cost: 340, price: 520, stock: 26, reorderPoint: 12, supplierId: "s1", art: "carver", description: "Everything for tooth carving in dental anatomy." },
  { id: "p14", sku: "IN-GRACEY", name: "Gracey curette set, 7 pcs", brand: "Medesy", category: "Hand instruments", subject: "Periodontics", years: [4,5], cost: 1900, price: 2550, stock: 5, reorderPoint: 4, supplierId: "s1", art: "instruments", description: "Area-specific curettes 1/2 to 13/14." },
  { id: "p15", sku: "IN-FORC8", name: "Extraction forceps set, 8 pcs", brand: "Medesy", category: "Hand instruments", subject: "Oral surgery", years: [4,5,6], cost: 3400, price: 4300, stock: 4, reorderPoint: 3, supplierId: "s1", art: "forceps", description: "Upper and lower universal, molars, roots." },
  { id: "p16", sku: "IN-ELEV3", name: "Elevator set, 3 pcs", brand: "Medesy", category: "Hand instruments", subject: "Oral surgery", years: [4,5,6], cost: 520, price: 750, stock: 10, reorderPoint: 5, supplierId: "s1", art: "forceps", description: "Straight and Cryer pair." },
  { id: "p17", sku: "IN-PROSLAB", name: "Prosth lab kit: wax knife, spatula, bowl", brand: "Generic", category: "Hand instruments", subject: "Removable prosth", years: [2,3], cost: 610, price: 880, stock: 17, reorderPoint: 10, supplierId: "s4", art: "carver", description: "Wax knife, plaster spatula, rubber bowl, Bunsen-safe tray." },

  // Burs & rotary
  { id: "p18", sku: "BR-DIA20", name: "Diamond bur kit FG, 20 pcs", brand: "Mani", category: "Burs & rotary", subject: "Operative", years: [2,3,4,5,6], cost: 520, price: 780, stock: 41, reorderPoint: 20, supplierId: "s3", art: "burs", description: "Round, pear, flat-end taper, flame and inverted cone." },
  { id: "p19", sku: "BR-CARB10", name: "Carbide bur set, 10 pcs", brand: "Jota", category: "Burs & rotary", subject: "Operative", years: [2,3], cost: 380, price: 560, stock: 19, reorderPoint: 12, supplierId: "s3", art: "burs", description: "FG carbide burs for cavity prep." },
  { id: "p20", sku: "BR-ACRY", name: "Acrylic trimming bur set (HP)", brand: "Jota", category: "Burs & rotary", subject: "Removable prosth", years: [2,3], cost: 290, price: 450, stock: 6, reorderPoint: 10, supplierId: "s3", art: "burs", description: "Tungsten carbide trimmers for dentures." },
  { id: "p21", sku: "BR-POL", name: "Composite polishing kit", brand: "Shofu", category: "Burs & rotary", subject: "Operative", years: [3,4,5,6], cost: 690, price: 980, stock: 12, reorderPoint: 6, supplierId: "s1", art: "burs", description: "Cups, points and discs." },

  // Typodonts & teeth
  { id: "p22", sku: "TY-32", name: "Typodont with 32 removable teeth", brand: "Nissin-type", category: "Typodonts & teeth", subject: "Operative", years: [2,3], cost: 2700, price: 3600, stock: 4, reorderPoint: 8, supplierId: "s4", art: "typodont", description: "Screw-retained teeth, soft gingiva, articulated jaws." },
  { id: "p23", sku: "TY-T32", name: "Replacement typodont teeth, set of 32", brand: "Nissin-type", category: "Typodonts & teeth", subject: "Fixed prosth", years: [2,3,4], cost: 650, price: 950, stock: 15, reorderPoint: 10, supplierId: "s4", art: "teeth", description: "Prep-ready resin teeth matching the typodont." },
  { id: "p24", sku: "TY-ACR28", name: "Acrylic denture teeth, 28, shade A2", brand: "Major", category: "Typodonts & teeth", subject: "Removable prosth", years: [2,3], cost: 120, price: 190, stock: 64, reorderPoint: 30, supplierId: "s4", art: "teeth", description: "Full set for complete denture setup." },
  { id: "p25", sku: "TY-ENDOB", name: "Endo training blocks, 10", brand: "Generic", category: "Typodonts & teeth", subject: "Endodontics", years: [3,4], cost: 330, price: 480, stock: 22, reorderPoint: 10, supplierId: "s3", art: "teeth", description: "Clear resin blocks with simulated canals." },

  // Materials
  { id: "p26", sku: "MT-Z250", name: "Composite kit, 4 shades", brand: "Filtek Z250", category: "Materials", subject: "Operative", years: [3,4,5,6], cost: 1550, price: 2050, stock: 10, reorderPoint: 8, supplierId: "s1", art: "syringe", description: "A1, A2, A3, B2 syringes." },
  { id: "p27", sku: "MT-FUJI9", name: "Glass ionomer restorative", brand: "GC Fuji IX", category: "Materials", subject: "Operative", years: [3,4,5,6], cost: 820, price: 1150, stock: 9, reorderPoint: 5, supplierId: "s1", art: "jar", description: "Powder and liquid pack." },
  { id: "p28", sku: "MT-ALG", name: "Alginate impression material, 453 g", brand: "Zhermack", category: "Materials", subject: "Removable prosth", years: [2,3,4,5], cost: 230, price: 340, stock: 38, reorderPoint: 20, supplierId: "s4", art: "jar", description: "Fast set, chromatic." },
  { id: "p29", sku: "MT-STONE3", name: "Dental stone type III, 1 kg", brand: "Generic", category: "Materials", subject: "Removable prosth", years: [2,3], cost: 95, price: 160, stock: 70, reorderPoint: 30, supplierId: "s4", art: "jar", description: "For study and working casts." },
  { id: "p30", sku: "MT-WAX", name: "Modeling wax sheets, 500 g", brand: "Cavex", category: "Materials", subject: "Anatomy & carving", years: [1,2,3], cost: 260, price: 380, stock: 29, reorderPoint: 15, supplierId: "s4", art: "wax", description: "Pink base plate wax." },
  { id: "p31", sku: "MT-ACRY", name: "Self-cure acrylic resin kit", brand: "Acrostone", category: "Materials", subject: "Removable prosth", years: [2,3], cost: 340, price: 490, stock: 13, reorderPoint: 10, supplierId: "s4", art: "jar", description: "Powder and monomer." },
  { id: "p32", sku: "MT-BOND", name: "Universal bonding agent, 5 ml", brand: "Single Bond", category: "Materials", subject: "Operative", years: [3,4,5,6], cost: 980, price: 1350, stock: 7, reorderPoint: 6, supplierId: "s1", art: "syringe", description: "One-bottle universal adhesive." },

  // Endo
  { id: "p33", sku: "EN-K1540", name: "K-files ISO 15–40, 6 pcs", brand: "Mani", category: "Endo", subject: "Endodontics", years: [3,4,5], cost: 155, price: 240, stock: 48, reorderPoint: 30, supplierId: "s3", art: "files", description: "Stainless steel, 25 mm, colour-coded handles." },
  { id: "p34", sku: "EN-GP", name: "Gutta-percha points 15–40", brand: "Meta", category: "Endo", subject: "Endodontics", years: [3,4,5], cost: 75, price: 120, stock: 55, reorderPoint: 25, supplierId: "s3", art: "files", description: "Box of 120." },
  { id: "p35", sku: "EN-PP", name: "Paper points 15–40", brand: "Meta", category: "Endo", subject: "Endodontics", years: [3,4,5], cost: 55, price: 95, stock: 61, reorderPoint: 25, supplierId: "s3", art: "files", description: "Box of 200." },
  { id: "p36", sku: "EN-DAM", name: "Rubber dam kit: punch, forceps, frame, clamps", brand: "Medesy", category: "Endo", subject: "Endodontics", years: [3,4,5], cost: 1700, price: 2350, stock: 5, reorderPoint: 6, supplierId: "s1", art: "dam", description: "Ainsworth punch, Brewer forceps, 6 clamps, sheets." },
  { id: "p37", sku: "EN-ROT", name: "Rotary file system, 6 pcs", brand: "Gold", category: "Endo", subject: "Endodontics", years: [4,5,6], cost: 690, price: 980, stock: 16, reorderPoint: 8, supplierId: "s3", art: "files", description: "Heat-treated NiTi, 25 mm." },

  // Lab & PPE
  { id: "p38", sku: "PP-LOUPE25", name: "Loupes 2.5x with LED", brand: "Vision", category: "Lab & PPE", subject: "Clinic", years: [4,5,6], cost: 5800, price: 7600, stock: 3, reorderPoint: 2, supplierId: "s5", art: "loupes", description: "Galilean 2.5x, 420 mm, cordless LED.", warrantyMonths: 12, serviceable: true },
  { id: "p39", sku: "PP-COAT", name: "Lab coat with embroidered name", brand: "Cusp", category: "Lab & PPE", subject: "Lab", years: all, cost: 420, price: 650, stock: 30, reorderPoint: 15, supplierId: "s6", art: "coat", description: "Cotton blend. Name and faculty embroidered in 48 h." },
  { id: "p40", sku: "PP-SCRUB", name: "Scrubs set", brand: "Cusp", category: "Lab & PPE", subject: "Clinic", years: [4,5,6], cost: 620, price: 900, stock: 24, reorderPoint: 12, supplierId: "s6", art: "coat", description: "Stretch fabric, 6 colours." },
  { id: "p41", sku: "PP-CASE", name: "Instrument case with lock", brand: "Generic", category: "Lab & PPE", subject: "Lab", years: all, cost: 380, price: 590, stock: 18, reorderPoint: 10, supplierId: "s4", art: "case", description: "Two-tier organiser with combination lock." },
  { id: "p42", sku: "PP-GLOVE", name: "Nitrile gloves, box of 100", brand: "Generic", category: "Lab & PPE", subject: "Clinic", years: all, cost: 150, price: 220, stock: 85, reorderPoint: 40, supplierId: "s4", art: "case", description: "Powder-free, sizes XS to L." },
  { id: "p43", sku: "PP-POUCH", name: "Sterilization pouches, 200", brand: "Generic", category: "Lab & PPE", subject: "Clinic", years: [3,4,5,6], cost: 180, price: 270, stock: 27, reorderPoint: 20, supplierId: "s4", art: "case", description: "Self-seal, 90 x 230 mm." },
];

export const product = (id: string) => PRODUCTS.find((p) => p.id === id)!;

const kitSum = (items: { productId: string; qty: number }[]) =>
  items.reduce((s, i) => s + product(i.productId).price * i.qty, 0);

const mkKit = (k: Omit<Kit, "price">, discount: number): Kit => {
  const raw = kitSum(k.items);
  return { ...k, price: Math.round((raw * (1 - discount)) / 50) * 50 };
};

export const KITS: Kit[] = [
  mkKit({ id: "k1", name: "Carving & anatomy kit", year: 1, subject: "Anatomy & carving", blurb: "Carvers, wax and a case for your first lab.", items: [{ productId: "p13", qty: 1 }, { productId: "p30", qty: 2 }, { productId: "p39", qty: 1 }, { productId: "p41", qty: 1 }] }, 0.08),
  mkKit({ id: "k2", name: "Preclinical operative kit", year: 2, subject: "Operative", blurb: "Typodont, hand instruments and burs for cavity prep.", items: [{ productId: "p22", qty: 1 }, { productId: "p10", qty: 1 }, { productId: "p18", qty: 1 }, { productId: "p19", qty: 1 }, { productId: "p09", qty: 1 }, { productId: "p11", qty: 1 }] }, 0.07),
  mkKit({ id: "k3", name: "Removable prosth lab kit", year: 2, subject: "Removable prosth", blurb: "Everything for your first complete denture.", items: [{ productId: "p17", qty: 1 }, { productId: "p24", qty: 2 }, { productId: "p28", qty: 1 }, { productId: "p29", qty: 3 }, { productId: "p30", qty: 1 }, { productId: "p31", qty: 1 }, { productId: "p20", qty: 1 }] }, 0.08),
  mkKit({ id: "k4", name: "Fixed prosth kit", year: 3, subject: "Fixed prosth", blurb: "Crown preps on typodont teeth, with burs and impressions.", items: [{ productId: "p23", qty: 2 }, { productId: "p18", qty: 1 }, { productId: "p28", qty: 2 }, { productId: "p29", qty: 2 }] }, 0.06),
  mkKit({ id: "k5", name: "Endodontics preclinical kit", year: 3, subject: "Endodontics", blurb: "Files, points, blocks and a full rubber dam kit.", items: [{ productId: "p33", qty: 2 }, { productId: "p34", qty: 1 }, { productId: "p35", qty: 1 }, { productId: "p25", qty: 1 }, { productId: "p36", qty: 1 }] }, 0.07),
  mkKit({ id: "k6", name: "Clinic essentials kit", year: 4, subject: "Clinic", blurb: "Restorative materials and a curing light for your first patients.", items: [{ productId: "p26", qty: 1 }, { productId: "p32", qty: 1 }, { productId: "p12", qty: 1 }, { productId: "p21", qty: 1 }, { productId: "p06", qty: 1 }, { productId: "p43", qty: 1 }] }, 0.06),
  mkKit({ id: "k7", name: "Oral surgery kit", year: 5, subject: "Oral surgery", blurb: "Forceps and elevators for the surgery clinic.", items: [{ productId: "p15", qty: 1 }, { productId: "p16", qty: 1 }, { productId: "p42", qty: 2 }] }, 0.05),
  mkKit({ id: "k8", name: "Intern starter kit", year: 6, subject: "Clinic", blurb: "Loupes, a reliable turbine and scrubs for internship.", items: [{ productId: "p38", qty: 1 }, { productId: "p01", qty: 1 }, { productId: "p40", qty: 1 }] }, 0.05),
];

export const kit = (id: string) => KITS.find((k) => k.id === id)!;
export const kitRawPrice = (k: Kit) => kitSum(k.items);
export const kitCost = (k: Kit) => k.items.reduce((s, i) => s + product(i.productId).cost * i.qty, 0);

/** Requirement list per year. Built from the kits plus single items that faculties list. */
export const REQUIREMENTS: Record<YearOfStudy, { productId: string; qty: number; required: boolean }[]> = {
  1: [
    { productId: "p13", qty: 1, required: true },
    { productId: "p30", qty: 2, required: true },
    { productId: "p39", qty: 1, required: true },
    { productId: "p41", qty: 1, required: false },
    { productId: "p05", qty: 1, required: false },
  ],
  2: [
    { productId: "p22", qty: 1, required: true },
    { productId: "p10", qty: 1, required: true },
    { productId: "p18", qty: 1, required: true },
    { productId: "p19", qty: 1, required: true },
    { productId: "p09", qty: 1, required: true },
    { productId: "p11", qty: 1, required: true },
    { productId: "p02", qty: 1, required: true },
    { productId: "p04", qty: 1, required: true },
    { productId: "p17", qty: 1, required: true },
    { productId: "p24", qty: 2, required: true },
    { productId: "p28", qty: 1, required: true },
    { productId: "p29", qty: 3, required: true },
    { productId: "p31", qty: 1, required: true },
    { productId: "p20", qty: 1, required: false },
    { productId: "p39", qty: 1, required: false },
  ],
  3: [
    { productId: "p23", qty: 2, required: true },
    { productId: "p18", qty: 1, required: true },
    { productId: "p28", qty: 2, required: true },
    { productId: "p29", qty: 2, required: true },
    { productId: "p33", qty: 2, required: true },
    { productId: "p34", qty: 1, required: true },
    { productId: "p35", qty: 1, required: true },
    { productId: "p25", qty: 1, required: true },
    { productId: "p36", qty: 1, required: true },
    { productId: "p03", qty: 1, required: true },
    { productId: "p12", qty: 1, required: false },
    { productId: "p01", qty: 1, required: false },
  ],
  4: [
    { productId: "p26", qty: 1, required: true },
    { productId: "p32", qty: 1, required: true },
    { productId: "p12", qty: 1, required: true },
    { productId: "p21", qty: 1, required: true },
    { productId: "p06", qty: 1, required: true },
    { productId: "p43", qty: 1, required: true },
    { productId: "p14", qty: 1, required: true },
    { productId: "p27", qty: 1, required: true },
    { productId: "p40", qty: 1, required: false },
    { productId: "p38", qty: 1, required: false },
  ],
  5: [
    { productId: "p15", qty: 1, required: true },
    { productId: "p16", qty: 1, required: true },
    { productId: "p42", qty: 2, required: true },
    { productId: "p07", qty: 1, required: true },
    { productId: "p37", qty: 1, required: true },
    { productId: "p08", qty: 1, required: false },
    { productId: "p38", qty: 1, required: false },
  ],
  6: [
    { productId: "p38", qty: 1, required: true },
    { productId: "p01", qty: 1, required: true },
    { productId: "p40", qty: 2, required: true },
    { productId: "p42", qty: 3, required: true },
    { productId: "p08", qty: 1, required: false },
  ],
};

export const SUPPLIERS: Supplier[] = [
  { id: "s1", name: "Nile Dental Supply", kind: "supplier", categories: ["Instruments", "NSK", "Materials"], leadDays: 3, onTime: 0.94, contact: "Hany", phone: "+20 122 410 7781", openPOs: 2, spendYtd: 612000 },
  { id: "s2", name: "Woodpecker agent, Dokki", kind: "supplier", categories: ["Motors", "Curing lights", "Scalers"], leadDays: 5, onTime: 0.88, contact: "Mona", phone: "+20 111 280 4410", openPOs: 1, spendYtd: 284000 },
  { id: "s3", name: "Medident Wholesale", kind: "supplier", categories: ["Burs", "Endo", "Budget handpieces"], leadDays: 2, onTime: 0.97, contact: "Tamer", phone: "+20 100 902 3315", openPOs: 0, spendYtd: 198000 },
  { id: "s4", name: "Al Fajr Trading", kind: "supplier", categories: ["Typodonts", "Prosth materials", "Consumables"], leadDays: 4, onTime: 0.81, contact: "Sherif", phone: "+20 127 655 0920", openPOs: 1, spendYtd: 241000 },
  { id: "s5", name: "Vision Optics EG", kind: "supplier", categories: ["Loupes"], leadDays: 10, onTime: 0.9, contact: "Dina", phone: "+20 106 330 1174", openPOs: 0, spendYtd: 87000 },
  { id: "s6", name: "Stitch Uniforms", kind: "supplier", categories: ["Coats", "Scrubs", "Embroidery"], leadDays: 2, onTime: 0.95, contact: "Amal", phone: "+20 109 774 2251", openPOs: 1, spendYtd: 76000 },
];

export const PARTNERS: ServicePartner[] = [
  { id: "r1", name: "NSK authorised service", kind: "partner", short: "NSK service", brands: ["NSK"], area: "Mohandessin", avgDays: 5.4, onTime: 0.91, rating: 4.7, contact: "Eng. Waleed", phone: "+20 122 300 8812", loaners: false },
  { id: "r2", name: "Woodpecker service centre", kind: "partner", short: "Woodpecker", brands: ["Woodpecker"], area: "Dokki", avgDays: 7.8, onTime: 0.76, rating: 4.1, contact: "Eng. Rania", phone: "+20 111 280 4499", loaners: false },
  { id: "r3", name: "Handpiece Clinic", kind: "partner", short: "Handpiece Clinic", brands: ["All turbines", "COXO", "Contra-angles"], area: "Downtown", avgDays: 3.6, onTime: 0.95, rating: 4.8, contact: "Am Sayed", phone: "+20 100 471 6620", loaners: true },
  { id: "r4", name: "Al Amal Electro-Dental", kind: "partner", short: "Al Amal", brands: ["Saeshin", "Marathon", "Motors"], area: "Shubra", avgDays: 6.1, onTime: 0.84, rating: 4.4, contact: "Eng. Hossam", phone: "+20 127 118 3304", loaners: true },
];

export const supplier = (id: string) => SUPPLIERS.find((s) => s.id === id)!;
export const partner = (id: string) => PARTNERS.find((p) => p.id === id)!;
