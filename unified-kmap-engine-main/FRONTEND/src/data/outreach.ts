export type NewsItem = {
  id: string;
  level: "Central" | "Karnataka";
  title: string;
  scheme: string;
  summary: string;
  benefit: string;
  link: string;
};

export const NEWS: NewsItem[] = [
  {
    id: "pmkisan",
    level: "Central",
    title: "PM-KISAN instalment released to eligible farmer families",
    scheme: "PM Kisan Samman Nidhi",
    summary:
      "Direct income support of ₹6,000 per year paid in three equal instalments straight into the farmer's bank account through DBT.",
    benefit: "₹6,000 / year · e-KYC + Aadhaar seeding mandatory",
    link: "https://pmkisan.gov.in/",
  },
  {
    id: "pmfby",
    level: "Central",
    title: "Kharif enrolment window open under crop insurance",
    scheme: "Pradhan Mantri Fasal Bima Yojana",
    summary:
      "Premium capped at 2% for kharif, 1.5% for rabi and 5% for commercial and horticultural crops; the rest is shared by the Centre and State.",
    benefit: "Yield loss, prevented sowing and post-harvest cover",
    link: "https://pmfby.gov.in/",
  },
  {
    id: "shc",
    level: "Central",
    title: "Soil Health Card cycle expanded with village-level soil labs",
    scheme: "Soil Health Card Scheme",
    summary:
      "Free soil testing with crop-wise nutrient recommendations every two years, now supported by mobile and village-level testing labs.",
    benefit: "Free NPK, pH and micro-nutrient report",
    link: "https://soilhealth.dac.gov.in/",
  },
  {
    id: "enam",
    level: "Central",
    title: "More Karnataka APMCs integrated into the national online market",
    scheme: "e-NAM",
    summary:
      "Online trading platform linking APMC mandis so farmers can discover prices beyond their local yard and receive payment digitally.",
    benefit: "Transparent price discovery · assaying-based bidding",
    link: "https://enam.gov.in/web/",
  },
  {
    id: "raitha-vidya",
    level: "Karnataka",
    title: "Raitha Vidya Nidhi scholarships for farmers' children",
    scheme: "Raitha Vidya Nidhi",
    summary:
      "Scholarship for children of farmers from PUC to postgraduate and professional courses, credited directly through DBT.",
    benefit: "₹2,500 – ₹11,000 per year based on course",
    link: "https://raitamitra.karnataka.gov.in/",
  },
  {
    id: "krishi-bhagya",
    level: "Karnataka",
    title: "Krishi Bhagya rain-water harvesting package back in focus",
    scheme: "Krishi Bhagya",
    summary:
      "Support for farm ponds, polythene lining, diesel/solar pump sets and micro-irrigation for dryland farmers in rain-fed taluks.",
    benefit: "Up to 80–90% subsidy for SC/ST and small farmers",
    link: "https://raitamitra.karnataka.gov.in/",
  },
  {
    id: "ksdps",
    level: "Karnataka",
    title: "Zero-interest crop loans continue for Karnataka farmers",
    scheme: "Karnataka Co-operative Crop Loan Scheme",
    summary:
      "Short-term crop loans up to ₹3 lakh at 0% interest and medium/long-term loans at 3% through DCC banks and PACS.",
    benefit: "₹3 lakh short-term crop loan at 0% interest",
    link: "https://raitamitra.karnataka.gov.in/",
  },
  {
    id: "raitha-shakti",
    level: "Karnataka",
    title: "Raitha Shakti diesel subsidy for farm mechanisation",
    scheme: "Raitha Shakti",
    summary:
      "Diesel subsidy per acre for farmers using tractors and power tillers for land preparation, credited to the registered FRUITS ID.",
    benefit: "₹250 per acre, up to 5 acres per farmer",
    link: "https://raitamitra.karnataka.gov.in/",
  },
];

export type BankScheme = {
  id: string;
  bank: string;
  kind: "Public sector" | "Co-operative" | "Regional rural" | "Private" | "Development";
  headline: string;
  products: { name: string; activity: string; amount: string; rate: string; note: string }[];
  link: string;
};

export const BANKS: BankScheme[] = [
  {
    id: "sbi",
    bank: "State Bank of India",
    kind: "Public sector",
    headline: "Widest branch network across Karnataka for KCC and agri term loans.",
    products: [
      {
        name: "Kisan Credit Card",
        activity: "Crop cultivation, post-harvest expenses",
        amount: "Up to ₹3 lakh (collateral free)",
        rate: "7% p.a., 4% effective with prompt repayment",
        note: "Interest subvention plus 3% prompt repayment incentive.",
      },
      {
        name: "Agri Gold Loan",
        activity: "Any agricultural activity",
        amount: "Based on gold value",
        rate: "From ~8.5% p.a.",
        note: "Fastest disbursal option during sowing season.",
      },
      {
        name: "Land Development / Drip Irrigation Loan",
        activity: "Micro-irrigation, land levelling",
        amount: "Up to ₹10 lakh",
        rate: "From ~9% p.a.",
        note: "Can be combined with PMKSY drip subsidy.",
      },
    ],
    link: "https://sbi.co.in/web/agri-rural",
  },
  {
    id: "canara",
    bank: "Canara Bank",
    kind: "Public sector",
    headline: "Karnataka-origin bank with strong horticulture and plantation lending.",
    products: [
      {
        name: "Kisan Suvidha",
        activity: "Crop + allied + consumption needs",
        amount: "Up to ₹10 lakh composite",
        rate: "From ~8.4% p.a.",
        note: "Single composite limit instead of multiple loans.",
      },
      {
        name: "Arecanut & Coconut Plantation Loan",
        activity: "Plantation crops of coastal & Malnad belt",
        amount: "Scale-of-finance based",
        rate: "From ~9% p.a.",
        note: "Repayment aligned to plantation gestation period.",
      },
      {
        name: "Kisan Vehicle / Tractor Loan",
        activity: "Mechanisation",
        amount: "Up to 85% of asset cost",
        rate: "From ~9.2% p.a.",
        note: "Tenure up to 9 years with half-yearly instalments.",
      },
    ],
    link: "https://canarabank.com/",
  },
  {
    id: "kvgb",
    bank: "Karnataka Vikas Grameena Bank",
    kind: "Regional rural",
    headline: "RRB focused on north Karnataka districts and small/marginal farmers.",
    products: [
      {
        name: "KCC – Crop Loan",
        activity: "Jowar, cotton, sugarcane, pulses",
        amount: "Up to ₹3 lakh collateral free",
        rate: "7% p.a. with subvention",
        note: "Village-level camps for renewal.",
      },
      {
        name: "Dairy & Sheep Rearing Loan",
        activity: "Allied animal husbandry",
        amount: "₹1 – ₹8 lakh",
        rate: "From ~9.5% p.a.",
        note: "Eligible for AHIDF interest subvention.",
      },
    ],
    link: "https://kvgbank.com/",
  },
  {
    id: "dcc",
    bank: "District Central Co-operative Banks (DCC) & PACS",
    kind: "Co-operative",
    headline: "Route for Karnataka's 0% interest short-term crop loan scheme.",
    products: [
      {
        name: "Zero-interest Short Term Crop Loan",
        activity: "Seasonal crop cultivation",
        amount: "Up to ₹3 lakh",
        rate: "0% interest (State subsidised)",
        note: "Apply through your local PACS with FRUITS ID and RTC.",
      },
      {
        name: "Medium / Long Term Agri Loan",
        activity: "Wells, pump sets, farm sheds",
        amount: "Up to ₹15 lakh",
        rate: "3% p.a.",
        note: "State interest subsidy for timely repayers.",
      },
    ],
    link: "https://sahakara.karnataka.gov.in/",
  },
  {
    id: "kbl",
    bank: "Karnataka Bank",
    kind: "Private",
    headline: "Coastal Karnataka private bank with quick agri-processing loans.",
    products: [
      {
        name: "KBL Krishi Card",
        activity: "Crop + working capital",
        amount: "Up to ₹5 lakh",
        rate: "From ~8.9% p.a.",
        note: "Overdraft style operation with cheque facility.",
      },
      {
        name: "Agri Infrastructure / Warehouse Loan",
        activity: "Cold storage, godown, processing",
        amount: "Up to ₹2 crore",
        rate: "From ~9.5% p.a.",
        note: "Eligible for 3% AIF interest subvention.",
      },
    ],
    link: "https://karnatakabank.com/",
  },
  {
    id: "nabard",
    bank: "NABARD (through banks & FPOs)",
    kind: "Development",
    headline: "Refinance and grant support behind most agri lending in Karnataka.",
    products: [
      {
        name: "Agri Infrastructure Fund (AIF)",
        activity: "Post-harvest infrastructure, FPO assets",
        amount: "Up to ₹2 crore per project",
        rate: "Capped at 9% with 3% interest subvention",
        note: "Credit guarantee cover for loans up to ₹2 crore.",
      },
      {
        name: "FPO Produce Aggregation Loan",
        activity: "Collective marketing by FPOs",
        amount: "Project based",
        rate: "Concessional refinance rate",
        note: "Channelled via banks; FPO must be registered.",
      },
    ],
    link: "https://www.nabard.org/",
  },
];
