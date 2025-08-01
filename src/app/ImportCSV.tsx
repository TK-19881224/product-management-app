"use client";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { productConverter } from "@/lib/productConverter";
import Papa from "papaparse";
import { ProductData } from "@/types/product";
import { useRef } from "react";

export default function ImportCSV() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as ProductData[];

        const ref = collection(db, "products").withConverter(productConverter);

        for (const row of rows) {
          try {
            await addDoc(ref, {
              ...row,
              createdAt: serverTimestamp(),
            });
          } catch (err) {
            console.error("インポート失敗:", err);
          }
        }

        alert("CSVインポート完了！");
      },
    });
  };

  return (
    <div>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="bg-blue-600 hover:bg-blue-700 text-sm font-medium px-4 py-2 min-w-[120px] rounded text-white"
      >
        📥 CSVインポート
      </button>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );
}