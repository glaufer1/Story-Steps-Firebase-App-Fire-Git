// src/interfaces.ts
export interface AppUser {
  uid: string;
  email: string | null;
  role: 'Admin' | 'Creator' | 'Customer';
  displayName?: string;
  photoURL?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  mobilePhone?: string;
  citiesOfInterest?: string[];
  updatedAt?: Date;
  createdAt?: Date;
}

export interface Tour {
  id: string;
  title: string;
  subTitle?: string;
  description: string;
  additionalTourText?: string;
  city: string;
  distance?: string;
  time?: string;
  price?: number;
  stops?: Stop[];
  tourPreviewAudio?: string;
  tourPreviewAudioFileName?: string;
}

export interface City {
  id: string;
  name: string;
  state?: string;
  photoUrl?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  widePhotoUrl?: string;
  squarePhotoUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
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

// Customer Facing Pages Interfaces
export enum CustomerPageType {
  Home = 'Home',
  About = 'About',
  Blog = 'Blog',
  City = 'City',
  TourPromo = 'TourPromo',
  ToursList = 'ToursList',
  Stop = 'Stop',
  Custom = 'Custom'
}

export interface CustomerPage {
  id: string;
  title: string;
  slug: string;
  type: CustomerPageType;
  description?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  sections: PageSection[];
  metaTitle?: string;
  metaDescription?: string;
  featuredImage?: string;
}

export interface PageSection {
  id: string;
  type: SectionType;
  title?: string;
  content: any;
  order: number;
  isVisible: boolean;
}

export enum SectionType {
  Header = 'Header',
  Text = 'Text',
  Gallery = 'Gallery',
  AudioPlayer = 'AudioPlayer',
  Map = 'Map',
  TourContent = 'TourContent',
  StopContent = 'StopContent',
  ContactForm = 'ContactForm',
  SocialMedia = 'SocialMedia',
  Custom = 'Custom'
}

// Menu Management Interfaces
export interface Menu {
  id: string;
  name: string;
  location: MenuLocation;
  items: MenuItem[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  logoUrl?: string;
}

export enum MenuLocation {
  Header = 'Header',
  Footer = 'Footer',
  Sidebar = 'Sidebar'
}

export interface MenuItem {
  id: string;
  title: string;
  url?: string;
  pageId?: string;
  order: number;
  parentId?: string;
  children?: MenuItem[];
  isExternal: boolean;
  isVisible: boolean;
}

// Header/Footer Management Interfaces
export interface SiteHeader {
  id: string;
  logoUrl?: string;
  logoAlt?: string;
  menuId?: string;
  isLocked: boolean;
  mobileBreakpoint: number;
  styles: HeaderStyles;
}

export interface HeaderStyles {
  backgroundColor?: string;
  textColor?: string;
  logoWidth?: string;
  logoHeight?: string;
  padding?: string;
}

export interface SiteFooter {
  id: string;
  menuId?: string;
  copyrightText?: string;
  socialLinks?: SocialLink[];
  isLocked: boolean;
  styles: FooterStyles;
}

export interface FooterStyles {
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
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
  mapType: string; // Changed from optional to required
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
  title: string; // Changed from optional to required
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
