export interface ReviewFeedback {
  line: number;
  comment: string;
}

export interface ReviewResponse {
  feedback: ReviewFeedback[];
}

export interface FileReview {
  file: string;
  feedback: ReviewFeedback[];
}

export interface DocUpdate {
  file: string;
  content: string;
  reason: string;
}

export interface DocUpdateConfig {
  // Directory configurations
  docsDir: string; // Where documentation files are located within the docs repository
  codeDir?: string; // Optional: restrict which code directories to monitor

  // Documentation repository configuration
  docsRepo?: {
    owner: string; // GitHub org/user that owns the docs repo
    repo: string; // Repository name containing the docs
    branch?: string; // Branch to use (defaults to 'main' or repository default)
    monorepo?: boolean; // Whether this is a monorepo setup
  };

  // Documentation matching rules
  matchRules?: {
    // Map of code paths to doc paths (e.g., { "packages/spinai": "docs/api" })
    pathMappings?: Record<string, string>;
    // File patterns to ignore
    ignorePatterns?: string[];
    // Additional file extensions to consider as docs (default is ['.mdx'])
    docExtensions?: string[];
  };

  // PR creation settings
  prConfig: {
    // Whether to update the original PR or create a new one
    updateOriginalPr: boolean;
    // Custom PR title template
    titleTemplate?: string;
    // Custom PR body template
    bodyTemplate?: string;
    // Branch name prefix (default is 'docs/update')
    branchPrefix?: string;
    // Labels to add to the PR
    labels?: string[];
  };

  // LLM settings for doc generation
  llmConfig?: {
    // Temperature for doc generation (default 0.3 for more precise updates)
    temperature?: number;
    // System prompt additions for customizing doc style
    styleGuide?: string;
  };
}

export interface CodeChange {
  file: string;
  patch: string;
  type: "added" | "modified" | "deleted";
  significance: {
    hasExports: boolean;
    hasInterfaces: boolean;
    hasClasses: boolean;
    hasTypes: boolean;
    hasEnums: boolean;
    isTest: boolean;
  };
  category?: string;
  relatedFiles?: string[];
}

export interface CodeAnalysis {
  changes: CodeChange[];
  impactedAreas: string[];
  significantChanges: boolean;
  summary: string;
}

export interface DocFile {
  path: string;
  type: string;
  category?: string;
  lastModified?: string;
  references?: string[];
}

export interface DocStructure {
  files: DocFile[];
  categories: string[];
  navigation: NavigationItem[];
  fileTree: string;
}

export interface NavigationItem {
  group: string;
  pages: string[];
}

export interface PlannedDocUpdate {
  path: string;
  type: "create" | "update";
  reason: string;
  priority: "high" | "medium" | "low";
  sourceFiles: string[];
  relatedDocs?: string[];
  suggestedContent?: {
    title?: string;
    sections?: string[];
    examples?: string[];
  };
}

export interface UpdatePlan {
  summary: string;
  updates: PlannedDocUpdate[];
  navigationChanges?: {
    group: string;
    changes: Array<{
      type: "add" | "move" | "remove";
      page: string;
    }>;
  }[];
}

export interface GeneratedContent {
  files: Array<{
    path: string;
    content: string;
    type: "create" | "update";
    reason: string;
  }>;
  navigationUpdate?: {
    path: string;
    content: string;
    changes: Array<{
      type: "add" | "move" | "remove";
      page: string;
      group: string;
    }>;
  };
}

export interface ReviewState {
  owner: string;
  repo: string;
  pull_number: number;
  config: DocUpdateConfig;

  // Analysis results
  codeAnalysis?: CodeAnalysis;
  docStructure?: DocStructure;

  // Planning and generation
  updatePlan?: UpdatePlan;
  generatedContent?: GeneratedContent;
  docUpdates?: DocUpdate[];

  // Repository info
  docsRepo?: {
    owner: string;
    repo: string;
    branch: string;
  };
}
