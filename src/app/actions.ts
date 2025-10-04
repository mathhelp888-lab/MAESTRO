
"use server";

import { recommendMitigations } from "@/ai/flows/recommend-mitigations";
import { suggestThreatsForLayer } from "@/ai/flows/suggest-threats-for-layer";
import { generateExecutiveSummary } from "@/ai/flows/generate-executive-summary";
import { generateArchitectureDiagram } from "@/ai/flows/generate-architecture-diagram";

import { type RecommendMitigationsOutput } from "@/ai/flows/recommend-mitigations";
import { type SuggestThreatsForLayerOutput } from "@/ai/flows/suggest-threats-for-layer";
import { type GenerateExecutiveSummaryOutput } from "@/ai/flows/generate-executive-summary";
import { type GenerateArchitectureDiagramOutput } from "@/ai/flows/generate-architecture-diagram";

import { LayerData } from "@/lib/types";
import { AIErrorHandler } from "@/lib/ai-error-handler";
import { withRetry } from "@/lib/retry-utils";

export async function suggestThreat(
  architectureDescription: string,
  layerName: string,
  layerDescription: string
): Promise<SuggestThreatsForLayerOutput> {
  return withRetry(async () => {
    try {
      const result = await suggestThreatsForLayer({
        architectureDescription,
        layerName,
        layerDescription,
      });
      return result;
    } catch (error) {
      const maestroError = AIErrorHandler.handleAIFlowError(error, 'suggestThreatsForLayer', {
        layerName,
        architectureDescription: architectureDescription.slice(0, 100) + '...'
      });
      throw maestroError;
    }
  }, undefined, (error) => {
    if (error instanceof Error && error.message.includes('MaestroError')) {
      const maestroError = JSON.parse(error.message.split('MaestroError: ')[1]);
      return AIErrorHandler.shouldRetry(maestroError);
    }
    return true;
  });
}

export async function recommendMitigation(
  threatDescription: string,
  layerName: string
): Promise<RecommendMitigationsOutput> {
  return withRetry(async () => {
    try {
      const result = await recommendMitigations({
        threatDescription,
        layer: layerName,
      });
      return result;
    } catch (error) {
      const maestroError = AIErrorHandler.handleAIFlowError(error, 'recommendMitigations', {
        layerName,
        threatDescription: threatDescription.slice(0, 100) + '...'
      });
      throw maestroError;
    }
  }, undefined, (error) => {
    if (error instanceof Error && error.message.includes('MaestroError')) {
      const maestroError = JSON.parse(error.message.split('MaestroError: ')[1]);
      return AIErrorHandler.shouldRetry(maestroError);
    }
    return true;
  });
}

export async function getExecutiveSummary(
  architectureDescription: string,
  analysisResults: LayerData[]
): Promise<GenerateExecutiveSummaryOutput> {
  return withRetry(async () => {
    try {
      const result = await generateExecutiveSummary({
        architectureDescription,
        analysisResults,
      });
      return result;
    } catch (error) {
      const maestroError = AIErrorHandler.handleAIFlowError(error, 'generateExecutiveSummary', {
        architectureDescription: architectureDescription.slice(0, 100) + '...',
        layerCount: analysisResults.length
      });
      throw maestroError;
    }
  }, undefined, (error) => {
    if (error instanceof Error && error.message.includes('MaestroError')) {
      const maestroError = JSON.parse(error.message.split('MaestroError: ')[1]);
      return AIErrorHandler.shouldRetry(maestroError);
    }
    return true;
  });
}

export async function getArchitectureDiagram(
  architectureDescription: string
): Promise<GenerateArchitectureDiagramOutput> {
  return withRetry(async () => {
    try {
      const result = await generateArchitectureDiagram({
        architectureDescription,
      });
      return result;
    } catch (error) {
      const maestroError = AIErrorHandler.handleAIFlowError(error, 'generateArchitectureDiagram', {
        architectureDescription: architectureDescription.slice(0, 100) + '...'
      });
      throw maestroError;
    }
  }, undefined, (error) => {
    if (error instanceof Error && error.message.includes('MaestroError')) {
      const maestroError = JSON.parse(error.message.split('MaestroError: ')[1]);
      return AIErrorHandler.shouldRetry(maestroError);
    }
    return true;
  });
}
