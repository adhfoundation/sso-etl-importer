import { DatabaseComparison } from '../utils/databaseComparison';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    console.log('🚀 Iniciando comparação entre bancos de dados...');
    console.log('📊 Banco Local: PostgreSQL');
    console.log('🌐 Sistema Logto: API REST');
    console.log('=' .repeat(60));
    
    const comparison = new DatabaseComparison();
    await comparison.generateReport();
    
  } catch (error) {
    console.error('❌ Erro durante a comparação:', error);
    process.exit(1);
  }
}

main();
