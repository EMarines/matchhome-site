import * as universal from '../entries/pages/property/_id_/_page.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/property/_id_/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/property/[id]/+page.js";
export const imports = ["_app/immutable/nodes/3.D5XE9Dem.js"];
export const stylesheets = [];
export const fonts = [];
