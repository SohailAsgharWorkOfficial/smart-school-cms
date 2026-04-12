const normalizeString = (value) => `${value ?? ""}`.trim().toLowerCase();

export const assessmentLabel = (assessmentType) => {
  if (assessmentType === "midterm") return "Midterm";
  if (assessmentType === "final") return "Final Term";
  return "Assessment";
};

export const getAssessmentType = (result) => {
  if (result?.assessmentType === "midterm" || result?.assessmentType === "final") return result.assessmentType;

  const exam = normalizeString(result?.examName);
  const term = normalizeString(result?.term);

  if (exam.includes("mid") || term.includes("mid")) return "midterm";
  if (exam.includes("final") || term.includes("final")) return "final";

  return "other";
};

export const isAssessmentType = (result, assessmentType) => getAssessmentType(result) === assessmentType;

export const pickLatestResult = (items) => {
  if (!items?.length) return null;
  const toDate = (value) => {
    if (!value) return null;
    if (value?.toDate) return value.toDate();
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const score = (item) => {
    const updated = toDate(item?.updatedAt);
    const created = toDate(item?.createdAt);
    return (updated ?? created)?.getTime?.() ?? 0;
  };

  return items.reduce((acc, curr) => (score(curr) >= score(acc) ? curr : acc), items[0]);
};

