// Bundles every templates/*.json into one map for the Worker (which can't
// readdir at runtime). esbuild inlines these at build time, so adding a new
// template means adding one import line + one map entry here.

import Article from '../templates/Article.json';
import BreadcrumbList from '../templates/BreadcrumbList.json';
import Course from '../templates/Course.json';
import Dataset from '../templates/Dataset.json';
import DefinedTerm from '../templates/DefinedTerm.json';
import DefinedTermSet from '../templates/DefinedTermSet.json';
import Event from '../templates/Event.json';
import FAQPage from '../templates/FAQPage.json';
import HowTo from '../templates/HowTo.json';
import HowToTip from '../templates/HowToTip.json';
import ItemList from '../templates/ItemList.json';
import JobPosting from '../templates/JobPosting.json';
import LocalBusiness from '../templates/LocalBusiness.json';
import Organization from '../templates/Organization.json';
import Product from '../templates/Product.json';
import ProfilePage from '../templates/ProfilePage.json';
import QAPage from '../templates/QAPage.json';
import Recipe from '../templates/Recipe.json';
import Review from '../templates/Review.json';
import Service from '../templates/Service.json';
import SoftwareApplication from '../templates/SoftwareApplication.json';
import VideoObject from '../templates/VideoObject.json';
import WebSite from '../templates/WebSite.json';

export const TEMPLATES = {
  Article,
  BreadcrumbList,
  Course,
  Dataset,
  DefinedTerm,
  DefinedTermSet,
  Event,
  FAQPage,
  HowTo,
  HowToTip,
  ItemList,
  JobPosting,
  LocalBusiness,
  Organization,
  Product,
  ProfilePage,
  QAPage,
  Recipe,
  Review,
  Service,
  SoftwareApplication,
  VideoObject,
  WebSite,
};
