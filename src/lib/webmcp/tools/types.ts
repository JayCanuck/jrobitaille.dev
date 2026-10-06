// Contract for the read-only WebMCP tools (spec §7, D17). A tool is pure: the profile data and a
// validated input in, a tool result out. No zod here or in any tool file; the input schemas are
// JSON Schema literals so the browser never loads the content schemas.
import type { ProfileData } from '@/lib/webmcp/profile-data';

export interface JsonSchema {
  type: 'object';
  properties: Record<string, { type: string; description: string; enum?: string[] }>;
  required?: string[];
  additionalProperties: false;
}

export interface ToolResult {
  content: [{ type: 'text'; text: string }];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
}

export interface ToolDefinition<Input = Record<string, never>> {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  handler: (data: ProfileData, input: Input) => ToolResult;
}

export const EMPTY_INPUT: JsonSchema = {
  type: 'object',
  properties: {},
  additionalProperties: false
};

// Success: the value as JSON text plus structured content for clients that read it. Deep-copied,
// so a caller that mutates the result never reaches the shared profile data (review finding).
export const success = (value: Record<string, unknown>): ToolResult => {
  const text = JSON.stringify(value);
  return {
    content: [{ type: 'text', text }],
    structuredContent: JSON.parse(text) as Record<string, unknown>
  };
};

// Failure: a plain message, never a throw, so an agent can read why and retry.
export const failure = (message: string): ToolResult => ({
  content: [{ type: 'text', text: message }],
  isError: true
});
