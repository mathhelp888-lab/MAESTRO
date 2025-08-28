"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Spinner } from "./icons";

interface MermaidDiagramProps {
  code: string;
}

// Generate a unique ID for each diagram
let idCounter = 0;
const generateId = () => `mermaid-diagram-${idCounter++}`;

export function MermaidDiagram({ code }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [diagramId] = useState(generateId);

  useEffect(() => {
    setLoading(true);
    if (ref.current && code) {
      mermaid.initialize({
        startOnLoad: false,
        theme: "neutral", // or base, dark, forest, neutral
        securityLevel: "loose",
        fontFamily: "Inter, sans-serif",
      });

      mermaid.render(diagramId, code)
        .then(({ svg }) => {
          setSvg(svg);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Mermaid rendering error:", error);
          setSvg(`<p class="text-destructive">Error rendering diagram.</p>`);
          setLoading(false);
        });
    }
  }, [code, diagramId]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      {loading && <Spinner className="w-8 h-8 text-muted-foreground" />}
      <div ref={ref} dangerouslySetInnerHTML={{ __html: svg || "" }} className={loading ? 'hidden' : ''} />
      <div id={diagramId} className="hidden" />
    </div>
  );
}
