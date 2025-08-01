import path from 'path';
import { fileURLToPath } from 'url';
import { parseCookies } from './utils.py';

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
export const sessions = new Map();



