/** Portfolio demonstration. All records and funding assumptions are synthetic. */
export interface Service {
  id: string; name: string; participants: number; employed: number;
  sustained: number; staff: number; delivery: number; overhead: number;
}
export interface Assumptions { base: number; outcomePayment: number; outcomeRate: number; capPerParticipant?: number; costChange?: number; }
export const services: Service[] = [
  { id: 'coaching', name: 'Career coaching', participants: 120, employed: 66, sustained: 48, staff: 144000, delivery: 42000, overhead: 24000 },
  { id: 'skills', name: 'Skills development', participants: 80, employed: 48, sustained: 36, staff: 128000, delivery: 96000, overhead: 16000 },
  { id: 'matching', name: 'Employer matching', participants: 100, employed: 62, sustained: 50, staff: 120000, delivery: 30000, overhead: 20000 },
];
export const divide = (a: number, b: number): number | null => b > 0 ? a / b : null;
export function summarise(rows: Service[]) {
  const sum = (key: keyof Omit<Service, 'id' | 'name'>) => rows.reduce((a, r) => a + r[key], 0);
  const participants = sum('participants'), employed = sum('employed'), sustained = sum('sustained');
  const staff = sum('staff'), delivery = sum('delivery'), overhead = sum('overhead');
  const cost = staff + delivery + overhead;
  return { participants, employed, sustained, staff, delivery, overhead, cost,
    employmentRate: divide(employed, participants), sustainedRate: divide(sustained, participants),
    costPerParticipant: divide(cost, participants), costPerOutcome: divide(cost, sustained) };
}
export function scenario(participants: number, cost: number, a: Assumptions) {
  if (![participants, cost, a.base, a.outcomePayment, a.outcomeRate].every(Number.isFinite) ||
      participants < 0 || cost < 0 || a.base < 0 || a.outcomePayment < 0 || a.outcomeRate < 0 || a.outcomeRate > 1)
    throw new Error('Inputs must be finite, non-negative; outcome rate must be between 0 and 1.');
  const cap = a.capPerParticipant ?? 100000;
  const change = a.costChange ?? 0;
  if (!Number.isFinite(cap) || cap < 0 || !Number.isFinite(change) || change < -1) throw new Error('Invalid cap or cost change');
  const adjustedCost = cost * (1 + change);
  const outcomes = participants * a.outcomeRate;
  const baseFunding = participants * a.base, outcomeFunding = outcomes * a.outcomePayment;
  const uncappedFunding = baseFunding + outcomeFunding;
  const funding = Math.min(uncappedFunding, participants * cap);
  const required = a.outcomePayment > 0 ? Math.max(0, Math.ceil((adjustedCost - baseFunding) / a.outcomePayment)) : adjustedCost <= baseFunding ? 0 : null;
  return { outcomes, baseFunding, outcomeFunding, funding, uncappedFunding, adjustedCost, capApplied: funding < uncappedFunding, balance: funding - adjustedCost, required,
    feasible: required !== null && required <= participants && participants * cap >= adjustedCost };
}
const eur = (n: number | null) => n === null ? 'N/A' : new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const pct = (n: number | null) => n === null ? 'N/A' : `${(n * 100).toFixed(1)}%`;
function mount() {
  const root = document.getElementById('app');
  if (!root) return;
  root.innerHTML = `
    <header><div class="eyebrow">SAYEM ARAF · ANALYTICAL PORTFOLIO</div><h1>Employment services<br>Costs, outcomes & funding</h1><p>A decision-support prototype for comparing service costs and testing outcome-linked funding assumptions.</p><span class="badge">SYNTHETIC DATA · INDEPENDENT DEMO</span></header>
    <section class="toolbar"><label>Service cohort <select id="service"><option value="all">All services</option>${services.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}</select></label><button id="download">Download scenario CSV</button><button id="print">Print / save PDF</button></section>
    <p class="context">Synthetic 2025 intake cohorts, illustrated as assessed on 15 October 2026. Each participant belongs to one service. All have completed a nine-month observation window from enrolment; outcome records are assumed complete. Costs cover the entire cohort and observation window, without duplication.</p>
    <section id="kpis" class="grid four" aria-live="polite"></section>
    <section class="grid two"><article><h2>Simulated cohort outcomes</h2><p>At least 180 consecutive days in paid employment within nine months of enrolment / all enrolled participants (demo definition).</p><div id="bars"></div><p class="note">Different participant needs and starting conditions may explain differences. These comparisons do not establish service effectiveness.</p></article><article><h2>Cost structure</h2><p>Total allocated cost for the selected cohort</p><div id="costs"></div><p class="note">Includes staff, delivery and allocated overhead. Costs and funding are shown separately to avoid double counting.</p></article></section>
    <article><div class="eyebrow">FUNDING SCENARIO</div><h2>What would an outcome-linked model pay?</h2><p>Change assumptions to explore provider cost coverage. Illustrative contract terms for a future cohort of the same size. The scenario rate is independent of the simulated cohort rate above. Values are uncalibrated assumptions, not Tampere contract terms. The cap includes both base and outcome payments.</p><div class="grid three controls"><label>Base payment per participant (€)<input id="base" type="number" min="0" max="10000" step="100" value="1000"></label><label>Payment per sustained outcome (€)<input id="payment" type="number" min="0" max="20000" step="100" value="2500"></label><label>Assumed sustained outcome rate (%)<input id="rate" type="number" min="0" max="100" step="1" value="45"></label><label>Total funding cap per participant (€)<input id="cap" type="number" min="0" max="50000" step="100" value="2500"></label><label>Change in delivery cost (%)<input id="costChange" type="number" min="-50" max="100" step="1" value="0"></label></div><p id="error" role="alert"></p><div id="scenario" class="grid four" aria-live="polite"></div><p id="coverage" class="note"></p><h3>Sensitivity to the outcome rate</h3><div class="table-wrap"><table><thead><tr><th>Assumed rate</th><th>Expected outcomes</th><th>Funding</th><th>Funding less cost</th></tr></thead><tbody id="sensitivity"></tbody></table></div><p class="note">Expected outcomes may be fractional in planning. Actual payments would depend on verified whole-person outcomes and contract rules. Funding less cost is a provider coverage measure, not public-sector savings or social return.</p></article>
    <article><h2>Monitoring & evaluation design</h2><div class="table-wrap"><table><thead><tr><th>Indicator</th><th>Definition / evidence</th><th>Monitoring approach</th></tr></thead><tbody><tr><td>Participation</td><td>Unique enrolled individuals, deduplicated by participant ID</td><td>Monthly service register reconciliation</td></tr><tr><td>Employment entry</td><td>Demo: at least one paid job start within nine months of enrolment / all enrolled participants</td><td>Agree the window and evidence rules before implementation</td></tr><tr><td>Sustained employment</td><td>Demo: 180 consecutive days in paid employment within nine months of enrolment / all enrolled participants; no exclusion of unsuccessful participants</td><td>Document duration, earnings threshold, missing data and evidence source</td></tr><tr><td>Cost per sustained outcome</td><td>Allocated cohort cost / verified sustained outcomes</td><td>Reconcile financial ledger and outcome register; report N/A when zero</td></tr><tr><td>Equity & incentive safeguards</td><td>Outcomes by agreed participant groups; access, dropouts and service quality</td><td>Check incentives to select easier cases; protect privacy and suppress small groups</td></tr></tbody></table></div><details><summary>Methodology, limitations and next steps</summary><p><strong>Observed outcomes are not causal impact.</strong> Estimating additional employment attributable to a service requires a credible comparison, baseline characteristics, an agreed follow-up period and a suitable evaluation design. No causal estimate is calculated here.</p><p><strong>Funding formula:</strong> minimum of (participants × base payment + expected sustained outcomes × outcome payment) and (participants × total funding cap). Scenario cost = cohort cost × (1 + cost change). Expected sustained outcomes = participants × assumed rate. Coverage threshold = ceiling((scenario cost − base funding) / outcome payment), floored at zero. If the threshold exceeds cohort size, or the cap is below scenario costs, coverage is infeasible. Sensitivity rows are assumption changes of ±10 percentage points, bounded at 0–100%; they are not confidence intervals.</p><p><strong>Before operational use:</strong> agree indicator definitions with service teams, finance, procurement and evaluation specialists; validate data permissions and quality; test payment caps, verification, risk adjustment and unintended incentives. Recent cohorts with incomplete follow-up must be reported separately.</p><p><strong>Cost boundary:</strong> provider staff, delivery and allocated overhead only; excludes benefit payments, commissioner administration and wider social costs. Staff includes employment on-costs; figures use a consistent illustrative cost basis with no VAT calculation. Cash-flow timing, payment delays and discounting are outside the model.</p><p><strong>Data:</strong> all values are invented for this demonstration. No personal records, official city data, public funding rules or taxpayer-savings estimates are used.</p></details><h3>Methodological references</h3><p class="note">The sources inform model design only; they do not supply the figures or validate the payment rates. <a href="https://www.oecd.org/en/publications/2022/01/paying-for-results_e21263a2.html">OECD (2022), Paying for results</a> reviews outcome-linked employment contracts. <a href="https://arkisto.sitra.fi/en/articles/ten-tips-for-an-effective-impact/">Sitra (2019), Ten tips for an effective impact</a> discusses outcomes-based agreements. Reviewed 15 October 2026.</p></article><footer>Independent portfolio prototype · Sayem Araf · Built to demonstrate financial modelling, monitoring design and scenario analysis.</footer>`;
  const input = (id: string) => document.getElementById(id) as HTMLInputElement;
  const card = (label: string, value: string, sub: string) => `<div class="metric"><span>${label}</span><strong>${value}</strong><small>${sub}</small></div>`;
  let csv = '';
  const render = () => {
    const rows = services.filter(s => input('service').value === 'all' || s.id === input('service').value);
    const m = summarise(rows);
    document.getElementById('kpis')!.innerHTML = card('Participants', String(m.participants), `${m.employed} entered employment`) + card('Total service cost', eur(m.cost), `${eur(m.costPerParticipant)} per participant`) + card('Sustained employment', pct(m.sustainedRate), `${m.sustained} simulated outcomes; 180-day criterion`) + card('Cost per sustained outcome', eur(m.costPerOutcome), 'Synthetic cohort cost / simulated outcomes');
    document.getElementById('bars')!.innerHTML = rows.map(s => `<div class="bar-row"><div><strong>${s.name}</strong><span>${pct(divide(s.sustained,s.participants))} · ${s.sustained}/${s.participants}</span></div><div class="track"><div style="width:${s.sustained / s.participants * 100}%"></div></div></div>`).join('');
    document.getElementById('costs')!.innerHTML = [['Staff', m.staff], ['Delivery', m.delivery], ['Overhead', m.overhead]].map(([label,value]) => `<div class="bar-row"><div><strong>${label}</strong><span>${eur(value as number)}</span></div><div class="track cost"><div style="width:${m.cost ? (value as number) / m.cost * 100 : 0}%"></div></div></div>`).join('');
    const values = [input('base'), input('payment'), input('rate'), input('cap'), input('costChange')];
    const valid = values.every(el => el.value.trim() !== '' && el.checkValidity() && Number.isFinite(el.valueAsNumber));
    document.getElementById('error')!.textContent = valid ? '' : 'Enter valid values within the stated ranges. Scenario results are unavailable until corrected.';
    (document.getElementById('download') as HTMLButtonElement).disabled = !valid;
    if (!valid) { document.getElementById('scenario')!.innerHTML = ''; document.getElementById('coverage')!.textContent = ''; document.getElementById('sensitivity')!.innerHTML = ''; return; }
    const a = { base: values[0].valueAsNumber, outcomePayment: values[1].valueAsNumber, outcomeRate: values[2].valueAsNumber / 100, capPerParticipant: values[3].valueAsNumber, costChange: values[4].valueAsNumber / 100 };
    const r = scenario(m.participants,m.cost,a);
    document.getElementById('scenario')!.innerHTML = card('Expected outcomes', r.outcomes.toFixed(1), pct(a.outcomeRate) + ' of participants') + card('Scenario cost', eur(r.adjustedCost), `${a.costChange * 100}% change from cohort cost`) + card('Total funding', eur(r.funding), r.capApplied ? `Capped; ${eur(r.uncappedFunding)} before cap` : `${eur(r.baseFunding)} base + ${eur(r.outcomeFunding)} outcomes`) + card('Funding less cost', eur(r.balance), r.balance >= 0 ? 'Costs covered under assumptions' : 'Costs exceed modelled funding');
    document.getElementById('coverage')!.textContent = r.required === null ? 'Cost coverage cannot be reached with zero outcome payment and the current base funding.' : `Cost coverage requires ${r.required} sustained outcomes (${pct(divide(r.required,m.participants))} of the cohort). ${r.feasible ? 'Within cohort size; achievement is uncertain.' : 'Infeasible: the required count exceeds cohort size or the total funding cap is below costs.'}`;
    document.getElementById('coverage')!.textContent += ` Base funding covers ${pct(divide(r.baseFunding,r.adjustedCost))} of scenario costs before applying the cap. ${a.capPerParticipant < a.base ? 'Warning: the cap is below the base payment; the base entitlement cannot be paid in full.' : ''}`;
    const rates = [...new Set([Math.max(0,a.outcomeRate-.1), a.outcomeRate, Math.min(1,a.outcomeRate+.1)])].sort((x,y)=>x-y);
    const cases = rates.map(rate => ({rate, ...scenario(m.participants,m.cost,{...a,outcomeRate:rate})}));
    document.getElementById('sensitivity')!.innerHTML = cases.map(c=>`<tr><td>${pct(c.rate)}</td><td>${c.outcomes.toFixed(1)}</td><td>${eur(c.funding)}</td><td>${eur(c.balance)}</td></tr>`).join('');
    csv = 'data_type,service,participants,scenario_cost_eur,cap_per_participant_eur,cost_change,base_per_participant_eur,payment_per_outcome_eur,assumed_rate,expected_outcomes,funding_eur,funding_less_cost_eur\n' + cases.map(c=>['SYNTHETIC',input('service').value,m.participants,c.adjustedCost,a.capPerParticipant,a.costChange,a.base,a.outcomePayment,c.rate.toFixed(4),c.outcomes.toFixed(2),c.funding.toFixed(2),c.balance.toFixed(2)].join(',')).join('\n');
  };
  ['service','base','payment','rate','cap','costChange'].forEach(id=>input(id).addEventListener('input',render));
  document.getElementById('print')!.addEventListener('click',()=>window.print());
  document.getElementById('download')!.addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='synthetic-funding-scenarios.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  render();
}
if (typeof document !== 'undefined') mount();
