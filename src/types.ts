export type RelationType = 'igual' | 'atingente';

export type DegreeKey = '2' | '3' | '4' | '1-2' | '2-3' | '3-4';

export type MultiplicityKey =
  | 'simples'
  | 'duplicado'
  | 'triplicado'
  | 'quadruplicado'
  | 'quintuplicado'
  | 'sextuplicado'
  | 'septuplicado';

export interface DegreeConfig {
  type: RelationType;
  key: DegreeKey;
  label: string;
  genGroom: number;
  genBride: number;
  maxMultiplicity: number;
}

export interface TreeNodeData {
  id: string;
  generation: number;
  isShared: boolean;
  sharedGroupIndex: number | null;
}

export interface AppState {
  type: RelationType;
  degreeKey: DegreeKey;
  multiplicity: number;
}
