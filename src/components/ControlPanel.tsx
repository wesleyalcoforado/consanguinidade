import type { DegreeKey, RelationType } from '../types';
import { DEGREE_CONFIGS, MULTIPLICITY_LABELS } from '../config/degrees';

interface Props {
  type: RelationType;
  degreeKey: DegreeKey;
  multiplicity: number;
  onChange: (type: RelationType, degreeKey: DegreeKey, multiplicity: number) => void;
}

export function ControlPanel({ type, degreeKey, multiplicity, onChange }: Props) {
  const degreesForType = DEGREE_CONFIGS.filter(d => d.type === type);
  const currentDegree = DEGREE_CONFIGS.find(d => d.type === type && d.key === degreeKey);
  const maxMult = currentDegree?.maxMultiplicity ?? 1;

  function handleTypeChange(newType: RelationType) {
    const firstDegree = DEGREE_CONFIGS.find(d => d.type === newType)!;
    onChange(newType, firstDegree.key, 1);
  }

  function handleDegreeChange(newKey: DegreeKey) {
    const deg = DEGREE_CONFIGS.find(d => d.type === type && d.key === newKey)!;
    onChange(type, newKey, Math.min(multiplicity, deg.maxMultiplicity));
  }

  function handleMultiplicityChange(newMult: number) {
    onChange(type, degreeKey, newMult);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Configuração do Parentesco
      </h2>
      <div className="flex flex-wrap gap-4 items-end">
        {/* Tipo */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Tipo</label>
          <select
            value={type}
            onChange={e => handleTypeChange(e.target.value as RelationType)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="igual">Grau Igual</option>
            <option value="atingente">Grau Atingente</option>
          </select>
        </div>

        {/* Grau */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Grau</label>
          <select
            value={degreeKey}
            onChange={e => handleDegreeChange(e.target.value as DegreeKey)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {degreesForType.map(d => (
              <option key={d.key} value={d.key}>{d.label}</option>
            ))}
          </select>
        </div>

        {/* Multiplicidade */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Multiplicidade</label>
          <select
            value={multiplicity}
            onChange={e => handleMultiplicityChange(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {Array.from({ length: maxMult }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>
                {MULTIPLICITY_LABELS[m]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
