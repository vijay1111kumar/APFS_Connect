import React from "react";

const Card = ({ title, current_value, past_value, trend }) => {
    const trendClasses =
        trend > 0
            ? "bg-green-100 text-green-600"
            : trend < 0
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 text-gray-500";

    return (
        <div className="group relative block h-full bg-white before:absolute before:inset-0 before:rounded-md before:border-2 before:border-dashed  before:border-gray-300">
            <article className="flex flex-col gap-1 from-bg-green-100 p-4 h-full rounded-md border-2 border-gray-300 bg-white transition group-hover:-translate-y-2 group-hover:-translate-x-2 ">
                {trend && (
                    <div className={`inline-flex gap-2 self-end rounded p-1 ${trendClasses}`}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d={trend > 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"}
                            />
                        </svg>
                        <span className="text-xs font-medium">{Math.abs(trend)}%</span>
                    </div>
                )}

                <div>
                    <strong className="block text-sm font-medium text-gray-500">{title}</strong>
                    <p>
                        <span className="text-2xl sm:text-lg font-semibold text-gray-900 pr-1">{current_value}</span>
                        {past_value && (
                            <span className="text-xs text-gray-500"> from {past_value}</span>
                        )}
                    </p>
                </div>
            </article>

        </div>
    );
};

export default Card;
