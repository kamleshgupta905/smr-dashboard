/**
 * Normalizes survey objects from both Zamplia PascalCase API
 * and local MongoDB snake_case schemas.
 */
export function normalizeSurvey(s) {
  if (!s) return null;
  const id = s.SurveyId ?? s.survey_id ?? s.id ?? s._id ?? '';
  const name = s.Name ?? s.survey_name ?? s.name ?? `Survey #${id}`;
  const cpi = Number(s.CPI ?? s.cpi ?? s.Cpi ?? 0);
  const loi = Number(s.LOI ?? s.loi ?? s.Loi ?? 15);
  const ir = Number(s.IR ?? s.ir ?? s.IncidenceRate ?? s.incidence_rate ?? 50);
  const completes = s.TotalCompleteRequired ?? s.target_completes ?? s.completes ?? 500;
  
  // Proper-case country name first (Zamplia returns e.g. "United States",
  // Market Xcel returns the country via survey_country). Fall back to the
  // language region code when neither is present.
  let countryName = s.Country || s.country || s.survey_country || '';
  if (!countryName && s.LanguageCode && typeof s.LanguageCode === 'string') {
    countryName = s.LanguageCode.split('-')[1] || s.LanguageCode.split('-')[0] || 'US';
  }
  countryName = countryName || 'US';

  const category = s.IndustryName || s.industry_name || s.survey_category || s.StudyTypes || (s.IndustryId ? `Industry #${s.IndustryId}` : 'Consumer');
  const status = s.status || s.Status || 'Live';
  // Completes still needed (open demand) — real field from both sources
  const completesNeeded = Number(
    s.CompletesNeeded ?? s.completesNeeded ?? s.RemainingCapacity ?? 0
  );

  return {
    ...s,
    SurveyId: id,
    survey_id: id,
    Name: name,
    survey_name: name,
    CPI: cpi,
    cpi: cpi,
    LOI: loi,
    loi: loi,
    IR: ir,
    ir: ir,
    incidence_rate: ir,
    TotalCompleteRequired: completes,
    target_completes: completes,
    CompletesNeeded: completesNeeded,
    completesNeeded,
    country: countryName.toUpperCase(),
    countryName,
    LanguageCode: s.LanguageCode || `En-${countryName.toUpperCase().slice(0, 2)}`,
    category,
    status,
  };
}

export function normalizeSurveys(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeSurvey).filter(Boolean);
}
