import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResearchForm } from "@/components/research/research-form";
import { ResearchList } from "@/components/research/research-list";

export default function ResearchPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Research Hub</h1>
          <p className="text-muted-foreground mt-2">
            Collect, organize, and review your research insights from Notion.
          </p>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="list">All Notes</TabsTrigger>
            <TabsTrigger value="new">Add New</TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-6">
            <ResearchList />
          </TabsContent>
          <TabsContent value="new" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <ResearchForm />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
