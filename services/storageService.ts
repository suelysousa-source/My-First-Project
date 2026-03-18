import { PedagogicalPrompt } from '../types';

const STORAGE_KEY = 'savedPedagogicalPrompts_v1';

export const getSavedPrompts = (): PedagogicalPrompt[] => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : [];
  } catch (error) {
    console.error("Failed to retrieve saved prompts from localStorage:", error);
    // Em caso de erro, limpa o item para evitar problemas futuros
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
};

export const savePrompt = (prompt: PedagogicalPrompt): PedagogicalPrompt[] => {
  const prompts = getSavedPrompts();
  // Previne a adição de um prompt já salvo
  if (prompts.some(p => p.id === prompt.id)) {
    return prompts;
  }
  const updatedPrompts = [prompt, ...prompts];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPrompts));
  } catch(error) {
      console.error("Failed to save prompts to localStorage:", error);
  }
  return updatedPrompts;
};

export const updatePrompt = (updatedPrompt: PedagogicalPrompt): PedagogicalPrompt[] => {
  let prompts = getSavedPrompts();
  const promptIndex = prompts.findIndex(p => p.id === updatedPrompt.id);
  if (promptIndex > -1) {
    prompts[promptIndex] = updatedPrompt;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
    } catch(error) {
        console.error("Failed to update prompts in localStorage:", error);
    }
  }
  return prompts;
};

export const deletePrompt = (promptId: string): PedagogicalPrompt[] => {
  let prompts = getSavedPrompts();
  const updatedPrompts = prompts.filter(p => p.id !== promptId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPrompts));
  } catch (error) {
      console.error("Failed to delete prompt from localStorage:", error);
  }
  return updatedPrompts;
};
