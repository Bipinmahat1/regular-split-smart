
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Users, Leaf, DollarSign } from 'lucide-react';

interface SplitResult {
  vegetarianAmount: number;
  nonVegetarianAmount: number;
  sharedAmount: number;
  meatAmountPerPerson: number;
  isValid: boolean;
  error?: string;
}

const ExpenseSplitter = () => {
  const [totalExpenses, setTotalExpenses] = useState<string>('');
  const [meatExpenses, setMeatExpenses] = useState<string>('');
  const [totalPeople, setTotalPeople] = useState<string>('');
  const [vegetarians, setVegetarians] = useState<string>('');
  const [result, setResult] = useState<SplitResult>({
    vegetarianAmount: 0,
    nonVegetarianAmount: 0,
    sharedAmount: 0,
    meatAmountPerPerson: 0,
    isValid: false
  });

  const calculateSplit = () => {
    const total = parseFloat(totalExpenses) || 0;
    const meat = parseFloat(meatExpenses) || 0;
    const people = parseInt(totalPeople) || 0;
    const veggies = parseInt(vegetarians) || 0;

    // Validation
    if (people <= 0) {
      setResult({
        vegetarianAmount: 0,
        nonVegetarianAmount: 0,
        sharedAmount: 0,
        meatAmountPerPerson: 0,
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
        meatAmountPerPerson: 0,
        isValid: false,
        error: 'Vegetarians cannot exceed total people'
      });
      return;
    }

    if (meat > total) {
      setResult({
        vegetarianAmount: 0,
        nonVegetarianAmount: 0,
        sharedAmount: 0,
        meatAmountPerPerson: 0,
        isValid: false,
        error: 'Meat expenses cannot exceed total expenses'
      });
      return;
    }

    if (meat > 0 && (people - veggies) === 0) {
      setResult({
        vegetarianAmount: 0,
        nonVegetarianAmount: 0,
        sharedAmount: 0,
        meatAmountPerPerson: 0,
        isValid: false,
        error: 'Cannot split meat expenses - all participants are vegetarian'
      });
      return;
    }

    // Calculate splits
    const nonVegetarians = people - veggies;
    const sharedExpenses = total - meat;
    const sharedAmountPerPerson = sharedExpenses / people;
    const meatAmountPerPerson = nonVegetarians > 0 ? meat / nonVegetarians : 0;
    
    const vegetarianAmount = sharedAmountPerPerson;
    const nonVegetarianAmount = sharedAmountPerPerson + meatAmountPerPerson;

    setResult({
      vegetarianAmount,
      nonVegetarianAmount,
      sharedAmount: sharedAmountPerPerson,
      meatAmountPerPerson,
      isValid: true
    });
  };

  useEffect(() => {
    calculateSplit();
  }, [totalExpenses, meatExpenses, totalPeople, vegetarians]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
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

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Expense Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="total-expenses" className="text-sm font-medium text-gray-700">
                  Total Expenses ($)
                </Label>
                <Input
                  id="total-expenses"
                  type="number"
                  placeholder="0.00"
                  value={totalExpenses}
                  onChange={(e) => setTotalExpenses(e.target.value)}
                  className="text-lg h-12 border-2 focus:border-green-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meat-expenses" className="text-sm font-medium text-gray-700">
                  Meat Expenses ($)
                </Label>
                <Input
                  id="meat-expenses"
                  type="number"
                  placeholder="0.00"
                  value={meatExpenses}
                  onChange={(e) => setMeatExpenses(e.target.value)}
                  className="text-lg h-12 border-2 focus:border-green-500"
                  min="0"
                  step="0.01"
                />
              </div>

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
            </CardContent>
          </Card>

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
              ) : result.isValid ? (
                <div className="space-y-6">
                  {/* Breakdown */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p>Shared expenses:</p>
                      <p className="font-semibold text-gray-800">
                        {formatCurrency((parseFloat(totalExpenses) || 0) - (parseFloat(meatExpenses) || 0))}
                      </p>
                    </div>
                    <div>
                      <p>Per person (shared):</p>
                      <p className="font-semibold text-gray-800">
                        {formatCurrency(result.sharedAmount)}
                      </p>
                    </div>
                    <div>
                      <p>Meat expenses:</p>
                      <p className="font-semibold text-gray-800">
                        {formatCurrency(parseFloat(meatExpenses) || 0)}
                      </p>
                    </div>
                    <div>
                      <p>Per non-vegetarian (meat):</p>
                      <p className="font-semibold text-gray-800">
                        {formatCurrency(result.meatAmountPerPerson)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Final Amounts:</h3>
                    
                    <div className="space-y-4">
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
                  <p>Enter expense details to see the split calculation</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Example Section */}
        <Card className="shadow-lg border-0 bg-white/60 backdrop-blur">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Example:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Total expenses: $60, Meat expenses: $30</p>
              <p>• Total people: 3, Vegetarians: 1</p>
              <p>• Shared portion ($30) ÷ 3 people = $10 per person</p>
              <p>• Meat portion ($30) ÷ 2 non-vegetarians = $15 each</p>
              <p>• <strong>Result:</strong> Vegetarian pays $10, Non-vegetarians pay $25 each</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpenseSplitter;
