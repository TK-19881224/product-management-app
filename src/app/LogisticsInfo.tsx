"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next"; // ✅ 翻訳フック
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { productConverter } from "@/lib/productConverter";
import { ProductData } from "@/types/product";
import Pagination from "./Pagination";

type Props = {
  searchKeyword: string;
};

type SortKey =
  | "storageLocation"
  | "temperatureZone"
  | "shippingBase"
  | "packageSize"
  | "weight"
  | "shippingRestriction";

type SortDirection = "asc" | "desc";

export default function InventoryPricing({ searchKeyword = "" }: Props) {
  const { t } = useTranslation(); // ✅ 翻訳関数

  const [products, setProducts] = useState<ProductData[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey | null;
    direction: SortDirection;
  }>({ key: null, direction: "asc" });

  useEffect(() => {
    const fetchProducts = async () => {
      const ref = collection(db, "products").withConverter(productConverter);
      const snapshot = await getDocs(ref);
      const data = snapshot.docs.map((doc) => doc.data());
      setProducts(data);
    };

    fetchProducts();
  }, []);

  const keyword = searchKeyword.toLowerCase();

  const filteredProducts = products.filter((product) => {
    return [
      product.storageLocation,
      product.temperatureZone,
      product.shippingBase,
      product.packageSize,
      product.weight?.toString(),
      product.shippingRestriction,
    ]
      .map((field) => (field ?? "").toLowerCase())
      .some((field) => field.includes(keyword));
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const key = sortConfig.key;
    if (!key) return 0;

    let aVal: any = a[key];
    let bVal: any = b[key];

    aVal = aVal ?? "";
    bVal = bVal ?? "";

    if (!isNaN(Number(aVal)) && !isNaN(Number(bVal))) {
      aVal = Number(aVal);
      bVal = Number(bVal);
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    return sortConfig.direction === "asc"
      ? aVal.toString().localeCompare(bVal.toString())
      : bVal.toString().localeCompare(aVal.toString());
  });

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // ✅ 翻訳キーを使ったソートヘッダー表示
  const renderSortHeader = (labelKey: SortKey, sortKey: SortKey) => (
    <th
      onClick={() => handleSort(sortKey)}
      className="p-2 border cursor-pointer hover:bg-gray-200"
    >
      {t(`logistics.${labelKey}`)}
      {sortConfig.key === sortKey
        ? sortConfig.direction === "asc"
          ? " ▲"
          : " ▼"
        : ""}
    </th>
  );

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const currentItems = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {renderSortHeader("storageLocation", "storageLocation")}
            {renderSortHeader("temperatureZone", "temperatureZone")}
            {renderSortHeader("shippingBase", "shippingBase")}
            {renderSortHeader("packageSize", "packageSize")}
            {renderSortHeader("weight", "weight")}
            {renderSortHeader("shippingRestriction", "shippingRestriction")}
          </tr>
        </thead>
        <tbody>
          {currentItems.map((product, index) => (
            <tr key={index}>
              <td className="p-2 border">{product.storageLocation}</td>
              <td className="p-2 border">{product.temperatureZone}</td>
              <td className="p-2 border">{product.shippingBase}</td>
              <td className="p-2 border">{product.packageSize}</td>
              <td className="p-2 border">{product.weight}</td>
              <td className="p-2 border">{product.shippingRestriction}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
}