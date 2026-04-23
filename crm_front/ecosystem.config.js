module.exports = {
  apps: [{
    name: 'cefr-front',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/cefr/crm_front',
    env: {
      NODE_ENV: 'production',
      API_URL: 'http://localhost:8000',
      NEXT_PUBLIC_API_URL: 'https://arturturkce.online',
      NEXTAUTH_URL: 'https://arturturkce.online',
      NEXTAUTH_SECRET: 'artur-turkce-super-secret-key-2024-production-komilcefr',
      DATABASE_URL: 'postgresql://myuser:il0v3y04%40t0O@localhost:5432/myappdb'
    }
  }]
}
