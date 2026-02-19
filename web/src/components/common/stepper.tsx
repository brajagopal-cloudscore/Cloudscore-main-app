import React from 'react';
import cn from 'classnames';
import { IoIosCheckmarkCircle } from 'react-icons/io';
import { FaRegCircleDot } from 'react-icons/fa6';
import { Check } from 'lucide-react';

export interface IStep {
  label: string;
  key: number;
  // [INFO] - can be introduced in future to support more customizations to each step
  // defaultIcon: JSX.Element;
  // activeIcon: JSX.Element;
}

interface Props {
  activeStep: IStep;
  steps: IStep[];
  setActiveStep: (step: IStep) => void;
}

const Stepper = ({ activeStep, steps }: Props) => {
  return (
    <div className="flex items-center justify-start py-6 w-full">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center">
          <div className="flex items-center">
            <div
              className={` rounded-full flex items-center justify-center  ${
                activeStep.key > step.key
                  ? 'bg-[#3D3D3D] text-white w-5 h-5'
                  : 'bg-white text-[#3D3D3D] w-0 h-0'
              }`}
            >
              {activeStep.key > step.key ? (
                <Check className="w-3 h-3" />
              ) : (
                <></>
              )}
            </div>
            <span
              className={` text-sm font-medium ${
                activeStep.key >= step.key
                  ? 'text-[#3D3D3D] ml-3'
                  : 'text-[#D1D1D1] '
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-[58px] h-[1px] mx-[12px] ${
                activeStep.key > step.key ? 'bg-[#3D3D3D]' : 'bg-[#E2E8F0]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default Stepper;
