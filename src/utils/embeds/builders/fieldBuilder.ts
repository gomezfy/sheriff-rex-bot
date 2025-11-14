import { EmbedBuilder } from "discord.js";

export class EmbedFieldBuilder {
  private fields: Array<{ name: string; value: string; inline?: boolean }> = [];

  add(name: string, value: string, inline: boolean = false): this {
    this.fields.push({ name, value, inline });
    return this;
  }

  addSpacer(inline: boolean = false): this {
    this.fields.push({ name: "\u200b", value: "\u200b", inline });
    return this;
  }

  addMultiple(
    fields: Array<{ name: string; value: string; inline?: boolean }>,
  ): this {
    this.fields.push(...fields);
    return this;
  }

  build(): Array<{ name: string; value: string; inline?: boolean }> {
    return this.fields;
  }

  apply(embed: EmbedBuilder): EmbedBuilder {
    return embed.addFields(...this.fields);
  }
}
