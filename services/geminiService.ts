import { GoogleGenAI, Type } from "@google/genai";
import { PedagogicalPrompt, AdaptationParams } from '../types';
import { skillsByBimester } from '../data/skills';

// Fix: Initialize the GoogleGenAI client lazily to prevent crashes if the API key is missing.
let aiInstance: GoogleGenAI | null = null;
let currentKey: string | null = null;

const getAI = () => {
  const isValid = (k: any): k is string => {
    if (!k || typeof k !== 'string') return false;
    const t = k.trim();
    return t.length >= 20 && t.startsWith('AIza') && t !== 'undefined' && t !== 'null';
  };

  // Tenta capturar a chave de várias fontes, validando cada uma
  let apiKey = "";
  
  const manualKey = localStorage.getItem('GEMINI_API_KEY_MANUAL');
  const envViteKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  const envProcessKey = process.env.GEMINI_API_KEY;
  const envApiKey = process.env.API_KEY;

  if (isValid(manualKey)) apiKey = manualKey;
  else if (isValid(envViteKey)) apiKey = envViteKey;
  else if (isValid(envProcessKey)) apiKey = envProcessKey;
  else if (isValid(envApiKey)) apiKey = envApiKey;
  else apiKey = "AIzaSyD4U_OMgB-1COKd4cI5hC3NxAslwetSsQY"; // Fallback final garantido

  apiKey = apiKey.trim();

  // Se a chave mudou, precisamos criar uma nova instância
  if (apiKey !== currentKey) {
    aiInstance = null;
    currentKey = apiKey;
  }

  if (!aiInstance) {
    // Debug logging (masked for security)
    console.log(`[Gemini Service] Chave ativa iniciada com: ${apiKey.substring(0, 4)}...`);

    // Validação final apenas por segurança
    if (!apiKey.startsWith('AIza')) {
      throw new Error(
        `ERRO CRÍTICO: Chave de API com formato inválido detectada (${apiKey.substring(0, 4)}...). \n` +
        `Por favor, limpe o cache do navegador ou contate o suporte.`
      );
    }
    
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

/**
 * Helper to handle Gemini API errors and provide user-friendly messages.
 */
const handleGeminiError = (error: any, context: string) => {
  console.error(`[Gemini Service] Error in ${context}:`, error);
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  if (errorMessage.includes("API key not valid") || errorMessage.includes("API_KEY_INVALID")) {
    return new Error("A chave de API (GEMINI_API_KEY) configurada não é válida. Verifique se você copiou a chave corretamente nos 'Secrets' do AI Studio e se ela pertence a um projeto com a API habilitada.");
  }
  
  if (errorMessage.includes("500") || errorMessage.includes("Internal Server Error")) {
    return new Error(`O servidor da IA teve um problema temporário (Erro 500). Por favor, tente novamente em alguns segundos.`);
  }

  if (errorMessage.includes("429") || errorMessage.includes("Quota exceeded")) {
    return new Error("Limite de uso excedido. Por favor, aguarde um momento antes de tentar novamente.");
  }

  if (errorMessage.includes("403") || errorMessage.includes("Permission denied")) {
    return new Error("Acesso negado. Verifique se a API Generative Language está ativada no seu projeto do Google Cloud.");
  }

  return new Error(`Falha ao comunicar com a IA para ${context}. Detalhes: ${errorMessage}`);
};

// Helper to find skill description from code to enrich the prompt
const getSkillDescription = (code: string): string => {
  for (const bimester of skillsByBimester) {
    const foundSkill = bimester.skills.find(skill => skill.code === code);
    if (foundSkill) {
      return foundSkill.description;
    }
  }
  return 'Descrição não encontrada.';
};

/**
 * Generates a complete pedagogical prompt using the Gemini API.
 */
export const generatePedagogicalPrompt = async (
  skillCodes: string[],
  bimester: string,
  classCount: string,
  theme: string,
  classType: string,
  adaptationParams?: AdaptationParams // New optional parameter
): Promise<PedagogicalPrompt> => {
  // Use gemini-3-flash-preview for better stability and to avoid 500 Internal Server Errors.
  const model = 'gemini-3-flash-preview';
  
  const skillDetails = skillCodes.map(code => {
    const description = getSkillDescription(code);
    return `- Habilidade (Código): ${code}\n- Habilidade (Descrição): "${description}"`;
  }).join('\n');

  let systemInstruction = `Você é um assistente pedagógico especialista em criar planos de aula de matemática para o 5º ano do ensino fundamental. Sua tarefa é gerar uma proposta completa, criativa, inclusiva e alinhada à BNCC, que integre de forma coesa TODAS as habilidades selecionadas. 

  IMPORTANTE PARA O REGISTRO: No campo "diarioDeClasse", você deve SEMPRE iniciar o texto com o código alfanumérico da habilidade (ex: EF05MA01), sem parênteses, seguido de um hífen e a descrição sucinta da aula. Exemplo: "EF05MA01 - Aula sobre sistema de numeração decimal".

  A resposta deve ser um objeto JSON válido.`;
  
  let adaptationContext = "";

  if (adaptationParams) {
      const transtornoDisplay = adaptationParams.detalhesOutro ? adaptationParams.detalhesOutro : adaptationParams.transtorno;

      systemInstruction = `PERSONA & CONTEXTO: Você é um Especialista em Educação Inclusiva e Neurodesenvolvimento (com foco em DUA - Desenho Universal para a Aprendizagem). Seu objetivo é criar atividades pedagógicas altamente adaptadas e personalizadas para alunos com Transtornos do Neurodesenvolvimento e/ou com a necessidade de níveis específicos de suporte.

      IMPORTANTE PARA O REGISTRO: No campo "diarioDeClasse", você deve SEMPRE iniciar o texto com o código alfanumérico da habilidade (ex: EF05MA01), sem parênteses, seguido de um hífen e a descrição sucinta da aula. Exemplo: "EF05MA01 - Aula sobre sistema de numeração decimal".

      DIRETRIZES FUNDAMENTAIS:
      - Fundamentação Científica: Toda adaptação deve ser baseada em princípios e recomendações de documentos científicos mundialmente reconhecidos (ex: DSM-5, CID-11, Diretrizes Internacionais para TDAH/TEA, CAS, etc.).
      - Foco na Habilidade (e não no Déficit): As atividades devem focar na habilidade que o aluno pode desenvolver, ajustando o método e o formato (andaime/scaffolding), não o objetivo curricular essencial.
      - Suporte Visual Estruturado: Priorize a clareza visual, alto contraste e minimalismo nas descrições de imagens para evitar sobrecarga sensorial e facilitar o processamento cognitivo. A imagem deve ser uma representação LITERAL e EXATA do que é pedido na atividade, sem elementos decorativos ou artísticos que possam confundir o aluno.
      - Fidelidade Visual: Se a atividade pede "3 maçãs", a imagem deve conter exatamente 3 maçãs. Evite qualquer tipo de "ilusão" ou interpretação artística abstrata.
      
      A resposta DEVE ser um objeto JSON válido.`;

      adaptationContext = `
      GERAR ATIVIDADE ADAPTADA PARA:
      - Transtorno/Condição: ${transtornoDisplay}
      - Nível de Suporte: ${adaptationParams.nivelSuporte}
      ${adaptationParams.conteudo ? `- Habilidade/Conteúdo Específico (Foco da Adaptação): ${adaptationParams.conteudo}` : ''}
      
      ESTRUTURA DE RESPOSTA OBRIGATÓRIA (Mapeada para o JSON):
      O campo "conteudoTema" deve ser o "NOME da Atividade Adaptada".
      O campo "objetosDeConhecimento" deve conter os "Objetivo(s) Curricular(es)".
      O campo "folhaDeAtividades" deve ser a "Atividade Principal (Adaptada)". Use linguagem clara e instrucional, dividindo em passos se necessário.
      O campo "planoDeAula" deve incluir o perfil do aluno e o detalhamento do plano.
      O campo "adaptacao" deve conter as "Estratégias de Adaptação Aplicadas" e "Critérios de Sucesso".
      `;
  }

  const userPrompt = `
    Por favor, crie uma proposta pedagógica completa que integre as seguintes habilidades:
    - Bimestre: ${bimester}
    ${skillDetails}
    - Quantidade de Aulas Previstas: ${classCount}
    - Tipo de Aula: ${classType}
    ${theme ? `- Tema Gerador Opcional: "${theme}"` : ''}

    ${adaptationContext}

    A proposta deve incluir os seguintes campos no JSON:
    1.  **codigoAlfanumerico**: Os códigos das habilidades fornecidos (Ex: ${skillCodes.join(', ')}).
    2.  **habilidade**: As descrições completas de todas as habilidades.
    3.  **objetosDeConhecimento**: Uma lista de objetos de conhecimento (ou objetivos curriculares da adaptação).
    4.  **conteudoTema**: Um nome ou título criativo para a atividade (ou Nome da Atividade Adaptada).
    5.  **contextualizacao**: Uma breve introdução para os alunos.
    6.  **planoDeAula**: O plano de aula detalhado. ${adaptationParams ? 'Deve incluir o Perfil do Aluno (Transtorno e Nível).' : 'Deve ser estruturado em seções claras (OBJETIVOS, DESENVOLVIMENTO, DIFERENCIAÇÃO).'} IMPORTANTE: Use dois "enters" (duas quebras de linha) entre cada item ou parágrafo para garantir uma leitura clara e organizada. NÃO utilize os termos "SÍNCRONA (ONLINE)" ou "ASSÍNCRONA (OFFLINE)" no desenvolvimento.
    7.  **folhaDeAtividades**: O conteúdo da atividade para o aluno. ${adaptationParams ? 'Deve ser a Atividade Principal Adaptada passo a passo. IMPORTANTE: Se houver uso de imagens/pictogramas, descreva-os explicitamente no texto para guiar o aluno.' : 'Inclua cabeçalho.'} IMPORTANTE: Use dois "enters" (duas quebras de linha) entre cada questão ou seção para facilitar a leitura.
    8.  **sugestaoDeImagem**: Uma descrição detalhada para gerar uma imagem ilustrativa. A descrição deve ser EXTREMAMENTE LITERAL, descrevendo objetos, quantidades e posições de forma objetiva, como se fosse um diagrama técnico ou uma fotografia clara. Evite termos como "estilo artístico", "mágico" ou "vibrante". Foque em: "Um desenho simples de [objeto] em fundo branco, com [quantidade] unidades, visto de frente". ${adaptationParams ? 'Para atividades adaptadas, a descrição DEVE focar em um suporte visual minimalista: imagem com poucos elementos, traços simples e bem definidos, alto contraste, sem fundos complexos ou distrações visuais, servindo como um apoio cognitivo direto e claro para a tarefa (ex: pictogramas, esquemas simplificados, objetos isolados).' : ''}
    9.  **quantidadeAulas**: A quantidade de aulas prevista.
    10. **diarioDeClasse**: Texto sucinto para registro. O formato DEVE ser: "[Código Alfanumérico] - [Descrição Sucinta]". Exemplo: "EF05MA01 - Atividade sobre números naturais". Não use parênteses para o código.
    11. **tipoDeAula**: Objeto com tipo e materiais.
    12. **sugestaoAvaliacao**: Sugestão de avaliação.
    13. **sugestaoVideoAula**: Termo de busca para YouTube.
    14. **sugestaoVideoLibras**: Roteiro para LIBRAS.
    15. **sugestaoAudiodescricao**: Objeto com 'atividade' e 'imagem'.
    16. **passoAPassoProfessor**: Um roteiro detalhado passo a passo para o professor aplicar a atividade, com dicas de mediação e pontos de atenção.
    ${adaptationParams ? '17. **adaptacao**: Objeto contendo "transtorno", "nivelSuporte", "estrategias" (lista de strings com estratégia e justificativa) e "criteriosSucesso" (string).' : ''}

    IMPORTANTE: Para os campos "planoDeAula" e "folhaDeAtividades", NÃO use formatação markdown como "**" ou "#" para ênfase ou títulos, exceto para tabelas [TABLE_START]...[TABLE_END].
    `;

  const responseSchemaProperties: any = {
        codigoAlfanumerico: { type: Type.STRING },
        habilidade: { type: Type.STRING },
        objetosDeConhecimento: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        contextualizacao: { type: Type.STRING },
        planoDeAula: { type: Type.STRING },
        folhaDeAtividades: { type: Type.STRING },
        sugestaoDeImagem: { type: Type.STRING },
        quantidadeAulas: { type: Type.STRING },
        conteudoTema: { type: Type.STRING },
        diarioDeClasse: { type: Type.STRING },
        tipoDeAula: {
          type: Type.OBJECT,
          properties: {
            tipo: { type: Type.STRING },
            materiais: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
          },
          required: ['tipo']
        },
        sugestaoAvaliacao: { type: Type.STRING },
        sugestaoVideoAula: { type: Type.STRING },
        sugestaoVideoLibras: { type: Type.STRING },
        sugestaoAudiodescricao: {
          type: Type.OBJECT,
          properties: {
            atividade: { type: Type.STRING },
            imagem: { type: Type.STRING },
          },
          required: ['atividade', 'imagem']
        },
        passoAPassoProfessor: { type: Type.STRING },
    };

    if (adaptationParams) {
        responseSchemaProperties.adaptacao = {
            type: Type.OBJECT,
            properties: {
                transtorno: { type: Type.STRING },
                nivelSuporte: { type: Type.STRING },
                estrategias: { type: Type.ARRAY, items: { type: Type.STRING } },
                criteriosSucesso: { type: Type.STRING }
            },
            required: ['transtorno', 'nivelSuporte', 'estrategias', 'criteriosSucesso']
        };
    }

    const ai = getAI();
    console.log(`[Gemini Service] Generating content with model: ${model}`);

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: userPrompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction,
          responseSchema: {
            type: Type.OBJECT,
            properties: responseSchemaProperties,
            required: [
              'codigoAlfanumerico', 'habilidade', 'objetosDeConhecimento', 'contextualizacao',
              'planoDeAula', 'folhaDeAtividades', 'sugestaoDeImagem', 'quantidadeAulas', 'conteudoTema',
              'diarioDeClasse', 'tipoDeAula', 'sugestaoAvaliacao', 'sugestaoVideoAula',
              'sugestaoVideoLibras', 'sugestaoAudiodescricao', 'passoAPassoProfessor'
            ]
          },
        },
      });

      const responseText = response.text.trim();
      const result = JSON.parse(responseText);
      return result as PedagogicalPrompt;

    } catch (error) {
      throw handleGeminiError(error, "gerar a atividade");
    }
};

/**
 * Generates an image from a text prompt using the Gemini API.
 */
export const generateImageFromPrompt = async (promptInPortuguese: string): Promise<string> => {
  const model = 'gemini-2.5-flash-image';

  const ai = getAI();
  // Translate the prompt to English for the image generation model
  let englishPrompt = promptInPortuguese;
  try {
    const translationResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate the following image description to English. 
        IMPORTANT: The translation must be EXTREMELY LITERAL and PRECISE. 
        If the description mentions specific quantities (e.g., "3 apples"), the translation MUST clearly state "exactly 3 apples". 
        Do not add artistic adjectives. If there's text to be shown, it must be in Brazilian Portuguese.
        Only return the translated text.\n\nPortuguese: "${promptInPortuguese}"\n\nEnglish:`,
    });
    englishPrompt = translationResponse.text.trim();
  } catch(e) {
      console.warn("Translation failed, using original prompt.", e);
      // Fallback to original prompt if translation fails
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            text: `Create a pedagogical illustration for a 5th grade math activity. 
            CRITICAL: The image MUST be an EXTREMELY LITERAL and ACCURATE representation of this description: "${englishPrompt}". 
            RULES:
            1. Exact quantities: If the description specifies a number of objects, show exactly that number.
            2. No hallucinations: Do not add any extra objects, characters, or artistic backgrounds not mentioned.
            3. Style: Clean, educational, technical illustration style. High contrast. White or neutral background.
            4. Clarity: Objects should be clearly separated and easy to count or identify.
            5. No abstract art: Avoid any "AI-style" artistic distortions or illusions.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("Nenhuma imagem foi gerada.");
  } catch (error) {
    console.error("Error generating image:", error);
    return ''; // Return empty string to fallback to placeholder
  }
};
