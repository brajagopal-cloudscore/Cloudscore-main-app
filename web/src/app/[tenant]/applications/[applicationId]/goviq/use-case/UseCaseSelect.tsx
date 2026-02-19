// ============================================
// 4. USE CASE SELECT COMPONENT (components/UseCaseSelect.tsx)
// ============================================
import React, { useState } from 'react';
import { Check, Plus, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface UseCaseSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  allowCustom?: boolean;
  disabled?: boolean;
}

export const UseCaseSelect: React.FC<UseCaseSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select use case",
  error,
  allowCustom = true,
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === '__custom__') {
      setShowCustomInput(true);
      setCustomInput(value || '');
    } else {
      onChange(selectedValue);
      setOpen(false);
      setShowCustomInput(false);
    }
  };

  const handleCustomSubmit = () => {
    if (customInput.trim()) {
      onChange(customInput.trim());
      setShowCustomInput(false);
      setOpen(false);
      setCustomInput('');
    }
  };

  const handleCustomCancel = () => {
    setShowCustomInput(false);
    setCustomInput('');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            error && "border-red-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          {!showCustomInput ? (
            <>
              <CommandInput placeholder="Search use cases..." />
              <CommandList>
                <CommandEmpty>No use case found.</CommandEmpty>
                <CommandGroup className="max-h-48 overflow-y-auto">
                  {allowCustom && (
                    <CommandItem
                      value="__custom__"
                      onSelect={() => handleSelect('__custom__')}
                      className="border-t"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add custom use case
                    </CommandItem>
                  )}
                  {options.map((option) => (
                    <CommandItem
                      key={option}
                      value={option}
                      onSelect={() => handleSelect(option)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </>
          ) : (
            <div className="p-4 space-y-3">
              <Label className="text-sm font-medium">Enter custom use case:</Label>
              <Input
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Type your use case"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomSubmit();
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCustomSubmit}>
                  Add
                </Button>
                <Button size="sm" variant="outline" onClick={handleCustomCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};
