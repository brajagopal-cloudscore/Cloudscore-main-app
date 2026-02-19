import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface UseCase {
  id: string;
  function: string;
  useCase: string;
  whatItDoes: string;
  agentPatterns: string[];
  keyInputs: string[];
  primaryOutputs: string[];
  businessImpact: string[];
  region: string[];
  kpis: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  user_createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  user_updatedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export const MultiSelectField = ({
  field,
  options,
  placeholder,
  label,
  data,
  onUpdate,
  formData,
  error,
}: {
  field: keyof UseCase;
  options: string[];
  placeholder: string;
  label: string;
  data: string[];
  onUpdate: (data: any) => void;
  error?: string;
  formData: any;
}) => {
  const handleMultiSelectToggle = (field: keyof UseCase, value: string) => {
    const newValues = data.includes(value)
      ? data.filter((v) => v !== value)
      : [...data, value];

    onUpdate({ ...formData, [field]: newValues });
  };

  const [isOpen, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddCustomValue = () => {
    if (customInput.trim() && !data.includes(customInput.trim())) {
      handleMultiSelectToggle(field, customInput.trim());
      setCustomInput("");
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomValue();
    }
  };

  return (
    <div className="space-y-2">
      <Label className=" text-muted-foreground text-sm font-normal">
        {label} *
      </Label>
      <Popover open={isOpen} onOpenChange={(open) => setOpen(open)}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between h-auto min-h-10 p-3 bg-transparent"
          >
            <div className="flex flex-wrap gap-2">
              {data.length > 0 ? (
                data?.map((value) => (
                  <Badge key={value} variant="secondary" className="text-xs  ">
                    {value}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMultiSelectToggle(field, value);
                      }}
                    />
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foregroun">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            {/* Custom input at the top */}
            <div className="border-b p-2">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  placeholder="Add custom value..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleAddCustomValue}
                  disabled={!customInput.trim()}
                  className=""
                >
                  Add
                </Button>
              </div>
            </div>

            <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>
                <p className="text-sm text-muted-foreground p-2">
                  No options found.
                </p>
              </CommandEmpty>
              <CommandGroup>
                {options?.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => handleMultiSelectToggle(field, option)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        data.includes(option) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const SingleSelectField = ({
  field,
  options,
  placeholder,
  label,
  required = false,
  data,
  onUpdate,
  formData,
  error,
}: {
  field: keyof UseCase;
  options: string[];
  placeholder: string;

  label: string;
  required?: boolean;
  data: string;
  onUpdate: (data: any) => void;
  error?: string;
  formData: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const handleAddCustomValue = () => {
    if (customInput.trim()) {
      onUpdate({ ...formData, [field]: customInput.trim() });
      setCustomInput("");
      setIsOpen(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomValue();
    }
  };

  useEffect(() => {
    if (formData.kpis && formData.kpis.length > 1) {
      onUpdate({
        ...formData,
        kpis: formData.kpis
          ? [formData.kpis[formData.formData.length - 1]]
          : [],
      });
    }
  }, [formData.kpis]);

  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground text-sm font-normal">
        {label} {required && "*"}
      </Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between  bg-transparent"
          >
            <span className={data ? "" : "text-muted-foreground"}>
              {data || placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            {/* Custom input at the top */}
            <div className="border-b p-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom value..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleAddCustomValue}
                  disabled={!customInput.trim()}
                  className="bg-[#18181B] hover:bg-gray-800 text-white"
                >
                  Add
                </Button>
              </div>
            </div>

            <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>
                <p className="text-sm text-muted-foreground p-2">
                  No options found.
                </p>
              </CommandEmpty>
              <CommandGroup>
                {options?.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => {
                      onUpdate(() => {
                        const newData = { ...formData, [field]: option };
                        // Clear useCase when function changes
                        if (field === "function") {
                          newData.useCase = "";
                        }
                        return newData;
                      });
                      setIsOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        data === option ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
