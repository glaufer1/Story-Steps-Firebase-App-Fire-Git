// A legacy interface for the original tour creation feature
export interface Tour {
  id: string;
  title: string;
  description: string;
  price: number;
  stops: google.maps.LatLngLiteral[];
}

// Base Page and Tour-level interfaces
export interface Page {
    id: string;
    type: 'City' | 'PrePurchaseTour' | 'PostPurchaseTour' | 'Stop' | 'Collection';
    title: string;
    description: string;
    imageUrl?: string;
}

export interface CityPage extends Page { type: 'City'; tours: string[]; }
export interface PrePurchaseTourPage extends Page { /* ... as before ... */ }
export interface PostPurchaseTourPage extends Page { /* ... as before ... */ }
export interface CollectionPage extends Page { /* ... as before ... */ }

// --- NEW MODULAR CONTENT BLOCKS for StopPage ---

type BlockType = 'text' | 'media' | 'openingTimes' | 'links' | 'imageSlider' | 'location' | 'howToGetFrom' | 'social';

export interface BaseBlock {
    id: string; // Unique ID for each block instance
    type: BlockType;
    order: number; // To determine display sequence
}

export interface TextBlock extends BaseBlock {
    type: 'text';
    content: string; // HTML content from a rich text editor
}

export interface MediaBlock extends BaseBlock {
    type: 'media';
    items: {
        type: 'image' | 'audio' | 'video';
        url: string; // URL to the asset or YouTube embed
        caption?: string;
    }[];
}

export interface OpeningTimesBlock extends BaseBlock {
    type: 'openingTimes';
    times: {
        day: string; // e.g., "Monday"
        opens: string; // e.g., "9:00 AM"
        closes: string; // e.g., "5:00 PM"
    }[];
}

export interface LinkButtonBlock extends BaseBlock {
    type: 'links';
    title: string;
    buttons: {
        text: string;
        url: string; // Can be internal or external
    }[];
}

export interface ImageSliderBlock extends BaseBlock {
    type: 'imageSlider';
    imageUrl1: string;
    imageUrl2: string;
}

export interface LocationBlock extends BaseBlock {
    type: 'location';
    mapType: 'Start Point' | 'End Point';
    address: string;
    latitude: number;
    longitude: number;
}
export interface Pin {
    id: string;
    latitude: number;
    longitude: number;
    color: 'Blue' | 'Yellow' | 'Green' | 'Red' | 'Purple' | 'Orange';
    label?: string;
}
export interface HowToGetFromBlock extends BaseBlock {
    type: 'howToGetFrom';
    startAddress: string;
    endAddress: string;
    // This will store the GeoJSON data for the route drawn by the creator
    routeData: any; 
    pins: Pin[];
}

export interface SocialMediaBlock extends BaseBlock {
    type: 'social';
    links: {
        platform: 'Facebook' | 'Twitter' | 'Instagram' | 'Website';
        url: string;
    }[];
}

export type ContentBlock = TextBlock | MediaBlock | OpeningTimesBlock | LinkButtonBlock | ImageSliderBlock | LocationBlock | HowToGetFromBlock | SocialMediaBlock;

// --- UPDATED StopPage Interface ---

export interface StopPage extends Page {
    type: 'Stop';
    
    // Fixed Top Section data
    heroImageUrl: string;
    audioFileUrl: string;
    audioFileTitle: string;
    audioGraphicUrl?: string; // Optional graphic behind play button
    
    // Geofencing data
    latitude: number;
    longitude: number;
    geoFenceRadius: number; // in meters
    
    // Dynamic content blocks
    contentBlocks: ContentBlock[];
}
