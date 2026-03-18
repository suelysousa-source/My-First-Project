export interface Skill {
  code: string;
  description: string;
}

export interface BimesterSkills {
  bimester: string;
  skills: Skill[];
}

export const skillsByBimester: BimesterSkills[] = [
  {
    bimester: "1º Bimestre",
    skills: [
      { code: "EF05MA01", description: "Ler, escrever e ordenar números naturais até a ordem das centenas de milhar com compreensão das principais características do sistema de numeração decimal." },
      { code: "EF05MA02", description: "Ler, escrever e ordenar números racionais na forma decimal com compreensão das principais características do sistema de numeração decimal, utilizando como recursos a composição e decomposição e a reta numérica." },
      { code: "EF05MA06", description: "Associar as representações 10%, 25%, 50%, 75% e 100% respectivamente à décima parte, quarta parte, metade, três quartos e um inteiro, para calcular porcentagens, utilizando estratégias pessoais, cálculo mental e calculadora, em contextos de educação financeira, entre outros." },
      { code: "EF05MA07", description: "Resolver e elaborar problemas de adição e subtração com números naturais e com números racionais, cuja representação decimal seja finita, utilizando estratégias diversas, como cálculo por estimativa, cálculo mental e algoritmos." },
    ],
  },
  {
    bimester: "2º Bimestre",
    skills: [
      { code: "EF05MA03", description: "Identificar e representar frações (menores e maiores que a unidade), associando-as ao resultado de uma divisão ou à ideia de parte de um todo, utilizando a reta numérica como recurso." },
      { code: "EF05MA04", description: "Identificar frações equivalentes." },
      { code: "EF05MA05", description: "Comparar e ordenar números racionais positivos (representações fracionária e decimal), relacionando-os a pontos na reta numérica." },
      { code: "EF05MA08", description: "Resolver e elaborar problemas de multiplicação e divisão com números naturais e com números racionais cuja representação decimal é finita (com multiplicador natural e divisor natural e diferente de zero), utilizando estratégias diversas, como cálculo por estimativa, cálculo mental e algoritmos." },
      { code: "EF05MA09", description: "Resolver e elaborar problemas que envolvam a partilha de uma quantidade em duas partes desiguais, tais como dividir uma quantidade em duas partes, de modo que uma seja o dobro da outra, com compreensão da ideia de razão entre as partes e delas com o todo." },
    ],
  },
  {
    bimester: "3º Bimestre",
    skills: [
      { code: "EF05MA10", description: "Concluir, por meio de investigações, que a relação de igualdade existente entre dois membros permanece ao adicionar, subtrair, multiplicar ou dividir cada um desses membros por um mesmo número, para construir a noção de equivalência." },
      { code: "EF05MA11", description: "Resolver e elaborar problemas cuja conversão em sentença matemática seja uma igualdade com uma operação em que um dos termos é desconhecido." },
      { code: "EF05MA12", description: "Resolver problemas que envolvam variação de proporcionalidade direta entre duas grandezas, para associar a quantidade de um produto ao valor a pagar, alterar as quantidades de ingredientes de receitas, ampliar ou reduzir escalas em mapas, entre outros." },
      { code: "EF05MA13", description: "Resolver problemas que envolvam a partilha de uma quantidade em duas partes desiguais, envolvendo relações aditivas e multiplicativas, bem como a razão entre as partes." },
      { code: "EF05MA19", description: "Resolver e elaborar problemas envolvendo medidas das grandezas comprimento, área, massa, tempo, temperatura e capacidade, recorrendo a transformações entre as unidades mais usuais em contextos socioculturais." },
      { code: "EF05MA20", description: "Concluir, por meio de investigações, que figuras de perímetros iguais podem ter áreas diferentes e que, também, figuras que têm a mesma área podem ter perímetros diferentes." },
      { code: "EF05MA21", description: "Medir, comparar e estimar área de figuras planas desenhadas em malha quadriculada, pela contagem dos quadradinhos ou de metades de quadradinho, reconhecendo que duas figuras com formatos diferentes podem ter a mesma medida de área." },
    ],
  },
  {
    bimester: "4º Bimestre",
    skills: [
      { code: "EF05MA14", description: "Utilizar e compreender diferentes representações para a localização de objetos no plano, como mapas, células em planilhas eletrônicas e coordenadas geográficas, a fim de desenvolver as primeiras noções de coordenadas cartesianas." },
      { code: "EF05MA15", description: "Interpretar, descrever e representar a localização ou movimentação de objetos no plano cartesiano (1º quadrante), utilizando coordenadas cartesianas, indicando mudanças de direção e de sentido e giros." },
      { code: "EF05MA16", description: "Associar figuras espaciais a suas planificações (prismas, pirâmides, cilindros e cones) e analisar, nomear e comparar seus atributos." },
      { code: "EF05MA17", description: "Reconhecer, nomear e comparar polígonos, considerando lados, vértices e ângulos, e desenhá-los, utilizando material de desenho ou tecnologias digitais." },
      { code: "EF05MA18", description: "Reconhecer a congruência dos ângulos e a proporcionalidade entre os lados correspondentes de figuras poligonais em situações de ampliação e de redução em malhas quadriculadas e com o uso de tecnologias digitais." },
      { code: "EF05MA22", description: "Apresentar todos os possíveis resultados de um experimento aleatório, estimando se esses resultados são igualmente prováveis ou não." },
      { code: "EF05MA23", description: "Determinar a probabilidade de ocorrência de um resultado em eventos aleatórios, quando todos os resultados possíveis têm a mesma chance de ocorrer (equiprováveis)." },
      { code: "EF05MA24", description: "Interpretar dados estatísticos apresentados em textos, tabelas (simples ou de dupla entrada) e em gráficos (colunas, pictóricos ou de linhas), referentes a outras áreas do conhecimento ou a outros contextos, como saúde e trânsito, e produzir textos com o objetivo de sintetizar conclusões." },
      { code: "EF05MA25", description: "Realizar pesquisa envolvendo variáveis categóricas e numéricas, organizar dados coletados por meio de tabelas, gráficos de colunas, pictóricos e de linhas, com e sem uso de tecnologias digitais, e apresentar texto escrito sobre a finalidade da pesquisa e a síntese dos resultados." },
    ],
  },
];
