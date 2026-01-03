export default function PageTitle({ title }: { title: string }) {
  return (
    <h1 className="text-3xl font-bold tracking-tight mb-8 text-primary">
      {title}
    </h1>
  );
}
