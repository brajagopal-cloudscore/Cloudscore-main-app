export default function Loading() {
  return (
    <div className="w-full flex justify-center items-center py-16">
      <div className="animate-spin h-8 w-8 rounded-full border-4 border-muted-foreground border-t-transparent"></div>
      <span className="ml-3 text-muted-foreground">Loading...</span>
    </div>
  );
}
