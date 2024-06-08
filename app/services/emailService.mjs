import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

const gmail = google.gmail("v1");

export async function fetchOneEmail(accessToken, maxResults = 15) {
  try {
    const authClient = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });

    authClient.setCredentials({
      access_token: accessToken,
    });

    const res = await gmail.users.messages.list({
      auth: authClient,
      userId: "me",
      q: "category:primary",
      maxResults: maxResults,
    });

    if (!res.data.messages || res.data.messages.length === 0) {
      throw new Error("No emails found in inbox");
    }

    const messageId = res.data.messages[14].id;

    const detailRes = await gmail.users.messages.get({
      auth: authClient,
      userId: "me",
      id: messageId,
    });

    return detailRes;
  } catch (error) {
    console.error("Error fetching email:", error);
    throw error;
  }
}
