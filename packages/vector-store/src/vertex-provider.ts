export async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=\;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'models/text-embedding-004',
      content: { parts: [{ text }] }
    })
  });

  const data = await response.json();
  if (!data.embedding) {
    throw new Error('Failed to generate embedding: ' + JSON.stringify(data));
  }
  return data.embedding.values;
}
