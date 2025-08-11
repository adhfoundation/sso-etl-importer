# ✏️ Update User

Atualiza dados de um usuário com base no seu **ID**.  
> **Observação:** Este método realiza uma **atualização parcial** dos dados.

---

## **Método e Endpoint**
```
PATCH /api/users/{userId}
```

---

## **Autenticação**
- **Tipo:** OAuth 2.0  
- **Header:**  
  ```
  Authorization: Bearer {access_token}
  Content-Type: application/json
  ```

---

## **Parâmetros**

### **Path Parameters**
| Nome      | Tipo   | Obrigatório | Descrição |
|-----------|--------|-------------|-----------|
| `userId`  | string | Sim         | Identificador único do usuário. |

### **Body Parameters (JSON)**
| Campo           | Tipo    | Padrão/Regex | Descrição |
|-----------------|---------|--------------|-----------|
| `username`      | string  | `/^[A-Z_a-z]\w*$/` | Nome de usuário único. |
| `primaryEmail`  | string  | `/^\S+@\S+\.\S+$/` | Email principal único. |
| `primaryPhone`  | string  | `/^\d+$/` | Telefone principal único. |
| `name`          | string  | — | Nome completo. |
| `avatar`        | string  | URL | URL do avatar do usuário. |
| `customData`    | object  | — | Objeto de dados personalizados. **Substitui** o objeto inteiro. |
| `profile`       | object  | — | Dados de perfil detalhados, incluindo `address`. |

---

## **Resposta de Sucesso (200)**
Retorna o objeto do usuário atualizado.

---

## **Códigos de Resposta**
| Código | Descrição |
|--------|-----------|
| `200`  | Usuário atualizado com sucesso. |
| `400`  | Requisição inválida. |
| `401`  | Não autenticado. |
| `403`  | Sem permissão. |
| `404`  | Usuário não encontrado. |
| `422`  | Dados inválidos para atualização. |

---

## **Exemplo de Requisição**

### **cURL**
```bash
curl --request PATCH "https://[tenant_id].logto.app/api/users/{userId}" \
  --header "Authorization: Bearer $ACCESS_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "username": "newUsername",
    "primaryEmail": "email@domain.com",
    "primaryPhone": "11999999999",
    "name": "Nome Completo",
    "avatar": "https://example.com/avatar.png",
    "customData": {},
    "profile": {
      "familyName": "Sobrenome",
      "givenName": "Nome",
      "middleName": "Nome do meio",
      "nickname": "Apelido",
      "preferredUsername": "usuario",
      "profile": "https://perfil.com",
      "website": "https://site.com",
      "gender": "male",
      "birthdate": "1990-01-01",
      "zoneinfo": "America/Sao_Paulo",
      "locale": "pt-BR",
      "address": {
        "formatted": "Rua Exemplo, 123",
        "streetAddress": "Rua Exemplo",
        "locality": "Cidade",
        "region": "Estado",
        "postalCode": "12345-678",
        "country": "BR"
      }
    }
  }'
```

### **JavaScript (Axios)**
```javascript
import axios from "axios";

async function updateUser(userId) {
  const payload = {
    username: "newUsername",
    primaryEmail: "email@domain.com",
    primaryPhone: "11999999999",
    name: "Nome Completo",
    avatar: "https://example.com/avatar.png",
    customData: {},
    profile: {
      familyName: "Sobrenome",
      givenName: "Nome",
      middleName: "Nome do meio",
      nickname: "Apelido",
      preferredUsername: "usuario",
      profile: "https://perfil.com",
      website: "https://site.com",
      gender: "male",
      birthdate: "1990-01-01",
      zoneinfo: "America/Sao_Paulo",
      locale: "pt-BR",
      address: {
        formatted: "Rua Exemplo, 123",
        streetAddress: "Rua Exemplo",
        locality: "Cidade",
        region: "Estado",
        postalCode: "12345-678",
        country: "BR"
      }
    }
  };

  const { data } = await axios.patch(`https://[tenant_id].logto.app/api/users/${userId}`, payload, {
    headers: {
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  console.log("Usuário atualizado:", data);
}

updateUser("123456");
```
