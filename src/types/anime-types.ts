export interface AnimeFields {
  title: string;
  enTitle: string | null;
  description: string;
  rating: number | null;
  startDate: string;
  endDate: string | null;
  subtype: Subtype;
  status: Status;
  posterImage: string;
  coverImage: string | null;
  episodeCount: number | null;
  categories: string[];
}

export interface Anime extends AnimeFields {
  id: number;
}

export enum Subtype {
  ONA = 'ONA',
  OVA = 'OVA',
  TV = 'TV',
  MOVIE = 'movie'
}

export enum Status {
  CURRENT = 'current',
  FINISHED = 'finished',
  UPCOMING = 'upcoming',
}
