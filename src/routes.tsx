import { lazy } from 'react';

// Public Routes
export const LandingPage = lazy(() => import('./pages/LandingPage'));
export const Login = lazy(() => import('./Login'));
export const AboutUsPage = lazy(() => import('./pages/AboutUsPage'));
export const BlogPage = lazy(() => import('./pages/BlogPage'));

// Protected Routes
export const HomePage = lazy(() => import('./pages/HomePage'));
export const ToursPage = lazy(() => import('./pages/ToursPage'));
export const CityToursPage = lazy(() => import('./pages/CityToursPage'));
export const MyToursPage = lazy(() => import('./pages/MyToursPage'));
export const MyProfilePage = lazy(() => import('./pages/MyProfilePage'));
export const MyAccountPage = lazy(() => import('./pages/MyAccountPage'));

// Admin Routes
export const BackOfficeHome = lazy(() => import('./pages/BackOfficeHome'));
export const TourCreatorPage = lazy(() => import('./pages/TourCreatorPage'));
export const TourEditorPage = lazy(() => import('./pages/TourEditorPage'));
export const EditTourPage = lazy(() => import('./pages/EditTourPage'));
export const TourSelectorPage = lazy(() => import('./pages/TourSelectorPage'));
export const CollectionsEditor = lazy(() => import('./pages/CollectionsEditor')); 