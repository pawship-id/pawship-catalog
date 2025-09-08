import React from "react";

interface StepCardProps {
  step: any;
  onApply: () => void;
}

export default function StepCard({ step, onApply }: StepCardProps) {
  const Icon = step.icon;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-15 h-15 bg-gradient-to-r from-[#F79985] to-[#FCBE87] rounded-full flex items-center justify-center">
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {step.id}. {step.title}
          </h3>
          <p className="text-gray-600 mb-4">{step.description}</p>
          {step.cta && (
            <button
              onClick={onApply}
              className="bg-gradient-to-r from-[#F79985] to-[#FCBE87] text-white font-semibold px-6 py-2 rounded-lg hover:shadow-lg transition-shadow duration-300"
            >
              {step.cta}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
