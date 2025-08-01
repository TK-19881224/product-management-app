"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { productConverter } from "@/lib/productConverter";
import { useTranslation } from "react-i18next";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  minStock: number;
  imageUrls?: string[];
  hidden?: boolean;
};

type SortKey = "name" | "price" | "stock" | "minStock";

export default function ProductList({ searchKeyword }: { searchKeyword: string }) {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchProducts = async () => {
    const snapshot = await getDocs(
      collection(db, "products").withConverter(productConverter)
    );
    const data = snapshot.docs.map((doc) => doc.data());
    console.log("Fetched products:", data);
    setProducts(data);
  };

  const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, "products", id));
    fetchProducts();
  };

  const toggleHidden = async (id: string, currentHidden: boolean = false) => {
    const productRef = doc(db, "products", id);
    try {
      await updateDoc(productRef, {
        hidden: !currentHidden,
      });
      console.log(`Toggled hidden status for ${id} to ${!currentHidden}`);
      fetchProducts();
    } catch (error) {
      console.error("Error updating hidden status:", error);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2 flex-wrap items-center">
        <span className="font-semibold"></span>
        {(["name", "price", "stock", "minStock"] as SortKey[]).map((key) => (
          <button
            key={key}
            onClick={() => handleSort(key)}
            className={`px-3 py-1 rounded border ${
              sortKey === key ? "bg-blue-500 text-white" : "bg-gray-100"
            }`}
          >
            {t(`product.${key}`)}
            {sortKey === key && (sortOrder === "asc" ? " ↑" : " ↓")}
          </button>
        ))}
      </div>

      <ul className="space-y-4">
        {sortedProducts.map((product) => (
          <li key={product.id} className="border p-4 rounded-md shadow-md">
            <div className="flex">
              <div className="flex-1">
                <p className="font-semibold">{product.name}</p>
                <p>{t("product.price")}: {product.price}</p>
                <p>{t("product.stock")}: {product.stock}</p>
                <p>{t("product.minStock")}: {product.minStock}</p>

                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    {t("product.delete")}
                  </button>

                </div>
              </div>

              {product.imageUrls && product.imageUrls.length > 0 && (
                <div className="flex gap-2 ml-4 flex-wrap">
                  {product.imageUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`${t("product.name")} ${index + 1}`}
                      className="w-24 h-24 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}