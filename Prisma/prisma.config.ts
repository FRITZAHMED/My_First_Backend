import { defineConfig, env } from "prisma/config";

export default defineConfig({
	schema: "Prisma/Schema.prisma",

	migrations: {
		path: "Prisma/migrations",
	},

	datasource: {
		url: env("DATABASE_URL"),
	},
});
