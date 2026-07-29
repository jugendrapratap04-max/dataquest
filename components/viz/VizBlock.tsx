"use client";

import { CodeRunner } from "./CodeRunner";
import { TestLab } from "./TestLab";
import { SpreadLab } from "./SpreadLab";
import { ProbabilityLab } from "./ProbabilityLab";
import { LogLevels } from "./LogLevels";
import { StyleLab } from "./StyleLab";
import { GitFlow } from "./GitFlow";
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
import { RecursionLab } from "./RecursionLab";
import { InheritanceLab } from "./InheritanceLab";
import { EncapsulationLab } from "./EncapsulationLab";
import { DunderLab } from "./DunderLab";
import { GeneratorLab } from "./GeneratorLab";
import { DecoratorLab } from "./DecoratorLab";
import { RegexLab } from "./RegexLab";
import { ConcurrencyLab } from "./ConcurrencyLab";
import { AsyncLab } from "./AsyncLab";
import { CounterLab } from "./CounterLab";
import { PathLab } from "./PathLab";
import { StorageLab } from "./StorageLab";
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
import { BoxPlot } from "./BoxPlot";
import { BayesGrid } from "./BayesGrid";
import { DistributionLab } from "./DistributionLab";
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
  "recursion-lab": RecursionLab,
  "inheritance-lab": InheritanceLab,
  "encapsulation-lab": EncapsulationLab,
  "dunder-lab": DunderLab,
  "generator-lab": GeneratorLab,
  "decorator-lab": DecoratorLab,
  "regex-lab": RegexLab,
  "concurrency-lab": ConcurrencyLab,
  "async-lab": AsyncLab,
  "counter-lab": CounterLab,
  "path-lab": PathLab,
  "storage-lab": StorageLab,
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
  "box-plot": BoxPlot,
  "bayes-grid": BayesGrid,
  "distribution-lab": DistributionLab,
  "scatter-correlation": ScatterCorrelation,
  "dataframe-anatomy": DataFrameAnatomy,
  "test-lab": TestLab,
  "spread-lab": SpreadLab,
  "probability-lab": ProbabilityLab,
  "log-levels": LogLevels,
  "style-lab": StyleLab,
  "git-flow": GitFlow,
};

// Renders an interactive visualization by key (from lesson content blocks).
export function VizBlock({ name }: { name: string }) {
  const Comp = REGISTRY[name];
  if (!Comp) return null;
  return <Comp />;
}
