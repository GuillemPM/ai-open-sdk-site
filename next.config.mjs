import { createMDX } from 'fumadocs-mdx/next';

/** Comma-separated hosts from `.env.local` */
const allowedDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  ...(allowedDevOrigins.length > 0 ? { allowedDevOrigins } : {}),
};

const withMDX = createMDX();

export default withMDX(config);
