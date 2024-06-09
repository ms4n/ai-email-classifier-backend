import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

export async function classifyEmail(email, openAiApiKey) {
  try {
    const model =
      openAiApiKey.toLowerCase() === "gpt3" ? "gpt-3.5-turbo-0125" : "gpt-4o";

    const apiKey =
      openAiApiKey.toLowerCase() === "gpt3"
        ? process.env.OPENAI_API_KEY
        : openAiApiKey;

    const classificationSchema = z.object({
      label: z
        .enum([
          "Important",
          "Promotions",
          "Social",
          "Marketing",
          "Spam",
          "General",
        ])
        .describe(
          "The classification labels of the email, you need select one label based on the email content."
        ),
    });

    const taggingPrompt = ChatPromptTemplate.fromTemplate(
      `Classify the email into one of the following categories:
  
        - Important: Emails that are personal or work-related and require immediate attention.
        - Promotions: Emails related to sales, discounts, and marketing campaigns.
        - Social: Emails from social networks, friends, and family.
        - Marketing: Emails related to marketing, newsletters, and notifications.
        - Spam: Unwanted or unsolicited emails.
        - General: If none of the above are matched, use General.
        
        Email Subject:
        {email_subject}
        
        Email Snippet:
        {email_snippet}
        
        Respond with a single category label.
        `
    );

    const llm = new ChatOpenAI({
      temperature: 0,
      model: model,
      apiKey: apiKey,
    });

    const llmWithStructuredOutput = llm.withStructuredOutput(
      classificationSchema,
      {
        name: "email_classifier",
      }
    );

    const taggingChain = taggingPrompt.pipe(llmWithStructuredOutput);

    // Function to classify an email
    const input = {
      email_subject: email.emailSubject,
      email_snippet: email.emailSnippet,
    };

    const result = await taggingChain.invoke(input);

    return result;
  } catch (error) {
    console.error("Error classifying emails using LLM:", error);
    throw error;
  }
}

// console.log(
//   await classifyEmail({
//     emailSnippet:
//       "@abhagsain: Hey, You don&#39;t need to submit for verification. The users will see a insecure screen but it would work Anurag Bhagsain sent you a Direct Message. Hey, You don&#39;t need to submit for",
//     emailSubject:
//       "Anurag Bhagsain (@abhagsain) has sent you a Direct Message on X!",
//   })
// );
