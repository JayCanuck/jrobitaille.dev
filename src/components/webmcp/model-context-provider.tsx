'use client';
// Why a client component: WebMCP registration needs document.modelContext in the browser (spec
// §7, D17). Loaded by the island loader after idle. Feature-detects the native API, loads the
// pinned polyfill only when it is absent, registers the eight read-only tools, and renders the
// badge once registration succeeds. Registration is a module promise read with use(): no effect.
import { Suspense, use } from 'react';

import { AgentToolsBadge } from '@/components/webmcp/agent-tools-badge';
import type { ProfileData } from '@/lib/webmcp/profile-data';
import { callTool, tools } from '@/lib/webmcp/tools';

interface ModelContextLike {
  registerTool(tool: {
    name: string;
    description: string;
    inputSchema: object;
    execute: (input: never) => Promise<unknown>;
  }): Promise<void> | void;
}

const modelContextOf = (): ModelContextLike | undefined =>
  (document as { modelContext?: ModelContextLike }).modelContext ??
  (navigator as { modelContext?: ModelContextLike }).modelContext;

// The data is fetched on the first tool call, once, so idle costs the island alone.
let data: Promise<ProfileData> | undefined;
const loadData = () =>
  (data ??= fetch('/api/profile.json').then(response => {
    if (!response.ok) throw new Error(`profile.json ${String(response.status)}`);
    return response.json() as Promise<ProfileData>;
  }));

const register = async (): Promise<boolean> => {
  try {
    let context = modelContextOf();
    if (!context) {
      const { initializeWebMCPPolyfill } = await import('@mcp-b/webmcp-polyfill');
      initializeWebMCPPolyfill();
      context = modelContextOf();
    }
    if (!context) return false;
    for (const tool of tools) {
      await context.registerTool({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        execute: async (input: unknown) => callTool(tool, await loadData(), input)
      });
    }
    return true;
  } catch {
    return false;
  }
};

let registration: Promise<boolean> | undefined;

function Registered() {
  const ok = use((registration ??= register()));
  return ok ? <AgentToolsBadge /> : null;
}

export function ModelContextProvider() {
  return (
    <Suspense fallback={null}>
      <Registered />
    </Suspense>
  );
}
