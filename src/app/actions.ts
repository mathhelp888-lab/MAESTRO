"use server";

import { recommendMitigations } from "@/ai/flows/recommend-mitigations";
import { suggestThreatsForLayer } from "@/ai/flows/suggest-threats-for-layer";
import { type RecommendMitigationsOutput } from "@/ai/flows/recommend-mitigations";
import { type SuggestThreatsForLayerOutput } from "@/ai/flows/suggest-threats-for-layer";

export async function suggestThreat(
  architectureDescription: string,
  layerName: string
): Promise<SuggestThreatsForLayerOutput> {
  try {
    const result = await suggestThreatsForLayer({
      architectureDescription,
      layerName,
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
