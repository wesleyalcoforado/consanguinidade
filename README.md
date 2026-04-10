# Visualizador de dispensas segundo o Direito Canônico

Ferramenta interativa para visualização de heredogramas de consanguinidade, conforme as normas do Direito Canônico para concessão de dispensas matrimoniais.

Parte do projeto [Genealogia do Ceará](https://www.genealogiadoceara.net).

## O que é

No Direito Canônico, o casamento entre parentes consanguíneos é impedido até o quarto grau da linha colateral. Para que o matrimônio seja válido, é necessária uma dispensa eclesiástica. O grau de parentesco determina a dificuldade de obtenção dessa dispensa.

Esta ferramenta gera automaticamente o heredograma dos dois nubentes, destacando os ancestrais em comum e exibindo o texto canônico do impedimento correspondente.

## Funcionalidades

- **Graus iguais**: 2º, 3º e 4º grau (primos carnais, segundos, terceiros)
- **Graus atingentes**: 1º atingente ao 2º, 2º atingente ao 3º, 3º atingente ao 4º
- **Multiplicidade**: de simples até septuplicado, conforme o grau
- Heredograma combinado com os dois nubentes no mesmo diagrama
- Ancestrais em comum destacados por cor
- Edição de nomes nos nós — nomes espelhados automaticamente entre as árvores
- Reposicionamento dos casais ancestrais compartilhados dentro da geração
- Texto canônico do impedimento gerado automaticamente

## Tecnologias

- React + TypeScript
- Vite
- Tailwind CSS v4

## Instalação e uso

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173` no navegador.
