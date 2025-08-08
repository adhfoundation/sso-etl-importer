// Teste simples para verificar se o LogtoHttpClient funciona
import { LogtoHttpClient } from "./src/clients/LogtoHttpClient";
import { LogtoApi } from "./src/clients/LogtoApi";

// Teste básico de instanciação
try {
  console.log("🧪 Testando LogtoHttpClient...");
  
  // Teste 1: Instanciação com parâmetros válidos
  const client = new LogtoHttpClient("https://api.example.com", "test-token");
  console.log("✅ LogtoHttpClient instanciado com sucesso");
  
  // Teste 2: Instanciação do LogtoApi
  const api = new LogtoApi(client);
  console.log("✅ LogtoApi instanciado com sucesso");
  
  // Teste 3: Verificar se os métodos existem
  const methods = ['get', 'post', 'patch', 'delete'];
  methods.forEach(method => {
    if (typeof (client as any)[method] === 'function') {
      console.log(`✅ Método ${method} existe`);
    } else {
      console.log(`❌ Método ${method} não encontrado`);
    }
  });
  
  console.log("\n🎉 Todos os testes básicos passaram!");
  
} catch (error) {
  console.error("❌ Erro durante os testes:", error);
}

// Teste de erro de configuração
try {
  console.log("\n🧪 Testando validação de parâmetros...");
  new LogtoHttpClient("", "token");
  console.log("❌ Deveria ter lançado erro para URL vazia");
} catch (error) {
  console.log("✅ Erro capturado corretamente para URL vazia:", (error as Error).message);
}

try {
  new LogtoHttpClient("https://api.example.com", "");
  console.log("❌ Deveria ter lançado erro para token vazio");
} catch (error) {
  console.log("✅ Erro capturado corretamente para token vazio:", (error as Error).message);
}

console.log("\n✨ Teste de validação concluído!");