interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  className?: string;
}

interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

interface TableHeadProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  className?: string;
  colSpan?: number;
}

const Table = ({ children, className }: TableProps) => {
  return (
    <table className={`w-full table-fixed border-collapse ${className || ''}`}>
      {children}
    </table>
  );
};

const TableHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <thead
      className={`bg-muted/80 text-foreground text-sm font-semibold ${
        className || ''
      }`}
    >
      {children}
    </thead>
  );
};

const TableBody = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <tbody
      className={`bg-card text-muted-foreground text-sm ${className || ''}`}
    >
      {children}
    </tbody>
  );
};

const TableRow = ({ children, className, ...props }: TableRowProps) => {
  return (
    <tr
      className={`text-center border-b border-border last:border-b-0 transition-colors ${
        className || ''
      }`}
      {...props}
    >
      {children}
    </tr>
  );
};

const TableCell = ({ children, className, colSpan }: TableCellProps) => {
  return (
    <td
      colSpan={colSpan}
      className={`text-foreground text-sm px-4 py-3.5 ${className || ''}`}
    >
      {children}
    </td>
  );
};

const TableHead = ({ children, className, colSpan }: TableHeadProps) => {
  return (
    <th
      colSpan={colSpan}
      className={`px-4 py-3.5 text-center font-medium text-foreground ${
        className || ''
      }`}
    >
      {children && children}
    </th>
  );
};

export const TableComponent = {
  table: Table,
  tableHeader: TableHeader,
  tableBody: TableBody,
  tableRow: TableRow,
  tableCell: TableCell,
  tableHead: TableHead,
};
