import { SHARED_COLORS } from './Heredogram';
import { getSharedCoupleLabel } from '../config/degrees';

interface Props {
  multiplicity: number;
  groomGen: number;
  brideGen: number;
}

export function Legend({ multiplicity, groomGen, brideGen }: Props) {
  if (multiplicity === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Casais Ancestrais em Comum
      </h3>
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: multiplicity }, (_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-sm flex-shrink-0"
              style={{ backgroundColor: SHARED_COLORS[i].bg }}
            />
            <span className="text-xs text-gray-700">
              {getSharedCoupleLabel(i, groomGen, brideGen)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
