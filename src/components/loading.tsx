// import React from "react";

// export default function Loading({
//   message = "Loading...",
// }: {
//   message?: string;
// }) {
//   return (
//     <div className="py-10 flex flex-col items-center justify-center gap-4 p-4">
//       <div className="flex items-center gap-1 text-lg font-semibold tracking-wide text-zinc-700">
//         {message.split("").map((char, index) => (
//           <span
//             key={index}
//             className={`inline-block text-[${
//               index % 2 === 0 ? "#E9967A" : "#FFDAB9"
//             }] animate-bounce text-xl md:text-2xl lg:text-3xl`}
//             style={{ animationDelay: `${index * 0.12}s` }}
//           >
//             {char}
//           </span>
//         ))}
//       </div>
//     </div>
//   );
// }

import React from "react";

interface LoadingPageProps {
  text?: string;
}

export default function LoadingPage({
  text = "Please wait a moment.",
}: LoadingPageProps) {
  return (
    <div className="my-20 text-center mx-auto max-w-xs">
      <div className="animate-spin rounded-full h-8 w-8 lg:h-10 lg:w-10 border-b-2 border-gray-900 mx-auto"></div>
      <p className="mt-4 text-lg lg:text-xl font-medium text-gray-700">
        Loading...
      </p>
      <p className="mt-1 text-sm lg:text-base text-gray-500">{text}</p>
    </div>
  );
}
