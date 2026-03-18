#!/bin/bash
echo ""
echo "  ========================================"
echo "   MM92 Service Protocol"
echo "   Blue Line Energy - Senvion MM92"
echo "  ========================================"
echo ""

# Check node
if ! command -v node &> /dev/null; then
    echo "  [EROARE] Node.js nu este instalat!"
    echo "  Instalati: https://nodejs.org/"
    exit 1
fi

# Install deps if needed
if [ ! -d "node_modules" ]; then
    echo "  Instalare dependente (prima rulare)..."
    npm install
    echo ""
fi

echo "  Pornire aplicatie..."
echo "  Browser: http://localhost:3000"
echo "  Oprire:  Ctrl+C"
echo ""
npm start
