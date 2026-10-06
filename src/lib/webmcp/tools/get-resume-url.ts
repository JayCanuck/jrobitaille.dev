// get_resume_url: returns the absolute URL of the current resume PDF as { resumeUrl }.
import { EMPTY_INPUT, success, type ToolDefinition } from './types';

export const getResumeUrl: ToolDefinition = {
  name: 'get_resume_url',
  description: 'The absolute URL of the current resume PDF.',
  inputSchema: EMPTY_INPUT,
  handler: data => success({ resumeUrl: data.resumeUrl })
};
