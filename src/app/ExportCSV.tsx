"use client";

import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { productConverter } from "@/lib/productConverter";
import Papa from "papaparse";

export default function ExportCSV() {
  const handleExport = async () => {
    const ref = collection(db, "products").withConverter(productConverter);
    const snapshot = await getDocs(ref);
    const data = snapshot.docs.map(doc => doc.data());

    // CSVに変換
    const csv = Papa.unparse(data);

    // ブラウザからダウンロード
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className="bg-green-600 hover:bg-green-700 text-sm font-medium px-4 py-2 min-w-[120px] rounded text-white"
    >
      📤 CSVエクスポート
    </button>
  );
}