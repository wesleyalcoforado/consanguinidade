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

  const selectStyle: React.CSSProperties = {
    border: '1px solid var(--border)',
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    background: 'var(--container)',
    color: 'var(--on-container)',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
  };

  return (
    <div className="rounded-xl p-4 shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--border)', fontFamily: 'var(--font-body)' }}>
        Configuração do Parentesco
      </h2>
      <div className="flex flex-wrap gap-4 items-end">
        {/* Tipo */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--on-surface)' }}>Tipo</label>
          <select
            value={type}
            onChange={e => handleTypeChange(e.target.value as RelationType)}
            style={selectStyle}
          >
            <option value="igual">Grau Igual</option>
            <option value="atingente">Grau Atingente</option>
          </select>
        </div>

        {/* Grau */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--on-surface)' }}>Grau</label>
          <select
            value={degreeKey}
            onChange={e => handleDegreeChange(e.target.value as DegreeKey)}
            style={selectStyle}
          >
            {degreesForType.map(d => (
              <option key={d.key} value={d.key}>{d.label}</option>
            ))}
          </select>
        </div>

        {/* Multiplicidade */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--on-surface)' }}>Multiplicidade</label>
          <select
            value={multiplicity}
            onChange={e => handleMultiplicityChange(Number(e.target.value))}
            style={selectStyle}
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
