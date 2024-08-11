export interface Board {
  name: string;
  key: string;
  image: string;
  flashType: string;
  instructions: {
    en: string;
    nl: string;
  };
  firmware: string;
}
