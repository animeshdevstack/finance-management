import { Label } from "@/components/ui/label"

export function CategorySelect({
  categories,
  value,
  onChange,
  label = "Category",
  required = true,
  allowAll = false,
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="category-select">{label}</Label>
      <select
        id="category-select"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        {allowAll ? (
          <option value="">All categories</option>
        ) : (
          <option value="">Select a category</option>
        )}
        {categories.map((category) => (
          <option key={category._id} value={category._id}>
            {category.Name}
          </option>
        ))}
      </select>
    </div>
  )
}
