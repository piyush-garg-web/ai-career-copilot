export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-card border rounded-lg p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-card-foreground mb-2">
            AI Career Copilot
          </h1>
          <p className="text-muted-foreground mb-6">
            shadcn/ui is initialized correctly! 🎉
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>App Router</span>
            <div className="w-2 h-2 bg-green-500 rounded-full ml-4"></div>
            <span>JavaScript</span>
            <div className="w-2 h-2 bg-green-500 rounded-full ml-4"></div>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
