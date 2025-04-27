export interface Category {
    id: string;
    name: string;
    color: string;
    icon?: string;
  }
  
  // Predefined categories
  export const categories: Category[] = [
    { id: "groceries", name: "Groceries", color: "#4f46e5" },
    { id: "dining", name: "Dining Out", color: "#ef4444" },
    { id: "utilities", name: "Utilities", color: "#10b981" },
    { id: "transportation", name: "Transportation", color: "#f59e0b" },
    { id: "entertainment", name: "Entertainment", color: "#8b5cf6" },
    { id: "shopping", name: "Shopping", color: "#ec4899" },
    { id: "healthcare", name: "Healthcare", color: "#06b6d4" },
    { id: "housing", name: "Housing", color: "#f97316" },
    { id: "education", name: "Education", color: "#14b8a6" },
    { id: "other", name: "Other", color: "#6b7280" },
  ];
  
  // Function to get category by id
  export function getCategoryById(id: string): Category {
    return categories.find((cat) => cat.id === id) || categories[categories.length - 1];
  }
  
  // Function to get all category names for dropdown
  export function getCategoryOptions() {
    return categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    }));
  }