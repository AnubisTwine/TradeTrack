import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus } from "lucide-react";

const tradeSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").toUpperCase(),
  side: z.enum(["LONG", "SHORT"], { required_error: "Side is required" }),
  quantity: z.number().positive("Quantity must be positive"),
  entryPrice: z.number().positive("Entry price must be positive"),
  exitPrice: z.number().positive("Exit price must be positive").optional(),
  entryDate: z.string().min(1, "Entry date is required"),
  exitDate: z.string().optional(),
  commission: z.number().min(0, "Commission cannot be negative").optional(),
  instrumentType: z.enum(["stock", "option", "futures", "forex", "crypto"]),
  strategy: z.string().optional(),
  notes: z.string().optional(),
  isOpen: z.boolean().default(false),
});

type TradeFormData = z.infer<typeof tradeSchema>;

export default function ManualEntry() {
  const { toast } = useToast();
  
  const form = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      side: "LONG",
      instrumentType: "stock",
      commission: 0,
      isOpen: false,
      entryDate: new Date().toISOString().split('T')[0],
    },
  });

  const createTradeMutation = useMutation({
    mutationFn: async (data: TradeFormData) => {
      // Convert form data to the correct format
      const tradeData = {
        ...data,
        entryDate: new Date(data.entryDate + 'T00:00:00Z'),
        exitDate: data.exitDate ? new Date(data.exitDate + 'T00:00:00Z') : undefined,
      };

      const response = await apiRequest('POST', '/api/trades', tradeData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Trade Added",
        description: "Trade has been successfully added to your journal",
      });
      
      form.reset({
        side: "LONG",
        instrumentType: "stock", 
        commission: 0,
        isOpen: false,
        entryDate: new Date().toISOString().split('T')[0],
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add trade",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TradeFormData) => {
    createTradeMutation.mutate(data);
  };

  const isOpen = form.watch("isOpen");

  return (
    <>
      {/* Header */}
      <header className="bg-dark-card border-b border-dark-border px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold">Manual Entry</h2>
          <p className="text-text-muted text-sm">Add trades manually to your journal</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-dark-card border-dark-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Add New Trade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Trade Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="symbol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Symbol</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="AAPL"
                              className="bg-dark-bg border-dark-border uppercase"
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="side"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Side</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-dark-bg border-dark-border">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-dark-card border-dark-border">
                              <SelectItem value="LONG">Long</SelectItem>
                              <SelectItem value="SHORT">Short</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder="100"
                              className="bg-dark-bg border-dark-border"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="instrumentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instrument Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-dark-bg border-dark-border">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-dark-card border-dark-border">
                              <SelectItem value="stock">Stock</SelectItem>
                              <SelectItem value="option">Option</SelectItem>
                              <SelectItem value="futures">Futures</SelectItem>
                              <SelectItem value="forex">Forex</SelectItem>
                              <SelectItem value="crypto">Crypto</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Price and Date Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="entryPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Entry Price</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              placeholder="175.42"
                              className="bg-dark-bg border-dark-border"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="exitPrice" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exit Price {isOpen && "(Optional - Open Position)"}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              placeholder="178.91"
                              className="bg-dark-bg border-dark-border"
                              disabled={isOpen}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="entryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Entry Date</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              className="bg-dark-bg border-dark-border"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="exitDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exit Date {isOpen && "(Optional - Open Position)"}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              className="bg-dark-bg border-dark-border"
                              disabled={isOpen}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="commission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commission</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              placeholder="2.50"
                              className="bg-dark-bg border-dark-border"
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="strategy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Strategy (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Momentum, Reversal, etc."
                              className="bg-dark-bg border-dark-border"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Open Position Toggle */}
                  <FormField
                    control={form.control}
                    name="isOpen"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-dark-border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Open Position</FormLabel>
                          <div className="text-sm text-text-muted">
                            Mark this trade as still open (no exit price required)
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Add any notes about this trade..."
                            className="bg-dark-bg border-dark-border h-24"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-info-blue hover:bg-blue-600 transition-colors"
                    disabled={createTradeMutation.isPending}
                  >
                    {createTradeMutation.isPending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Adding Trade...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Add Trade
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
