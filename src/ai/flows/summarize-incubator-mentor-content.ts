'use server';
/**
 * @fileOverview Summarizes the content of incubator and mentor profiles.
 *
 * - summarizeIncubatorMentorContent - A function that summarizes the content of a profile.
 * - SummarizeIncubatorMentorContentInput - The input type for the summarizeIncubatorMentorContent function.
 * - SummarizeIncubatorMentorContentOutput - The return type for the summarizeIncubatorMentorContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeIncubatorMentorContentInputSchema = z.object({
  content: z
    .string()
    .describe('The content of the incubator or mentor profile to summarize.'),
});
export type SummarizeIncubatorMentorContentInput = z.infer<
  typeof SummarizeIncubatorMentorContentInputSchema
>;

const SummarizeIncubatorMentorContentOutputSchema = z.object({
  summary: z.string().describe('A brief summary of the profile content.'),
});
export type SummarizeIncubatorMentorContentOutput = z.infer<
  typeof SummarizeIncubatorMentorContentOutputSchema
>;

export async function summarizeIncubatorMentorContent(
  input: SummarizeIncubatorMentorContentInput
): Promise<SummarizeIncubatorMentorContentOutput> {
  return summarizeIncubatorMentorContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeIncubatorMentorContentPrompt',
  input: {schema: SummarizeIncubatorMentorContentInputSchema},
  output: {schema: SummarizeIncubatorMentorContentOutputSchema},
  prompt: `You are an expert content summarizer. Please provide a brief summary of the following content:\n\nContent: {{{content}}}`,
});

const summarizeIncubatorMentorContentFlow = ai.defineFlow(
  {
    name: 'summarizeIncubatorMentorContentFlow',
    inputSchema: SummarizeIncubatorMentorContentInputSchema,
    outputSchema: SummarizeIncubatorMentorContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
