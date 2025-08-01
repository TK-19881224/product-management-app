// lib/productConverter.ts

import { ProductData } from "@/types/product";
import { Timestamp, DocumentData, FirestoreDataConverter } from "firebase/firestore";

export const productConverter: FirestoreDataConverter<ProductData> = {
  toFirestore(product: ProductData): DocumentData {
    return {
      ...product,
    };
  },
  fromFirestore(snapshot, options): ProductData {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: data.name,
      price: data.price,
      stock: data.stock,
      minStock: data.minStock,
      orderUnit: data.orderUnit,

      supplierCompany: data.supplierCompany,
      supplier: data.supplier,
      purchasePlace: data.purchasePlace,
      purchaseDate: data.purchaseDate,
      lotNumber: data.lotNumber,

      manufacturer: data.manufacturer,
      manufacturerName: data.manufacturerName,
      origin: data.origin,
      productionDate: data.productionDate,
      expiryDate: data.expiryDate,
      ingredients: data.ingredients,

      storageLocation: data.storageLocation,
      temperatureZone: data.temperatureZone,
      shippingBase: data.shippingBase,
      packageSize: data.packageSize,
      weight: data.weight,
      shippingRestriction: data.shippingRestriction,

      createdBy: data.createdBy,
      updatedAt: data.updatedAt instanceof Timestamp
        ? data.updatedAt
        : Timestamp.fromDate(new Date(data.updatedAt)),
      createdAt: data.createdAt instanceof Timestamp
        ? data.createdAt
        : Timestamp.fromDate(new Date(data.createdAt)),
      department: data.department,
      status: data.status,
      hiddenReason: data.hiddenReason,

      imageUrls: data.imageUrls ?? [],
    };
  },
};