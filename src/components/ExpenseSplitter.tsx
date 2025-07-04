import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Users, Leaf, DollarSign } from 'lucide-react';
import ItemEntry, { ExpenseItem } from './ItemEntry';
import ReceiptScanner from './ReceiptScanner';

interface SplitResult {
  vegetarianAmount: number;
  nonVegetarianAmount: number;
  sharedAmount: number;
  vegetarianOnlyAmount: number;
  nonVegetarianOnlyAmount: number;
  isValid: boolean;
  error?: string;
}

interface CategoryTotals {
  total: number;
  shared: number;
  vegetarian: number;
  nonVegetarian: number;
  itemizedTotal: number;
  remainingAmount: number;
}

const ExpenseSplitter = () => {
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [totalPeople, setTotalPeople] = useState<string>('');
  const [vegetarians, setVegetarians] = useState<string>('');
  const [result, setResult] = useState<SplitResult>({
    vegetarianAmount: 0,
    nonVegetarianAmount: 0,
    sharedAmount: 0,
    vegetarianOnlyAmount: 0,
    nonVegetarianOnlyAmount: 0,
    isValid: false
  });

  const calculateCategoryTotals = (): CategoryTotals => {
    const totals = items.reduce((acc, item) => {
      switch (item.category) {
        case 'Total':
          acc.total += item.amount;
          break;
        case 'Shared':
          acc.shared += item.amount;
          break;
        case 'Vegetarian':
          acc.vegetarian += item.amount;
          break;
        case 'Non-Vegetarian':
          acc.nonVegetarian += item.amount;
          break;
      }
      return acc;
    }, { total: 0, shared: 0, vegetarian: 0, nonVegetarian: 0 });

    const itemizedTotal = totals.shared + totals.vegetarian + totals.nonVegetarian;
    const remainingAmount = totals.total - itemizedTotal;

    return {
      ...totals,
      itemizedTotal,
      remainingAmount
    };
  };

  const calculateSplit = () => {
    const people = parseInt(totalPeople) || 0;
    const veggies = parseInt(vegetarians) || 0;
    const categoryTotals = calculateCategoryTotals();

    // Validation
    if (people <= 0) {
      setResult({
        vegetarianAmount: 0,
        nonVegetarianAmount: 0,
        sharedAmount: 0,
        vegetarianOnlyAmount: 0,
        nonVegetarianOnlyAmount: 0,
        isValid: false,
        error: 'Total people must be greater than 0'
      });
      return;
    }

    if (veggies > people) {
      setResult({
        vegetarianAmount: 0,
        nonVegetarianAmount: 0,
        sharedAmount: 0,
        vegetarianOnlyAmount: 0,
        nonVegetarianOnlyAmount: 0,
        isValid: false,
        error: 'Vegetarians cannot exceed total people'
      });
      return;
    }

    if (categoryTotals.nonVegetarian > 0 && (people - veggies) === 0) {
      setResult({
        vegetarianAmount: 0,
        nonVegetarianAmount: 0,
        sharedAmount: 0,
        vegetarianOnlyAmount: 0,
        nonVegetarianOnlyAmount: 0,
        isValid: false,
        error: 'Cannot split non-vegetarian expenses - all participants are vegetarian'
      });
      return;
    }

    if (categoryTotals.vegetarian > 0 && veggies === 0) {
      setResult({
        vegetarianAmount: 0,
        nonVegetarianAmount: 0,
        sharedAmount: 0,
        vegetarianOnlyAmount: 0,
        nonVegetarianOnlyAmount: 0,
        isValid: false,
        error: 'Cannot split vegetarian expenses - no vegetarians in the group'
      });
      return;
    }

    // Calculate splits - include remaining amount in shared expenses
    const nonVegetarians = people - veggies;
    const totalSharedAmount = categoryTotals.shared + categoryTotals.remainingAmount;
    const sharedAmountPerPerson = totalSharedAmount / people;
    const vegetarianOnlyAmountPerPerson = veggies > 0 ? categoryTotals.vegetarian / veggies : 0;
    const nonVegetarianOnlyAmountPerPerson = nonVegetarians > 0 ? categoryTotals.nonVegetarian / nonVegetarians : 0;
    
    const vegetarianAmount = sharedAmountPerPerson + vegetarianOnlyAmountPerPerson;
    const nonVegetarianAmount = sharedAmountPerPerson + nonVegetarianOnlyAmountPerPerson;

    setResult({
      vegetarianAmount,
      nonVegetarianAmount,
      sharedAmount: sharedAmountPerPerson,
      vegetarianOnlyAmount: vegetarianOnlyAmountPerPerson,
      nonVegetarianOnlyAmount: nonVegetarianOnlyAmountPerPerson,
      isValid: true
    });
  };

  const handleReceiptItems = (extractedItems: ExpenseItem[]) => {
    setItems([...items, ...extractedItems]);
  };

  useEffect(() => {
    calculateSplit();
  }, [items, totalPeople, vegetarians]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const categoryTotals = calculateCategoryTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calculator className="h-8 w-8 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-900">Regular Split</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Fair expense splitting for vegetarians and non-vegetarians
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Receipt Scanner Section */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <ReceiptScanner onItemsExtracted={handleReceiptItems} />
              <ItemEntry items={items} onItemsChange={setItems} />
            </div>
          </div>

          {/* People Details Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                People Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="total-people" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Total People
                </Label>
                <Input
                  id="total-people"
                  type="number"
                  placeholder="0"
                  value={totalPeople}
                  onChange={(e) => setTotalPeople(e.target.value)}
                  className="text-lg h-12 border-2 focus:border-green-500"
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vegetarians" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Leaf className="h-4 w-4 text-green-600" />
                  Number of Vegetarians
                </Label>
                <Input
                  id="vegetarians"
                  type="number"
                  placeholder="0"
                  value={vegetarians}
                  onChange={(e) => setVegetarians(e.target.value)}
                  className="text-lg h-12 border-2 focus:border-green-500"
                  min="0"
                />
              </div>

              {/* Category Totals */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Expense Breakdown:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Bill:</span>
                    <span className="font-medium">{formatCurrency(categoryTotals.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shared:</span>
                    <span className="font-medium">{formatCurrency(categoryTotals.shared)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vegetarian:</span>
                    <span className="font-medium">{formatCurrency(categoryTotals.vegetarian)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Non-Vegetarian:</span>
                    <span className="font-medium">{formatCurrency(categoryTotals.nonVegetarian)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Itemized Total:</span>
                    <span>{formatCurrency(categoryTotals.itemizedTotal)}</span>
                  </div>
                  {categoryTotals.remainingAmount !== 0 && (
                    <div className="flex justify-between text-xs">
                      <span className={categoryTotals.remainingAmount > 0 ? 'text-orange-600' : 'text-red-600'}>
                        {categoryTotals.remainingAmount > 0 ? 'Remaining (taxes/fees):' : 'Over itemized:'}
                      </span>
                      <span className={categoryTotals.remainingAmount > 0 ? 'text-orange-600' : 'text-red-600'}>
                        {formatCurrency(Math.abs(categoryTotals.remainingAmount))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Split Results
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {result.error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 font-medium">{result.error}</p>
              </div>
            ) : result.isValid && (categoryTotals.total > 0 || categoryTotals.itemizedTotal > 0) ? (
              <div className="space-y-6">
                {/* Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <p>Shared per person:</p>
                    <p className="font-semibold text-gray-800">
                      {formatCurrency(result.sharedAmount)}
                    </p>
                  </div>
                  <div>
                    <p>Vegetarian per person:</p>
                    <p className="font-semibold text-gray-800">
                      {formatCurrency(result.vegetarianOnlyAmount)}
                    </p>
                  </div>
                  <div>
                    <p>Non-veg per person:</p>
                    <p className="font-semibold text-gray-800">
                      {formatCurrency(result.nonVegetarianOnlyAmount)}
                    </p>
                  </div>
                  <div>
                    <p>Non-vegetarians:</p>
                    <p className="font-semibold text-gray-800">
                      {parseInt(totalPeople) - parseInt(vegetarians || '0')}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Final Amounts:</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Leaf className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800">Each Vegetarian Pays</span>
                      </div>
                      <p className="text-2xl font-bold text-green-700">
                        {formatCurrency(result.vegetarianAmount)}
                      </p>
                    </div>

                    <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-orange-600" />
                        <span className="font-medium text-orange-800">Each Non-Vegetarian Pays</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-700">
                        {formatCurrency(result.nonVegetarianAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Add expense items and enter people details to see the split calculation</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-gray-600 text-sm">
            Created by <span className="font-semibold text-gray-800">Bipin Mahat</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExpenseSplitter;
