import { promises as fs } from 'fs';
import path from 'path';
import { compile } from 'json-schema-to-typescript';

const inputPath = path.resolve(__dirname, '../files/input/dados.json');
const outputPath = path.resolve(__dirname, '../types/generated-types.ts');

async function main() {
  try {
    const jsonData = await fs.readFile(inputPath, 'utf8');
    const parsed = JSON.parse(jsonData);

    // Pega o primeiro item do array como base
    const example = Array.isArray(parsed) ? parsed[0] : parsed;

    // Cria um "schema básico" (assumindo estrutura direta)
    const schema = {
      title: 'RootObject',
      type: 'object',
      properties: {},
      additionalProperties: true, // permite campos extras
    };

    schema.properties = mapSchema(example);

    // Gera os tipos com base no schema
    const ts = await compile(schema as any, 'RootObject', {
      bannerComment: '// Gerado automaticamente a partir de dados.json',
    });

    await fs.writeFile(outputPath, ts);
    console.log('✅ Tipos TypeScript gerados em:', outputPath);
  } catch (err) {
    console.error('❌ Erro ao gerar tipos:', err);
  }
}

// Função para inferir tipo aproximado de cada campo
function mapSchema(obj: any): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key in obj) {
    const value = obj[key];

    if (Array.isArray(value)) {
      const first = value[0];
      result[key] = {
        type: 'array',
        items: typeof first === 'object' ? { type: 'object', properties: mapSchema(first) } : { type: typeof first },
      };
    } else if (typeof value === 'object' && value !== null) {
      result[key] = {
        type: 'object',
        properties: mapSchema(value),
      };
    } else {
      result[key] = { type: typeof value };
    }
  }

  return result;
}

main();
