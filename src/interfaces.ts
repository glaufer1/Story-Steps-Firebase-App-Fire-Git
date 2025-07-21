// src/interfaces.ts
export interface AppUser {
  uid: string;
  email: string | null;
  role: 'Admin' | 'Creator' | 'Customer';
}

export interface Tour {
  id: string;
  title: string;
  description: string;
  city: string;
  price?: number;
  stops?: Stop[];
}

export interface Stop {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  heroImageUrl?: string;
  title?: string;
}

export enum PageType {
  CityPage = 'CityPage',
  CollectionPage = 'CollectionPage',
  PrePurchaseTourPage = 'PrePurchaseTourPage',
  PostPurchaseTourPage = 'PostPurchaseTourPage',
  StopPage = 'StopPage',
}

export interface Page {
  id: string;
  title: string;
  type: PageType;
}

export interface CityPage extends Page {
  imageUrl?: string;
  description?: string;
}

export interface CollectionPage extends Page {
  imageUrl?: string;
  description?: string;
}

export interface PrePurchaseTourPage extends Page {
  imageUrl?: string;
  distance?: string;
  stops?: Stop[];
  travelMode?: string;
  previewAudioUrl?: string;
  description?: string;
  price?: number;
}

export interface PostPurchaseTourPage extends Page {
  preDepartureHeroImageUrl?: string;
  preDepartureAudioUrl?: string;
  stops?: Stop[];
  totalSizeMB?: string;
  imageUrl?: string;
  tourTime?: string;
  description?: string;
}

export interface StopPage extends Page {
  latitude?: number;
  longitude?: number;
  geoFenceRadius?: number;
  contentBlocks?: ContentBlock[];
  heroImageUrl?: string;
  audioFileUrl?: string;
  audioFileTitle?: string;
}

export enum BlockType {
  Text = 'Text',
  Media = 'Media',
  Location = 'Location',
  HowToGetFrom = 'HowToGetFrom',
  LinkButton = 'LinkButton',
  SocialMedia = 'SocialMedia',
  OpeningTimes = 'OpeningTimes',
  ImageSlider = 'ImageSlider',
}

export interface ContentBlock {
  id: string;
  type: BlockType;
  order: number;
}

export interface TextBlock extends ContentBlock {
  type: BlockType.Text;
  content: string;
}

export interface MediaItem {
  url: string;
  caption?: string;
  type?: 'image' | 'video' | 'audio';
}

export interface MediaBlock extends ContentBlock {
  type: BlockType.Media;
  items: MediaItem[];
}

export interface LocationBlock extends ContentBlock {
  type: BlockType.Location;
  latitude: number;
  longitude: number;
  address: string;
  mapType?: string;
}

export interface Pin {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  color?: string;
}
export interface HowToGetFromBlock extends ContentBlock {
  type: BlockType.HowToGetFrom;
  pins: Pin[];
  routeData?: any;
}

export interface LinkButtonBlock extends ContentBlock {
  type: BlockType.LinkButton;
  title?: string;
  buttons: { text: string; url: string }[];
}

export interface SocialMediaBlock extends ContentBlock {
  type: BlockType.SocialMedia;
  links: { platform: string; url: string }[];
}

export interface OpeningTimesBlock extends ContentBlock {
  type: BlockType.OpeningTimes;
  times: { day: string; open: string; close: string }[];
}

export interface ImageSliderBlock extends ContentBlock {
  type: BlockType.ImageSlider;
  images: string[];
  imageUrl1?: string;
  imageUrl2?: string;
}
