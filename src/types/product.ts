import { Timestamp } from "firebase/firestore";

export type ProductData = {
  id?: string;
  name: string;
  price: number;
  stock: number;
  minStock: number;
  orderUnit: number;

  supplierCompany: string;
  supplier: string;
  purchasePlace: string;
  purchaseDate: string;
  lotNumber: string;

  manufacturer: string;
  manufacturerName: string;
  origin: string;
  productionDate: string;
  expiryDate: string;
  ingredients: string;

  storageLocation: string;
  temperatureZone: string;
  shippingBase: string;
  packageSize: string;
  weight: string;
  shippingRestriction: string;

  createdBy: string;
  updatedAt: Timestamp;
  createdAt: Timestamp;
  department: string;
  status: string;
  hiddenReason?: string;

  imageUrls?: string[];
};

// Firestoreから取得したデータ（idを含む）
export type Product = ProductData & {
  id: string;
};