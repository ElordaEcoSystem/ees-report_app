module.exports = {
  apps: [
    {
      name: "ees-backend",
      script: "./bin/www",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
