export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateURL(url: string): ValidationResult {
  if (!url || url.trim() === "") {
    return { valid: true };
  }

  const trimmed = url.trim();

  if (trimmed.length > 2000) {
    return {
      valid: false,
      error: "URL is too long (max 2000 characters)",
    };
  }

  try {
    const urlObj = new URL(trimmed);

    if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
      return {
        valid: false,
        error: "URL must use HTTP or HTTPS protocol",
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: "Invalid URL format",
    };
  }
}

export function validateImageURL(url: string): ValidationResult {
  if (!url || url.trim() === "") {
    return { valid: true };
  }

  const trimmed = url.trim();

  if (trimmed.startsWith("attachment://")) {
    return { valid: true };
  }

  const basicValidation = validateURL(url);
  if (!basicValidation.valid) {
    return basicValidation;
  }

  const imageExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".svg",
    ".bmp",
    ".apng",
  ];
  const lowerUrl = url.toLowerCase();

  const hasImageExtension = imageExtensions.some((ext) =>
    lowerUrl.includes(ext),
  );
  const isDiscordCDN = 
    lowerUrl.includes("cdn.discordapp.com") ||
    lowerUrl.includes("media.discordapp.net") ||
    lowerUrl.includes("cdn.discord.com");
  const isImgur = lowerUrl.includes("imgur.com");
  const isCommonImageHost =
    lowerUrl.includes("i.redd.it") ||
    lowerUrl.includes("images") ||
    lowerUrl.includes("tenor.com") ||
    lowerUrl.includes("giphy.com");

  if (!hasImageExtension && !isDiscordCDN && !isImgur && !isCommonImageHost) {
    return {
      valid: false,
      error: "URL must be a valid image (png, jpg, gif, webp, etc.) or from a trusted image host (Discord CDN, Imgur, Tenor, Giphy, etc.)",
    };
  }

  return { valid: true };
}

export function validateEmbedLimits(embedData: {
  title?: string;
  description?: string;
  fields: Array<{ name: string; value: string; inline: boolean }>;
  footerText?: string;
  authorName?: string;
}): ValidationResult {
  if (embedData.title && embedData.title.length > 256) {
    return {
      valid: false,
      error: "Title exceeds 256 characters",
    };
  }

  if (embedData.description && embedData.description.length > 4096) {
    return {
      valid: false,
      error: "Description exceeds 4096 characters",
    };
  }

  if (embedData.fields.length > 25) {
    return {
      valid: false,
      error: "Too many fields (max 25)",
    };
  }

  for (const field of embedData.fields) {
    if (field.name.length > 256) {
      return {
        valid: false,
        error: "Field name exceeds 256 characters",
      };
    }
    if (field.value.length > 1024) {
      return {
        valid: false,
        error: "Field value exceeds 1024 characters",
      };
    }
  }

  if (embedData.footerText && embedData.footerText.length > 2048) {
    return {
      valid: false,
      error: "Footer text exceeds 2048 characters",
    };
  }

  if (embedData.authorName && embedData.authorName.length > 256) {
    return {
      valid: false,
      error: "Author name exceeds 256 characters",
    };
  }

  const totalCharacters =
    (embedData.title?.length || 0) +
    (embedData.description?.length || 0) +
    embedData.fields.reduce(
      (sum, field) => sum + field.name.length + field.value.length,
      0,
    ) +
    (embedData.footerText?.length || 0) +
    (embedData.authorName?.length || 0);

  if (totalCharacters > 6000) {
    return {
      valid: false,
      error: "Total embed characters exceed 6000",
    };
  }

  return { valid: true };
}
