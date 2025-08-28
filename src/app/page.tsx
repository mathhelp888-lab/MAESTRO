"use client";

import * as React from "react";
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
import { suggestThreat, recommendMitigation } from "@/app/actions";
import { MAESTRO_LAYERS } from "@/data/maestro";
import { type LayerData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal } from "lucide-react";

const INITIAL_LAYERS: LayerData[] = MAESTRO_LAYERS.map((layer) => ({
  ...layer,
  threat: null,
  mitigation: null,
  status: "pending",
}));

export default function Home() {
  const [layers, setLayers] = React.useState<LayerData[]>(INITIAL_LAYERS);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [buttonText, setButtonText] = React.useState("Generate Analysis");
  const [logs, setLogs] = React.useState<string[]>([]);
  const logsContainerRef = React.useRef<HTMLDivElement>(null);

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

  const handleAnalyze = async (architectureDescription: string) => {
    setIsAnalyzing(true);
    setLogs([]);
    setLayers(INITIAL_LAYERS);
    addLog("Starting MAESTRO threat analysis...");

    for (const layer of MAESTRO_LAYERS) {
      try {
        setButtonText(`Analyzing: ${layer.name}`);
        addLog(`[${layer.name}] Analysis started...`);
        updateLayerStatus(layer.id, "analyzing");

        addLog(`[${layer.name}] Calling AI to suggest threats...`);
        const threatResult = await suggestThreat(
          architectureDescription,
          layer.name
        );
        const threat = threatResult.threatAnalysis;
        addLog(`[${layer.name}] Threat identified: "${threat.substring(0, 50)}..."`);
        setLayers((prev) =>
          prev.map((l) => (l.id === layer.id ? { ...l, threat } : l))
        );

        addLog(`[${layer.name}] Calling AI for mitigation strategies...`);
        const mitigation = await recommendMitigation(threat, layer.name);
        addLog(`[${layer.name}] Mitigation recommendation received.`);
        setLayers((prev) =>
          prev.map((l) =>
            l.id === layer.id ? { ...l, mitigation, status: "complete" } : l
          )
        );
        addLog(`[${layer.name}] Analysis complete.`);
      } catch (error) {
        console.error(`Error analyzing layer ${layer.name}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        addLog(`[${layer.name}] Error: ${errorMessage}`);
        updateLayerStatus(layer.id, "error");
      }
    }

    setButtonText("Generate Analysis");
    addLog("Full analysis complete.");
    setIsAnalyzing(false);
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
            isAnalyzing={isAnalyzing}
            buttonText={buttonText}
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
