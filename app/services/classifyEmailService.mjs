import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

export async function classifyEmail(email) {
  try {
    const model = "gpt-4o";
    const apiKey = process.env.OPENAI_API_KEY;

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
      `Classify the following email into exactly one of these categories. Consider both the subject and content carefully:

        1. Important:
           - Work-related emails requiring action (meetings, deadlines, assignments)
           - Financial notifications (bills, payments, banking)
           - Official communications (legal, government, school)
           - Time-sensitive personal matters
        
        2. Social:
           - Messages from social networks (Facebook, Twitter, LinkedIn)
           - Personal communications from friends/family
           - Event invitations and RSVPs
           - Social media notifications and updates
        
        3. Promotions:
           - Sales and discount offers
           - Product promotions
           - Limited time deals
           - Shopping-related emails
        
        4. Marketing:
           - Newsletters
           - Company updates and announcements
           - Product launches
           - Blog posts and content updates
           - Non-promotional business communications
        
        5. Spam:
           - Unsolicited advertisements
           - Phishing attempts
           - Suspicious sender addresses
           - Excessive use of urgency or pressure tactics
           - Unrequested services or products
        
        6. General:
           - Routine notifications and updates
           - Confirmations and receipts
           - Any email that doesn't clearly fit the above categories

        Email Subject: {email_subject}
        
        Email Snippet: {email_snippet}
        
        Instructions:
        1. Analyze both subject and content
        2. Select the MOST appropriate category
        3. Respond with only one category name from the list above
        4. If in doubt between categories, prioritize Important > Social > Promotions > Marketing > General > Spam
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
