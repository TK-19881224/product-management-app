"use client";

import React, { useEffect, useState } from "react";
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
  | "manufacturer"
  | "manufacturerName"
  | "origin"
  | "productionDate"
  | "expiryDate"
  | "ingredients";

type SortDirection = "asc" | "desc";

export default function ProductionInfo({ searchKeyword = "" }: Props) {
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
      const data = snapshot.docs.map((doc) => doc.data());
      setProducts(data);
    };

    fetchProducts();
  }, []);

  const keyword = searchKeyword.toLowerCase();

  const filteredProducts = products.filter((product) =>
    [
      product.manufacturer,
      product.manufacturerName,
      product.origin,
      product.productionDate?.toString(),
      product.expiryDate?.toString(),
      product.ingredients,
    ]
      .map((field) => (field ?? "").toLowerCase())
      .some((field) => field.includes(keyword))
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const key = sortConfig.key;
    if (!key) return 0;

    let aVal: any = a[key];
    let bVal: any = b[key];

    if (key === "productionDate" || key === "expiryDate") {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
    }

    aVal = aVal ?? "";
    bVal = bVal ?? "";

    if (typeof aVal === "number" && typeof bVal === "number") {
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

  // ⬅ 翻訳付きヘッダー表示
  const renderSortHeader = (labelKey: SortKey, sortKey: SortKey) => (
    <th
      onClick={() => handleSort(sortKey)}
      className="p-2 border cursor-pointer hover:bg-gray-200"
    >
      {t(`production.${labelKey}`)}
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
            {renderSortHeader("manufacturer", "manufacturer")}
            {renderSortHeader("manufacturerName", "manufacturerName")}
            {renderSortHeader("origin", "origin")}
            {renderSortHeader("productionDate", "productionDate")}
            {renderSortHeader("expiryDate", "expiryDate")}
            {renderSortHeader("ingredients", "ingredients")}
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, index) => (
            <tr key={index}>
              <td className="p-2 border">{item.manufacturer}</td>
              <td className="p-2 border">{item.manufacturerName}</td>
              <td className="p-2 border">{item.origin}</td>
              <td className="p-2 border">
                {item.productionDate
                  ? new Date(item.productionDate).toLocaleDateString()
                  : "-"}
              </td>
              <td className="p-2 border">
                {item.expiryDate
                  ? new Date(item.expiryDate).toLocaleDateString()
                  : "-"}
              </td>
              <td className="p-2 border">{item.ingredients}</td>
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