"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function ResultChart({ scores }: { scores: Array<{ type: string; label: string; score: number }> }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={scores}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dce7f5" />
          <XAxis dataKey="type" />
          <YAxis domain={[0, 20]} allowDecimals={false} />
          <Tooltip formatter={(value, _name, item) => [`${value}`, item.payload.label]} />
          <Bar dataKey="score" fill="#2d5f9f" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
