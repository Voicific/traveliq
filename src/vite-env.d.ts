/// <reference types="vite/client" />

interface Window {
  aistudio?: {
    randomPrompt?: () => void;
    reset?: () => void;
    hasSelectedApiKey?: () => Promise<boolean>;
    openSelectKey?: () => Promise<void>;
  };
}
