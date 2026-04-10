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
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <span className="text-amber-500 text-xl mt-0.5">⚖</span>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-amber-900">{info.impedimento}</p>
          <p className="text-sm text-amber-800">{info.descricao}</p>
          <p className="text-xs text-amber-600 mt-1">
            <span className="font-medium">Ancestrais em comum:</span> {info.ancestraisComuns}
          </p>
        </div>
      </div>
    </div>
  );
}
