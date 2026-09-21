/**
 * Deterministic demo inventory generator.
 *
 * Used ONLY as a fallback when the live Zamplia Supply API is unreachable
 * (no network, sandbox, or key still being configured). It produces a stable,
 * realistic ~626-study allocation catalog in Zamplia's PascalCase shape so the
 * platform remains fully demoable. Every downstream consumer receives a
 * `source: 'simulated_fallback'` flag from zampliaService, and the UI surfaces
 * a visible "Demo data" badge — the platform never pretends this is live data.
 */

const INDUSTRIES = [
  { cat: 'Information Technology', topics: ['Enterprise Cloud Migrations', 'DevOps Tooling & CI/CD Benchmarks', 'Cyber Threat Detection & SIEM Tools', 'Generative AI Adoption in Enterprise', 'Microservices & Container Security', 'SaaS Licensing & Renewal Dynamics'] },
  { cat: 'Healthcare & Medical', topics: ['Clinical Workflow Optimization', 'Telehealth Patient Satisfaction', 'Medical Imaging Equipment Upgrades', 'Chronic Illness Remote Patient Monitoring', 'Bio-Pharma Clinical Trials Awareness', 'EHR Interoperability & Compliance'] },
  { cat: 'Automotive & Mobility', topics: ['EV Battery Range Anxiety', 'Connected Vehicle Telematics & Infotainment', 'Commercial Fleet Management ROI', 'Autonomous Driving Safety Perceptions', 'Hybrid Powertrain Consumer Demand', 'Urban Micro-Mobility & E-Scooters'] },
  { cat: 'Financial Services', topics: ['Cross-Border B2B Payment Gateways', 'Retail Neobank Switching Intentions', 'Crypto Custody & Institutional Trading', 'Wealth Management Robo-Advisory Usage', 'SME Commercial Credit Accessibility', 'Mobile Contactless Payments Security'] },
  { cat: 'Retail & E-Commerce', topics: ['Omnichannel BOPIS Fulfillment Preferences', 'Quick-Commerce 15-Minute Delivery Viability', 'Subscription Box Retention Metrics', 'Private Label vs National Brand Loyalty', 'Social Commerce & TikTok Shop Sentiment', 'Sustainable Packaging Consumer Willingness'] },
  { cat: 'Telecommunications', topics: ['Fixed Wireless Access (FWA) vs Fiber', 'Enterprise SD-WAN Adoption', 'Mobile Carrier 5G Standalone Quality', 'MVNO Consumer Value Perception', 'Satellite Broadband Direct-to-Cell', 'Customer Churn Predictors in Telco'] },
  { cat: 'Energy & Utilities', topics: ['Residential Solar & Powerwall ROI', 'Smart Meter Grid Reliability Feedback', 'Commercial Heat Pump Electrification', 'Industrial Decarbonization Pathways', 'Wind Energy Community Impact Study', 'EV Smart Charging & Dynamic Tariffs'] },
  { cat: 'Travel & Hospitality', topics: ['Business Travel Post-Pandemic Policies', 'Hotel Loyalty Program Redemption Patterns', 'Short-Term Vacation Rental Quality Audit', 'Airline Premium Economy Demand', 'Sustainable Tourism Eco-Certifications', 'Airport Digital Baggage Tracking'] },
  { cat: 'Media & Entertainment', topics: ['Ad-Supported SVOD Tier Acceptance', 'Cloud Gaming Latency & Controller Feel', 'Podcast Listener Monetization', 'Short-Form Video Content Fatigue', 'Esports Audience Brand Sponsorships', 'Digital Publishing Paywall Conversion'] },
  { cat: 'Food & Beverage', topics: ['Plant-Based Protein Repeat Purchase', 'Functional Energy Drink Ingredient Trends', 'Craft Brewery Regional Preferences', 'Specialty Coffee Single-Origin Demand', 'Ready-to-Drink Cocktails Market Share', 'Organic Grocery Price Sensitivity'] },
];

const COUNTRIES = [
  { country: 'United States', lang: 'en-US', iso: 'US' },
  { country: 'United Kingdom', lang: 'en-GB', iso: 'GB' },
  { country: 'Germany', lang: 'de-DE', iso: 'DE' },
  { country: 'France', lang: 'fr-FR', iso: 'FR' },
  { country: 'Canada', lang: 'en-CA', iso: 'CA' },
  { country: 'India', lang: 'en-IN', iso: 'IN' },
  { country: 'Australia', lang: 'en-AU', iso: 'AU' },
  { country: 'Japan', lang: 'ja-JP', iso: 'JP' },
  { country: 'Spain', lang: 'es-ES', iso: 'ES' },
];

const DEVICES = ['Desktop,Mobile,Tablet', 'Desktop,Mobile', 'Mobile,Tablet', 'Desktop'];

/**
 * Build a deterministic survey list (stable across restarts — no Math.random()).
 * @param {number} targetCount  how many studies to generate
 * @param {number} startId      SurveyId of the first generated study
 */
function generateDemoInventory(targetCount = 626, startId = 90142) {
  const result = [];
  const totalTopics = INDUSTRIES.reduce((acc, i) => acc + i.topics.length, 0);

  for (let i = 0; i < targetCount; i++) {
    const topicIndex = i % totalTopics;
    // Map a flat topic index to (industry, topic)
    let indIdx = 0;
    let acc = 0;
    while (acc + INDUSTRIES[indIdx].topics.length <= topicIndex) {
      acc += INDUSTRIES[indIdx].topics.length;
      indIdx++;
    }
    const ind = INDUSTRIES[indIdx];
    const topic = ind.topics[topicIndex - acc];
    const cObj = COUNTRIES[i % COUNTRIES.length];
    const baseCpi = Number((1.5 + ((i * 7) % 120) / 10).toFixed(2));
    const totalReq = 200 + ((i * 50) % 1000);
    const needed = Math.round(totalReq * (0.35 + ((i * 13) % 50) / 100));
    const endOffsetDays = 45 + ((i * 11) % 200);
    const endDate = new Date(Date.UTC(2026, 8, 21) + endOffsetDays * 86400000)
      .toISOString()
      .slice(0, 10) + 'T23:59:59Z';

    result.push({
      SurveyId: startId + i,
      Name: `${cObj.country} ${topic} Study 2026`,
      TotalCompleteRequired: totalReq,
      CompletesNeeded: needed,
      CPI: baseCpi,
      LOI: 8 + ((i * 3) % 18),
      IR: 25 + ((i * 11) % 65),
      Device: DEVICES[i % DEVICES.length],
      LanguageCode: cObj.lang,
      Country: cObj.country,
      IndustryId: indIdx + 1,
      IndustryName: ind.cat,
      status: 'Live',
      StudyTypes: i % 3 === 0 ? 'B2B' : 'Consumer',
      SurveyEndDate: endDate,
      IsSurveyGroupExist: i % 4 === 0 ? 1 : 0,
      IsRecontactSurvey: 0,
      CollectPII: 0,
    });
  }

  return result;
}

module.exports = { generateDemoInventory };
