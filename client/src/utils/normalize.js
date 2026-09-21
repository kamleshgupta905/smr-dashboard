/**
 * Normalizes survey objects from both Zamplia PascalCase API
 * and local MongoDB snake_case schemas.
 */
export function normalizeSurvey(s) {
  if (!s) return null;
  const id = s.SurveyId || s.survey_id || s.surveyId || s.id || s._id || s.project_id || s.projectId || '';
  const name = s.Name || s.survey_name || s.name || s.project_name || `Study #${id}`;
  const cpi = Number(s.CPI ?? s.cpi ?? s.Cpi ?? 0);
  const loi = Number(s.LOI ?? s.loi ?? s.Loi ?? 15);
  const ir = Number(s.IR ?? s.ir ?? s.IncidenceRate ?? s.incidence_rate ?? 50);
  const completes = Number(s.TotalCompleteRequired ?? s.target_completes ?? s.completes ?? s.totalRequired ?? 500);
  
  let country = 'US';
  if (s.LanguageCode && typeof s.LanguageCode === 'string') {
    const parts = s.LanguageCode.split('-');
    country = parts[1] || parts[0] || 'US';
  } else if (s.Country || s.country) {
    country = s.Country || s.country;
  }

  const category = s.IndustryName || s.industry_name || s.category || s.StudyTypes || (s.IndustryId ? `Industry #${s.IndustryId}` : 'Market Research');
  const status = s.status || s.Status || 'Live';

  return {
    ...s,
    SurveyId: id,
    survey_id: id,
    surveyId: id,
    id: id,
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
    completesNeeded: s.completesNeeded ?? completes,
    country: country.toUpperCase(),
    LanguageCode: s.LanguageCode || `En-${country.toUpperCase()}`,
    category,
    status,
  };
}

export function normalizeSurveys(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeSurvey).filter(Boolean);
}
