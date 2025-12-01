
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
		RouteId(): "/" | "/property" | "/property/[id]" | "/propuesta" | "/propuesta/[id]";
		RouteParams(): {
			"/property/[id]": { id: string };
			"/propuesta/[id]": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string };
			"/property": { id?: string };
			"/property/[id]": { id: string };
			"/propuesta": { id?: string };
			"/propuesta/[id]": { id: string }
		};
		Pathname(): "/" | "/property" | "/property/" | `/property/${string}` & {} | `/property/${string}/` & {} | "/propuesta" | "/propuesta/" | `/propuesta/${string}` & {} | `/propuesta/${string}/` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}