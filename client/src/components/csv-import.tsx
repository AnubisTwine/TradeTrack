import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

const brokerOptions = [
  { value: "generic", label: "Generic CSV" },
  { value: "interactive_brokers", label: "Interactive Brokers" },
  { value: "tradestation", label: "TradeStation" },
  { value: "tastytrade", label: "TastyTrade" },
  { value: "robinhood", label: "Robinhood" },
];

interface CsvImportProps {
  onImportComplete?: () => void;
}

export default function CsvImport({ onImportComplete }: CsvImportProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedBroker, setSelectedBroker] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const importMutation = useMutation({
    mutationFn: async ({ file, broker }: { file: File; broker: string }) => {
      const formData = new FormData();
      formData.append('csvFile', file);
      formData.append('broker', broker);

      const response = await apiRequest('POST', '/api/trades/import', formData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Import Successful",
        description: `Successfully imported ${data.imported} trades. ${data.errors > 0 ? `${data.errors} errors encountered.` : ''}`,
      });
      
      // Reset form
      setSelectedFile(null);
      setSelectedBroker("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      
      onImportComplete?.();
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import CSV file",
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid File",
          description: "Please select a CSV file",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid File",
          description: "Please select a CSV file",
          variant: "destructive",
        });
      }
    }
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to import",
        variant: "destructive",
      });
      return;
    }

    if (!selectedBroker) {
      toast({
        title: "No Broker Selected",
        description: "Please select your broker format",
        variant: "destructive",
      });
      return;
    }

    importMutation.mutate({ file: selectedFile, broker: selectedBroker });
  };

  return (
    <Card className="bg-dark-card border-dark-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Import Trades from CSV</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            dragActive
              ? "border-info-blue/50 bg-info-blue/5"
              : selectedFile
              ? "border-profit-green/50 bg-profit-green/5"
              : "border-dark-border hover:border-info-blue/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {selectedFile ? (
            <div className="space-y-2">
              <FileText className="w-12 h-12 text-profit-green mx-auto" />
              <p className="text-sm font-medium text-profit-green">File Selected</p>
              <p className="text-sm text-text-muted">{selectedFile.name}</p>
              <p className="text-xs text-text-muted">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-12 h-12 text-text-muted mx-auto" />
              <p className="text-sm text-text-muted mb-2">Drop CSV file here or click to browse</p>
              <Button variant="outline" size="sm" className="border-info-blue/20 text-info-blue hover:bg-info-blue/10">
                Browse Files
              </Button>
            </div>
          )}
        </div>

        {/* Broker Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Broker Format</label>
          <Select value={selectedBroker} onValueChange={setSelectedBroker}>
            <SelectTrigger className="bg-dark-bg border-dark-border">
              <SelectValue placeholder="Select your broker" />
            </SelectTrigger>
            <SelectContent className="bg-dark-card border-dark-border">
              {brokerOptions.map((broker) => (
                <SelectItem key={broker.value} value={broker.value}>
                  {broker.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Format Information */}
        {selectedBroker && (
          <div className="bg-info-blue/10 border border-info-blue/20 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-info-blue mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-info-blue mb-1">CSV Format Requirements</h4>
                <p className="text-xs text-text-muted">
                  {selectedBroker === "generic" && "Required columns: Symbol, Side, Quantity, EntryPrice, ExitPrice (optional), EntryDate"}
                  {selectedBroker === "interactive_brokers" && "Standard IBKR Activity Statement CSV format"}
                  {selectedBroker === "tradestation" && "TradeStation order export format"}
                  {selectedBroker === "tastytrade" && "TastyTrade account statement format"}
                  {selectedBroker === "robinhood" && "Robinhood order history export"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Import Button */}
        <Button
          onClick={handleImport}
          disabled={!selectedFile || !selectedBroker || importMutation.isPending}
          className="w-full bg-info-blue hover:bg-blue-600 transition-colors"
        >
          {importMutation.isPending ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Importing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Import Trades
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
