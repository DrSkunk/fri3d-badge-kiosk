export interface AssetStatus {
  key: string;
  name: string;
  fileName: string;
  installed: boolean;
  size: number | null;
  modifiedAt: string | null;
  version: string | null;
  downloadedAt: string | null;
}

export interface AssetsStatus {
  flashers: AssetStatus[];
  firmware: AssetStatus[];
}
