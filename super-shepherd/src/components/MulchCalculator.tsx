import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Maximize2, ChevronDown, Layers, DollarSign } from 'lucide-react';
import { ui, defaultLang } from '../i18n/ui';

type Shape = 'rectangle' | 'circle' | 'triangle';

interface Area {
  id: string;
  shape: Shape;
  name: string;
  length?: number;
  width?: number;
  diameter?: number;
  base?: number;
  height?: number;
}

interface Props {
  lang?: keyof typeof ui;
}

const MulchCalculator: React.FC<Props> = ({ lang = defaultLang }) => {
  const t = (key: keyof typeof ui[typeof defaultLang]) => ui[lang][key] || ui[defaultLang][key];

  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');
  const [areas, setAreas] = useState<Area[]>([
    { id: '1', shape: 'rectangle', name: 'Main Bed', length: 10, width: 5 }
  ]);
  const [depth, setDepth] = useState<number>(3); // inches or cm
  const [pricePerUnit, setPricePerUnit] = useState<number>(45); // bulk price
  const [bagSize, setBagSize] = useState<number>(2); // cu ft or liters
  const [pricePerBag, setPricePerBag] = useState<number>(5.99);
  
  const [totalArea, setTotalArea] = useState<number>(0);
  const [totalVolume, setTotalVolume] = useState<number>(0); // Yards or Meters
  const [totalCostBulk, setTotalCostBulk] = useState<number>(0);
  const [totalCostBags, setTotalCostBags] = useState<number>(0);
  const [numBags, setNumBags] = useState<number>(0);

  useEffect(() => {
    let areaSum = 0;
    areas.forEach(a => {
      let val = 0;
      if (a.shape === 'rectangle') val = (a.length || 0) * (a.width || 0);
      if (a.shape === 'circle') val = Math.PI * Math.pow((a.diameter || 0) / 2, 2);
      if (a.shape === 'triangle') val = 0.5 * (a.base || 0) * (a.height || 0);
      areaSum += val;
    });
    setTotalArea(areaSum);
    
    if (unit === 'imperial') {
      const volumeCuFt = areaSum * (depth / 12);
      const volumeCuYards = volumeCuFt / 27;
      setTotalVolume(volumeCuYards);
      setTotalCostBulk(volumeCuYards * pricePerUnit);
      const bagsRequired = Math.ceil(volumeCuFt / bagSize);
      setNumBags(bagsRequired);
      setTotalCostBags(bagsRequired * pricePerBag);
    } else {
      const volumeCuMeters = areaSum * (depth / 100);
      setTotalVolume(volumeCuMeters);
      setTotalCostBulk(volumeCuMeters * pricePerUnit);
      const volumeLiters = volumeCuMeters * 1000;
      const bagsRequired = Math.ceil(volumeLiters / bagSize);
      setNumBags(bagsRequired);
      setTotalCostBags(bagsRequired * pricePerBag);
    }
  }, [areas, depth, pricePerUnit, bagSize, pricePerBag, unit]);

  const addArea = () => {
    const newId = (areas.length + 1).toString();
    setAreas([...areas, { id: newId, shape: 'rectangle', name: `Area ${newId}`, length: 0, width: 0 }]);
  };

  const removeArea = (id: string) => {
    if (areas.length > 1) {
      setAreas(areas.filter(a => a.id !== id));
    }
  };

  const updateArea = (id: string, updates: Partial<Area>) => {
    setAreas(areas.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 space-y-12 bg-canvas">
      {/* Unit Toggle and Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-left space-y-2">
          <h1 className="display-sm text-ink">{t('calc.title')}</h1>
          <p className="body-sm text-body">{t('calc.subtitle')}</p>
        </div>
        <div className="flex bg-canvas-soft border border-hairline-strong rounded-sm p-1">
          <button 
            onClick={() => setUnit('imperial')}
            className={`px-4 py-1.5 body-sm-strong rounded-sm transition-all duration-150 ${unit === 'imperial' ? 'bg-canvas text-ink shadow-sm' : 'text-mute hover:text-body hover:bg-canvas/50'}`}
          >
            {t('calc.imperial')}
          </button>
          <button 
            onClick={() => setUnit('metric')}
            className={`px-4 py-1.5 body-sm-strong rounded-sm transition-all duration-150 ${unit === 'metric' ? 'bg-canvas text-ink shadow-sm' : 'text-mute hover:text-body hover:bg-canvas/50'}`}
          >
            {t('calc.metric')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Areas Section */}
          <div className="bg-canvas border border-hairline-strong rounded-sm overflow-hidden shadow-sm">
            <div className="bg-canvas-soft border-b border-hairline-strong px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-mute" />
                <h2 className="body-md-strong uppercase tracking-wider text-xs">{t('calc.gardenAreas')}</h2>
              </div>
              <button 
                onClick={addArea}
                className="classical-button h-8 px-4 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" /> {t('calc.addArea')}
              </button>
            </div>
            
            <div className="divide-y divide-hairline">
              {areas.map((area, index) => (
                <div key={area.id} className="p-6 space-y-4 hover:bg-canvas-soft/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <input 
                      className="bg-transparent border-none p-0 body-md-strong focus:ring-0 w-1/2 focus:border-b focus:border-primary/20"
                      value={area.name}
                      onChange={(e) => updateArea(area.id, { name: e.target.value })}
                    />
                    <button 
                      onClick={() => removeArea(area.id)}
                      className="text-mute hover:text-error transition-all hover:scale-110"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="caption text-mute font-medium uppercase tracking-tighter">{t('calc.shape')}</label>
                      <div className="relative">
                        <select 
                          className="w-full h-10 px-3 bg-canvas border border-hairline-strong rounded-sm body-sm appearance-none focus:border-primary focus:ring-0 outline-none transition-all"
                          value={area.shape}
                          onChange={(e) => updateArea(area.id, { shape: e.target.value as Shape })}
                        >
                          <option value="rectangle">{t('calc.rectangle')}</option>
                          <option value="circle">{t('calc.circle')}</option>
                          <option value="triangle">{t('calc.triangle')}</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-mute pointer-events-none" />
                      </div>
                    </div>
                    
                    {area.shape === 'rectangle' && (
                      <>
                        <div className="space-y-1">
                          <label className="caption text-mute font-medium uppercase tracking-tighter">{t('calc.length')} ({unit === 'imperial' ? 'ft' : 'm'})</label>
                          <input 
                            type="number" 
                            className="classical-input w-full"
                            value={area.length || ''}
                            onChange={(e) => updateArea(area.id, { length: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="caption text-mute font-medium uppercase tracking-tighter">{t('calc.width')} ({unit === 'imperial' ? 'ft' : 'm'})</label>
                          <input 
                            type="number" 
                            className="classical-input w-full"
                            value={area.width || ''}
                            onChange={(e) => updateArea(area.id, { width: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </>
                    )}
                    
                    {area.shape === 'circle' && (
                      <div className="space-y-1">
                        <label className="caption text-mute font-medium uppercase tracking-tighter">{t('calc.diameter')} ({unit === 'imperial' ? 'ft' : 'm'})</label>
                        <input 
                          type="number" 
                          className="classical-input w-full"
                          value={area.diameter || ''}
                          onChange={(e) => updateArea(area.id, { diameter: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    )}
                    
                    {area.shape === 'triangle' && (
                      <>
                        <div className="space-y-1">
                          <label className="caption text-mute font-medium uppercase tracking-tighter">{t('calc.base')} ({unit === 'imperial' ? 'ft' : 'm'})</label>
                          <input 
                            type="number" 
                            className="classical-input w-full"
                            value={area.base || ''}
                            onChange={(e) => updateArea(area.id, { base: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="caption text-mute font-medium uppercase tracking-tighter">{t('calc.height')} ({unit === 'imperial' ? 'ft' : 'm'})</label>
                          <input 
                            type="number" 
                            className="classical-input w-full"
                            value={area.height || ''}
                            onChange={(e) => updateArea(area.id, { height: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Depth & Pricing Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-canvas border border-hairline-strong rounded-sm p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-mute" />
                <h2 className="body-md-strong uppercase tracking-wider text-xs">{t('calc.mulchDepth')}</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="body-sm text-body">{t('calc.layerDepth')}: <span className="text-ink font-semibold">{depth}{unit === 'imperial' ? '"' : ' cm'}</span></span>
                  <div className="flex gap-2">
                    {(unit === 'imperial' ? [1, 2, 3, 4] : [2, 5, 8, 10]).map(d => (
                      <button 
                        key={d}
                        onClick={() => setDepth(d)}
                        className={`w-8 h-8 rounded-sm body-sm border transition-all duration-150 ${depth === d ? 'bg-primary text-on-primary border-primary shadow-sm' : 'bg-canvas text-body border-hairline-strong hover:bg-canvas-soft hover:shadow-inner'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <input 
                  type="range" 
                  min={unit === 'imperial' ? "0.5" : "1"} 
                  max={unit === 'imperial' ? "12" : "30"} 
                  step={unit === 'imperial' ? "0.5" : "1"}
                  className="w-full accent-primary h-2 bg-hairline rounded-full appearance-none cursor-pointer"
                  value={depth}
                  onChange={(e) => setDepth(parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="bg-canvas border border-hairline-strong rounded-sm p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-mute" />
                <h2 className="body-md-strong uppercase tracking-wider text-xs">{t('calc.pricing')}</h2>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="caption text-mute font-medium uppercase tracking-tighter">{t('calc.bulkPrice')} ({t('calc.per')} {unit === 'imperial' ? t('calc.cuYard') : t('calc.cuMeter')})</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 body-sm text-mute">$</span>
                    <input 
                      type="number" 
                      className="classical-input pl-7 pr-3 w-full"
                      value={pricePerUnit}
                      onChange={(e) => setPricePerUnit(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="caption text-mute font-medium uppercase tracking-tighter">{t('calc.bagSize')} ({unit === 'imperial' ? 'cu ft' : 'liters'})</label>
                    <input 
                      type="number" 
                      className="classical-input w-full"
                      value={bagSize}
                      onChange={(e) => setBagSize(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="caption text-mute font-medium uppercase tracking-tighter">{t('calc.pricePerBag')}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 body-sm text-mute">$</span>
                      <input 
                        type="number" 
                        className="classical-input pl-7 pr-3 w-full"
                        value={pricePerBag}
                        onChange={(e) => setPricePerBag(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="space-y-8">
          <div className="bg-canvas border-2 border-primary rounded-sm p-8 shadow-md sticky top-8 space-y-8">
            <h2 className="display-sm border-b border-hairline-strong pb-4 uppercase tracking-widest text-sm text-primary">{t('calc.results')}</h2>
            
            <div className="space-y-6">
              <div className="bg-canvas-soft p-4 rounded-sm border border-hairline-strong shadow-inner">
                <label className="caption text-mute block mb-1 uppercase tracking-tighter font-bold">{t('calc.totalVolume')}</label>
                <div className="flex items-baseline gap-2">
                  <span className="display-lg text-primary">{totalVolume.toFixed(2)}</span>
                  <span className="body-md font-medium">{unit === 'imperial' ? t('calc.cuYards') : t('calc.cuMeters')}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="caption text-mute block mb-1 uppercase tracking-tighter font-bold">{unit === 'imperial' ? t('calc.cuFeet') : t('calc.liters')}</label>
                  <span className="body-md-strong text-ink">
                    {unit === 'imperial' ? (totalVolume * 27).toFixed(1) : (totalVolume * 1000).toFixed(0)}
                  </span>
                </div>
                <div>
                  <label className="caption text-mute block mb-1 uppercase tracking-tighter font-bold">{t('calc.totalArea')}</label>
                  <span className="body-md-strong text-ink">{totalArea.toFixed(1)} {unit === 'imperial' ? 'sq. ft' : 'sq. m'}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-hairline-strong space-y-4">
                <div className="flex justify-between items-center">
                  <span className="body-sm text-mute font-bold uppercase tracking-wider text-[10px]">{t('calc.bulkTotal')}</span>
                  <span className="display-md text-ink">${totalCostBulk.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary/5 border border-primary/10 rounded-sm">
                  <span className="body-sm text-mute font-bold uppercase tracking-wider text-[10px]">{t('calc.baggedTotal')} ({numBags} {t('calc.bags')})</span>
                  <span className="body-md-strong text-ink">${totalCostBags.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MulchCalculator;
