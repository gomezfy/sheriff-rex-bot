import { Canvas, SKRSContext2D } from "@napi-rs/canvas";

interface OptimizationOptions {
  quality?: number;
  format?: "png" | "jpeg";
  maxWidth?: number;
  maxHeight?: number;
}

export class CanvasOptimizer {
  static async optimizeCanvas(
    canvas: Canvas,
    options: OptimizationOptions = {},
  ): Promise<Buffer> {
    const { quality = 80, format = "png", maxWidth, maxHeight } = options;

    let finalCanvas = canvas;

    if (maxWidth || maxHeight) {
      finalCanvas = this.resizeCanvas(canvas, maxWidth, maxHeight);
    }

    if (format === "jpeg") {
      return finalCanvas.toBuffer("image/jpeg", quality);
    } else {
      return finalCanvas.toBuffer("image/png");
    }
  }

  private static resizeCanvas(
    canvas: Canvas,
    maxWidth?: number,
    maxHeight?: number,
  ): Canvas {
    let width = canvas.width;
    let height = canvas.height;

    if (maxWidth && width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (maxHeight && height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    const resizedCanvas = new Canvas(Math.floor(width), Math.floor(height));
    const ctx = resizedCanvas.getContext("2d");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      canvas as any,
      0,
      0,
      canvas.width,
      canvas.height,
      0,
      0,
      width,
      height,
    );

    return resizedCanvas;
  }

  static createGradient(
    ctx: SKRSContext2D,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    colors: string[],
  ): any {
    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

    const step = 1 / (colors.length - 1);
    colors.forEach((color, index) => {
      gradient.addColorStop(index * step, color);
    });

    return gradient;
  }

  static roundRect(
    ctx: SKRSContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number | { tl: number; tr: number; br: number; bl: number },
  ): void {
    if (typeof radius === "number") {
      radius = { tl: radius, tr: radius, br: radius, bl: radius };
    }

    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius.br,
      y + height,
    );
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
  }

  static applyTextShadow(
    ctx: SKRSContext2D,
    options: {
      blur?: number;
      color?: string;
      offsetX?: number;
      offsetY?: number;
    } = {},
  ): void {
    const {
      blur = 4,
      color = "rgba(0, 0, 0, 0.5)",
      offsetX = 2,
      offsetY = 2,
    } = options;

    ctx.shadowBlur = blur;
    ctx.shadowColor = color;
    ctx.shadowOffsetX = offsetX;
    ctx.shadowOffsetY = offsetY;
  }

  static clearShadow(ctx: SKRSContext2D): void {
    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  static wrapText(
    ctx: SKRSContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
  ): void {
    const words = text.split(" ");
    let line = "";
    let currentY = y;

    for (const word of words) {
      const testLine = `${line + word} `;
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && line.length > 0) {
        ctx.fillText(line, x, currentY);
        line = `${word} `;
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }

    ctx.fillText(line, x, currentY);
  }

  static async loadImageWithCache(
    url: string,
    cache: Map<string, any> = new Map(),
  ): Promise<any> {
    if (cache.has(url)) {
      return cache.get(url);
    }

    const { loadImage } = await import("@napi-rs/canvas");
    const image = await loadImage(url);
    cache.set(url, image);

    return image;
  }

  static drawCircularImage(
    ctx: SKRSContext2D,
    image: any,
    x: number,
    y: number,
    radius: number,
  ): void {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(image, x, y, radius * 2, radius * 2);
    ctx.restore();
  }
}

export const imageCache = new Map<string, any>();
