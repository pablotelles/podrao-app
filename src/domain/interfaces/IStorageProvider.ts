export interface IStorageProvider {
  upload(path: string, file: File | Blob): Promise<string>; // retorna URL pública
  delete(path: string): Promise<void>;
}
