import { c as create_ssr_component, f as add_attribute, d as subscribe, v as validate_component, e as escape, g as each } from "../../chunks/ssr.js";
import { P as PropertyCard } from "../../chunks/PropertyCard.js";
import { i as inventoryData } from "../../chunks/inventory.js";
import { p as page } from "../../chunks/stores.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
function goto(url, opts = {}) {
  {
    throw new Error("Cannot call goto(...) on the server");
  }
}
const css$1 = {
  code: ".hero.svelte-nkjib1{background-image:url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');background-size:cover;background-position:center;height:600px;display:flex;align-items:center;justify-content:center;position:relative;color:var(--color-white)}.hero-overlay.svelte-nkjib1{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0, 0, 0, 0.3)}.hero-content.svelte-nkjib1{position:relative;z-index:1;text-align:center;width:100%;max-width:800px;padding:0 var(--spacing-md)}.hero-title.svelte-nkjib1{font-size:3.5rem;font-weight:700;margin-bottom:var(--spacing-md);text-shadow:0 2px 4px rgba(0, 0, 0, 0.3)}.hero-subtitle.svelte-nkjib1{font-size:var(--font-size-xl);margin-bottom:var(--spacing-2xl);opacity:0.95;text-shadow:0 1px 2px rgba(0, 0, 0, 0.3)}.search-bar.svelte-nkjib1{background:var(--color-white);padding:var(--spacing-sm);border-radius:8px;display:flex;gap:var(--spacing-sm);box-shadow:0 4px 12px rgba(0, 0, 0, 0.15)}.search-input.svelte-nkjib1{flex:1;border:none;padding:var(--spacing-md);font-size:var(--font-size-base);outline:none}.search-btn.svelte-nkjib1{padding:var(--spacing-md) var(--spacing-2xl)}@media(max-width: 768px){.hero.svelte-nkjib1{height:500px}.hero-title.svelte-nkjib1{font-size:2.5rem}.hero-subtitle.svelte-nkjib1{font-size:var(--font-size-lg)}.search-bar.svelte-nkjib1{flex-direction:column;padding:var(--spacing-md)}.search-btn.svelte-nkjib1{width:100%}}",
  map: `{"version":3,"file":"Hero.svelte","sources":["Hero.svelte"],"sourcesContent":["<script>\\r\\n\\texport let searchValue = '';\\r\\n\\texport let onSearch;\\r\\n\\r\\n\\tlet inputValue = searchValue;\\r\\n\\r\\n\\t$: inputValue = searchValue;\\r\\n\\r\\n\\tfunction handleChange(e) {\\r\\n\\t\\tinputValue = e.target.value;\\r\\n\\t\\tif (onSearch) onSearch(inputValue);\\r\\n\\t}\\r\\n\\r\\n\\tfunction handleButtonClick() {\\r\\n\\t\\tif (onSearch) onSearch(inputValue);\\r\\n\\t}\\r\\n<\/script>\\r\\n\\r\\n<section class=\\"hero\\">\\r\\n\\t<div class=\\"hero-overlay\\"></div>\\r\\n\\t<div class=\\"container hero-content\\">\\r\\n\\t\\t<h2 class=\\"hero-title\\">Encuentra tu hogar ideal</h2>\\r\\n\\t\\t<p class=\\"hero-subtitle\\">Las mejores propiedades en exclusiva para ti</p>\\r\\n\\r\\n\\t\\t<div class=\\"search-bar\\">\\r\\n\\t\\t\\t<input\\r\\n\\t\\t\\t\\ttype=\\"text\\"\\r\\n\\t\\t\\t\\tplaceholder=\\"Buscar por ubicación, tipo de propiedad...\\"\\r\\n\\t\\t\\t\\tclass=\\"search-input\\"\\r\\n\\t\\t\\t\\tvalue={inputValue}\\r\\n\\t\\t\\t\\ton:input={handleChange}\\r\\n\\t\\t\\t/>\\r\\n\\t\\t\\t<button class=\\"btn btn-secondary search-btn\\" on:click={handleButtonClick}>Buscar</button>\\r\\n\\t\\t</div>\\r\\n\\t</div>\\r\\n</section>\\r\\n\\r\\n<style>\\r\\n\\t.hero {\\r\\n\\t\\tbackground-image: url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');\\r\\n\\t\\tbackground-size: cover;\\r\\n\\t\\tbackground-position: center;\\r\\n\\t\\theight: 600px;\\r\\n\\t\\tdisplay: flex;\\r\\n\\t\\talign-items: center;\\r\\n\\t\\tjustify-content: center;\\r\\n\\t\\tposition: relative;\\r\\n\\t\\tcolor: var(--color-white);\\r\\n\\t}\\r\\n\\t.hero-overlay {\\r\\n\\t\\tposition: absolute;\\r\\n\\t\\ttop: 0;\\r\\n\\t\\tleft: 0;\\r\\n\\t\\tright: 0;\\r\\n\\t\\tbottom: 0;\\r\\n\\t\\tbackground: rgba(0, 0, 0, 0.3);\\r\\n\\t}\\r\\n\\t.hero-content {\\r\\n\\t\\tposition: relative;\\r\\n\\t\\tz-index: 1;\\r\\n\\t\\ttext-align: center;\\r\\n\\t\\twidth: 100%;\\r\\n\\t\\tmax-width: 800px;\\r\\n\\t\\tpadding: 0 var(--spacing-md);\\r\\n\\t}\\r\\n\\t.hero-title {\\r\\n\\t\\tfont-size: 3.5rem;\\r\\n\\t\\tfont-weight: 700;\\r\\n\\t\\tmargin-bottom: var(--spacing-md);\\r\\n\\t\\ttext-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);\\r\\n\\t}\\r\\n\\t.hero-subtitle {\\r\\n\\t\\tfont-size: var(--font-size-xl);\\r\\n\\t\\tmargin-bottom: var(--spacing-2xl);\\r\\n\\t\\topacity: 0.95;\\r\\n\\t\\ttext-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);\\r\\n\\t}\\r\\n\\t.search-bar {\\r\\n\\t\\tbackground: var(--color-white);\\r\\n\\t\\tpadding: var(--spacing-sm);\\r\\n\\t\\tborder-radius: 8px;\\r\\n\\t\\tdisplay: flex;\\r\\n\\t\\tgap: var(--spacing-sm);\\r\\n\\t\\tbox-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\\r\\n\\t}\\r\\n\\t.search-input {\\r\\n\\t\\tflex: 1;\\r\\n\\t\\tborder: none;\\r\\n\\t\\tpadding: var(--spacing-md);\\r\\n\\t\\tfont-size: var(--font-size-base);\\r\\n\\t\\toutline: none;\\r\\n\\t}\\r\\n\\t.search-btn {\\r\\n\\t\\tpadding: var(--spacing-md) var(--spacing-2xl);\\r\\n\\t}\\r\\n\\r\\n\\t@media (max-width: 768px) {\\r\\n\\t\\t.hero {\\r\\n\\t\\t\\theight: 500px;\\r\\n\\t\\t}\\r\\n\\t\\t.hero-title {\\r\\n\\t\\t\\tfont-size: 2.5rem;\\r\\n\\t\\t}\\r\\n\\t\\t.hero-subtitle {\\r\\n\\t\\t\\tfont-size: var(--font-size-lg);\\r\\n\\t\\t}\\r\\n\\t\\t.search-bar {\\r\\n\\t\\t\\tflex-direction: column;\\r\\n\\t\\t\\tpadding: var(--spacing-md);\\r\\n\\t\\t}\\r\\n\\t\\t.search-btn {\\r\\n\\t\\t\\twidth: 100%;\\r\\n\\t\\t}\\r\\n\\t}\\r\\n</style>\\r\\n"],"names":[],"mappings":"AAsCC,mBAAM,CACL,gBAAgB,CAAE,mHAAmH,CACrI,eAAe,CAAE,KAAK,CACtB,mBAAmB,CAAE,MAAM,CAC3B,MAAM,CAAE,KAAK,CACb,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAAM,CACvB,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,aAAa,CACzB,CACA,2BAAc,CACb,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,MAAM,CAAE,CAAC,CACT,UAAU,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAC9B,CACA,2BAAc,CACb,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,CAAC,CACV,UAAU,CAAE,MAAM,CAClB,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,KAAK,CAChB,OAAO,CAAE,CAAC,CAAC,IAAI,YAAY,CAC5B,CACA,yBAAY,CACX,SAAS,CAAE,MAAM,CACjB,WAAW,CAAE,GAAG,CAChB,aAAa,CAAE,IAAI,YAAY,CAAC,CAChC,WAAW,CAAE,CAAC,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CACzC,CACA,4BAAe,CACd,SAAS,CAAE,IAAI,cAAc,CAAC,CAC9B,aAAa,CAAE,IAAI,aAAa,CAAC,CACjC,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,CAAC,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CACzC,CACA,yBAAY,CACX,UAAU,CAAE,IAAI,aAAa,CAAC,CAC9B,OAAO,CAAE,IAAI,YAAY,CAAC,CAC1B,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,IAAI,CACb,GAAG,CAAE,IAAI,YAAY,CAAC,CACtB,UAAU,CAAE,CAAC,CAAC,GAAG,CAAC,IAAI,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAC1C,CACA,2BAAc,CACb,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,YAAY,CAAC,CAC1B,SAAS,CAAE,IAAI,gBAAgB,CAAC,CAChC,OAAO,CAAE,IACV,CACA,yBAAY,CACX,OAAO,CAAE,IAAI,YAAY,CAAC,CAAC,IAAI,aAAa,CAC7C,CAEA,MAAO,YAAY,KAAK,CAAE,CACzB,mBAAM,CACL,MAAM,CAAE,KACT,CACA,yBAAY,CACX,SAAS,CAAE,MACZ,CACA,4BAAe,CACd,SAAS,CAAE,IAAI,cAAc,CAC9B,CACA,yBAAY,CACX,cAAc,CAAE,MAAM,CACtB,OAAO,CAAE,IAAI,YAAY,CAC1B,CACA,yBAAY,CACX,KAAK,CAAE,IACR,CACD"}`
};
const Hero = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { searchValue = "" } = $$props;
  let { onSearch } = $$props;
  let inputValue = searchValue;
  if ($$props.searchValue === void 0 && $$bindings.searchValue && searchValue !== void 0) $$bindings.searchValue(searchValue);
  if ($$props.onSearch === void 0 && $$bindings.onSearch && onSearch !== void 0) $$bindings.onSearch(onSearch);
  $$result.css.add(css$1);
  inputValue = searchValue;
  return `<section class="hero svelte-nkjib1"><div class="hero-overlay svelte-nkjib1"></div> <div class="container hero-content svelte-nkjib1"><h2 class="hero-title svelte-nkjib1" data-svelte-h="svelte-zcz45k">Encuentra tu hogar ideal</h2> <p class="hero-subtitle svelte-nkjib1" data-svelte-h="svelte-rtyxhj">Las mejores propiedades en exclusiva para ti</p> <div class="search-bar svelte-nkjib1"><input type="text" placeholder="Buscar por ubicación, tipo de propiedad..." class="search-input svelte-nkjib1"${add_attribute("value", inputValue, 0)}> <button class="btn btn-secondary search-btn svelte-nkjib1" data-svelte-h="svelte-si07ob">Buscar</button></div></div> </section>`;
});
function filterProperties(inventoryData2, search, filters, page2 = 1, limit = 20) {
  const term = search.toLowerCase();
  const filtered = inventoryData2.filter((p) => {
    const title = (p.title || "").toLowerCase();
    const locationObj = p.location || {};
    const locationName = typeof p.location === "object" ? [locationObj.name, locationObj.city, locationObj.region, locationObj.city_area].filter(Boolean).join(" ") : p.location || "";
    const location = locationName.toLowerCase();
    const type = (p.property_type || "").toLowerCase();
    const matchesText = !term || title.includes(term) || location.includes(term) || type.includes(term);
    const matchesBedrooms = !filters.bedrooms || p.bedrooms >= parseInt(filters.bedrooms);
    const matchesBathrooms = !filters.bathrooms || p.bathrooms >= parseInt(filters.bathrooms);
    const matchesParking = !filters.parking || p.parking_spaces >= parseInt(filters.parking);
    const price = p.operations && p.operations[0] ? p.operations[0].amount : 0;
    const min = filters.minPrice ? parseFloat(filters.minPrice) : 0;
    const max = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
    const matchesPrice = price >= min && price <= max;
    const matchesPropertyType = !filters.propertyType || p.property_type === filters.propertyType;
    const matchesOperationType = !filters.operationType || p.operations && p.operations.some((op) => op.type === filters.operationType);
    const ZONES = ["Norte", "Sur", "Este", "Oeste", "CentroNorte", "CentroSur"];
    const propertyTags = (p.tags || []).map((t) => t.toString().toLowerCase().trim());
    const propertyFeatures = (p.features || []).map((f) => (f.name || "").toLowerCase().trim());
    const allPropertyTags = [...propertyTags, ...propertyFeatures];
    const selectedTags = (filters.tags || []).map((t) => t.toLowerCase().trim());
    const selectedZones = selectedTags.filter((t) => ZONES.map((z) => z.toLowerCase()).includes(t));
    const selectedAmenities = selectedTags.filter((t) => !ZONES.map((z) => z.toLowerCase()).includes(t));
    const matchesZones = selectedZones.length === 0 || selectedZones.some((zone) => allPropertyTags.includes(zone));
    const matchesAmenities = selectedAmenities.length === 0 || selectedAmenities.every((amenity) => allPropertyTags.includes(amenity));
    const matchesTags = matchesZones && matchesAmenities;
    return matchesText && matchesBedrooms && matchesBathrooms && matchesParking && matchesPrice && matchesPropertyType && matchesOperationType && matchesTags;
  });
  const total = filtered.length;
  const start = (page2 - 1) * limit;
  const end = start + limit;
  const items = filtered.slice(start, end);
  return {
    items,
    pagination: {
      limit,
      total,
      page: page2,
      next_page: end < total ? true : null
    }
  };
}
const css = {
  code: ".properties-grid.svelte-17dtzqe.svelte-17dtzqe{display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:var(--spacing-xl)}.features-grid.svelte-17dtzqe.svelte-17dtzqe{display:grid;grid-template-columns:repeat(auto-fit, minmax(250px, 1fr));gap:var(--spacing-xl);text-align:center}.feature-item.svelte-17dtzqe h3.svelte-17dtzqe{color:var(--color-secondary);margin-bottom:var(--spacing-sm);font-size:var(--font-size-xl)}.pagination-controls.svelte-17dtzqe.svelte-17dtzqe{display:flex;justify-content:center;align-items:center;gap:var(--spacing-lg);margin-top:var(--spacing-2xl)}.page-info.svelte-17dtzqe.svelte-17dtzqe{font-weight:600;color:var(--color-text-light)}button.svelte-17dtzqe.svelte-17dtzqe:disabled{opacity:0.5;cursor:not-allowed}",
  map: `{"version":3,"file":"+page.svelte","sources":["+page.svelte"],"sourcesContent":["<script>\\r\\n\\timport Hero from '$lib/components/Hero.svelte';\\r\\n\\timport PropertyCard from '$lib/components/PropertyCard.svelte';\\r\\n\\timport Filters from '$lib/components/Filters.svelte';\\r\\n\\timport inventoryData from '$lib/data/inventory.json';\\r\\n\\timport { filterProperties } from '$lib/utils/filterProperties';\\r\\n\\timport { page } from '$app/stores';\\r\\n\\timport { goto } from '$app/navigation';\\r\\n\\r\\n\\tlet showFilters = false;\\r\\n\\r\\n\\t// Estado inicial desde URL\\r\\n\\tlet search = $page.url.searchParams.get('q') || '';\\r\\n\\tlet filters = {\\r\\n\\t\\tbedrooms: $page.url.searchParams.get('bedrooms') || 0,\\r\\n\\t\\tbathrooms: $page.url.searchParams.get('bathrooms') || 0,\\r\\n\\t\\tparking: $page.url.searchParams.get('parking') || 0,\\r\\n\\t\\tminPrice: $page.url.searchParams.get('min_price') || '',\\r\\n\\t\\tmaxPrice: $page.url.searchParams.get('max_price') || '',\\r\\n\\t\\tpropertyType: $page.url.searchParams.get('property_type') || '',\\r\\n\\t\\toperationType: $page.url.searchParams.get('operation_type') || '',\\r\\n\\t\\ttags: $page.url.searchParams.get('tags') ? $page.url.searchParams.get('tags').split(',') : []\\r\\n\\t};\\r\\n\\tlet currentPage = parseInt($page.url.searchParams.get('page')) || 1;\\r\\n\\r\\n\\t// Reactividad\\r\\n\\t$: result = filterProperties(inventoryData, search, filters, currentPage);\\r\\n\\t$: properties = result.items;\\r\\n\\t$: pagination = result.pagination;\\r\\n\\r\\n\\t// Actualizar URL\\r\\n\\tfunction updateUrl() {\\r\\n\\t\\tconst params = new URLSearchParams();\\r\\n\\t\\tif (search) params.set('q', search);\\r\\n\\t\\tif (currentPage > 1) params.set('page', currentPage);\\r\\n\\t\\tif (filters.bedrooms > 0) params.set('bedrooms', filters.bedrooms);\\r\\n\\t\\tif (filters.bathrooms > 0) params.set('bathrooms', filters.bathrooms);\\r\\n\\t\\tif (filters.parking > 0) params.set('parking', filters.parking);\\r\\n\\t\\tif (filters.minPrice) params.set('min_price', filters.minPrice);\\r\\n\\t\\tif (filters.maxPrice) params.set('max_price', filters.maxPrice);\\r\\n\\t\\tif (filters.propertyType) params.set('property_type', filters.propertyType);\\r\\n\\t\\tif (filters.operationType) params.set('operation_type', filters.operationType);\\r\\n\\t\\tif (filters.tags.length > 0) params.set('tags', filters.tags.join(','));\\r\\n\\r\\n\\t\\tgoto(\`/?\${params.toString()}\`, { replaceState: true, keepFocus: true, noScroll: true });\\r\\n\\t}\\r\\n\\r\\n\\tfunction handleSearch(term) {\\r\\n\\t\\tsearch = term;\\r\\n\\t\\tcurrentPage = 1;\\r\\n\\t\\tupdateUrl();\\r\\n\\t}\\r\\n\\r\\n\\tfunction handleFilterChange(name, value) {\\r\\n\\t\\tfilters = { ...filters, [name]: value };\\r\\n\\t\\tcurrentPage = 1;\\r\\n\\t\\tupdateUrl();\\r\\n\\t}\\r\\n\\r\\n\\tfunction clearFilters() {\\r\\n\\t\\tsearch = '';\\r\\n\\t\\tfilters = {\\r\\n\\t\\t\\tbedrooms: 0,\\r\\n\\t\\t\\tbathrooms: 0,\\r\\n\\t\\t\\tparking: 0,\\r\\n\\t\\t\\tminPrice: '',\\r\\n\\t\\t\\tmaxPrice: '',\\r\\n\\t\\t\\tpropertyType: '',\\r\\n\\t\\t\\toperationType: '',\\r\\n\\t\\t\\ttags: []\\r\\n\\t\\t};\\r\\n\\t\\tcurrentPage = 1;\\r\\n\\t\\tupdateUrl();\\r\\n\\t}\\r\\n\\r\\n\\tfunction nextPage() {\\r\\n\\t\\tif (pagination.next_page) {\\r\\n\\t\\t\\tcurrentPage++;\\r\\n\\t\\t\\tupdateUrl();\\r\\n\\t\\t\\twindow.scrollTo(0, 0);\\r\\n\\t\\t}\\r\\n\\t}\\r\\n\\r\\n\\tfunction prevPage() {\\r\\n\\t\\tif (currentPage > 1) {\\r\\n\\t\\t\\tcurrentPage--;\\r\\n\\t\\t\\tupdateUrl();\\r\\n\\t\\t\\twindow.scrollTo(0, 0);\\r\\n\\t\\t}\\r\\n\\t}\\r\\n<\/script>\\r\\n\\r\\n<svelte:head>\\r\\n\\t<title>MatchHome - Encuentra tu hogar ideal</title>\\r\\n\\t<meta\\r\\n\\t\\tname=\\"description\\"\\r\\n\\t\\tcontent=\\"Las mejores propiedades en exclusiva para ti. Venta y renta de casas, departamentos y terrenos.\\"\\r\\n\\t/>\\r\\n</svelte:head>\\r\\n\\r\\n<Hero onSearch={handleSearch} searchValue={search} />\\r\\n\\r\\n<section class=\\"section container\\">\\r\\n\\t<h2 class=\\"section-title\\">Propiedades Destacadas</h2>\\r\\n\\r\\n\\t<div\\r\\n\\t\\tclass=\\"filters-header\\"\\r\\n\\t\\tstyle=\\"margin-bottom: var(--spacing-lg); display: flex; justify-content: space-between; align-items: center;\\"\\r\\n\\t>\\r\\n\\t\\t<button class=\\"btn btn-secondary\\" on:click={() => (showFilters = !showFilters)}>\\r\\n\\t\\t\\t{showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}\\r\\n\\t\\t</button>\\r\\n\\t</div>\\r\\n\\r\\n\\t{#if showFilters}\\r\\n\\t\\t<Filters\\r\\n\\t\\t\\t{filters}\\r\\n\\t\\t\\tonFilterChange={handleFilterChange}\\r\\n\\t\\t\\tonClear={clearFilters}\\r\\n\\t\\t\\tonClose={() => (showFilters = false)}\\r\\n\\t\\t/>\\r\\n\\t{/if}\\r\\n\\r\\n\\t<div class=\\"properties-grid\\">\\r\\n\\t\\t{#each properties as property (property.public_id || Math.random())}\\r\\n\\t\\t\\t<PropertyCard {property} />\\r\\n\\t\\t{/each}\\r\\n\\t</div>\\r\\n\\r\\n\\t<div class=\\"pagination-controls\\">\\r\\n\\t\\t<button on:click={prevPage} disabled={currentPage === 1} class=\\"btn btn-secondary\\">\\r\\n\\t\\t\\tAnterior\\r\\n\\t\\t</button>\\r\\n\\t\\t<span class=\\"page-info\\">Página {currentPage}</span>\\r\\n\\t\\t<button on:click={nextPage} disabled={!pagination.next_page} class=\\"btn btn-primary\\">\\r\\n\\t\\t\\tSiguiente\\r\\n\\t\\t</button>\\r\\n\\t</div>\\r\\n</section>\\r\\n\\r\\n<section class=\\"section\\" style=\\"background-color: var(--color-background-alt);\\">\\r\\n\\t<div class=\\"container\\">\\r\\n\\t\\t<h2 class=\\"section-title\\">¿Por qué elegirnos?</h2>\\r\\n\\t\\t<div class=\\"features-grid\\">\\r\\n\\t\\t\\t<div class=\\"feature-item\\">\\r\\n\\t\\t\\t\\t<h3>Experiencia</h3>\\r\\n\\t\\t\\t\\t<p>Más de 10 años conectando personas con su hogar ideal.</p>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t\\t<div class=\\"feature-item\\">\\r\\n\\t\\t\\t\\t<h3>Confianza</h3>\\r\\n\\t\\t\\t\\t<p>Procesos transparentes y seguros en cada transacción.</p>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t\\t<div class=\\"feature-item\\">\\r\\n\\t\\t\\t\\t<h3>Soporte</h3>\\r\\n\\t\\t\\t\\t<p>Acompañamiento personalizado en todo el proceso.</p>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t</div>\\r\\n\\t</div>\\r\\n</section>\\r\\n\\r\\n<style>\\r\\n\\t.properties-grid {\\r\\n\\t\\tdisplay: grid;\\r\\n\\t\\tgrid-template-columns: repeat(auto-fill, minmax(280px, 1fr));\\r\\n\\t\\tgap: var(--spacing-xl);\\r\\n\\t}\\r\\n\\t.features-grid {\\r\\n\\t\\tdisplay: grid;\\r\\n\\t\\tgrid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\\r\\n\\t\\tgap: var(--spacing-xl);\\r\\n\\t\\ttext-align: center;\\r\\n\\t}\\r\\n\\t.feature-item h3 {\\r\\n\\t\\tcolor: var(--color-secondary);\\r\\n\\t\\tmargin-bottom: var(--spacing-sm);\\r\\n\\t\\tfont-size: var(--font-size-xl);\\r\\n\\t}\\r\\n\\t.pagination-controls {\\r\\n\\t\\tdisplay: flex;\\r\\n\\t\\tjustify-content: center;\\r\\n\\t\\talign-items: center;\\r\\n\\t\\tgap: var(--spacing-lg);\\r\\n\\t\\tmargin-top: var(--spacing-2xl);\\r\\n\\t}\\r\\n\\t.page-info {\\r\\n\\t\\tfont-weight: 600;\\r\\n\\t\\tcolor: var(--color-text-light);\\r\\n\\t}\\r\\n\\tbutton:disabled {\\r\\n\\t\\topacity: 0.5;\\r\\n\\t\\tcursor: not-allowed;\\r\\n\\t}\\r\\n</style>\\r\\n"],"names":[],"mappings":"AAiKC,8CAAiB,CAChB,OAAO,CAAE,IAAI,CACb,qBAAqB,CAAE,OAAO,SAAS,CAAC,CAAC,OAAO,KAAK,CAAC,CAAC,GAAG,CAAC,CAAC,CAC5D,GAAG,CAAE,IAAI,YAAY,CACtB,CACA,4CAAe,CACd,OAAO,CAAE,IAAI,CACb,qBAAqB,CAAE,OAAO,QAAQ,CAAC,CAAC,OAAO,KAAK,CAAC,CAAC,GAAG,CAAC,CAAC,CAC3D,GAAG,CAAE,IAAI,YAAY,CAAC,CACtB,UAAU,CAAE,MACb,CACA,4BAAa,CAAC,iBAAG,CAChB,KAAK,CAAE,IAAI,iBAAiB,CAAC,CAC7B,aAAa,CAAE,IAAI,YAAY,CAAC,CAChC,SAAS,CAAE,IAAI,cAAc,CAC9B,CACA,kDAAqB,CACpB,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,IAAI,YAAY,CAAC,CACtB,UAAU,CAAE,IAAI,aAAa,CAC9B,CACA,wCAAW,CACV,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,IAAI,kBAAkB,CAC9B,CACA,oCAAM,SAAU,CACf,OAAO,CAAE,GAAG,CACZ,MAAM,CAAE,WACT"}`
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let result;
  let properties;
  let pagination;
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let search = $page.url.searchParams.get("q") || "";
  let filters = {
    bedrooms: $page.url.searchParams.get("bedrooms") || 0,
    bathrooms: $page.url.searchParams.get("bathrooms") || 0,
    parking: $page.url.searchParams.get("parking") || 0,
    minPrice: $page.url.searchParams.get("min_price") || "",
    maxPrice: $page.url.searchParams.get("max_price") || "",
    propertyType: $page.url.searchParams.get("property_type") || "",
    operationType: $page.url.searchParams.get("operation_type") || "",
    tags: $page.url.searchParams.get("tags") ? $page.url.searchParams.get("tags").split(",") : []
  };
  let currentPage = parseInt($page.url.searchParams.get("page")) || 1;
  function updateUrl() {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (currentPage > 1) params.set("page", currentPage);
    if (filters.bedrooms > 0) params.set("bedrooms", filters.bedrooms);
    if (filters.bathrooms > 0) params.set("bathrooms", filters.bathrooms);
    if (filters.parking > 0) params.set("parking", filters.parking);
    if (filters.minPrice) params.set("min_price", filters.minPrice);
    if (filters.maxPrice) params.set("max_price", filters.maxPrice);
    if (filters.propertyType) params.set("property_type", filters.propertyType);
    if (filters.operationType) params.set("operation_type", filters.operationType);
    if (filters.tags.length > 0) params.set("tags", filters.tags.join(","));
    goto(`/?${params.toString()}`, {});
  }
  function handleSearch(term) {
    search = term;
    currentPage = 1;
    updateUrl();
  }
  $$result.css.add(css);
  result = filterProperties(inventoryData, search, filters, currentPage);
  properties = result.items;
  pagination = result.pagination;
  $$unsubscribe_page();
  return `${$$result.head += `<!-- HEAD_svelte-1p26tap_START -->${$$result.title = `<title>MatchHome - Encuentra tu hogar ideal</title>`, ""}<meta name="description" content="Las mejores propiedades en exclusiva para ti. Venta y renta de casas, departamentos y terrenos."><!-- HEAD_svelte-1p26tap_END -->`, ""} ${validate_component(Hero, "Hero").$$render(
    $$result,
    {
      onSearch: handleSearch,
      searchValue: search
    },
    {},
    {}
  )} <section class="section container"><h2 class="section-title" data-svelte-h="svelte-8x32ts">Propiedades Destacadas</h2> <div class="filters-header" style="margin-bottom: var(--spacing-lg); display: flex; justify-content: space-between; align-items: center;"><button class="btn btn-secondary svelte-17dtzqe">${escape("Mostrar Filtros")}</button></div> ${``} <div class="properties-grid svelte-17dtzqe">${each(properties, (property) => {
    return `${validate_component(PropertyCard, "PropertyCard").$$render($$result, { property }, {}, {})}`;
  })}</div> <div class="pagination-controls svelte-17dtzqe"><button ${currentPage === 1 ? "disabled" : ""} class="btn btn-secondary svelte-17dtzqe">Anterior</button> <span class="page-info svelte-17dtzqe">Página ${escape(currentPage)}</span> <button ${!pagination.next_page ? "disabled" : ""} class="btn btn-primary svelte-17dtzqe">Siguiente</button></div></section> <section class="section" style="background-color: var(--color-background-alt);" data-svelte-h="svelte-1laxnu1"><div class="container"><h2 class="section-title">¿Por qué elegirnos?</h2> <div class="features-grid svelte-17dtzqe"><div class="feature-item svelte-17dtzqe"><h3 class="svelte-17dtzqe">Experiencia</h3> <p>Más de 10 años conectando personas con su hogar ideal.</p></div> <div class="feature-item svelte-17dtzqe"><h3 class="svelte-17dtzqe">Confianza</h3> <p>Procesos transparentes y seguros en cada transacción.</p></div> <div class="feature-item svelte-17dtzqe"><h3 class="svelte-17dtzqe">Soporte</h3> <p>Acompañamiento personalizado en todo el proceso.</p></div></div></div> </section>`;
});
export {
  Page as default
};
