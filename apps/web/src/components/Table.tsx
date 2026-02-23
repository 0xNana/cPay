import type { PropsWithChildren } from "react";

export function Table({ headers, children }: PropsWithChildren<{ headers: string[] }>) {
  return (
    <table className="table">
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
