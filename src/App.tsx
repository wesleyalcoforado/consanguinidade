import { useMemo, useState } from 'react';
import type { DegreeKey, RelationType } from './types';
import { getDegreeConfig, DEGREE_CONFIGS } from './config/degrees';
import { buildTreePair } from './model/tree-model';
import { ControlPanel } from './components/ControlPanel';
import { DispensationInfo } from './components/DispensationInfo';
import { Heredogram } from './components/Heredogram';
import { Legend } from './components/Legend';

const DEFAULT_TYPE: RelationType = 'igual';
const DEFAULT_DEGREE: DegreeKey = '2';
const DEFAULT_MULT = 1;

export default function App() {
  const [type, setType] = useState<RelationType>(DEFAULT_TYPE);
  const [degreeKey, setDegreeKey] = useState<DegreeKey>(DEFAULT_DEGREE);
  const [multiplicity, setMultiplicity] = useState<number>(DEFAULT_MULT);
  const [names, setNames] = useState<Record<string, string>>({});

  const degreeConfig = useMemo(
    () => getDegreeConfig(type, degreeKey) ?? DEGREE_CONFIGS[0],
    [type, degreeKey]
  );

  const { groomTree, brideTree } = useMemo(
    () => buildTreePair(degreeConfig.genGroom, degreeConfig.genBride, multiplicity),
    [degreeConfig, multiplicity]
  );

  const totalDepth = Math.max(degreeConfig.genGroom, degreeConfig.genBride);

  function handleChange(newType: RelationType, newKey: DegreeKey, newMult: number) {
    setType(newType);
    setDegreeKey(newKey);
    setMultiplicity(newMult);
    setNames({});
  }

  function handleNameChange(id: string, name: string) {
    setNames(prev => ({ ...prev, [id]: name }));
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-indigo-900 text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold tracking-tight">
            Dispensas Matrimoniais — Consanguinidade
          </h1>
          <p className="text-indigo-300 text-sm mt-0.5">
            Visualizador de heredogramas segundo o Direito Canônico
          </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Heredogram
            tree={groomTree}
            depth={degreeConfig.genGroom}
            totalDepth={totalDepth}
            label="Noivo"
            names={names}
            onNameChange={handleNameChange}
          />
          <Heredogram
            tree={brideTree}
            depth={degreeConfig.genBride}
            totalDepth={totalDepth}
            label="Noiva"
            names={names}
            onNameChange={handleNameChange}
          />
        </div>

        <Legend
          multiplicity={multiplicity}
          groomGen={degreeConfig.genGroom}
          brideGen={degreeConfig.genBride}
        />

        <p className="text-xs text-center text-gray-400 pb-4">
          Os nós coloridos representam os mesmos ancestrais em ambas as árvores.
          Clique em qualquer nó para digitar o nome da pessoa.
        </p>
      </main>
    </div>
  );
}
