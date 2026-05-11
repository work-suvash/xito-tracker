import { useState } from "react";
import { PageTransition, FadeList, FadeItem } from "@/components/ui/page-transition";
import { useListFiles, useCreateFile, useDeleteFile, useListProjects, useListClients } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  LayoutGrid, 
  List as ListIcon,
  Image as ImageIcon,
  Video,
  FileText,
  File,
  Download,
  MoreVertical,
  UploadCloud,
  Trash2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string(),
  clientId: z.coerce.number().optional(),
  projectId: z.coerce.number().optional(),
  size: z.coerce.number().optional(),
});

function FileForm({ clients, projects, onSubmit, onCancel }: { clients: any[], projects: any[], onSubmit: (data: any) => void, onCancel: () => void }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "photo",
      clientId: 0,
      projectId: 0,
      size: 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>File Name</FormLabel>
              <FormControl><Input placeholder="wedding_highlights.mp4" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="photo">Photo</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value ? field.value.toString() : undefined}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  {clients?.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value ? field.value.toString() : undefined}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  {projects?.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <SheetFooter className="mt-6">
          <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Upload</Button>
        </SheetFooter>
      </form>
    </Form>
  );
}

export default function Files() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const { data: files, isLoading, refetch } = useListFiles();
  const { data: clients } = useListClients();
  const { data: projects } = useListProjects();
  
  const createFile = useCreateFile();
  const deleteFile = useDeleteFile();
  const { toast } = useToast();

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const getFileIcon = (type: string, className = "h-10 w-10") => {
    switch (type) {
      case 'photo': return <ImageIcon className={className} />;
      case 'video': return <Video className={className} />;
      case 'document': return <FileText className={className} />;
      default: return <File className={className} />;
    }
  };

  const filteredFiles = files?.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    (f.clientName && f.clientName.toLowerCase().includes(search.toLowerCase())) ||
    (f.projectName && f.projectName.toLowerCase().includes(search.toLowerCase()))
  );

  const onSubmit = async (data: any) => {
    try {
      // Clean up 0 IDs to be null for the API
      const payload = {
        ...data,
        clientId: data.clientId === 0 ? null : data.clientId,
        projectId: data.projectId === 0 ? null : data.projectId,
        availability: 'available',
        backupStatus: 'backed_up'
      };
      await createFile.mutateAsync({ data: payload });
      toast({ title: "Success", description: "File record created." });
      setIsSheetOpen(false);
      refetch();
    } catch (e) {
      toast({ title: "Error", description: "Failed to create file.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteFile.mutateAsync({ id });
        toast({ title: "Deleted", description: "File removed." });
        refetch();
      } catch (e) {
        toast({ title: "Error", description: "Failed to delete file.", variant: "destructive" });
      }
    }
  };

  return (
    <PageTransition>
    <FadeList className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Files</h1>
          <p className="text-muted-foreground">Manage your deliverables and resources.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search files..." 
              className="pl-8 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Tabs value={view} onValueChange={(v) => setView(v as "grid" | "list")} className="w-[100px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid"><LayoutGrid className="h-4 w-4" /></TabsTrigger>
              <TabsTrigger value="list"><ListIcon className="h-4 w-4" /></TabsTrigger>
            </TabsList>
          </Tabs>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <UploadCloud className="mr-2 h-4 w-4" /> Upload
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Upload File</SheetTitle>
                <SheetDescription>
                  Create a new file record linked to a project or client.
                </SheetDescription>
              </SheetHeader>
              <FileForm 
                clients={clients || []}
                projects={projects || []}
                onSubmit={onSubmit} 
                onCancel={() => setIsSheetOpen(false)} 
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      ) : filteredFiles?.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12 border-2 border-dashed rounded-xl">
          <UploadCloud className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No files found</h3>
          <p className="text-sm text-muted-foreground mb-4">Upload some files to get started.</p>
          <Button variant="outline" onClick={() => setIsSheetOpen(true)}>Upload Files</Button>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles?.map((file) => (
            <Card key={file.id} className="group overflow-hidden hover:border-primary/50 transition-colors">
              <div className="aspect-video bg-muted flex items-center justify-center relative p-4">
                <div className="text-muted-foreground/30">
                  {getFileIcon(file.type, "h-16 w-16")}
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  {file.backupStatus === 'backed_up' && (
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur text-[10px] px-1.5 py-0 h-5">Backup</Badge>
                  )}
                  <Badge variant="outline" className="bg-background/80 backdrop-blur text-[10px] px-1.5 py-0 h-5 border-border/50">
                    {file.type}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-sm truncate pr-2" title={file.name}>{file.name}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-6 w-6 p-0 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Download className="mr-2 h-4 w-4" /> Download</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(file.id, file.name)} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-xs text-muted-foreground truncate mb-3">
                  {file.clientName || file.projectName || "Unassigned"}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}</span>
                  <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredFiles?.map(file => (
                <div key={file.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-muted rounded flex items-center justify-center shrink-0">
                      {getFileIcon(file.type, "h-5 w-5 text-muted-foreground")}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{file.clientName || "Unassigned"}</span>
                        <span>•</span>
                        <span>{file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}</span>
                        <span>•</span>
                        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="hidden sm:inline-flex">{file.availability}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Download className="mr-2 h-4 w-4" /> Download</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(file.id, file.name)} className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </FadeList>
    </PageTransition>
  );
}
