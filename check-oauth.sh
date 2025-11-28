#!/bin/bash

echo "🔍 Vérification de la configuration OAuth"
echo "=========================================="
echo ""

# Vérifier le fichier .env
echo "📄 1. Vérification du fichier .env"
echo "-----------------------------------"
if [ -f .env ]; then
    echo "✅ Fichier .env trouvé"
    echo ""
    
    # Vérifier Google
    GOOGLE_ID=$(grep "GOOGLE_CLIENT_ID" .env | cut -d'=' -f2 | tr -d '"' | tr -d ' ')
    GOOGLE_SECRET=$(grep "GOOGLE_CLIENT_SECRET" .env | cut -d'=' -f2 | tr -d '"' | tr -d ' ')
    
    if [ -z "$GOOGLE_ID" ] || [ "$GOOGLE_ID" == "" ]; then
        echo "❌ GOOGLE_CLIENT_ID: Non configuré"
    else
        echo "✅ GOOGLE_CLIENT_ID: Configuré ($(echo $GOOGLE_ID | cut -c1-20)...)"
    fi
    
    if [ -z "$GOOGLE_SECRET" ] || [ "$GOOGLE_SECRET" == "" ]; then
        echo "❌ GOOGLE_CLIENT_SECRET: Non configuré"
    else
        echo "✅ GOOGLE_CLIENT_SECRET: Configuré ($(echo $GOOGLE_SECRET | cut -c1-10)...)"
    fi
    
    echo ""
    
    # Vérifier GitHub
    GITHUB_ID=$(grep "GITHUB_CLIENT_ID" .env | cut -d'=' -f2 | tr -d '"' | tr -d ' ')
    GITHUB_SECRET=$(grep "GITHUB_CLIENT_SECRET" .env | cut -d'=' -f2 | tr -d '"' | tr -d ' ')
    
    if [ -z "$GITHUB_ID" ] || [ "$GITHUB_ID" == "" ]; then
        echo "❌ GITHUB_CLIENT_ID: Non configuré"
    else
        echo "✅ GITHUB_CLIENT_ID: Configuré ($(echo $GITHUB_ID | cut -c1-20)...)"
    fi
    
    if [ -z "$GITHUB_SECRET" ] || [ "$GITHUB_SECRET" == "" ]; then
        echo "❌ GITHUB_CLIENT_SECRET: Non configuré"
    else
        echo "✅ GITHUB_CLIENT_SECRET: Configuré ($(echo $GITHUB_SECRET | cut -c1-10)...)"
    fi
else
    echo "❌ Fichier .env non trouvé"
fi

echo ""
echo "🌐 2. Vérification de la configuration Google Cloud Console"
echo "------------------------------------------------------------"
echo "📋 À vérifier manuellement :"
echo ""
echo "   1. Allez sur: https://console.cloud.google.com/apis/credentials"
echo "   2. Vérifiez que votre OAuth 2.0 Client ID existe"
echo "   3. Vérifiez l'URL de redirection autorisée:"
echo "      → http://localhost:3000/api/auth/callback/google"
echo ""
echo "   4. Allez sur: https://console.cloud.google.com/apis/credentials/consent"
echo "   5. Vérifiez que l'écran de consentement est configuré"
echo "   6. Si en mode 'Testing', ajoutez votre email dans 'Test users'"
echo ""

echo "🐙 3. Vérification de la configuration GitHub"
echo "----------------------------------------------"
echo "📋 À vérifier manuellement :"
echo ""
echo "   1. Allez sur: https://github.com/settings/developers"
echo "   2. Vérifiez que votre OAuth App existe"
echo "   3. Vérifiez l'Authorization callback URL:"
echo "      → http://localhost:3000/api/auth/callback/github"
echo ""

echo "🚀 4. Vérification du serveur"
echo "------------------------------"
if pgrep -f "next dev" > /dev/null; then
    echo "✅ Serveur Next.js en cours d'exécution"
    echo "   URL: http://localhost:3000"
else
    echo "❌ Serveur Next.js non démarré"
    echo "   Lancez: npm run dev"
fi

echo ""
echo "📝 5. Prochaines étapes"
echo "-----------------------"
echo ""
if [ ! -z "$GOOGLE_ID" ] && [ "$GOOGLE_ID" != "" ]; then
    echo "✅ Google OAuth configuré - Testez sur: http://localhost:3000/login"
else
    echo "⚠️  Google OAuth non configuré - Suivez le guide dans OAUTH_SETUP.md"
fi

if [ ! -z "$GITHUB_ID" ] && [ "$GITHUB_ID" != "" ]; then
    echo "✅ GitHub OAuth configuré - Testez sur: http://localhost:3000/login"
else
    echo "⚠️  GitHub OAuth non configuré - Suivez le guide dans OAUTH_SETUP.md"
fi

echo ""
echo "=========================================="
echo "✅ Vérification terminée"

