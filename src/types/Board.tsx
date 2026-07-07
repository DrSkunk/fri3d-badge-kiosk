export interface Board {
  name: string;
  key: string;
  image: string;
  chipType: string;
  instructions: {
    en: string;
    nl: string;
  };
  firmware: string;
  download?: {
    type: "url" | "esp-zip";
    url: string;
    chip?: string;
  };
}
