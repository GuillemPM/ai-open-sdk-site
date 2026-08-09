declare const grammar: {
  name: string;
  scopeName: string;
  fileTypes?: string[];
  patterns: unknown[];
  repository?: Record<string, unknown>;
  [key: string]: unknown;
};

export default grammar;
