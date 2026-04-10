import type { DegreeKey, RelationType } from '../types';
import { getDispensationInfo } from '../config/dispensations';

interface Props {
  type: RelationType;
  degreeKey: DegreeKey;
  multiplicity: number;
}

export function DispensationInfo({ type, degreeKey, multiplicity }: Props) {
  const info = getDispensationInfo(type, degreeKey, multiplicity);

  return (
    <div className="rounded-xl p-4" style={{ background: 'hsl(40, 69%, 94%)', border: '1px solid var(--border)' }}>
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5" style={{ color: 'var(--primary)' }}>⚖</span>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold" style={{ color: 'var(--on-surface)', fontFamily: 'var(--font-title)' }}>{info.impedimento}</p>
          <p className="text-sm" style={{ color: 'var(--on-surface)' }}>{info.descricao}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--primary)' }}>
            <span className="font-medium">Ancestrais em comum:</span> {info.ancestraisComuns}
          </p>
        </div>
      </div>
    </div>
  );
}
