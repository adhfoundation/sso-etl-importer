# 📄 Get User

Recupera os dados de um usuário a partir do seu **ID**.

---

## **Método e Endpoint**
```
GET /api/users/{userId}
```

---

## **Autenticação**
- **Tipo:** OAuth 2.0  
- **Header:**  
  ```
  Authorization: Bearer {access_token}
  ```

---

## **Parâmetros**

### **Path Parameters**
| Nome      | Tipo   | Obrigatório | Descrição |
|-----------|--------|-------------|-----------|
| `userId`  | string | Sim         | Identificador único do usuário. Mínimo 1 e máximo 12 caracteres. |

### **Query Parameters**
| Nome                   | Tipo   | Obrigatório | Descrição |
|------------------------|--------|-------------|-----------|
| `includeSsoIdentities` | string | Não         | Se definido com valor verdadeiro (`true`, `1` ou `yes`), a resposta incluirá a propriedade `ssoIdentities` com as identidades SSO associadas ao usuário. |

---

## **Resposta de Sucesso (200)**
**Content-Type:** `application/json`

```json
{
  "id": "123456",
  "username": "usuario_exemplo",
  "primaryEmail": "user@example.com",
  "primaryPhone": "+5511999999999",
  "name": "Nome Completo",
  "avatar": "https://example.com/avatar.jpg",
  "customData": {},
  "identities": {
    "google": {
      "userId": "abc123",
      "details": {}
    }
  },
  "lastSignInAt": 1723123123,
  "createdAt": 1723100000,
  "updatedAt": 1723123999,
  "profile": {
    "familyName": "Sobrenome",
    "givenName": "Nome",
    "middleName": "Meio",
    "nickname": "Apelido",
    "preferredUsername": "usuario",
    "profile": "https://meuperfil.com",
    "website": "https://meusite.com",
    "gender": "male",
    "birthdate": "1990-01-01",
    "zoneinfo": "America/Sao_Paulo",
    "locale": "pt-BR",
    "address": {
      "formatted": "Rua X, 123 - Cidade/Estado",
      "streetAddress": "Rua X, 123",
      "locality": "Cidade",
      "region": "Estado",
      "postalCode": "12345-000",
      "country": "BR"
    }
  },
  "applicationId": "app_123456",
  "isSuspended": false,
  "hasPassword": true,
  "ssoIdentities": [
    {
      "tenantId": "tenant_001",
      "id": "sso_123",
      "userId": "123456",
      "issuer": "https://sso.provider.com",
      "identityId": "idp_456",
      "detail": {},
      "createdAt": 1723100000,
      "updatedAt": 1723123999,
      "ssoConnectorId": "connector_789"
    }
  ]
}
```

---

## **Códigos de Resposta**
| Código | Descrição |
|--------|-----------|
| `200`  | Dados do usuário retornados com sucesso. |
| `400`  | Requisição inválida (ex.: formato incorreto do `userId`). |
| `401`  | Não autenticado (token ausente ou inválido). |
| `403`  | Sem permissão para acessar este usuário. |
| `404`  | Usuário não encontrado. |

---

## **Exemplo de Requisição**

### **cURL**
```bash
curl -X GET "https://api.exemplo.com/api/users/123456?includeSsoIdentities=true"   -H "Authorization: Bearer {access_token}"
```

### **JavaScript (Axios)**
```javascript
import axios from "axios";

async function getUser(userId, includeSsoIdentities = false) {
  const response = await axios.get(
    `https://api.exemplo.com/api/users/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      },
      params: {
        includeSsoIdentities: includeSsoIdentities ? "true" : undefined,
      },
    }
  );
  console.log(response.data);
}

getUser("123456", true);
```
