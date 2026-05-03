import fetch from "node-fetch";
import FormData from "form-data";
import { config } from "../config";
import type { EmbeddingServiceResponse } from "../types";

/**
 * Utility function to finalize FormData into a Buffer and set the Content-Length header.
 * This is crucial for reliable file transfer to external services (like FastAPI/Python)
 * when using node-fetch, preventing boundary corruption issues.
 * @param formData The FormData object containing the file buffer.
 * @returns A promise that resolves with the final Buffer of the request body.
 */
const getFormDataBuffer = (formData: FormData): Promise<Buffer> => {
  return new Promise<Buffer>((resolve, reject) => {
    formData.getLength((err, length) => {
      if (err) return reject(err);

      // Must include Content-Length for reliable server-to-server streaming
      formData.getHeaders()["content-length"] = String(length);

      // Resolve with a complete buffer (no longer a stream)
      resolve(formData.getBuffer());
    });
  });
};

/**
 * Sends an image file to the embedding service to generate a single CLIP embedding.
 * @param file The Multer file object containing the image buffer.
 * @param baseUrl The base URL of the embedding service (defaults to config).
 * @returns A promise that resolves with the embedding vector (number array).
 */
export async function getSingleEmbedding(
  file: Express.Multer.File,
  baseUrl: string = config.embeddingServiceUrl,
): Promise<number[]> {
  const formData = new FormData();
  formData.append("file", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  const buffer = await getFormDataBuffer(formData);
  const headers = formData.getHeaders();

  const response = await fetch(`${baseUrl}/embed`, {
    method: "POST",
    body: buffer,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Embedding service error: ${response.statusText} - ${errorText}`,
    );
  }

  const { embedding } = (await response.json()) as { embedding: number[] };
  return embedding;
}

/**
 * Sends an image file to the embedding service to detect cards and return embeddings for the detections.
 * @param file The Multer file object containing the image buffer.
 * @param baseUrl The base URL of the embedding service (defaults to config).
 * @returns A promise that resolves with the detection and embedding response object.
 */
export async function detectAndEmbed(
  file: Express.Multer.File,
  baseUrl: string = config.embeddingServiceUrl,
): Promise<EmbeddingServiceResponse> {
  const formData = new FormData();
  formData.append("file", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  const buffer = await getFormDataBuffer(formData);
  const headers = formData.getHeaders();

  const response = await fetch(`${baseUrl}/detect-and-embed`, {
    method: "POST",
    body: buffer,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Embedding service error: ${response.statusText} - ${errorText}`,
    );
  }

  return (await response.json()) as EmbeddingServiceResponse;
}

/**
 * Checks the health of the embedding service endpoint.
 * @param baseUrl The base URL of the embedding service (defaults to config).
 * @returns A promise that resolves to true if the service is healthy, false otherwise.
 */
export async function checkHealth(
  baseUrl: string = config.embeddingServiceUrl,
): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/health`);
    return response.ok;
  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
}
