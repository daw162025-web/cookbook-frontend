export interface Category {
  id: number;
  name: string;
  image_url?: string;
  description?: string;
  parent_id?: number | null;
  children?: Category[];
}