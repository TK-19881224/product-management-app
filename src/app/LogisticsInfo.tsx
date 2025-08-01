"use client";

import React, { useEffect, useState, KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  const [products, setProducts] = useState<ProductData[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey | null;
    direction: SortDirection;
  }>({ key: null, direction: "asc" });

  useEffect(() => {
    const fetchProducts = async () => {
      const ref = collection(db, "products").withConverter(productConverter);
      const snapshot = await getDocs(ref);
      const data = snapshot.docs.map((doc) => doc.data() as ProductData);
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
      .map((field) => (field ?? "").toString().toLowerCase())
      .some((field) => field.includes(keyword));
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const { key, direction } = sortConfig;
    if (!key) return 0;

    const aVal = a[key];
    const bVal = b[key];

    const aCompare: string | number = aVal ?? "";
    const bCompare: string | number = bVal ?? "";

    if (!isNaN(Number(aCompare)) && !isNaN(Number(bCompare))) {
      return direction === "asc"
        ? Number(aCompare) - Number(bCompare)
        : Number(bCompare) - Number(aCompare);
    }

    return direction === "asc"
      ? aCompare.toString().localeCompare(bCompare.toString())
      : bCompare.toString().localeCompare(aCompare.toString());
  });

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const renderSortHeader = (labelKey: SortKey, sortKey: SortKey) => (
    <th
      onClick={() => handleSort(sortKey)}
      className="p-2 border cursor-pointer hover:bg-gray-200 select-none"
      role="button"
      tabIndex={0}
      onKeyDown={(e: KeyboardEvent<HTMLTableCellElement>) => {
        if (e.key === "Enter" || e.key === " ") handleSort(sortKey);
      }}
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