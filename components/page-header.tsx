type PageHeaderProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-normal">{title}</h1>
        <p className="mt-3 text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
