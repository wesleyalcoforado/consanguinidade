import { useMemo, useState } from 'react';
import type { DegreeKey, RelationType } from './types';
import { getDegreeConfig, DEGREE_CONFIGS } from './config/degrees';
import { buildTreePair, couplesAtDepth } from './model/tree-model';
import { ControlPanel } from './components/ControlPanel';
import { DispensationInfo } from './components/DispensationInfo';
import { CombinedHeredogram } from './components/Heredogram';
import { Legend } from './components/Legend';

const DEFAULT_TYPE: RelationType = 'igual';
const DEFAULT_DEGREE: DegreeKey = '2';
const DEFAULT_MULT = 1;

function defaultSlots(multiplicity: number): number[] {
  return Array.from({ length: multiplicity }, (_, i) => i);
}

export default function App() {
  const [type, setType] = useState<RelationType>(DEFAULT_TYPE);
  const [degreeKey, setDegreeKey] = useState<DegreeKey>(DEFAULT_DEGREE);
  const [multiplicity, setMultiplicity] = useState<number>(DEFAULT_MULT);
  const [names, setNames] = useState<Record<string, string>>({});
  // Which couple slots are shared, independently for each side
  const [groomSlots, setGroomSlots] = useState<number[]>(defaultSlots(DEFAULT_MULT));
  const [brideSlots, setBrideSlots] = useState<number[]>(defaultSlots(DEFAULT_MULT));

  const degreeConfig = useMemo(
    () => getDegreeConfig(type, degreeKey) ?? DEGREE_CONFIGS[0],
    [type, degreeKey]
  );

  const { groomTree, brideTree } = useMemo(
    () => buildTreePair(degreeConfig.genGroom, degreeConfig.genBride, groomSlots, brideSlots),
    [degreeConfig, groomSlots, brideSlots]
  );

  const totalDepth = Math.max(degreeConfig.genGroom, degreeConfig.genBride);

  // Mirror map for name sync: shared node gi on groom ↔ shared node gi on bride
  const sharedMirror = useMemo(() => {
    const mirror: Record<string, string> = {};
    const groomGenStart = Math.pow(2, degreeConfig.genGroom) - 1;
    const brideGenStart = Math.pow(2, degreeConfig.genBride) - 1;
    const len = Math.min(groomSlots.length, brideSlots.length);
    for (let gi = 0; gi < len; gi++) {
      const gFather = `groom-${groomGenStart + groomSlots[gi] * 2}`;
      const gMother = `groom-${groomGenStart + groomSlots[gi] * 2 + 1}`;
      const bFather = `bride-${brideGenStart + brideSlots[gi] * 2}`;
      const bMother = `bride-${brideGenStart + brideSlots[gi] * 2 + 1}`;
      mirror[gFather] = bFather;
      mirror[bFather] = gFather;
      mirror[gMother] = bMother;
      mirror[bMother] = gMother;
    }
    return mirror;
  }, [degreeConfig, groomSlots, brideSlots]);

  function handleChange(newType: RelationType, newKey: DegreeKey, newMult: number) {
    setType(newType);
    setDegreeKey(newKey);
    setMultiplicity(newMult);
    setNames({});
    setGroomSlots(defaultSlots(newMult));
    setBrideSlots(defaultSlots(newMult));
  }

  function handleNameChange(id: string, name: string) {
    setNames(prev => {
      const next = { ...prev, [id]: name };
      const mirror = sharedMirror[id];
      if (mirror) next[mirror] = name;
      return next;
    });
  }

  /**
   * Swap a shared couple slot with a non-shared couple slot on one side.
   * Called when the user clicks a shared node then a non-shared node (or vice-versa)
   * at the same generation.
   * @param side - 'groom' or 'bride'
   * @param fromSlot - currently shared couple slot to move
   * @param toSlot   - currently non-shared couple slot to move into
   */
  function handleSwapSlot(side: 'groom' | 'bride', fromSlot: number, toSlot: number) {
    const setter = side === 'groom' ? setGroomSlots : setBrideSlots;
    setter(prev => prev.map(s => (s === fromSlot ? toSlot : s)));

    // Remap names: swap the IDs of the two couple slots so names follow the nodes
    const depth = side === 'groom' ? degreeConfig.genGroom : degreeConfig.genBride;
    const genStart = Math.pow(2, depth) - 1;
    const fromFather = `${side}-${genStart + fromSlot * 2}`;
    const fromMother = `${side}-${genStart + fromSlot * 2 + 1}`;
    const toFather   = `${side}-${genStart + toSlot * 2}`;
    const toMother   = `${side}-${genStart + toSlot * 2 + 1}`;

    setNames(prev => {
      const next = { ...prev };
      // Swap father names
      const tmpF = next[fromFather];
      next[fromFather] = next[toFather] ?? '';
      next[toFather] = tmpF ?? '';
      // Swap mother names
      const tmpM = next[fromMother];
      next[fromMother] = next[toMother] ?? '';
      next[toMother] = tmpM ?? '';
      return next;
    });
  }

  const groomTotalCouples = couplesAtDepth(degreeConfig.genGroom);
  const brideTotalCouples = couplesAtDepth(degreeConfig.genBride);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header className="px-6 py-4 shadow-sm" style={{ background: 'var(--bg-dark)', color: 'var(--on-bg-dark)' }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold tracking-tight">
            Visualizador de dispensas segundo o Direito Canônico
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-5">
        <ControlPanel
          type={type}
          degreeKey={degreeKey}
          multiplicity={multiplicity}
          onChange={handleChange}
        />

        <DispensationInfo type={type} degreeKey={degreeKey} multiplicity={multiplicity} />

        <CombinedHeredogram
          groomTree={groomTree}
          brideTree={brideTree}
          groomDepth={degreeConfig.genGroom}
          brideDepth={degreeConfig.genBride}
          totalDepth={totalDepth}
          groomSlots={groomSlots}
          brideSlots={brideSlots}
          groomTotalCouples={groomTotalCouples}
          brideTotalCouples={brideTotalCouples}
          names={names}
          onNameChange={handleNameChange}
          onSwapSlot={handleSwapSlot}
        />

        <Legend
          multiplicity={multiplicity}
          groomGen={degreeConfig.genGroom}
          brideGen={degreeConfig.genBride}
        />

        <p className="text-xs text-center pb-4" style={{ color: 'var(--border)' }}>
          Os nós coloridos representam os mesmos ancestrais em ambas as árvores.
          Clique num nó colorido e depois num nó cinza da mesma linha para trocar de posição.
        </p>
      </main>
    </div>
  );
}
