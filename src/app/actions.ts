"use server";

import { summarizeIncubatorMentorContent, type SummarizeIncubatorMentorContentInput } from "@/ai/flows/summarize-incubator-mentor-content";

export async function getSummary(content: string) {
    const input: SummarizeIncubatorMentorContentInput = { content };
    try {
        const { summary } = await summarizeIncubatorMentorContent(input);
        return { summary };
    } catch (error) {
        console.error(error);
        return { error: "Failed to generate summary." };
    }
}
