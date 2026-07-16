"use client";

import { VariablesPlayground } from "./VariablesPlayground";
import { CastingLab } from "./CastingLab";
import { OperatorLab } from "./OperatorLab";
import { LoopVisualizer } from "./LoopVisualizer";
import { ListIndexer } from "./ListIndexer";
import { CentralTendency } from "./CentralTendency";
import { BellCurve } from "./BellCurve";
import { ScatterCorrelation } from "./ScatterCorrelation";
import { DataFrameAnatomy } from "./DataFrameAnatomy";

const REGISTRY: Record<string, React.ComponentType> = {
  "variables-playground": VariablesPlayground,
  "casting-lab": CastingLab,
  "operator-lab": OperatorLab,
  "loop-visualizer": LoopVisualizer,
  "list-indexer": ListIndexer,
  "central-tendency": CentralTendency,
  "bell-curve": BellCurve,
  "scatter-correlation": ScatterCorrelation,
  "dataframe-anatomy": DataFrameAnatomy,
};

// Renders an interactive visualization by key (from lesson content blocks).
export function VizBlock({ name }: { name: string }) {
  const Comp = REGISTRY[name];
  if (!Comp) return null;
  return <Comp />;
}
