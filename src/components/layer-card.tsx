"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { LayerData } from "@/lib/types";
import {
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Spinner } from "./icons";
import { cn } from "@/lib/utils";

interface LayerCardProps {
  layer: LayerData;
}

export function LayerCard({ layer }: LayerCardProps) {
  const getStatusBadge = () => {
    switch (layer.status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "analyzing":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Spinner className="mr-1 h-3 w-3" />
            Analyzing...
          </Badge>
        );
      case "complete":
        return (
          <Badge className="bg-primary/20 text-primary-foreground dark:bg-primary/30 dark:text-primary-foreground">
            Complete
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-xl">{layer.name}</CardTitle>
            <CardDescription className="mt-1">
              MAESTRO Layer Analysis
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        {layer.status === "analyzing" && (
          <div className="flex flex-col items-center justify-center flex-grow text-muted-foreground">
            <Spinner className="h-8 w-8 mb-2" />
            <p>AI is analyzing threats...</p>
          </div>
        )}

        {layer.status === "error" && (
           <div className="flex flex-col items-center justify-center flex-grow text-destructive">
             <XCircle className="h-8 w-8 mb-2" />
             <p>Analysis failed</p>
           </div>
        )}

        {layer.status === "complete" && layer.threat && layer.mitigation && (
          <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="font-semibold">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                  Identified Threat
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {layer.threat}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="font-semibold">
                 <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Mitigation Strategy
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-1">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Recommendation
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {layer.mitigation.recommendation}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-1">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Reasoning
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {layer.mitigation.reasoning}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-accent" />
                      Caveats
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {layer.mitigation.caveats}
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
