import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-6">
        <h1 className="text-9xl font-bold text-muted-foreground">404</h1>
        <h2 className="text-3xl font-semibold">Page not found</h2>
        <p className="text-lg text-muted-foreground max-w-md">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="pt-4">
          <Link href="/">
            <Button size="lg">
              Go back home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}