import { PedagogicalPrompt } from '../types';

/**
 * Creates a pre-filled Canva presentation link from the pedagogical prompt data.
 * @param promptData The pedagogical prompt object.
 * @returns A URL string to open a new Canva design.
 */
export const createCanvaPresentation = (promptData: PedagogicalPrompt): string => {
  // Use a different, potentially more stable public template.
  // Template: "Minimalist Lines Company Project Presentation"
  const CANVA_TEMPLATE_ID = 'EAFMbo41y84'; 
  const baseUrl = `https://www.canva.com/design/${CANVA_TEMPLATE_ID}/remix`;

  // --- PARSE THE CONTENT FROM THE PROMPT ---
  const parseSection = (text: string, startMarker: string, endMarkers: string[]): string => {
    const startRegex = new RegExp(`(?:\\*\\*)?${startMarker}(?:\\s*\\(.*?\\))?(?:\\*\\*)?:?`, 'i');
    const match = text.match(startRegex);
    if (!match || match.index === undefined) return '';
    
    const searchFrom = match.index + match[0].length;
    let endIndex = text.length;

    for (const marker of endMarkers) {
        const endRegex = new RegExp(`(?:\\*\\*)?${marker}(?:\\s*\\(.*?\\))?(?:\\*\\*)?:?`, 'i');
        const subText = text.substring(searchFrom);
        const endMatch = subText.match(endRegex);
        if (endMatch && endMatch.index !== undefined) {
            const absoluteEndIndex = searchFrom + endMatch.index;
            endIndex = Math.min(endIndex, absoluteEndIndex);
        }
    }
    return text.substring(searchFrom, endIndex).trim().replace(/\*\*/g, ''); // Clean markdown
  };

  const promptText = promptData.planoDeAula; // Use planoDeAula as the source
  const allMarkers = ["Vamos Aprender", "Veja como se faz", "Agora é com você!", "Desafio"];
  
  const title = promptData.conteudoTema;
  const subtitle = `Habilidade: ${promptData.codigoAlfanumerico}`;

  const introText = parseSection(promptText, 'Vamos Aprender', allMarkers.slice(1));
  const exampleText = parseSection(promptText, 'Veja como se faz', allMarkers.slice(2));
  const exercisesText = parseSection(promptText, 'Agora é com você!', allMarkers.slice(3));
  const challengeText = parseSection(promptText, 'Desafio', []);


  // --- BUILD THE URL PARAMETERS ---
  const params = new URLSearchParams();

  const addTextParam = (text: string) => {
    // Canva has limits, so we truncate text to be safe.
    if (text && text.trim()) {
        params.append('t', text.substring(0, 1500));
    }
  }

  // Add the main content blocks. This is simpler and more robust.
  addTextParam(title);
  addTextParam(subtitle);
  addTextParam(introText);
  addTextParam(exampleText);
  addTextParam(exercisesText);
  addTextParam(challengeText);


  return `${baseUrl}?${params.toString()}`;
};
