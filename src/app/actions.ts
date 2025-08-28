"use server";

import { recommendMitigations } from "@/ai/flows/recommend-mitigations";
import { suggestThreatsForLayer } from "@/ai/flows/suggest-threats-for-layer";
import { generateExecutiveSummary } from "@/ai/flows/generate-executive-summary";
import { type RecommendMitigationsOutput } from "@/ai/flows/recommend-mitigations";
import { type SuggestThreatsForLayerOutput } from "@/ai/flows/suggest-threats-for-layer";
import { type GenerateExecutiveSummaryOutput } from "@/ai/flows/generate-executive-summary";
import { LayerData } from "@/lib/types";

export async function suggestThreat(
  architectureDescription: string,
  layerName: string,
  layerDescription: string
): Promise<SuggestThreatsForLayerOutput> {
  try {
    const result = await suggestThreatsForLayer({
      architectureDescription,
      layerName,
      layerDescription,
    });
    return result;
  } catch (error) {
    console.error("Error in suggestThreatsForLayer:", error);
    throw new Error("Failed to get threat suggestion from AI.");
  }
}

export async function recommendMitigation(
  threatDescription: string,
  layerName: string
): Promise<RecommendMitigationsOutput> {
  try {
    const result = await recommendMitigations({
      threatDescription,
      layer: layerName,
    });
    return result;
  } catch (error) {
    console.error("Error in recommendMitigations:", error);
    throw new Error("Failed to get mitigation recommendation from AI.");
  }
}

export async function getExecutiveSummary(
  architectureDescription: string,
  analysisResults: LayerData[]
): Promise<GenerateExecutiveSummaryOutput> {
  try {
    const result = await generateExecutiveSummary({
      architectureDescription,
      analysisResults,
    });
    return result;
  } catch (error) {
    console.error("Error in generateExecutiveSummary:", error);
    throw new Error("Failed to generate executive summary.");
  }
}
