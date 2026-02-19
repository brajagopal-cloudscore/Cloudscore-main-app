import { Input, InputProps, Spinner } from "@nextui-org/react";
import { CrossIcon, SearchIcon, X } from "lucide-react";
import React from "react";

interface Props {
  placeholder: string;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  onEnter?: () => void;
}

const SearchBox = ({
  placeholder,
  searchQuery,
  setSearchQuery,
  disabled,
  isLoading,
  onEnter,
  ...rest
}: Props & InputProps) => {
  return (
    <Input
      className="rounded-sm font-[#71717A]   text-sm leading-normal font-normal  "
      {...rest}
      isDisabled={disabled}
      isClearable
      classNames={{
        base: "w-full",
        inputWrapper: "border-1",
      }}
      placeholder={placeholder}
      size="sm"
      startContent={
        isLoading ? (
          <Spinner size="sm" />
        ) : (
          <SearchIcon className="text-muted-foreground mr-3" size={15} />
        )
      }
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      variant="bordered"
      onClear={() => setSearchQuery("")}
      onKeyUp={(e) => {
        if (e.key === "Enter") onEnter?.();
      }}
    />
  );
};

export default SearchBox;
