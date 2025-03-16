import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { useState } from "react"

const formSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  foto: z.string().optional(),
  orden: z.coerce.number().min(0, {
    message: "El orden debe ser un número positivo.",
  }),
})

type FormValues = z.infer<typeof formSchema>

interface CategoryFormProps {
  initialData?: {
    id: number;
    nombre: string;
    foto: string | null;
    orden: number;
  } | null;
  companyId: string;
}

export function CategoryForm({ initialData, companyId }: CategoryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: initialData?.nombre || "",
      foto: initialData?.foto || "",
      orden: initialData?.orden || 0,
    },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true)
      if (initialData) {
        await fetch(`/api/categories/${initialData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            companyId,
          }),
        })
      } else {
        await fetch("/api/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            companyId,
          }),
        })
      }
      router.refresh()
      router.push("/dashboard/categories")
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                <Input placeholder="URL de la imagen" {...field} value={field.value || ""} />
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
                <Input type="number" placeholder="Orden de la categoría" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : initialData ? "Guardar cambios" : "Crear categoría"}
        </Button>
      </form>
    </Form>
  )
} 