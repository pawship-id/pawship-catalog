import React from "react";

interface StepCardProps {
  step: any;
}

export default function StepCard({ step }: StepCardProps) {
  return (
    <div key={step.id} className="flex-shrink-0 w-80">
      {/* Card */}
      <div className="bg-white rounded-xl shadow-md transition-shadow duration-300 overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative h-80 overflow-hidden bg-black">
          <img
            src={step.image}
            alt={step.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-start gap-4 h-full">
            {/* Text Content */}
            <div className="flex-1 flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {step.id}. {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed flex-1">
                {step.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
