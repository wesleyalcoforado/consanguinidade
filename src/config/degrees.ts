import type { DegreeConfig, DegreeKey, RelationType } from '../types';

export const GENERATION_LABELS: Record<number, string> = {
  0: 'Nubente',
  1: 'Pais',
  2: 'Avós',
  3: 'Bisavós',
  4: 'Trisavós',
};

export const MULTIPLICITY_LABELS: Record<number, string> = {
  1: 'simples',
  2: 'duplicado',
  3: 'triplicado',
  4: 'quadruplicado',
  5: 'quintuplicado',
  6: 'sextuplicado',
  7: 'septuplicado',
};

export const DEGREE_CONFIGS: DegreeConfig[] = [
  // Graus iguais
  { type: 'igual', key: '2', label: '2º grau', genGroom: 2, genBride: 2, maxMultiplicity: 2 },
  { type: 'igual', key: '3', label: '3º grau', genGroom: 3, genBride: 3, maxMultiplicity: 3 },
  { type: 'igual', key: '4', label: '4º grau', genGroom: 4, genBride: 4, maxMultiplicity: 7 },
  // Graus atingentes
  { type: 'atingente', key: '1-2', label: '1º atingente ao 2º', genGroom: 1, genBride: 2, maxMultiplicity: 1 },
  { type: 'atingente', key: '2-3', label: '2º atingente ao 3º', genGroom: 2, genBride: 3, maxMultiplicity: 2 },
  { type: 'atingente', key: '3-4', label: '3º atingente ao 4º', genGroom: 3, genBride: 4, maxMultiplicity: 3 },
];

export function getDegreeConfig(type: RelationType, key: DegreeKey): DegreeConfig | undefined {
  return DEGREE_CONFIGS.find(d => d.type === type && d.key === key);
}

export function getDegreesByType(type: RelationType): DegreeConfig[] {
  return DEGREE_CONFIGS.filter(d => d.type === type);
}

// Shared couple labels for the legend
export function getSharedCoupleLabel(index: number, groomGen: number, brideGen: number): string {
  const label = index === 0 ? '1º' : index === 1 ? '2º' : index === 2 ? '3º'
    : index === 3 ? '4º' : index === 4 ? '5º' : index === 5 ? '6º' : '7º';
  if (groomGen === brideGen) {
    return `${label} casal de ${GENERATION_LABELS[groomGen]} em comum`;
  }
  return `${label} casal: ${GENERATION_LABELS[groomGen]} do noivo / ${GENERATION_LABELS[brideGen]} da noiva`;
}
