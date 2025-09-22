export type DmmNameObj = { name?: string };

export type DmmItemInfo = {
  actress?: DmmNameObj[];
  director?: DmmNameObj[];
  maker?: DmmNameObj | DmmNameObj[];
};

export type DmmItem = {
  imageURL?: { small?: string; large?: string };
  sampleImageURL?: {
    sample_l?: { image?: string[] };
    sample_s?: { image?: string[] };
  };
  sampleMovieURL?: {
    sampleMovieURL?: { size_720_480?: string };
    size_720_480?: string;
  };
  sample_movie_url?: {
    size_720_480?: string;
  };
  title?: string;
  URL?: string;
  affiliateURL?: string;
  content_id?: string;
  contentid?: string;
  date?: string;
  release_date?: string;
  iteminfo?: DmmItemInfo;
  maker?: DmmNameObj; // sometimes appears at root
};
