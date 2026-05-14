module.exports = {
  apps: [{
    name: 'consultoriaenmarketing',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/home/ubuntu/consultoriaenmarketing',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
    instances: 1,
    exec_mode: 'fork',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: '/home/ubuntu/consultoriaenmarketing/logs/pm2-error.log',
    out_file: '/home/ubuntu/consultoriaenmarketing/logs/pm2-out.log',
    merge_logs: true,
    max_restarts: 10,
    restart_delay: 5000,
  }]
};
