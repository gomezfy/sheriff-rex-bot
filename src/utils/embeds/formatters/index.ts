export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`;
  } else if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`;
  } else {
    return num.toLocaleString();
  }
}

export function formatTime(ms: number): string {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (seconds > 0) {
    parts.push(`${seconds}s`);
  }

  return parts.join(" ") || "0s";
}

export function createProgressBar(
  current: number,
  max: number,
  length: number = 10,
): string {
  const percentage = Math.min(Math.max(current / max, 0), 1);
  const filled = Math.round(percentage * length);
  const empty = length - filled;

  const filledBar = "█".repeat(filled);
  const emptyBar = "░".repeat(empty);

  return `${filledBar}${emptyBar} ${(percentage * 100).toFixed(0)}%`;
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength - 3)}...`;
}
