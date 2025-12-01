import * as universal from '../entries/pages/propuesta/_id_/_page.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/propuesta/_id_/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/propuesta/[id]/+page.js";
export const imports = ["_app/immutable/nodes/4.CCJiEV_a.js"];
export const stylesheets = [];
export const fonts = [];
