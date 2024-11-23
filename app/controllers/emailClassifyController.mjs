import { classifyEmail } from "../services/classifyEmailService.mjs";

export const classifyEmails = async (req, res) => {
  try {
    const { emails } = req.body;

    // Check if emails is an array
    if (!Array.isArray(emails)) {
      console.error("Invalid format for emails:", emails);
      return res.status(400).json({ error: "emails must be an array" });
    }

    // Check if emails is empty
    if (emails.length === 0) {
      console.error("Empty emails array:", emails);
      return res.status(400).json({ error: "emails cannot be empty" });
    }

    // Classify each email in the array individually
    const labeledEmails = [];
    for (const email of emails) {
      if (!email.emailSubject || !email.emailSnippet) {
        console.error("Missing emailSubject or emailSnippet in email:", email);
        return res
          .status(400)
          .json({ error: "emailSubject and emailSnippet are required" });
      }
      const classificationResult = await classifyEmail(email);
      labeledEmails.push(classificationResult);
    }

    // Send back the array of labeled emails
    return res.status(200).json({ labeledEmails });
  } catch (error) {
    console.error("Error classifying emails:", error);
    return res.status(500).json({
      error:
        error.message || "Internal Server Error. Unable to classify emails.",
    });
  }
};
