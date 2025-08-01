"use client";

import React, { useState } from "react";
import { useForm, FieldErrors, UseFormRegister } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import Image from "next/image";

import { db, storage } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { productConverter } from "@/lib/productConverter";
import ExportCSV from "./ExportCSV";
import ImportCSV from "./ImportCSV";

// Zod スキーマ
const schema = z.object({
  name: z.string().min(1),
  price: z.number().min(1),
  stock: z.number().min(0),
  minStock: z.number().min(0),
  orderUnit: z.number().min(1),
  supplierCompany: z.string().min(1),
  supplier: z.string().min(1),
  purchasePlace: z.string().min(1),
  purchaseDate: z.string().min(1),
  lotNumber: z.string().min(1),
  manufacturer: z.string().min(1),
  manufacturerName: z.string().min(1),
  origin: z.string().min(1),
  productionDate: z.string().min(1),
  expiryDate: z.string().min(1),
  ingredients: z.string().min(1),
  storageLocation: z.string().min(1),
  temperatureZone: z.string().min(1),
  shippingBase: z.string().min(1),
  packageSize: z.string().min(1),
  weight: z.string().min(1),
  shippingRestriction: z.string().min(1),
  createdBy: z.string().min(1),
  updatedAt: z.string().optional(),
  createdAt: z.string().optional(),
  department: z.string().min(1),
  status: z.string().min(1),
  hiddenReason: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProductForm() {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const onSubmit = async (data: FormData) => {
    try {
      const imageUrls: string[] = [];

      for (const file of imageFiles) {
        const imageRef = ref(storage, `productImages/${Date.now()}_${file.name}`);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        imageUrls.push(url);
      }

      const refDoc = collection(db, "products").withConverter(productConverter);

      const firestoreData = {
        ...data,
        imageUrls,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(refDoc, firestoreData);
      await updateDoc(doc(db, "products", docRef.id), { id: docRef.id });

      reset();
      setImageFiles([]);
      alert(t("form.submitSuccess"));
    } catch (error) {
      console.error("Error adding product:", error);
      alert(t("form.submitError"));
    }
  };

  const fields = [
    {
      sectionKey: "basicInfo",
      inputs: [
        { key: "name", type: "text" },
        { key: "price", type: "number" },
        { key: "stock", type: "number" },
      ],
    },
    {
      sectionKey: "pricingInfo",
      inputs: [
        { key: "minStock", type: "number" },
        { key: "orderUnit", type: "number" },
      ],
    },
    {
      sectionKey: "supplyInfo",
      inputs: [
        { key: "supplierCompany", type: "text" },
        { key: "supplier", type: "text" },
        { key: "purchasePlace", type: "text" },
        { key: "purchaseDate", type: "date" },
        { key: "lotNumber", type: "text" },
      ],
    },
    {
      sectionKey: "productionInfo",
      inputs: [
        { key: "manufacturer", type: "text" },
        { key: "manufacturerName", type: "text" },
        { key: "origin", type: "text" },
        { key: "productionDate", type: "date" },
        { key: "expiryDate", type: "date" },
        { key: "ingredients", type: "text" },
      ],
    },
    {
      sectionKey: "logisticsInfo",
      inputs: [
        { key: "storageLocation", type: "text" },
        { key: "temperatureZone", type: "text" },
        { key: "shippingBase", type: "text" },
        { key: "packageSize", type: "text" },
        { key: "weight", type: "text" },
        { key: "shippingRestriction", type: "text" },
      ],
    },
    {
      sectionKey: "adminInfo",
      inputs: [
        { key: "createdBy", type: "text" },
        { key: "department", type: "text" },
        { key: "status", type: "text" },
        { key: "hiddenReason", type: "text" },
      ],
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-center gap-4 mb-6">
        <ImportCSV />
        <ExportCSV />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {fields.map(({ sectionKey, inputs }) => (
          <section key={sectionKey}>
            <h2 className="text-xl font-semibold mb-2">
              {t(`section.${sectionKey}`)}
            </h2>
            {inputs.map(({ key, type }) => (
              <Field
                key={key}
                label={t(`form.${key}`)}
                name={key as keyof FormData}
                type={type}
                register={register}
                errors={errors}
              />
            ))}
          </section>
        ))}

        {imageFiles.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-2">
            {imageFiles.map((file, index) => (
              <Image
                key={index}
                src={URL.createObjectURL(file)}
                alt={`Preview ${index + 1}`}
                width={128}
                height={128}
                className="rounded border"
              />
            ))}
          </div>
        )}

        <div className="mb-4">
          <label className="block font-semibold mb-1">{t("image.image")}</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = e.target.files ? Array.from(e.target.files) : [];
              setImageFiles(files);
            }}
            className="block"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? t("form.submitting") : t("form.submit")}
        </button>
      </form>
    </div>
  );
}

// Field コンポーネント
type FieldProps = {
  label: string;
  name: keyof FormData;
  type: string;
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
};

function Field({ label, name, type, register, errors }: FieldProps) {
  return (
    <div className="mb-4">
      <label htmlFor={name as string} className="block font-semibold mb-1">
        {label}
      </label>
      <input
        id={name as string}
        type={type}
        {...register(name, { valueAsNumber: type === "number" })}
        className="border border-gray-300 p-2 rounded w-full"
      />
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">
          {errors[name]?.message?.toString()}
        </p>
      )}
    </div>
  );
}