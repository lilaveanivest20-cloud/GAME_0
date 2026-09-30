export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  isEntry?: boolean;
}

export interface ExecutionResult {
  status: 'idle' | 'running' | 'success' | 'compilation_error' | 'runtime_error' | 'timeout' | 'sandbox_error';
  stdout: string;
  stderr: string;
  executionTimeMs: number;
  memoryMb?: number;
  testsPassed?: number;
  totalTests?: number;
  sandboxInfo?: {
    mode: string;
    architecture: string;
  };
}

export interface GitCommit {
  id: string;
  hash: string;
  message: string;
  author: string;
  timestamp: string;
  branch: string;
  parentHash?: string;
}

export interface GitBranch {
  name: string;
  headCommitHash: string;
}

export interface DebuggerVariable {
  name: string;
  value: string;
  type: string;
  scope: 'local' | 'closure' | 'global';
}

export interface DebuggerFrame {
  functionName: string;
  fileName: string;
  lineNumber: number;
}
