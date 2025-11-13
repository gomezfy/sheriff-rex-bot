/**
 * Enhanced Console Logger for Sheriff Rex Bot
 * Provides colored, timestamped, and leveled logging
 */

// ANSI Color Codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  
  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
};

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  SUCCESS = 2,
  WARN = 3,
  ERROR = 4,
}

class ConsoleLogger {
  private minLevel: LogLevel;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.minLevel = this.isProduction ? LogLevel.INFO : LogLevel.DEBUG;
  }

  private getTimestamp(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  private formatMessage(level: string, message: string, color: string): string {
    const timestamp = this.getTimestamp();
    return `${colors.gray}[${timestamp}]${colors.reset} ${color}${level}${colors.reset} ${message}`;
  }

  debug(message: string, ...args: any[]): void {
    if (this.minLevel <= LogLevel.DEBUG) {
      const formatted = this.formatMessage('🔍 DEBUG', message, colors.gray);
      console.log(formatted, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.minLevel <= LogLevel.INFO) {
      const formatted = this.formatMessage('ℹ️  INFO ', message, colors.blue);
      console.log(formatted, ...args);
    }
  }

  success(message: string, ...args: any[]): void {
    if (this.minLevel <= LogLevel.SUCCESS) {
      const formatted = this.formatMessage('✅ SUCCESS', message, colors.green);
      console.log(formatted, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.minLevel <= LogLevel.WARN) {
      const formatted = this.formatMessage('⚠️  WARN ', message, colors.yellow);
      console.warn(formatted, ...args);
    }
  }

  error(message: string, error?: any): void {
    if (this.minLevel <= LogLevel.ERROR) {
      const formatted = this.formatMessage('❌ ERROR', message, colors.red);
      console.error(formatted);
      
      if (error) {
        if (error.stack && !this.isProduction) {
          console.error(`${colors.red}${error.stack}${colors.reset}`);
        } else if (error.message) {
          console.error(`${colors.red}   └─ ${error.message}${colors.reset}`);
        } else {
          console.error(`${colors.red}   └─ ${error}${colors.reset}`);
        }
      }
    }
  }

  // Special formatted logs for bot lifecycle
  startup(message: string): void {
    console.log(`\n${colors.bright}${colors.cyan}┌─────────────────────────────────────────┐${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}│  🤠  SHERIFF REX BOT                    │${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}└─────────────────────────────────────────┘${colors.reset}\n`);
    this.info(message);
  }

  section(title: string): void {
    console.log(`\n${colors.bright}${colors.magenta}━━━ ${title} ━━━${colors.reset}`);
  }

  command(commandName: string, user: string, guild?: string): void {
    const guildInfo = guild ? ` in ${colors.cyan}${guild}${colors.reset}` : '';
    const formatted = this.formatMessage(
      '📜 CMD  ',
      `${colors.yellow}/${commandName}${colors.reset} by ${colors.cyan}${user}${colors.reset}${guildInfo}`,
      colors.blue
    );
    console.log(formatted);
  }

  event(eventName: string, details?: string): void {
    const detailsInfo = details ? ` - ${details}` : '';
    const formatted = this.formatMessage(
      '⚡ EVENT',
      `${colors.magenta}${eventName}${colors.reset}${detailsInfo}`,
      colors.magenta
    );
    console.log(formatted);
  }

  ready(botTag: string, servers: number, users: number): void {
    console.log(`\n${colors.bright}${colors.green}╔════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}${colors.green}║  ✅  BOT READY                         ║${colors.reset}`);
    console.log(`${colors.bright}${colors.green}╠════════════════════════════════════════╣${colors.reset}`);
    console.log(`${colors.bright}${colors.green}║  ${colors.reset}Tag:     ${colors.cyan}${botTag.padEnd(27)}${colors.green}║${colors.reset}`);
    console.log(`${colors.bright}${colors.green}║  ${colors.reset}Servers: ${colors.yellow}${String(servers).padEnd(27)}${colors.green}║${colors.reset}`);
    console.log(`${colors.bright}${colors.green}║  ${colors.reset}Users:   ${colors.yellow}${String(users).padEnd(27)}${colors.green}║${colors.reset}`);
    console.log(`${colors.bright}${colors.green}╚════════════════════════════════════════╝${colors.reset}\n`);
  }

  table(data: Record<string, string | number | boolean>): void {
    const entries = Object.entries(data);
    const maxKeyLength = Math.max(...entries.map(([key]) => key.length));
    
    console.log(`${colors.gray}┌${'─'.repeat(maxKeyLength + 30)}┐${colors.reset}`);
    entries.forEach(([key, value]) => {
      const paddedKey = key.padEnd(maxKeyLength);
      const icon = value === true ? '✅' : value === false ? '❌' : 'ℹ️';
      const valueColor = value === true ? colors.green : value === false ? colors.red : colors.cyan;
      console.log(`${colors.gray}│${colors.reset} ${icon} ${colors.white}${paddedKey}${colors.reset} ${valueColor}${value}${colors.reset} ${colors.gray}│${colors.reset}`);
    });
    console.log(`${colors.gray}└${'─'.repeat(maxKeyLength + 30)}┘${colors.reset}`);
  }

  divider(): void {
    console.log(`${colors.gray}${'─'.repeat(50)}${colors.reset}`);
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }
}

// Export singleton instance
export const logger = new ConsoleLogger();
export default logger;
