import type { DegreeKey, RelationType } from '../types';
import { MULTIPLICITY_LABELS } from './degrees';

interface DispensationInfo {
  impedimento: string;
  descricao: string;
  ancestraisComuns: string;
  nota?: string;
}

function ordinal(n: number): string {
  return ['', '1º', '2º', '3º', '4º'][n] ?? `${n}º`;
}

const COUSIN_NAMES: Record<string, string> = {
  '2-1': 'primos legítimos',
  '2-2': 'primos carnais (primos em primeiro grau)',
  '3-1': 'primos segundos',
  '3-2': 'primos segundos duas vezes',
  '3-3': 'primos segundos três vezes',
  '4-1': 'primos terceiros',
  '4-2': 'primos terceiros duas vezes',
  '4-3': 'primos terceiros três vezes',
  '4-4': 'primos terceiros quatro vezes',
  '4-5': 'primos terceiros cinco vezes',
  '4-6': 'primos terceiros seis vezes',
  '4-7': 'primos terceiros sete vezes',
};

const ATINGENTE_NAMES: Record<string, string> = {
  '1-2-1': 'tio/tia com sobrinho/sobrinha',
  '2-3-1': 'sobrinho-neto/sobrinha-neta com tio-avô/tia-avó (2º atingente ao 3º)',
  '2-3-2': '2º atingente ao 3º duplicado (primo carnal de um dos pais do outro)',
  '3-4-1': '3º atingente ao 4º',
  '3-4-2': '3º atingente ao 4º duplicado',
  '3-4-3': '3º atingente ao 4º triplicado',
};

const ANCESTOR_LABELS: Record<number, string> = {
  2: 'avós',
  3: 'bisavós',
  4: 'trisavós',
};

export function getDispensationInfo(
  type: RelationType,
  key: DegreeKey,
  multiplicity: number
): DispensationInfo {
  const multLabel = MULTIPLICITY_LABELS[multiplicity] ?? `${multiplicity}x`;

  if (type === 'igual') {
    const degree = parseInt(key);
    const cousinName = COUSIN_NAMES[`${degree}-${multiplicity}`] ?? '';
    const ancestorLabel = ANCESTOR_LABELS[degree] ?? 'ancestrais';
    const numAncestors = multiplicity * 2;

    return {
      impedimento: `Impedimento de consanguinidade no ${ordinal(degree)} grau da linha colateral igual${multiplicity > 1 ? `, ${multLabel}` : ''}`,
      descricao: cousinName
        ? `Os nubentes são ${cousinName}.`
        : `Os nubentes possuem ${numAncestors} ${ancestorLabel} em comum.`,
      ancestraisComuns: `${numAncestors} ${ancestorLabel} em comum (${multiplicity} casal${multiplicity > 1 ? 'ais' : ''})`,
    };
  }

  // atingente
  const [groomGen, brideGen] = key.split('-').map(Number);
  const relationName = ATINGENTE_NAMES[`${key}-${multiplicity}`] ?? '';
  const multSuffix = multiplicity > 1 ? ` ${multLabel}` : '';

  let descricao = '';
  if (key === '1-2') {
    descricao = 'Um dos nubentes é filho/filha do outro (tio/sobrinho ou relação equivalente). Os pais de um são o mesmo casal de avós do outro.';
  } else if (key === '2-3') {
    if (multiplicity === 1) {
      descricao = 'O casal de avós de um dos nubentes é o mesmo que um casal de bisavós do outro.';
    } else {
      descricao = 'Dois casais de avós de um dos nubentes são os mesmos dois casais de bisavós do outro.';
    }
  } else if (key === '3-4') {
    descricao = `${multiplicity} casal${multiplicity > 1 ? 'ais' : ''} de bisavós de um dos nubentes é o mesmo que ${multiplicity} casal${multiplicity > 1 ? 'ais' : ''} de trisavós do outro.`;
  }

  return {
    impedimento: `Impedimento de consanguinidade no ${ordinal(groomGen)} grau atingente ao ${ordinal(brideGen)}${multSuffix}`,
    descricao: relationName ? `Relação: ${relationName}. ${descricao}` : descricao,
    ancestraisComuns: `${multiplicity} casal${multiplicity > 1 ? 'ais' : ''} ancestral${multiplicity > 1 ? 'is' : ''} em comum`,
  };
}
