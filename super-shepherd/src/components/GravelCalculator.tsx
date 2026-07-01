import React, { useMemo, useState } from 'react';
import { Calculator, ChevronDown, Package, RefreshCcw, Ruler, Scale, Truck } from 'lucide-react';

type Unit = 'imperial' | 'metric';
type Shape = 'rectangle' | 'circle' | 'triangle';
type MaterialKey = 'gravel' | 'peaGravel' | 'crushedStone' | 'limestone' | 'sand';

const MATERIAL_DENSITY_LB_PER_CU_YD: Record<MaterialKey, number> = {
  gravel: 2800,
  peaGravel: 2700,
  crushedStone: 3000,
  limestone: 2600,
  sand: 2400,
};

const MATERIAL_LABELS: Record<MaterialKey, string> = {
  gravel: 'Standard gravel',
  peaGravel: 'Pea gravel',
  crushedStone: 'Crushed stone',
  limestone: 'Limestone',
  sand: 'Sand',
};

function safeNumber(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function format(value: number, maximumFractionDigits = 2) {
  return value.toLocaleString(undefined, { maximumFractionDigits });
}

const GravelCalculator: React.FC = () => {
  const [unit, setUnit] = useState<Unit>('imperial');
  const [shape, setShape] = useState<Shape>('rectangle');
  const [length, setLength] = useState(20);
  const [width, setWidth] = useState(10);
  const [diameter, setDiameter] = useState(12);
  const [base, setBase] = useState(18);
  const [height, setHeight] = useState(10);
  const [depth, setDepth] = useState(2);
  const [material, setMaterial] = useState<MaterialKey>('gravel');
  const [waste, setWaste] = useState(10);
  const [bagSize, setBagSize] = useState(0.5);
  const [pricePerTon, setPricePerTon] = useState(55);
  const [pricePerBag, setPricePerBag] = useState(5.99);

  const results = useMemo(() => {
    const l = safeNumber(length);
    const w = safeNumber(width);
    const d = safeNumber(depth);
    const dia = safeNumber(diameter);
    const b = safeNumber(base);
    const h = safeNumber(height);

    let area = 0;
    if (shape === 'rectangle') area = l * w;
    if (shape === 'circle') area = Math.PI * Math.pow(dia / 2, 2);
    if (shape === 'triangle') area = 0.5 * b * h;

    const wasteMultiplier = 1 + safeNumber(waste) / 100;
    const densityLbPerCuYd = MATERIAL_DENSITY_LB_PER_CU_YD[material];

    if (unit === 'imperial') {
      const cubicFeet = area * (d / 12) * wasteMultiplier;
      const cubicYards = cubicFeet / 27;
      const tons = (cubicYards * densityLbPerCuYd) / 2000;
      const bags = Math.ceil(cubicFeet / Math.max(safeNumber(bagSize), 0.01));
      return {
        area,
        cubicFeet,
        cubicYards,
        cubicMeters: cubicYards * 0.764555,
        tons,
        tonnes: tons * 0.907185,
        bags,
        bulkCost: tons * safeNumber(pricePerTon),
        bagCost: bags * safeNumber(pricePerBag),
      };
    }

    const cubicMeters = area * (d / 100) * wasteMultiplier;
    const cubicYards = cubicMeters * 1.30795;
    const cubicFeet = cubicYards * 27;
    const tons = (cubicYards * densityLbPerCuYd) / 2000;
    const tonnes = tons * 0.907185;
    const bags = Math.ceil((cubicMeters * 1000) / Math.max(safeNumber(bagSize), 0.01));
    return {
      area,
      cubicFeet,
      cubicYards,
      cubicMeters,
      tons,
      tonnes,
      bags,
      bulkCost: tonnes * safeNumber(pricePerTon),
      bagCost: bags * safeNumber(pricePerBag),
    };
  }, [bagSize, base, depth, diameter, height, length, material, pricePerBag, pricePerTon, shape, unit, waste, width]);

  const reset = () => {
    setUnit('imperial');
    setShape('rectangle');
    setLength(20);
    setWidth(10);
    setDiameter(12);
    setBase(18);
    setHeight(10);
    setDepth(2);
    setMaterial('gravel');
    setWaste(10);
    setBagSize(0.5);
    setPricePerTon(55);
    setPricePerBag(5.99);
  };

  const dimensionUnit = unit === 'imperial' ? 'ft' : 'm';
  const depthUnit = unit === 'imperial' ? 'in' : 'cm';

  return (
    <div className="w-full max-w-6xl mx-auto bg-canvas/95 border border-hairline-strong rounded-xl shadow-level-4 overflow-hidden backdrop-blur">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="p-5 sm:p-8 lg:p-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="caption-mono text-mute mb-2">FAST MATERIAL ESTIMATE</p>
              <h2 className="display-sm text-ink">Gravel project inputs</h2>
            </div>
            <div className="flex bg-canvas-soft border border-hairline-strong rounded-sm p-1 w-full sm:w-auto">
              {(['imperial', 'metric'] as Unit[]).map((option) => (
                <button
                  key={option}
                  onClick={() => setUnit(option)}
                  className={`flex-1 sm:flex-none px-4 py-2 body-sm-strong rounded-sm transition-all ${unit === option ? 'bg-canvas text-ink shadow-sm' : 'text-mute hover:text-ink'}`}
                >
                  {option === 'imperial' ? 'Imperial' : 'Metric'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2 rounded-lg border border-hairline bg-canvas-soft/60 p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-mute" />
                <h3 className="body-md-strong text-ink">Project dimensions</h3>
              </div>
              <label className="space-y-1 block">
              <span className="caption text-mute uppercase font-medium">Area shape</span>
              <div className="relative">
                <select value={shape} onChange={(e) => setShape(e.target.value as Shape)} className="classical-input w-full appearance-none">
                  <option value="rectangle">Rectangle / driveway</option>
                  <option value="circle">Circle / round bed</option>
                  <option value="triangle">Triangle / wedge</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-mute pointer-events-none" />
              </div>
            </label>

            {shape === 'rectangle' && (
              <>
                <NumberField label={`Length (${dimensionUnit})`} value={length} onChange={setLength} />
                <NumberField label={`Width (${dimensionUnit})`} value={width} onChange={setWidth} />
              </>
            )}
            {shape === 'circle' && <NumberField label={`Diameter (${dimensionUnit})`} value={diameter} onChange={setDiameter} />}
            {shape === 'triangle' && (
              <>
                <NumberField label={`Base (${dimensionUnit})`} value={base} onChange={setBase} />
                <NumberField label={`Height (${dimensionUnit})`} value={height} onChange={setHeight} />
              </>
            )}
            </div>

            <div className="rounded-lg border border-hairline bg-canvas p-4 sm:p-5 space-y-4">
              <h3 className="body-md-strong text-ink">Depth & allowance</h3>
              <NumberField label={`Depth (${depthUnit})`} value={depth} onChange={setDepth} />
              <NumberField label="Waste / compaction (%)" value={waste} onChange={setWaste} />
            </div>

            <div className="rounded-lg border border-hairline bg-canvas p-4 sm:p-5 space-y-4">
              <h3 className="body-md-strong text-ink">Material & pricing</h3>
              <label className="space-y-1 block">
                <span className="caption text-mute uppercase font-medium">Material density</span>
                <div className="relative">
                  <select value={material} onChange={(e) => setMaterial(e.target.value as MaterialKey)} className="classical-input w-full appearance-none">
                    {Object.entries(MATERIAL_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-mute pointer-events-none" />
                </div>
              </label>
              <NumberField label={unit === 'imperial' ? 'Bag size (cu ft)' : 'Bag size (liters)'} value={bagSize} onChange={setBagSize} />
              <NumberField label={unit === 'imperial' ? 'Bulk price ($/ton)' : 'Bulk price ($/tonne)'} value={pricePerTon} onChange={setPricePerTon} />
              <NumberField label="Price per bag ($)" value={pricePerBag} onChange={setPricePerBag} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button className="classical-button bg-primary text-on-primary h-12 flex-1 uppercase tracking-widest text-xs font-bold">
              <Calculator className="w-4 h-4 mr-2" /> Results update instantly
            </button>
            <button onClick={reset} className="classical-button h-12 flex-1 uppercase tracking-widest text-xs font-bold">
              <RefreshCcw className="w-4 h-4 mr-2" /> Reset
            </button>
          </div>
        </div>

        <aside className="bg-canvas-soft border-t lg:border-t-0 lg:border-l border-hairline-strong p-5 sm:p-8 lg:p-10 space-y-5 lg:sticky lg:top-20 lg:self-start">
          <div>
            <p className="caption-mono text-mute mb-2">YOUR ORDER ESTIMATE</p>
            <h2 className="display-sm text-ink">Yards, tons & bags</h2>
          </div>

          <ResultCard icon={<Truck className="w-4 h-4" />} label="Cubic yards" value={format(results.cubicYards)} helper={`${format(results.cubicFeet, 1)} cu ft`} featured />
          <ResultCard icon={<Scale className="w-4 h-4" />} label="Weight" value={unit === 'imperial' ? `${format(results.tons)} tons` : `${format(results.tonnes)} tonnes`} helper={unit === 'imperial' ? `${format(results.tonnes)} metric tonnes` : `${format(results.tons)} US tons`} />
          <ResultCard icon={<Package className="w-4 h-4" />} label="Bags needed" value={format(results.bags, 0)} helper={`Estimated bag cost: $${format(results.bagCost)}`} />
          <ResultCard icon={<Ruler className="w-4 h-4" />} label="Coverage area" value={`${format(results.area, 1)} ${unit === 'imperial' ? 'sq ft' : 'sq m'}`} helper={`${format(results.cubicMeters)} cubic meters`} />

          <div className="pt-5 border-t border-hairline-strong">
            <div className="flex items-center justify-between gap-4">
              <span className="body-sm text-mute font-bold uppercase tracking-wider text-[10px]">Estimated bulk total</span>
              <span className="display-md text-ink">${format(results.bulkCost)}</span>
            </div>
            <p className="body-sm text-body mt-4 leading-relaxed">
              Order about <strong>{format(results.cubicYards)} cubic yards</strong>, or <strong>{unit === 'imperial' ? `${format(results.tons)} tons` : `${format(results.tonnes)} tonnes`}</strong>. If buying bags, round up to <strong>{format(results.bags, 0)} bags</strong>.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

const NumberField: React.FC<NumberFieldProps> = ({ label, value, onChange }) => (
  <label className="space-y-1">
    <span className="caption text-mute uppercase font-medium">{label}</span>
    <input
      type="number"
      min="0"
      step="any"
      className="classical-input w-full"
      value={value}
      onChange={(event) => onChange(parseFloat(event.target.value) || 0)}
    />
  </label>
);

interface ResultCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
  featured?: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ icon, label, value, helper, featured = false }) => (
  <div className={`rounded-sm border p-4 ${featured ? 'bg-primary text-on-primary border-primary' : 'bg-canvas border-hairline-strong'}`}>
    <div className="flex items-center justify-between gap-3 mb-3">
      <span className={`caption-mono ${featured ? 'text-on-primary/70' : 'text-mute'}`}>{label}</span>
      <span className={featured ? 'text-on-primary/80' : 'text-mute'}>{icon}</span>
    </div>
    <div className={featured ? 'display-lg text-on-primary' : 'display-sm text-ink'}>{value}</div>
    <p className={`body-sm mt-1 ${featured ? 'text-on-primary/75' : 'text-body'}`}>{helper}</p>
  </div>
);

export default GravelCalculator;
