export class BaseBotError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly isOperational: boolean = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class DatabaseError extends BaseBotError {
  constructor(message: string, code?: string) {
    super(message, code);
  }
}

export class ValidationError extends BaseBotError {
  constructor(message: string, code?: string) {
    super(message, code);
  }
}

export class InsufficientFundsError extends BaseBotError {
  constructor(message: string) {
    super(message, "INSUFFICIENT_FUNDS");
  }
}

export class InventoryFullError extends BaseBotError {
  constructor(message: string) {
    super(message, "INVENTORY_FULL");
  }
}

export class CooldownError extends BaseBotError {
  constructor(
    message: string,
    public readonly remainingTime: number,
  ) {
    super(message, "COOLDOWN_ACTIVE");
  }
}

export class PermissionError extends BaseBotError {
  constructor(message: string) {
    super(message, "INSUFFICIENT_PERMISSION");
  }
}

export class NotFoundError extends BaseBotError {
  constructor(message: string, code?: string) {
    super(message, code || "NOT_FOUND");
  }
}
