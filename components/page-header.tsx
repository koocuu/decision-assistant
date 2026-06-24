type PageHeaderProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b pb-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:pb-6">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:mt-3 sm:text-base">{description}</p>
      </div>
      {action}
    </div>
  );
}
