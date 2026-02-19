import { Checkbox } from "@/components/ui/checkbox";
import {
  PopoverTrigger,
  PopoverContent,
  Popover,
} from "@/components/ui/popover";
import { CheckedState } from "@radix-ui/react-checkbox";
import { ChevronDown } from "lucide-react";
import React from "react";
import SearchBox from "../search-box";
import classNames from "classnames";

type Item = { id: string; label: string };
interface Props {
  filterLabel: string;
  selectedItems: Item[];
  items: Item[];
  onSelectionChange: (list: Item[]) => void;
}

const MultiSelectFilter = ({
  filterLabel,
  selectedItems,
  items,
  onSelectionChange,
}: Props) => {
  const [open, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const selectedItemsId = selectedItems?.map((i) => i.id);

  const onCheckedChange = (item: Item, checked: CheckedState) => {
    if (checked === false) {
      const updatedItems = selectedItems.filter((i) => i.id !== item.id);
      onSelectionChange(updatedItems);
    } else {
      const updatedItems = [...selectedItems];
      updatedItems.push(item);
      onSelectionChange(updatedItems);
    }
  };

  return (
    <Popover open={open} onOpenChange={undefined}>
      <PopoverTrigger asChild>
        <div
          className={classNames(
            "flex items-center justify-between  py-2 px-3 border rounded-md  w-auto gap-14  cursor-pointer",
            {
              "hover:bg-muted": selectedItems.length > 0,
            }
          )}
          onClick={() => setIsOpen(true)}
        >
          <div className="flex gap-2">
            <p className="text-sm ">
              {filterLabel}
              {selectedItems.length > 0 ? ":" : ""}
            </p>
            {selectedItems.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedItems.map((i) => i.label).join(", ")}
              </p>
            )}
          </div>

          <ChevronDown size="18px" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 z-50 flex flex-col gap-4 p-0"
      >
        <div className="px-4 pt-4">
          <SearchBox
            searchQuery={searchQuery}
            setSearchQuery={(v) => setSearchQuery(v)}
            placeholder="Search items"
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {items
            .filter((i) =>
              i.label.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((item) => (
              <div className="flex py-2 px-6 gap-3 items-center " key={item.id}>
                <Checkbox
                  id={item.id}
                  checked={selectedItemsId.includes(item.id)}
                  onCheckedChange={(e) => onCheckedChange(item, e)}
                />
                <label
                  htmlFor={item.id}
                  className="text-sm text-muted-foreground"
                >
                  {item.label}
                </label>
              </div>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MultiSelectFilter;
