import React from "react";

export default function Loading({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <div className="py-10 flex flex-col items-center justify-center gap-4 p-4">
      <div className="flex items-center gap-1 text-lg font-semibold tracking-wide text-zinc-700">
        {message.split("").map((char, index) => (
          <span
            key={index}
            className={`inline-block text-[${
              index % 2 === 0 ? "#E9967A" : "#FFDAB9"
            }] animate-bounce text-xl md:text-2xl lg:text-3xl`}
            style={{ animationDelay: `${index * 0.12}s` }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}
