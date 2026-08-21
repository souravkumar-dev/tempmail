import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 serverExternalPackages: ["better-sqlite3", "smtp-server", "mailparser"],
};

export default nextConfig;
