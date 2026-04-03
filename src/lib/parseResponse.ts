import type { StructuredResponse } from "@/types";

const FIELDS = [
  "Objective",
  "Reasoning",
  "Recommended Action",
  "Cost",
  "Risk Level",
  "Expected Outcome",
  "Approval Needed",
] as const;

export function parseStructuredResponse(text: string): StructuredResponse | null {
  const hasObjective = /^Objective:/im.test(text);
  const hasAction = /^Recommended Action:/im.test(text);
  if (!hasObjective || !hasAction) return null;

  const extract = (label: string): string => {
    // Build pattern that matches "Label: value" up to the next field or end
    const fieldList = FIELDS.map((f) => f.replace(/\s/g, "\\s*")).join("|");
    const pattern = new RegExp(
      `^${label.replace(/\s/g, "\\s*")}:\\s*([\\s\\S]*?)(?=^(?:${fieldList}):|$)`,
      "im"
    );
    const match = text.match(pattern);
    return match ? match[1].trim() : "";
  };

  const objective = extract("Objective");
  const reasoning = extract("Reasoning");
  const recommendedAction = extract("Recommended Action");
  const cost = extract("Cost");
  const riskLevelRaw = extract("Risk Level").toLowerCase();
  const expectedOutcome = extract("Expected Outcome");
  const approvalRaw = extract("Approval Needed").toLowerCase();

  if (!objective || !recommendedAction) return null;

  const riskLevel =
    riskLevelRaw.includes("high")
      ? "High"
      : riskLevelRaw.includes("medium") || riskLevelRaw.includes("med")
      ? "Medium"
      : "Low";

  const approvalNeeded = approvalRaw.startsWith("yes") ? "Yes" : "No";

  return {
    objective,
    reasoning,
    recommendedAction,
    cost: cost || "$0",
    riskLevel,
    expectedOutcome,
    approvalNeeded,
    rawText: text,
  };
}

export function extractExtraContent(text: string): string {
  // Return any content after the last structured field
  const lastFieldPattern = /^Approval Needed:.*$/im;
  const match = text.match(lastFieldPattern);
  if (!match || match.index === undefined) return "";
  const afterLastField = text.slice(match.index + match[0].length).trim();
  return afterLastField;
}
