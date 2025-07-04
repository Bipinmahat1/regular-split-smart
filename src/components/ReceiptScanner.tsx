
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Upload, Loader2, FileText, AlertCircle } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { ExpenseItem } from './ItemEntry';

interface ReceiptScannerProps {
  onItemsExtracted: (items: ExpenseItem[]) => void;
}

interface ExtractedItem {
  name: string;
  amount: number;
  rawText: string;
}

const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onItemsExtracted }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setError('');
    setExtractedText('');

    try {
      // OCR Processing
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      setExtractedText(text);
      console.log('Extracted OCR text:', text);

      // Parse items from OCR text
      const extractedItems = parseReceiptText(text);
      
      if (extractedItems.length === 0) {
        setError('No items could be extracted from the receipt. Please try a clearer image or enter items manually.');
        return;
      }

      // If API key is provided, classify items using AI
      if (apiKey.trim()) {
        const classifiedItems = await classifyItems(extractedItems, apiKey);
        onItemsExtracted(classifiedItems);
      } else {
        // Convert to ExpenseItem format with default category
        const items: ExpenseItem[] = extractedItems.map((item, index) => ({
          id: Date.now().toString() + index,
          name: item.name,
          amount: item.amount,
          category: 'Shared' // Default category
        }));
        onItemsExtracted(items);
        setShowApiKeyInput(true);
      }

    } catch (err) {
      console.error('OCR processing error:', err);
      setError('Failed to process the image. Please try a clearer photo or enter items manually.');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseReceiptText = (text: string): ExtractedItem[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const items: ExtractedItem[] = [];
    
    // Look for patterns like "Item Name $12.99" or "Item Name 12.99"
    const pricePattern = /(\$?[\d,]+\.?\d{0,2})/g;
    
    for (const line of lines) {
      const cleanLine = line.trim();
      const priceMatches = cleanLine.match(pricePattern);
      
      if (priceMatches && priceMatches.length > 0) {
        // Get the last price match (likely the item price)
        const priceStr = priceMatches[priceMatches.length - 1].replace(/[$,]/g, '');
        const amount = parseFloat(priceStr);
        
        if (amount > 0 && amount < 1000) { // Reasonable price range
          // Extract item name (everything before the price)
          const priceIndex = cleanLine.lastIndexOf(priceMatches[priceMatches.length - 1]);
          let name = cleanLine.substring(0, priceIndex).trim();
          
          // Clean up the name
          name = name.replace(/^\d+\s*/, ''); // Remove leading numbers
          name = name.replace(/\s+/g, ' '); // Normalize whitespace
          
          if (name.length > 2) { // Must have a reasonable name
            items.push({
              name,
              amount,
              rawText: cleanLine
            });
          }
        }
      }
    }
    
    return items;
  };

  const classifyItems = async (items: ExtractedItem[], openaiApiKey: string): Promise<ExpenseItem[]> => {
    try {
      const itemNames = items.map(item => item.name).join(', ');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that classifies food items. For each item, respond with only one word: "Vegetarian", "Non-Vegetarian", or "Shared". Shared items are things like drinks, sides, or items that both vegetarians and non-vegetarians would consume.'
            },
            {
              role: 'user',
              content: `Classify these food items: ${itemNames}. Respond with classifications in the same order, separated by commas.`
            }
          ],
          temperature: 0.1,
          max_tokens: 200
        }),
      });

      if (!response.ok) {
        throw new Error('AI classification failed');
      }

      const data = await response.json();
      const classifications = data.choices[0].message.content.split(',').map((c: string) => c.trim());

      return items.map((item, index) => ({
        id: Date.now().toString() + index,
        name: item.name,
        amount: item.amount,
        category: (classifications[index] || 'Shared') as ExpenseItem['category']
      }));

    } catch (err) {
      console.error('AI classification error:', err);
      // Fallback to default classification
      return items.map((item, index) => ({
        id: Date.now().toString() + index,
        name: item.name,
        amount: item.amount,
        category: 'Shared' as ExpenseItem['category']
      }));
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Smart Receipt Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-4">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full h-12"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing Image...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Receipt Image
              </>
            )}
          </Button>

          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {showApiKeyInput && (
            <div className="space-y-2">
              <Label htmlFor="openai-key" className="text-sm font-medium text-gray-700">
                OpenAI API Key (optional - for smart categorization)
              </Label>
              <Input
                id="openai-key"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-gray-500">
                Items will be categorized as "Shared" without API key. You can edit categories manually.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {extractedText && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Extracted Text (for debugging)
              </Label>
              <Textarea
                value={extractedText}
                readOnly
                className="text-xs h-32 bg-gray-50"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceiptScanner;
