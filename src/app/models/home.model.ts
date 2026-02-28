export interface HeroSection {
  titleLines: string[];
  buttonText: string;
  buttonLink: string;
}

export interface Card {
  image: string;
  alt?: string;
  title: string;
  buttonText: string;
  type: 'history' | 'product';
}

export interface AboutSection {
  title: string;
  paragraphs: string[];
  linkText: string;
  linkUrl: string;
}

export interface HomeData {
  hero: HeroSection;
  cards: Card[];
  about: AboutSection;
}