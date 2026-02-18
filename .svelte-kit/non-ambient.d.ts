
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/api" | "/api/debug-property" | "/api/sync" | "/property" | "/property/[id]" | "/propiedades" | "/propuesta" | "/propuesta/[id]";
		RouteParams(): {
			"/property/[id]": { id: string };
			"/propuesta/[id]": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string };
			"/api": Record<string, never>;
			"/api/debug-property": Record<string, never>;
			"/api/sync": Record<string, never>;
			"/property": { id?: string };
			"/property/[id]": { id: string };
			"/propiedades": Record<string, never>;
			"/propuesta": { id?: string };
			"/propuesta/[id]": { id: string }
		};
		Pathname(): "/" | "/api" | "/api/" | "/api/debug-property" | "/api/debug-property/" | "/api/sync" | "/api/sync/" | "/property" | "/property/" | `/property/${string}` & {} | `/property/${string}/` & {} | "/propiedades" | "/propiedades/" | "/propuesta" | "/propuesta/" | `/propuesta/${string}` & {} | `/propuesta/${string}/` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/logo.png" | "/vite.svg" | string & {};
	}
}