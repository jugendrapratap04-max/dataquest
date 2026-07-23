"use client";

import { CodeRunner } from "./CodeRunner";
import { ConditionFlow } from "./ConditionFlow";
import { CollectionBench } from "./CollectionBench";
import { FunctionMachine } from "./FunctionMachine";
import { FloatLab } from "./FloatLab";
import { FileLab } from "./FileLab";
import { ImportLab } from "./ImportLab";
import { FormatLab } from "./FormatLab";
import { LambdaLab } from "./LambdaLab";
import { ScopeLab } from "./ScopeLab";
import { JsonBridge } from "./JsonBridge";
import { StrftimeLab } from "./StrftimeLab";
import { BitwiseLab } from "./BitwiseLab";
import { MatchLab } from "./MatchLab";
import { VariablesPlayground } from "./VariablesPlayground";
import { CastingLab } from "./CastingLab";
import { OperatorLab } from "./OperatorLab";
import { LoopVisualizer } from "./LoopVisualizer";
import { ListIndexer } from "./ListIndexer";
import { StringSlicer } from "./StringSlicer";
import { ComprehensionBuilder } from "./ComprehensionBuilder";
import { ObjectInspector } from "./ObjectInspector";
import { ExceptionFlow } from "./ExceptionFlow";
import { TruthinessTester } from "./TruthinessTester";
import { CentralTendency } from "./CentralTendency";
import { BellCurve } from "./BellCurve";
import { ScatterCorrelation } from "./ScatterCorrelation";
import { DataFrameAnatomy } from "./DataFrameAnatomy";

const REGISTRY: Record<string, React.ComponentType> = {
  "code-runner": CodeRunner,
  "condition-flow": ConditionFlow,
  "collection-bench": CollectionBench,
  "function-machine": FunctionMachine,
  "float-lab": FloatLab,
  "file-lab": FileLab,
  "import-lab": ImportLab,
  "format-lab": FormatLab,
  "lambda-lab": LambdaLab,
  "scope-lab": ScopeLab,
  "json-bridge": JsonBridge,
  "strftime-lab": StrftimeLab,
  "bitwise-lab": BitwiseLab,
  "match-lab": MatchLab,
  "variables-playground": VariablesPlayground,
  "casting-lab": CastingLab,
  "operator-lab": OperatorLab,
  "loop-visualizer": LoopVisualizer,
  "list-indexer": ListIndexer,
  "string-slicer": StringSlicer,
  "comprehension-builder": ComprehensionBuilder,
  "object-inspector": ObjectInspector,
  "exception-flow": ExceptionFlow,
  "truthiness-tester": TruthinessTester,
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
