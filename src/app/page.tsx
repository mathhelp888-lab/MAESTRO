
"use client";

import * as React from "react";
import jsPDF from "jspdf";
import mermaid from "mermaid";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LayerCard } from "@/components/layer-card";
import { SidebarInputForm } from "@/components/sidebar-input-form";
import { suggestThreat, recommendMitigation, getExecutiveSummary, getArchitectureDiagram } from "@/app/actions";
import { MAESTRO_LAYERS } from "@/data/maestro";
import { type LayerData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Terminal, ToyBrick } from "lucide-react";
import { Spinner } from "@/components/icons";
import { MermaidDiagram } from "@/components/mermaid-diagram";

const INITIAL_LAYERS: LayerData[] = MAESTRO_LAYERS.map((layer) => ({
  ...layer,
  threat: null,
  mitigation: null,
  status: "pending",
}));

const MAESTRO_METHODOLOGY_SUMMARY = `This report applies the MAESTRO (Multi-Agent Environment, Security, Threat, Risk, and Outcome) framework for agentic AI threat modeling. MAESTRO provides a structured, seven-layer approach to systematically analyze and mitigate security risks in multi-agent systems. It addresses both traditional security vulnerabilities and novel threats arising from agentic factors like autonomy, non-determinism, and complex agent-to-agent interactions. The following sections detail the analysis for each layer based on the provided system architecture.

For more details on the framework, visit: https://cloudsecurityalliance.org/blog/2025/02/06/agentic-ai-threat-modeling-framework-maestro`;


export default function Home() {
  const [layers, setLayers] = React.useState<LayerData[]>(INITIAL_LAYERS);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [buttonText, setButtonText] = React.useState("Generate Analysis");
  const [logs, setLogs] = React.useState<string[]>([]);
  const logsContainerRef = React.useRef<HTMLDivElement>(null);
  const analysisCancelledRef = React.useRef(false);
  const [currentArchitecture, setCurrentArchitecture] = React.useState("");
  const [executiveSummary, setExecutiveSummary] = React.useState<string | null>(null);
  const [mermaidCode, setMermaidCode] = React.useState<string>("");
  const [isGeneratingDiagram, setIsGeneratingDiagram] = React.useState(false);
  const diagramContainerRef = React.useRef<HTMLDivElement>(null);


  React.useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (message: string) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };

  const updateLayerStatus = (layerId: string, status: LayerData["status"]) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, status } : l))
    );
  };

  const handleStop = () => {
    analysisCancelledRef.current = true;
    addLog("Analysis stop requested. Finishing current step...");
  };

  const handleAnalyze = async (architectureDescription: string) => {
    analysisCancelledRef.current = false;
    setIsAnalyzing(true);
    setCurrentArchitecture(architectureDescription);
    setExecutiveSummary(null);
    setLogs([]);
    setLayers(INITIAL_LAYERS);
    // Note: We are intentionally NOT clearing the mermaidCode here
    // to keep the diagram persistent across analyses.
    addLog("Starting MAESTRO threat analysis...");

    let finalLayers: LayerData[] = [];

    for (const layer of MAESTRO_LAYERS) {
      if (analysisCancelledRef.current) {
        addLog(`Analysis stopped by user.`);
        break;
      }
      try {
        setButtonText(`Analyzing: ${layer.name}`);
        addLog(`[${layer.name}] Analysis started...`);
        updateLayerStatus(layer.id, "analyzing");

        if (analysisCancelledRef.current) continue;
        addLog(`[${layer.name}] Calling AI to suggest threats...`);
        const threatResult = await suggestThreat(
          architectureDescription,
          layer.name,
          layer.description
        );
        const threat = threatResult.threatAnalysis;

        if (analysisCancelledRef.current) {
           addLog(`[${layer.name}] Analysis stopped before mitigation step.`);
           updateLayerStatus(layer.id, "error");
           continue;
        };
        addLog(`[${layer.name}] Threat analysis received.`);
        setLayers((prev) =>
          prev.map((l) => (l.id === layer.id ? { ...l, threat } : l))
        );

        if (analysisCancelledRef.current) continue;
        addLog(`[${layer.name}] Calling AI for mitigation strategies...`);
        const mitigation = await recommendMitigation(threat, layer.name);
        addLog(`[${layer.name}] Mitigation recommendation received.`);
        setLayers((prev) => {
          const newLayers = prev.map((l) =>
            l.id === layer.id ? { ...l, mitigation, status: "complete" } : l
          );
          finalLayers = newLayers;
          return newLayers;
        });

        addLog(`[${layer.name}] Analysis complete.`);
      } catch (error) {
        if (!analysisCancelledRef.current) {
          console.error(`Error analyzing layer ${layer.name}:`, error);
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
          addLog(`[${layer.name}] Error: ${errorMessage}`);
          updateLayerStatus(layer.id, "error");
        }
      }
    }

    if (!analysisCancelledRef.current && finalLayers.some(l => l.status === 'complete')) {
        addLog("Generating executive summary...");
        try {
            const summaryResult = await getExecutiveSummary(architectureDescription, finalLayers);
            setExecutiveSummary(summaryResult.summary);
            addLog("Executive summary generated.");
        } catch (error) {
            console.error("Error generating executive summary:", error);
            addLog("Could not generate executive summary.");
        }
    }
    
    setButtonText("Generate Analysis");
    if (!analysisCancelledRef.current) {
      addLog("Full analysis complete.");
    }
    setIsAnalyzing(false);
  };

  const handleGenerateDiagram = async () => {
    if (!currentArchitecture) {
      addLog("Please provide an architecture description first.");
      return;
    }
    setIsGeneratingDiagram(true);
    addLog("Generating architecture diagram...");
    try {
      const result = await getArchitectureDiagram(currentArchitecture);
      setMermaidCode(result.mermaidCode);
      addLog("Diagram generated successfully.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      addLog(`Diagram generation failed: ${errorMessage}`);
      console.error("Diagram Generation Error:", error);
    } finally {
      setIsGeneratingDiagram(false);
    }
  };
  
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    addLog("PDF generation started...");
    
    try {
        const doc = new jsPDF({unit: "px", format: "letter"});
        const margin = 30;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const usableWidth = pageWidth - margin * 2;
        let y = margin;

        const addText = (text: string, options: any = {}) => {
            const { size = 10, style = 'normal', x = margin, align = 'left', color = 0 } = options;

            doc.setFontSize(size);
            doc.setFont("helvetica", style);
            doc.setTextColor(color);
            
            const lines = doc.splitTextToSize(text, usableWidth - (x > margin ? (x - margin) : 0));
            
            lines.forEach((line: string) => {
                const textHeight = doc.getTextDimensions(line).h;
                if (y + textHeight > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
                doc.text(line, x, y, { align: align || 'left' });
                y += textHeight * 1.15; // Add line spacing
            });
        };
        
        addLog("Assembling PDF document...");
        
        // --- HEADER ---
        addText("MAESTRO Threat Analysis Report", { size: 20, style: "bold", align: "center", x: pageWidth / 2 });
        y += 10;
    
        // --- DISCLAIMER & DEVELOPER INFO ---
        addText("Developed by: DistributedApps.ai", { size: 8, color: 150 });
        y += 12;

        const disclaimer = "This report is generated by an AI assistant based on the MAESTRO framework. AI can make mistakes; always double-check threats and mitigations with a security expert.";
        addText(disclaimer, { size: 8, color: 100 });
        y += 20;

        // --- ARCHITECTURE DESCRIPTION ---
        if (currentArchitecture) {
            addText("Analyzed System Architecture", { size: 16, style: "bold" });
            y+= 6;
            addText(currentArchitecture, { size: 10, color: 80 });
            y += 10;
        }

        // --- ARCHITECTURE DIAGRAM ---
        if (mermaidCode && diagramContainerRef.current) {
          addLog("Adding diagram to PDF...");
          y += 10;
          if (y + 200 > pageHeight - margin) { // Check if space for diagram
              doc.addPage();
              y = margin;
          }
          addText("Architecture Diagram", { size: 16, style: "bold" });
          y += 6;
          
          const svgElement = diagramContainerRef.current.querySelector('svg');
          if (svgElement) {
              const svgData = new XMLSerializer().serializeToString(svgElement);
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              const svgSize = svgElement.getBoundingClientRect();
              canvas.width = svgSize.width * 2; // Increase resolution
              canvas.height = svgSize.height * 2;
              canvas.style.width = `${svgSize.width}px`;
              canvas.style.height = `${svgSize.height}px`;
              
              const img = new Image();
              img.src = "data:image/svg+xml;base64," + btoa(svgData);
              
              await new Promise<void>((resolve) => {
                  img.onload = () => {
                      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                      const imgData = canvas.toDataURL("image/png");
                      const imgWidth = usableWidth * 0.8;
                      const imgHeight = (img.height * imgWidth) / img.width;
                      doc.addImage(imgData, "PNG", margin + (usableWidth * 0.1), y, imgWidth, imgHeight);
                      y += imgHeight + 20;
                      resolve();
                  };
              });
          } else {
              addLog("Could not find rendered SVG for diagram.");
          }
        }

        // --- EXECUTIVE SUMMARY ---
        addText("Executive Summary", { size: 16, style: "bold" });
        y+= 6;
        const summaryToUse = executiveSummary || MAESTRO_METHODOLOGY_SUMMARY;
        addText(summaryToUse.replace(/###\s|##\s|#\s|\*\*/g, ''), { size: 10, color: 80 });
        y += 16;
    
        // --- LAYER-BY-LAYER ANALYSIS ---
        layers.forEach((layer) => {
            if (y + 60 > pageHeight - margin) { // Pre-emptive page break check
              doc.addPage();
              y = margin;
            }
    
            doc.setDrawColor(220);
            doc.line(margin, y, pageWidth - margin, y);
            y += 16;
    
            addText(layer.name, { size: 14, style: "bold" });
            y += 4;
    
            if (layer.status === "pending" || layer.status === 'analyzing') {
                addText("Pending AI investigation...", { size: 10, style: "italic", color: 150 });
            } else if (layer.status === 'error') {
                addText("An error occurred during analysis.", { size: 10, style: "italic", color: 200 });
            } else if (layer.threat && layer.mitigation) {
                addText("Identified Threats", { size: 12, style: "bold" });
                addText(layer.threat.replace(/###\s|##\s|#\s|\*\*/g, ''), { size: 10, color: 80 });
                y += 8;
    
                addText("Mitigation Strategy", { size: 12, style: "bold" });
                
                addText("Recommendation:", { size: 10, style: "bold", x: margin + 4 });
                addText(layer.mitigation.recommendation, { size: 10, x: margin + 8, color: 80});
                y += 4;
    
                addText("Reasoning:", { size: 10, style: "bold", x: margin + 4});
                addText(layer.mitigation.reasoning, { size: 10, x: margin + 8, color: 80 });
                y += 4;
    
                addText("Caveats:", { size: 10, style: "bold", x: margin + 4 });
                addText(layer.mitigation.caveats, { size: 10, x: margin + 8, color: 80 });
            }
            y += 10;
        });
    
        addLog("Saving PDF file...");
        doc.save("MAESTRO_Threat_Analysis.pdf");
        addLog("PDF report saved successfully.");
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during PDF generation.";
        addLog(`PDF Generation Error: ${errorMessage}`);
        console.error("PDF Generation Error:", error);
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" side="left" variant="sidebar">
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-8 w-8 text-primary"><rect width="256" height="256" fill="none"/><path d="M45.1,182.2a7.9,7.9,0,0,1-6.2-13.4l80-96a7.9,7.9,0,0,1,12.2,0l80,96a8,8,0,0,1-12.2,10.8L128,88.2,51.3,179.6a7.9,7.9,0,0,1-6.2,2.6Z" fill="currentColor"/><path d="M210.9,202.8,137.1,72.6a8.2,8.2,0,0,0-14.2,0L48.9,202.8a8,8,0,0,0,7.1,13.2H203.8a8,8,0,0,0,7.1-13.2Zm-8.1,4.4H56L128,96.3Z" fill="currentColor"/></svg>
            <h1 className="text-xl font-headline font-semibold">
              MAESTRO
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-0">
          <SidebarInputForm
            onAnalyze={handleAnalyze}
            onStop={handleStop}
            isAnalyzing={isAnalyzing}
            buttonText={buttonText}
            onDescriptionChange={(desc) => {
              setCurrentArchitecture(desc);
            }}
          />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <main className="flex-1 p-4 md:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">
                  Threat Analyzer
                </h1>
                <p className="text-muted-foreground">
                  AI-Powered Threat Analysis for Multi-Agent Systems
                </p>
              </div>
            </div>
             <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                {isDownloading ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
              Download PDF Report
            </Button>
          </div>

          <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Card>
                <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
                  <Terminal className="h-5 w-5 text-muted-foreground"/>
                  <CardTitle className="text-base font-medium">Analysis Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-40 w-full rounded-md border bg-muted/50 p-4">
                    <div ref={logsContainerRef}>
                      {logs.map((log, index) => (
                        <p key={index} className="text-sm font-mono text-muted-foreground">
                          <span className="text-primary mr-2">&gt;</span>{log}
                        </p>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

             <div className="lg:col-span-4">
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <ToyBrick className="h-5 w-5 text-muted-foreground"/>
                    <CardTitle className="text-base font-medium">Architecture Diagram</CardTitle>
                  </div>
                  <Button size="sm" onClick={handleGenerateDiagram} disabled={isGeneratingDiagram || !currentArchitecture}>
                    {isGeneratingDiagram && <Spinner className="mr-2 h-4 w-4" />}
                    Generate
                  </Button>
                </CardHeader>
                <CardContent>
                   <div ref={diagramContainerRef} className="flex items-center justify-center min-h-[140px] w-full rounded-md border border-dashed bg-muted/50 p-4">
                      {isGeneratingDiagram ? (
                          <div className="text-center text-muted-foreground">
                              <Spinner className="h-6 w-6 mx-auto mb-2" />
                              <p className="text-sm">AI is generating the diagram...</p>
                          </div>
                      ) : mermaidCode ? (
                          <MermaidDiagram code={mermaidCode} />
                      ) : (
                          <div className="text-center text-muted-foreground">
                              <p className="text-sm">Click 'Generate' to create a diagram</p>
                              <p className="text-xs">from the architecture description.</p>
                          </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {layers.map((layer) => (
              <div key={layer.id} className="lg:col-span-4 md:col-span-6">
                <LayerCard layer={layer} />
              </div>
            ))}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
