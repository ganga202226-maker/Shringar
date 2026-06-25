import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ProgressStepperProps {
  steps: { label: string; description?: string }[];
  currentStep: number;
  className?: string;
}

export function ProgressStepper({
  steps,
  currentStep,
  className,
}: ProgressStepperProps) {
  return (
    <div className={cn('flex items-start w-full', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  isCompleted && 'bg-rose-400 text-white',
                  isCurrent && 'bg-rose-100 text-rose-600 border-2 border-rose-400',
                  !isCompleted && !isCurrent && 'bg-ivory-100 text-ivory-600'
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <p
                className={cn(
                  'mt-2 text-xs font-medium text-center',
                  isCurrent && 'text-rose-600',
                  isCompleted && 'text-rose-400',
                  !isCompleted && !isCurrent && 'text-ivory-600'
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-[10px] text-ivory-600 text-center hidden md:block">
                  {step.description}
                </p>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mt-5 mx-2',
                  isCompleted ? 'bg-rose-400' : 'bg-ivory-200'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}