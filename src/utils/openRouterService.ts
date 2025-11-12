import axios, { AxiosError } from "axios";

export interface OpenRouterModel {
  id: string;
  name: string;
  pricing: {
    prompt: string;
    completion: string;
    image?: string;
    request?: string;
  };
  context_length: number;
  description?: string;
  created?: number;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterService {
  private apiKey: string;
  private baseUrl = "https://openrouter.ai/api/v1";
  private defaultModel = "meta-llama/llama-3.3-70b-instruct:free";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || "";

    if (!this.apiKey) {
      console.warn(
        "⚠️ OpenRouter API key not configured. AI features will not work.",
      );
    }
  }

  async chat(
    messages: ChatMessage[],
    model?: string,
    maxTokens: number = 500,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error(
        "OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.",
      );
    }

    try {
      const response = await axios.post<ChatCompletionResponse>(
        `${this.baseUrl}/chat/completions`,
        {
          model: model || this.defaultModel,
          messages,
          max_tokens: maxTokens,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": "https://discord.bot",
            "X-Title": "Sheriff Bot Discord AI",
            "Content-Type": "application/json",
          },
          timeout: 30000,
        },
      );

      if (!response.data.choices || response.data.choices.length === 0) {
        throw new Error("No response from AI model");
      }

      return response.data.choices[0].message.content;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.response) {
          const status = axiosError.response.status;
          const data = axiosError.response.data as any;

          if (status === 401) {
            throw new Error(
              "Invalid API key. Please check your OpenRouter API key.",
            );
          } else if (status === 429) {
            throw new Error("Rate limit exceeded. Please try again later.");
          } else if (status === 402) {
            throw new Error(
              "Insufficient credits. Please check your OpenRouter account.",
            );
          } else {
            throw new Error(data?.error?.message || `API error: ${status}`);
          }
        } else if (axiosError.code === "ECONNABORTED") {
          throw new Error(
            "Request timeout. The AI model is taking too long to respond.",
          );
        } else {
          throw new Error(
            "Failed to connect to OpenRouter API. Please check your internet connection.",
          );
        }
      }

      throw error;
    }
  }

  async getAvailableModels(): Promise<OpenRouterModel[]> {
    if (!this.apiKey) {
      throw new Error("OpenRouter API key not configured.");
    }

    try {
      const response = await axios.get<{ data: OpenRouterModel[] }>(
        `${this.baseUrl}/models`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: 10000,
        },
      );

      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching models:", error);
      throw new Error("Failed to fetch available models from OpenRouter.");
    }
  }

  getDefaultModel(): string {
    return this.defaultModel;
  }

  setDefaultModel(modelId: string): void {
    this.defaultModel = modelId;
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }
}

export const openRouterService = new OpenRouterService();
