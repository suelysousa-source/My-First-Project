import { GoogleGenAI, Type } from "@google/genai";
import { PedagogicalPrompt, AdaptationParams } from '../types';
import { skillsByBimester } from '../data/skills';

// Fix: Initialize the GoogleGenAI client lazily to prevent crashes if the API key is missing.
let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("API Key não encontrada. Verifique as configurações.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
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
  // Fix: Use gemini-2.5-pro for complex text generation and JSON output.
  const model = 'gemini-2.5-pro';
  
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
      - Suporte Visual Estruturado: Priorize a clareza visual, alto contraste e minimalismo nas descrições de imagens para evitar sobrecarga sensorial e facilitar o processamento cognitivo.
      - Clareza e Estrutura: O output deve ser entregue em um formato claro, separando a atividade original (se aplicável) das estratégias de adaptação.
      
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
    6.  **planoDeAula**: O plano de aula detalhado. ${adaptationParams ? 'Deve incluir o Perfil do Aluno (Transtorno e Nível).' : 'Deve ser estruturado em seções claras (OBJETIVOS, DESENVOLVIMENTO, DIFERENCIAÇÃO).'}
    7.  **folhaDeAtividades**: O conteúdo da atividade para o aluno. ${adaptationParams ? 'Deve ser a Atividade Principal Adaptada passo a passo. IMPORTANTE: Se houver uso de imagens/pictogramas, descreva-os explicitamente no texto para guiar o aluno.' : 'Inclua cabeçalho.'}
    8.  **sugestaoDeImagem**: Uma descrição detalhada para gerar uma imagem ilustrativa. ${adaptationParams ? 'Para atividades adaptadas, a descrição DEVE focar em um suporte visual minimalista: imagem com poucos elementos, traços simples e bem definidos, alto contraste, sem fundos complexos ou distrações visuais, servindo como um apoio cognitivo direto e claro para a tarefa (ex: pictogramas, esquemas simplificados, objetos isolados).' : ''}
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

  try {
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

  } catch (error)
{
    console.error("Error generating pedagogical prompt:", error);
    throw new Error("Falha ao comunicar com a IA para gerar a atividade.");
  }
};

/**
 * Generates an image from a text prompt using the Gemini API.
 */
export const generateImageFromPrompt = async (promptInPortuguese: string): Promise<string> => {
  const model = 'imagen-4.0-generate-001';

  const ai = getAI();
  // Translate the prompt to English for the image generation model
  let englishPrompt = promptInPortuguese;
  try {
    const translationResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Translate the following image description to English, keeping it concise and clear for an image generation AI. If the description implies any text should appear in the image, that text MUST be in Brazilian Portuguese. Only return the translated text.\n\nPortuguese: "${promptInPortuguese}"\n\nEnglish:`,
    });
    englishPrompt = translationResponse.text.trim();
  } catch(e) {
      console.warn("Translation failed, using original prompt.", e);
      // Fallback to original prompt if translation fails
  }


  try {
    const ai = getAI();
    const response = await ai.models.generateImages({
      model: model,
      prompt: englishPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '16:9', // Aspect ratio suitable for activities
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      // Fix: Correctly create a data URL from the base64 image bytes.
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
      return imageUrl;
    } else {
      throw new Error("Nenhuma imagem foi gerada.");
    }

  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Falha ao comunicar com a IA para gerar a imagem.");
  }
};