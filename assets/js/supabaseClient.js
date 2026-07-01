// Crea el cliente único de Supabase para toda la aplicación.
// Cargamos la librería desde CDN (sin paso de compilación, sin npm).
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
