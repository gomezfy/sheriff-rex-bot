import * as fs from 'fs';
import * as path from 'path';

interface DomainMapping {
  [key: string]: string;
}

const domainMap: DomainMapping = {
  'Ping Command': 'core',
  'Daily Command': 'core',
  'Automatic Daily Rewards': 'core',
  'Inventory Command': 'core',
  'Profile Command': 'core',
  'Background Shop': 'core',
  'Frame Shop': 'core',
  'Help Command': 'core',
  'Category Titles': 'core',
  'Category Descriptions': 'core',
  'Emoji Placeholders': 'core',
  
  'Mining DM Notifications': 'economy',
  'Bank Robbery Command': 'economy',
  'Cattle Rustling': 'economy',
  'Middleman Command': 'economy',
  'Redeem Command': 'economy',
  'Give Command': 'economy',
  
  'Territories Command': 'guild',
  'Territory Rarities': 'guild',
  'Territory Names': 'guild',
  'Guild System': 'guild',
  'Server Setup Command': 'guild',
  
  'Admin Commands': 'admin',
  'Logs System': 'admin',
  'Announcement System': 'admin',
  'Welcome System': 'admin',
  
  'Dice Command': 'misc',
  'Duel Command': 'misc',
  'Roulette Command': 'misc',
  'Music Command': 'misc',
  'Poll Command': 'misc',
  'Bounty Commands': 'misc',
  'Wanted Poster': 'misc',
  'Embed Builder': 'misc',
};

function extractI18nModules() {
  const i18nPath = path.join(__dirname, '..', 'src', 'utils', 'i18n.ts');
  const content = fs.readFileSync(i18nPath, 'utf-8');

  const locales = ['pt-BR', 'en-US', 'es-ES'];
  const domains = ['core', 'economy', 'guild', 'admin', 'misc'];

  const translationsPerLocale: Record<string, Record<string, Record<string, string>>> = {};

  locales.forEach(locale => {
    translationsPerLocale[locale] = {};
    domains.forEach(domain => {
      translationsPerLocale[locale][domain] = {};
    });
  });

  const lines = content.split('\n');
  let currentLocale: string | null = null;
  let currentDomain: string | null = null;
  let inTranslationBlock = false;
  let keyBuffer = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes('"pt-BR":') || line.includes("'pt-BR':")) {
      currentLocale = 'pt-BR';
      inTranslationBlock = true;
      continue;
    } else if (line.includes('"en-US":') || line.includes("'en-US':")) {
      currentLocale = 'en-US';
      inTranslationBlock = true;
      continue;
    } else if (line.includes('"es-ES":') || line.includes("'es-ES':")) {
      currentLocale = 'es-ES';
      inTranslationBlock = true;
      continue;
    }

    if (inTranslationBlock && line.match(/^\s*\/\/\s+(.+)$/)) {
      const comment = line.match(/^\s*\/\/\s+(.+)$/)?.[1] || '';
      
      for (const [key, domain] of Object.entries(domainMap)) {
        if (comment.includes(key)) {
          currentDomain = domain;
          break;
        }
      }
    }

    if (currentLocale && currentDomain && inTranslationBlock) {
      const keyMatch = line.match(/^\s*(\w+):\s*(.+?),?\s*$/);
      if (keyMatch) {
        const [, key, value] = keyMatch;
        const cleanValue = value.trim().replace(/,\s*$/, '');
        
        if (!translationsPerLocale[currentLocale][currentDomain]) {
          translationsPerLocale[currentLocale][currentDomain] = {};
        }
        translationsPerLocale[currentLocale][currentDomain][key] = cleanValue;
      }
    }

    if (line.match(/^\s*},\s*$/)) {
      if (inTranslationBlock && line.match(/^\s*},\s*$/)) {
        inTranslationBlock = false;
        currentDomain = null;
      }
    }
  }

  locales.forEach(locale => {
    const localeDir = path.join(__dirname, '..', 'src', 'i18n', locale);
    
    if (!fs.existsSync(localeDir)) {
      fs.mkdirSync(localeDir, { recursive: true });
    }

    domains.forEach(domain => {
      const translations = translationsPerLocale[locale][domain];
      
      if (Object.keys(translations).length === 0) {
        return;
      }

      const moduleContent = generateModuleContent(translations, domain);
      const modulePath = path.join(localeDir, `${domain}.ts`);
      
      fs.writeFileSync(modulePath, moduleContent, 'utf-8');
      console.log(`✅ Generated: ${locale}/${domain}.ts (${Object.keys(translations).length} keys)`);
    });
  });

  generateIndexFile(locales, domains);
  
  console.log('\n✅ Module extraction completed!');
}

function generateModuleContent(translations: Record<string, string>, domain: string): string {
  const exportName = `${domain}Translations`;
  let content = `export const ${exportName} = {\n`;
  
  Object.entries(translations).forEach(([key, value]) => {
    content += `  ${key}: ${value},\n`;
  });
  
  content += '};\n';
  return content;
}

function generateIndexFile(locales: string[], domains: string[]) {
  const indexPath = path.join(__dirname, '..', 'src', 'i18n', 'index.ts');
  
  let content = `// Auto-generated i18n module loader\n`;
  content += `import { ChatInputCommandInteraction, ButtonInteraction, StringSelectMenuInteraction, Interaction } from "discord.js";\n\n`;

  locales.forEach(locale => {
    domains.forEach(domain => {
      content += `import { ${domain}Translations as ${domain}_${locale.replace('-', '_')} } from './${locale}/${domain}';\n`;
    });
  });

  content += `\nconst translations: Record<string, Record<string, string>> = {\n`;
  
  locales.forEach(locale => {
    content += `  "${locale}": {\n`;
    content += `    ...${domains.map(d => `${d}_${locale.replace('-', '_')}`).join(',\n    ...')},\n`;
    content += `  },\n`;
  });
  
  content += `};\n\n`;
  content += `export function t(interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction | Interaction, key: string, replacements?: Record<string, string | number>): string {\n`;
  content += `  const locale = interaction.locale || "en-US";\n`;
  content += `  const message = translations[locale]?.[key] || translations["en-US"]?.[key] || key;\n`;
  content += `  if (!replacements) return message;\n`;
  content += `  return Object.entries(replacements).reduce((msg, [k, v]) => msg.replace(new RegExp(\`\\\\{$\{k\}\\\\}\`, "g"), String(v)), message);\n`;
  content += `}\n`;
  
  fs.writeFileSync(indexPath, content, 'utf-8');
  console.log(`✅ Generated: i18n/index.ts`);
}

extractI18nModules();
