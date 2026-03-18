export interface TipoDeAula {
  tipo: string; // Ex: "Aula Prática com material concreto", "Aula Teórica", "Híbrida"
  materiais?: string[]; // Lista de materiais necessários por estudante
}

export interface PedagogicalPrompt {
  id?: string; // Identificador único para atividades salvas
  codigoAlfanumerico: string;
  habilidade: string;
  objetosDeConhecimento: string[];
  contextualizacao: string;
  planoDeAula: string;
  folhaDeAtividades: string;
  sugestaoDeImagem: string;
  // New fields
  quantidadeAulas: string; // e.g., "1 a 2 aulas"
  conteudoTema: string;
  diarioDeClasse: string;
  tipoDeAula: TipoDeAula;
  sugestaoAvaliacao: string;
  sugestaoVideoAula: string; // A search query for YouTube
  // Accessibility fields
  sugestaoVideoLibras: string;
  sugestaoAudiodescricao: {
    atividade: string;
    imagem: string;
  };
  passoAPassoProfessor?: string; // New field for detailed teacher instructions
  // Adaptation fields (Optional)
  adaptacao?: {
    transtorno: string;
    nivelSuporte: string;
    estrategias: string[]; // List of applied strategies
    criteriosSucesso: string;
  };
}

export interface AdaptationParams {
  transtorno: string;
  nivelSuporte: string;
  detalhesOutro?: string;
  conteudo?: string; // New field for specific content/skill description
}