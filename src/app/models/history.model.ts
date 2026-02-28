export interface HistoryStory {
  year: string;
  text: string;
}

export interface HistoryItem {
  image: string;
  alt: string;
  stories: HistoryStory[];
}

export interface HistoryData {
  heroTitle: string;
  timeline: HistoryItem[];
}