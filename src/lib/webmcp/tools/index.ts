// The eight read-only tools (spec §7, D17) in registration order. Each lives in its own file with
// its own test; this list is what the island registers and what llms.txt names.
import type { ProfileData } from '@/lib/webmcp/profile-data';

import { getContact } from './get-contact';
import { getExperience } from './get-experience';
import { getProfile } from './get-profile';
import { getProject } from './get-project';
import { getResumeUrl } from './get-resume-url';
import { getSkills } from './get-skills';
import { listExperience } from './list-experience';
import { listProjects } from './list-projects';
import { failure, type ToolDefinition, type ToolResult } from './types';

// Inputs differ per tool; the island narrows each call to its own definition.
export const tools: readonly ToolDefinition<never>[] = [
  getProfile,
  listExperience,
  getExperience,
  listProjects,
  getProject,
  getSkills,
  getContact,
  getResumeUrl
];

// The one never-throw guard, used by the island's execute: a handler that throws becomes a
// failure result an agent can read, instead of a rejected call (review finding).
export const callTool = (
  tool: ToolDefinition<never>,
  data: ProfileData,
  input: unknown
): ToolResult => {
  try {
    return tool.handler(data, input as never);
  } catch (error) {
    return failure(`${tool.name} failed: ${error instanceof Error ? error.message : 'unknown'}`);
  }
};

export type { ToolDefinition, ToolResult } from './types';
