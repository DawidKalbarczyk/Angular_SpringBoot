import { Service, signal } from '@angular/core';

export type LayerKey = 
    | 'vectorLayer'
    | 'boundsLayerCities'
    | 'boundsLayerGminy'
    | 'boundsLayerPowiaty'
    | 'boundsLayerWojewodz'
    | 'boundsLayerPanstwo'
    | 'osmLayer'
    | 'ortoLayer'
    | 'budLayer';

const LAYER_VISIBILITY_STORAGE_KEY = 'layerVisibility';

const DEFAULT_LAYERS_VISIBILITY: Record<LayerKey, boolean> = {
    osmLayer: true,
    ortoLayer: false,
    budLayer: false,
    boundsLayerPanstwo: true,
    vectorLayer: true,
    boundsLayerCities: false,
    boundsLayerGminy: false,
    boundsLayerPowiaty: false,
    boundsLayerWojewodz: true,
    
};

@Service()
export class LayerVisibility {
    isLayerClicked = signal<boolean>(false);
    layerClicked(): void {
        this.isLayerClicked.set(!this.isLayerClicked());
    }

    readonly layersVisibility = signal<Record<LayerKey, boolean>>(DEFAULT_LAYERS_VISIBILITY);

    constructor() {
        this.layersVisibility.set(this.loadVisibility());
    }

    setVisibility(layerKey: LayerKey): void {
        this.layersVisibility.update((state) => {
            const nextState = {
                ...state,
                [layerKey]: !state[layerKey],
            };

            this.persistVisibility(nextState);
            return nextState;
        });
    }

    setLayerVisibility(layerKey: LayerKey, isVisible: boolean): void {
        this.layersVisibility.update((state) => {
            const nextState = {
                ...state,
                [layerKey]: isVisible,
            };

            this.persistVisibility(nextState);
            return nextState;
        });
    }

    isVisible(layerKey: LayerKey): boolean {
        return this.layersVisibility()[layerKey];
    }

    private loadVisibility(): Record<LayerKey, boolean> {
        try {
            const raw = localStorage.getItem(LAYER_VISIBILITY_STORAGE_KEY);
            if (!raw) {
                return DEFAULT_LAYERS_VISIBILITY;
            }

            return {
                ...DEFAULT_LAYERS_VISIBILITY,
                ...(JSON.parse(raw) as Partial<Record<LayerKey, boolean>>),
            };
        } catch {
            return DEFAULT_LAYERS_VISIBILITY;
        }
    }

    private persistVisibility(state: Record<LayerKey, boolean>): void {
        try {
            localStorage.setItem(LAYER_VISIBILITY_STORAGE_KEY, JSON.stringify(state));
        } catch {
            // ignore
        }
    }

    public vectorResults = signal<any[]>([]); // Signal to hold the vector results
}
