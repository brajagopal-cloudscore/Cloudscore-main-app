import React, { useState } from 'react';
import { Button } from '../ui/button';
import { IoClose } from 'react-icons/io5';

interface Props {
  src: string;
  alt: string;
}

const ImageModal = ({ src, alt }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <div className="relative inline-block">
      <div className="border border-gray-200 cursor-pointer hover:scale-[1.02]  rounded-md overflow-hidden transition-all shadow-[4px_6px_16px_14px_#1C57EE0F] hover:shadow-[4px_16px_26px_12px_#1C57EE0F]">
        <img
          src={src}
          alt={alt}
          onClick={openModal}
          className=" h-auto w-fit max-w-[400px]  mb-4"
        />
      </div>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={src}
              alt={alt}
              className="m-auto max-h-[80vh] max-w-[80vh]"
            />
            <div className="w-full  flex items-center justify-center">
              <Button
                variant="outline"
                size="icon"
                className="rounded-3xl mt-8 hover:scale-105 cursor-pointer"
                onClick={closeModal}
              >
                <IoClose className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageModal;
