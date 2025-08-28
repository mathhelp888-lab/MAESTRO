
"use client";

import * as React from "react";
import jsPDF from "jspdf";
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
import { Download, Terminal } from "lucide-react";
import { Spinner } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";

const INITIAL_LAYERS: LayerData[] = MAESTRO_LAYERS.map((layer) => ({
  ...layer,
  threat: null,
  mitigation: null,
  status: "pending",
}));

const MAESTRO_METHODOLOGY_SUMMARY = `This report applies the MAESTRO (Multi-Agent Environment, Security, Threat, Risk, and Outcome) framework for agentic AI threat modeling. MAESTRO provides a structured, seven-layer approach to systematically analyze and mitigate security risks in multi-agent systems. It addresses both traditional security vulnerabilities and novel threats arising from agentic factors like autonomy, non-determinism, and complex agent-to-agent interactions. The following sections detail the analysis for each layer based on the provided system architecture.`;


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
  const { toast } = useToast();


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

  const handleDownloadPdf = async () => {
    if (!currentArchitecture) {
      toast({
        title: "Architecture Description Missing",
        description: "Please enter an architecture description before downloading the report.",
        variant: "destructive",
      });
      return;
    }
    
    setIsDownloading(true);
    addLog("PDF generation started...");

    let diagramDataUri = null;
    try {
      addLog("Generating architecture diagram...");
      const diagramResult = await getArchitectureDiagram(currentArchitecture);
      diagramDataUri = diagramResult.diagramDataUri;
      addLog("Diagram generated successfully!");
    } catch (error) {
      console.error("Failed to generate architecture diagram:", error);
      addLog("Diagram generation failed. The PDF will be created without it.");
    }

    addLog("Assembling PDF document...");
    const doc = new jsPDF({unit: "px", format: "letter"});
    doc.setFont("helvetica", "normal");
    const margin = 30;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const usableWidth = pageWidth - margin * 2;
    let y = margin;

    const addText = (text: string, options: any = {}) => {
      const { size = 10, style = 'normal', markdown = false, x = margin, align = 'left' } = options;
      
      doc.setFontSize(size);
      doc.setFont("helvetica", style);

      const plainText = markdown
        ? text.toString().replace(/###\s/g, '').replace(/##\s/g, '').replace(/#\s/g, '').replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '')
        : text;

      const lines = doc.splitTextToSize(plainText, usableWidth - (x > margin ? (x - margin) : 0));
      const textHeight = lines.length * (doc.getLineHeight(plainText) / doc.getFont().lineHeightFactor) * 1.15;
  
      if (y + textHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(lines, x, y, { align: align });
      y += textHeight;
    };
    
    // --- HEADER ---
    addText("MAESTRO Threat Analysis Report", { size: 20, style: "bold", align: "center", x: pageWidth / 2 });
    y += 10;
  
    // --- DISCLAIMER & DEVELOPER INFO ---
    y += 4;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Developed by:", margin, y);
    doc.setTextColor(60, 120, 255);
    doc.textWithLink("DistributedApps.ai", margin + 55, y, { url: 'https://distributedapps.ai/' });
    y += 12;

    doc.setTextColor(100);
    const disclaimer = "This report is generated by an AI assistant based on the MAESTRO framework. AI can make mistakes; always double-check threats and mitigations with a security expert.";
    addText(disclaimer, { size: 8 });
    y += 20;

    // --- ARCHITECTURE DESCRIPTION ---
    doc.setTextColor(0);
    addText("Analyzed System Architecture", { size: 16, style: "bold" });
    y+= 6;
    doc.setTextColor(80);
    addText(currentArchitecture, { size: 10 });
    y += 10;

    // --- ARCHITECTURE DIAGRAM ---
    if (diagramDataUri) {
      if (y > pageHeight - 200) { // Check if there's enough space for the image
        doc.addPage();
        y = margin;
      }
      addText("Architecture Diagram", { size: 16, style: "bold" });
      y+= 6;
      try {
        const img = new Image();
        img.src = diagramDataUri;
        await new Promise(resolve => img.onload = resolve);
        const aspectRatio = img.width / img.height;
        const imgWidth = usableWidth;
        const imgHeight = imgWidth / aspectRatio;
        
        if (y + imgHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
        
        doc.addImage(diagramDataUri, 'PNG', margin, y, imgWidth, imgHeight);
        y += imgHeight + 10;
      } catch (e) {
        console.error("Error adding image to PDF:", e);
        addText("Error embedding diagram.", { size: 10, style: "italic" });
      }
    }

    // --- EXECUTIVE SUMMARY ---
    if (y > pageHeight - 120) {
      doc.addPage();
      y = margin;
    }
    doc.setTextColor(0);
    addText("Executive Summary", { size: 16, style: "bold" });
    y+= 6;
    doc.setTextColor(80);
    const summaryToUse = executiveSummary || MAESTRO_METHODOLOGY_SUMMARY;
    addText(summaryToUse, { size: 10, markdown: true });
    y += 16;
  
    // --- LAYER-BY-LAYER ANALYSIS ---
    layers.forEach((layer) => {
      if (y > pageHeight - 120) {
        doc.addPage();
        y = margin;
      }
  
      doc.setDrawColor(220);
      doc.line(margin, y, pageWidth - margin, y);
      y += 16;
  
      doc.setTextColor(0);
      addText(layer.name, { size: 14, style: "bold" });
      y += 4;
  
      if (layer.status === "pending" || layer.status === 'analyzing') {
        doc.setTextColor(150);
        addText("Pending AI investigation...", { size: 10, style: "italic" });
      } else if (layer.status === 'error') {
        doc.setTextColor(200, 0, 0);
        addText("An error occurred during analysis.", { size: 10, style: "italic" });
      } else if (layer.threat && layer.mitigation) {
        doc.setTextColor(0);
        addText("Identified Threats", { size: 12, style: "bold" });
        doc.setTextColor(80);
        addText(layer.threat, { size: 10, markdown: true });
        y += 8;
  
        doc.setTextColor(0);
        addText("Mitigation Strategy", { size: 12, style: "bold" });
        
        addText("Recommendation:", { size: 10, style: "bold", x: margin + 4 });
        doc.setTextColor(80);
        addText(layer.mitigation.recommendation, { size: 10, x: margin + 8});
        y += 4;
  
        doc.setTextColor(0);
        addText("Reasoning:", { size: 10, style: "bold", x: margin + 4});
        doc.setTextColor(80);
        addText(layer.mitigation.reasoning, { size: 10, x: margin + 8 });
        y += 4;
  
        doc.setTextColor(0);
        addText("Caveats:", { size: 10, style: "bold", x: margin + 4 });
        doc.setTextColor(80);
        addText(layer.mitigation.caveats, { size: 10, x: margin + 8 });
      }
      y += 10;
    });
  
    addLog("Saving PDF file...");
    doc.save("MAESTRO_Threat_Analysis.pdf");
    addLog("PDF report saved successfully.");
    setIsDownloading(false);
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
            onDescriptionChange={setCurrentArchitecture}
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
            <div className="lg:col-span-12">
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
