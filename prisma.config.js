try {
  require("dotenv").config();
} catch (e) {
  // dotenv not found, fallback to existing process.env
}

const { defineConfig, env } = require("prisma/config");

module.exports = defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
