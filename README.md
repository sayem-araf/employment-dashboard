# Employment services: costs, outcomes and funding

Independent portfolio demonstration by Sayem Araf. All data and payment terms are synthetic. No official City of Tampere affiliation or data.

## View
Open dashboard.html in a modern browser. It is self-contained and works offline; no installation or API key is needed.

## TypeScript source
Edit dashboard.ts. It uses browser DOM APIs, no framework or external libraries. template.html supplies layout and styling.

With Node.js 22.18+ (or another version supporting stripTypeScriptTypes):

```sh
node build.mjs
node checks.mjs
```

build.mjs strips types and embeds the script in dashboard.html. It does not perform static type checking. For static checking with TypeScript installed:

```sh
tsc --noEmit --strict --target ES2022 --module ESNext --lib ES2022,DOM dashboard.ts
```

## Demonstration walkthrough
1. Compare the three synthetic service cohorts and cost structures.
2. Filter a service; observe that totals and funding scenarios use the same cohort.
3. Adjust base payment, outcome payment and sustained employment rate.
4. Explain funding coverage, the required outcome threshold and sensitivity.
5. Discuss verification, missing follow-up, equity and participant-selection incentives.
6. Export scenario calculations or print a summary.

## Interpretation
Six-month sustained employment is an illustrative criterion that would require a precise operational definition. All cohorts are assumed to have complete follow-up. Observed differences do not identify causal impact. Provider funding less cost does not measure public savings or social return. Costs can be stressed separately from outcome rates. A total funding cap applies to base plus outcome payments. Sensitivity rows vary the rate by ten percentage points and are not statistical confidence intervals. Cash-flow timing, risk adjustment and benefit savings remain outside this prototype.

Replace services with validated aggregated data only after agreeing definitions, follow-up windows, permissions, cost allocation and outcome verification. Do not paste personal participant data into a public portfolio.

## Revision: 15 October 2026
Added a total payment cap, cost stress input, explicit nine-month observation window and 180-day sustained employment definition, synthetic labels, cost boundaries and methodological references. All figures remain uncalibrated synthetic examples. Sources inform design, not numeric benchmarks.
