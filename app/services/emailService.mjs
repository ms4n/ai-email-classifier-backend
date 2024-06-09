import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

const gmail = google.gmail("v1");

// Fetch email IDs for a specified number of emails, default is 15 emails.
export async function fetchEmails(accessToken, maxResults = 15) {
  try {
    const authClient = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });

    authClient.setCredentials({
      access_token: accessToken,
    });

    const response = await gmail.users.messages.list({
      auth: authClient,
      userId: "me",
      q: "category:primary",
      maxResults: maxResults,
    });

    if (!response.data.messages || response.data.messages.length === 0) {
      throw new Error("No emails found in inbox");
    }

    return response.data.messages;
  } catch (error) {
    console.error("Error fetching emails:", error);
    throw error;
  }
}

// Fetch required detailed data for a given email ID.
export async function fetchEmailData(accessToken, messageId) {
  try {
    const authClient = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });

    authClient.setCredentials({
      access_token: accessToken,
    });

    const response = await gmail.users.messages.get({
      auth: authClient,
      userId: "me",
      id: messageId,
    });

    const emailPayload = response.data.payload;
    const emailSnippet = response.data.snippet;

    let fromValue = "";
    let subjectValue = "";
    let emailBodyHtmlBase64 = "";

    // Extract 'From' and 'Subject' headers
    emailPayload.headers.forEach((header) => {
      if (header.name === "From") {
        fromValue = header.value;
      } else if (header.name === "Subject") {
        subjectValue = header.value;
      }
    });

    // Extract 'text/html' part
    if (emailPayload.parts) {
      for (const part of emailPayload.parts) {
        if (part.mimeType === "text/html") {
          emailBodyHtmlBase64 = part.body.data;
          break;
        }
      }
    }

    // Decode Base64 to HTML
    let emailBodyHtml = "";
    if (emailBodyHtmlBase64) {
      try {
        emailBodyHtml = Buffer.from(emailBodyHtmlBase64, "base64").toString(
          "utf-8"
        );
      } catch (error) {
        console.error("Error decoding Base64 email body:", error);
      }
    } else {
      console.warn("No HTML part found in the email.");
    }

    const requiredEmailData = {
      emailFrom: fromValue,
      emailSnippet: emailSnippet,
      emailSubject: subjectValue,
      emailBodyHtml: emailBodyHtml,
    };

    return requiredEmailData;
  } catch (error) {
    console.error("Error fetching email data:", error);
    throw error;
  }
}

// Fetch required email data for all the email IDs.
export async function fetchAllEmailData(accessToken, maxResults) {
  try {
    const emails = await fetchEmails(accessToken, maxResults);
    const emailDataArray = [];

    for (const email of emails) {
      const emailData = await fetchEmailData(accessToken, email.id);
      emailDataArray.push(emailData);
    }

    return emailDataArray;
  } catch (error) {
    console.error("Error fetching all email data:", error);
    throw error;
  }
}
