import { useState } from "react";
import { useListProjects, useUpdateProjectStatus, useCreateProject, useListClients, useDeleteProject, useUpdateProject } from "@workspace/api-client-react";
import { PageTransition, FadeList, FadeItem } from "@/components/ui/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, LayoutGrid, List, Plus, MoreVertical, Clock, Edit, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUSES = ['Booked', 'Editing', 'Preview Sent', 'Final Delivery', 'Completed'];

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  clientId: z.coerce.number().min(1, "Client is required"),
  status: z.string(),
  type: z.string().optional(),
  deadline: z.string().optional(),
});

function ProjectForm({ project, clients, onSubmit, onCancel }: { project?: any, clients: any[], onSubmit: (data: any) => void, onCancel: () => void }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name || "",
      clientId: project?.clientId || 0,
      status: project?.status || "Booked",
      type: project?.type || "Photography",
      deadline: project?.deadline || "",
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
              <FormLabel>Project Name</FormLabel>
              <FormControl><Input placeholder="John & Jane Wedding" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value ? field.value.toString() : undefined}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger></FormControl>
                <SelectContent>
                  {clients?.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
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
                    <SelectItem value="Photography">Photography</SelectItem>
                    <SelectItem value="Videography">Videography</SelectItem>
                    <SelectItem value="Photo+Video">Photo+Video</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deadline</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SheetFooter className="mt-6">
          <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save</Button>
        </SheetFooter>
      </form>
    </Form>
  );
}


export default function Projects() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const { data: projects, isLoading, refetch } = useListProjects();
  const { data: clients } = useListClients();
  const updateStatus = useUpdateProjectStatus();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const { toast } = useToast();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  const handleCreate = () => {
    setEditingProject(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteProject.mutateAsync({ id });
        toast({ title: "Deleted", description: "Project removed." });
        refetch();
      } catch (e) {
        toast({ title: "Error", description: "Failed to delete project.", variant: "destructive" });
      }
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingProject) {
        await updateProject.mutateAsync({ id: editingProject.id, data });
        toast({ title: "Success", description: "Project updated." });
      } else {
        await createProject.mutateAsync({ data });
        toast({ title: "Success", description: "Project created." });
      }
      setIsSheetOpen(false);
      refetch();
    } catch (e) {
      toast({ title: "Error", description: "Failed to save project.", variant: "destructive" });
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateProject.mutateAsync({ id, data: { status } });
      toast({ title: "Status updated", description: `Moved to ${status}.` });
      refetch();
    } catch (e) {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };

  return (
    <PageTransition>
    <FadeList className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects Pipeline</h1>
          <p className="text-muted-foreground">Track all post-production workflows.</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as "kanban" | "list")} className="w-[120px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="kanban"><LayoutGrid className="h-4 w-4" /></TabsTrigger>
              <TabsTrigger value="list"><List className="h-4 w-4" /></TabsTrigger>
            </TabsList>
          </Tabs>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" /> New Project
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{editingProject ? "Edit Project" : "New Project"}</SheetTitle>
                <SheetDescription>
                  {editingProject ? "Update project details." : "Create a new project pipeline."}
                </SheetDescription>
              </SheetHeader>
              <ProjectForm 
                project={editingProject} 
                clients={clients || []}
                onSubmit={onSubmit} 
                onCancel={() => setIsSheetOpen(false)} 
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-[500px] w-full rounded-xl" />)}
        </div>
      ) : view === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1 h-[calc(100vh-200px)] snap-x">
          {STATUSES.map(status => {
            const columnProjects = projects?.filter(p => p.status === status) || [];
            return (
              <div key={status} className="flex-none w-[320px] flex flex-col snap-center">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-semibold flex items-center gap-2">
                    {status}
                    <Badge variant="secondary" className="rounded-full px-2 py-0">{columnProjects.length}</Badge>
                  </h3>
                </div>
                <div className="bg-muted/40 rounded-xl p-3 flex-1 overflow-y-auto space-y-3 border border-border/50">
                  {columnProjects.length === 0 ? (
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
                      <span className="text-sm text-muted-foreground">Drop here</span>
                    </div>
                  ) : (
                    columnProjects.map(project => (
                      <Card key={project.id} className="cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors shadow-sm group">
                        <CardHeader className="p-3 pb-2 flex flex-row items-start justify-between space-y-0">
                          <CardTitle className="text-sm font-semibold leading-tight pr-4">{project.name}</CardTitle>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-6 w-6 p-0 -mr-1 -mt-1 opacity-0 group-hover:opacity-100">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEdit(project)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Move to</DropdownMenuLabel>
                              {STATUSES.filter(s => s !== status).map(s => (
                                <DropdownMenuItem key={s} onClick={() => handleStatusChange(project.id, s)}>
                                  {s}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(project.id, project.name)} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 text-xs">
                          <p className="text-muted-foreground mb-3 truncate">{project.clientName}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="bg-background text-[10px] px-1.5 py-0">
                              {project.type || "Standard"}
                            </Badge>
                            {project.deadline && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{new Date(project.deadline).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="p-4 text-center text-muted-foreground">List view ready to be implemented with Table component</div>
          </CardContent>
        </Card>
      )}
    </FadeList>
    </PageTransition>
  );
}
