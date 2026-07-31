#!/bin/bash
set -e

echo "=== Management System Deployment Script ==="

# 1. Check for .env.production
if [ ! -f .env.production ]; then
    echo "[-] Error: .env.production file not found!"
    echo "    Please create a .env.production file with your DATABASE_URL."
    echo "    Example template:"
    cat .env.production.example
    exit 1
fi

# 2. Stop running containers if any
echo "[+] Stopping any existing containers..."
docker compose down || true

# 3. Build and start containers
echo "[+] Building and starting Docker containers..."
docker compose up -d --build

# 4. Check status
echo "[+] Checking container status..."
sleep 2
if docker ps | grep -q "management-system-app"; then
    echo "[+] Success! The application container is running on host port 3003."
else
    echo "[-] Error: Container failed to start. Run 'docker compose logs' to check errors."
    exit 1
fi

echo "====================================================="
echo "Application is live locally on http://localhost:3003"
echo "====================================================="
echo "Next steps:"
echo "1. Configure GoDaddy DNS A record to point to this VPS IP."
echo "2. Copy the Nginx template file (nginx-management.conf) to Nginx:"
echo "   sudo cp nginx-management.conf /etc/nginx/sites-available/management-system"
echo "   sudo ln -s /etc/nginx/sites-available/management-system /etc/nginx/sites-enabled/"
echo "   sudo systemctl reload nginx"
echo "3. Run Certbot for SSL (HTTPS):"
echo "   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"
echo "====================================================="
