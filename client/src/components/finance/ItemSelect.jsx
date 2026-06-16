import { Label } from "@/components/ui/label"

export function ItemSelect({ items, value, onChange, label = "Item", required = true, allowAll = false }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="item-select">{label}</Label>
      <select
        id="item-select"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        {allowAll ? (
          <option value="">All items</option>
        ) : (
          <option value="">Select an item</option>
        )}
        {items.map((item) => (
          <option key={item._id} value={item._id}>
            {item.Name}
          </option>
        ))}
      </select>
    </div>
  )
}
