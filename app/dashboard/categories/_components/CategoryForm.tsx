"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  foto: z.string().optional(),
  orden: z.coerce.number().min(0, "El orden debe ser mayor o igual a 0"),
});

type FormData = z.infer<typeof formSchema>;

interface CategoryFormProps {
  category?: {
    id: number;
    nombre: string;
    foto: string | null;
    orden: number;
  };
}

export default function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: category?.nombre || "",
      foto: category?.foto || "",
      orden: category?.orden || 0,
    },
  });

  async function onSubmit(data: FormData) {
    try {
      setIsLoading(true);
      const url = category
        ? `/api/categories/${category.id}`
        : "/api/categories";
      const method = category ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al guardar la categoría");
      }

      router.push("/dashboard/categories");
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar la categoría");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Nombre de la categoría" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="foto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de la foto</FormLabel>
              <FormControl>
                <Input placeholder="URL de la imagen" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="orden"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orden</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Orden de la categoría"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {category ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 