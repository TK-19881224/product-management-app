// app/AdminInfo.tsx
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
  | "createdBy"
  | "department"
  | "createdAt"
  | "updatedAt"
  | "status"
  | "hiddenReason";

type SortDirection = "asc" | "desc";

export default function AdminInfo({ searchKeyword = "" }: Props) {
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
    const createdAtStr =
      product.createdAt?.toDate().toLocaleString("ja-JP") ?? "";
    const updatedAtStr =
      product.updatedAt?.toDate().toLocaleString("ja-JP") ?? "";

    return [
      product.createdBy?.toString(),
      product.department?.toString(),
      createdAtStr,
      updatedAtStr,
      product.status?.toString(),
      product.hiddenReason?.toString(),
    ]
      .map((field) => (field ?? "").toLowerCase())
      .some((field) => field.includes(keyword));
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const key = sortConfig.key;
    if (!key) return 0;

    let aVal: any = a[key];
    let bVal: any = b[key];

    if (key === "createdAt" || key === "updatedAt") {
      aVal = aVal?.toDate().getTime() ?? 0;
      bVal = bVal?.toDate().getTime() ?? 0;
    } else {
      aVal = aVal ?? "";
      bVal = bVal ?? "";
    }

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

  // ✅ 翻訳付きヘッダー
  const renderSortHeader = (labelKey: SortKey, sortKey: SortKey) => (
    <th
      onClick={() => handleSort(sortKey)}
      className="p-2 border cursor-pointer hover:bg-gray-200"
    >
      {t(`admin.${labelKey}`)}
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
            {renderSortHeader("createdBy", "createdBy")}
            {renderSortHeader("department", "department")}
            {renderSortHeader("createdAt", "createdAt")}
            {renderSortHeader("updatedAt", "updatedAt")}
            {renderSortHeader("status", "status")}
            {renderSortHeader("hiddenReason", "hiddenReason")}
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, index) => (
            <tr key={index}>
              <td className="p-2 border">{item.createdBy}</td>
              <td className="p-2 border">{item.department}</td>
              <td className="p-2 border">
                {item.createdAt?.toDate().toLocaleString("ja-JP") ?? "-"}
              </td>
              <td className="p-2 border">
                {item.updatedAt?.toDate().toLocaleString("ja-JP") ?? "-"}
              </td>
              <td className="p-2 border">{item.status}</td>
              <td className="p-2 border">{item.hiddenReason || "-"}</td>
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