# 🔐 Générer NEXTAUTH_SECRET

## Option 1 : En ligne de commande (Mac/Linux)

```bash
openssl rand -base64 32
```

## Option 2 : En ligne de commande (Windows PowerShell)

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## Option 3 : En ligne

Allez sur : https://generate-secret.vercel.app/32

## Option 4 : Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Option 5 : Python

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

**Exemple de résultat** :
```
xK9mP2qR7vT4wY8zA1bC3dE5fG6hI0jK2lM4nO6pQ8rS0tU2vW4xY6zA8bC0dE
```

Copiez cette chaîne et utilisez-la comme valeur pour `NEXTAUTH_SECRET` dans Render.
