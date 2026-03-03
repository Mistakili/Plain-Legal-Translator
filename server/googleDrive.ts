// Google Drive integration via Replit Connectors
import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X-Replit-Token not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-drive',
    {
      headers: {
        'Accept': 'application/json',
        'X-Replit-Token': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Drive not connected');
  }
  return accessToken;
}

export async function getUncachableGoogleDriveClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

export async function listDriveFiles(query?: string, pageToken?: string) {
  const drive = await getUncachableGoogleDriveClient();

  const supportedMimes = [
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.google-apps.document",
  ];

  let q = supportedMimes.map(m => `mimeType='${m}'`).join(" or ");
  q = `(${q}) and trashed=false`;

  if (query) {
    q = `${q} and name contains '${query.replace(/'/g, "\\'")}'`;
  }

  const res = await drive.files.list({
    q,
    pageSize: 20,
    pageToken: pageToken || undefined,
    fields: "nextPageToken, files(id, name, mimeType, modifiedTime, size)",
    orderBy: "modifiedTime desc",
  });

  return {
    files: res.data.files || [],
    nextPageToken: res.data.nextPageToken || null,
  };
}

export async function downloadDriveFile(fileId: string): Promise<{ text: string; name: string }> {
  const drive = await getUncachableGoogleDriveClient();

  const meta = await drive.files.get({ fileId, fields: "id, name, mimeType" });
  const name = meta.data.name || "Untitled";
  const mimeType = meta.data.mimeType || "";

  if (mimeType === "application/vnd.google-apps.document") {
    const exported = await drive.files.export({ fileId, mimeType: "text/plain" });
    return { text: exported.data as string, name };
  }

  if (mimeType === "text/plain") {
    const res = await drive.files.get({ fileId, alt: "media" });
    return { text: res.data as string, name };
  }

  if (mimeType === "application/pdf") {
    const res = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "arraybuffer" }
    );
    const buffer = Buffer.from(res.data as ArrayBuffer);
    const pdfParse = (await import("pdf-parse")).default;
    const parsed = await pdfParse(buffer);
    return { text: parsed.text, name };
  }

  if (
    mimeType === "application/msword" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const exported = await drive.files.export({ fileId, mimeType: "text/plain" });
    return { text: exported.data as string, name };
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}
