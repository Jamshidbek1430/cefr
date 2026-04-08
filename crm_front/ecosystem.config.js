module.exports = {
  apps: [{
    name: 'cefr-front',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/cefr/crm_front',
    env: {
      NODE_ENV: 'production',
      NEXTAUTH_URL: 'https://komilcefr.org',
      NEXTAUTH_SECRET: 'hm0jyoUs1y/Ev2y25N0Lb5OWmRzuBW6jbGso3xSvE0I=',
      DATABASE_URL: 'postgresql://myuser:il0v3y04%40t0O@localhost:5432/myappdb',
      NEXT_PUBLIC_API_URL: 'https://komilcefr.org/api',
    }
  }]
}
