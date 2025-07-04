
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash } from 'lucide-react';

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  category: 'Total' | 'Shared' | 'Vegetarian' | 'Non-Vegetarian';
}

interface ItemEntryProps {
  items: ExpenseItem[];
  onItemsChange: (items: ExpenseItem[]) => void;
}

const ItemEntry: React.FC<ItemEntryProps> = ({ items, onItemsChange }) => {
  const addItem = () => {
    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      name: '',
      amount: 0,
      category: 'Total'
    };
    onItemsChange([...items, newItem]);
  };

  const removeItem = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof ExpenseItem, value: string | number) => {
    onItemsChange(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Sort items to show Total items first
  const sortedItems = [...items].sort((a, b) => {
    if (a.category === 'Total' && b.category !== 'Total') return -1;
    if (a.category !== 'Total' && b.category === 'Total') return 1;
    return 0;
  });

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Expense Items
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Button onClick={addItem} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
          
          {items.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Amount ($)</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.map((item) => (
                  <TableRow key={item.id} className={item.category === 'Total' ? 'bg-blue-50' : ''}>
                    <TableCell>
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        placeholder={item.category === 'Total' ? "Total bill/receipt" : "Enter item name"}
                        className="min-w-32"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.amount || ''}
                        onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="min-w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.category}
                        onValueChange={(value) => updateItem(item.id, 'category', value as ExpenseItem['category'])}
                      >
                        <SelectTrigger className="min-w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Total">Total</SelectItem>
                          <SelectItem value="Shared">Shared</SelectItem>
                          <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                          <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemEntry;
