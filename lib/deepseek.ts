export type DeepSeekMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type DeepSeekChoice = {
  message?: {
    content?: string;
  };
};

type DeepSeekResponse = {
  choices?: DeepSeekChoice[];
  error?: {
    message?: string;
  };
};

const defaultBaseUrl = "https://api.deepseek.com";
const defaultModel = "deepseek-chat";
const defaultTimeoutMs = 45_000;

export async function callDeepSeek(messages: DeepSeekMessage[]) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.DEEPSEEK_BASE_URL || defaultBaseUrl;
  const model = process.env.DEEPSEEK_MODEL || defaultModel;
  const timeoutMs = Number(process.env.DEEPSEEK_TIMEOUT_MS) || defaultTimeoutMs;

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
      signal: controller.signal
    });

    const data = (await response.json()) as DeepSeekResponse;

    if (!response.ok) {
      throw new Error(data.error?.message || `DeepSeek request failed with status ${response.status}.`);
    }

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("DeepSeek returned an empty response.");
    }

    return content;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`DeepSeek request timed out after ${Math.round(timeoutMs / 1000)}s.`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
