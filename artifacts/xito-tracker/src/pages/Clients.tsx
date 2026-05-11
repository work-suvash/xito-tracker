import { useState } from "react";
import { useListClients, useDeleteClient, useCreateClient, useUpdateClient } from "@workspace/api-client-react";
import { PageTransition, FadeList, FadeItem } from "@/components/ui/page-transition";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Search, Plus, MoreHorizontal, Trash2, Edit, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(5, "Phone is required"),
  status: z.string().optional(),
  weddingDate: z.string().optional(),
  eventLocation: z.string().optional(),
  packageType: z.string().optional(),
  totalAmount: z.coerce.number().optional(),
  advancePaid: z.coerce.number().optional(),
  paymentStatus: z.string().optional(),
});

function ClientForm({ client, onSubmit, onCancel }: { client?: any, onSubmit: (data: any) => void, onCancel: () => void }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: client?.name || "",
      email: client?.email || "",
      phone: client?.phone || "",
      status: client?.status || "active",
      weddingDate: client?.weddingDate || "",
      eventLocation: client?.eventLocation || "",
      packageType: client?.packageType || "",
      totalAmount: client?.totalAmount || 0,
      advancePaid: client?.advancePaid || 0,
      paymentStatus: client?.paymentStatus || "pending",
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
              <FormLabel>Name</FormLabel>
              <FormControl><Input placeholder="John & Jane" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl><Input placeholder="555-0123" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="weddingDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wedding Date</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="packageType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Package</FormLabel>
              <FormControl><Input placeholder="e.g. Platinum Video + Photo" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="totalAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Amount ($)</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="advancePaid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Advance Paid ($)</FormLabel>
                <FormControl><Input type="number" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <SheetFooter className="mt-6">
          <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save</Button>
        </SheetFooter>
      </form>
    </Form>
  );
}

export default function Clients() {
  const [search, setSearch] = useState("");
  const { data: clients, isLoading, refetch } = useListClients();
  const deleteClient = useDeleteClient();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const { toast } = useToast();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  const filteredClients = clients?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      try {
        await deleteClient.mutateAsync({ id });
        toast({ title: "Client deleted", description: `${name} has been removed.` });
        refetch();
      } catch (err) {
        toast({ title: "Error", description: "Failed to delete client.", variant: "destructive" });
      }
    }
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setIsSheetOpen(true);
  };

  const handleCreate = () => {
    setEditingClient(null);
    setIsSheetOpen(true);
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingClient) {
        await updateClient.mutateAsync({ id: editingClient.id, data });
        toast({ title: "Client updated", description: "Client details have been updated." });
      } else {
        await createClient.mutateAsync({ data });
        toast({ title: "Client created", description: "New client has been added." });
      }
      setIsSheetOpen(false);
      refetch();
    } catch (err) {
      toast({ title: "Error", description: "Failed to save client.", variant: "destructive" });
    }
  };

  return (
    <PageTransition>
    <FadeList className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your couples and leads.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search clients..." 
              className="pl-8 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" /> Add Client
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{editingClient ? "Edit Client" : "New Client"}</SheetTitle>
                <SheetDescription>
                  {editingClient ? "Update the details for this client." : "Enter the details for your new client."}
                </SheetDescription>
              </SheetHeader>
              <ClientForm 
                client={editingClient} 
                onSubmit={onSubmit} 
                onCancel={() => setIsSheetOpen(false)} 
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Client</TableHead>
                <TableHead>Wedding Date</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-2 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredClients?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No clients found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients?.map((client) => (
                  <TableRow key={client.id} className="group cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <Link href={`/clients/${client.id}`} className="font-medium hover:underline flex items-center gap-1">
                            {client.name}
                          </Link>
                          <div className="flex gap-2 items-center text-xs text-muted-foreground mt-0.5">
                            <span>{client.email}</span>
                            {client.status === 'active' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {client.weddingDate ? (
                        <div className="text-sm font-medium">
                          {new Date(client.weddingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        client.paymentStatus === 'paid' ? 'default' : 
                        client.paymentStatus === 'partial' ? 'secondary' : 'outline'
                      } className={client.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20' : ''}>
                        {client.paymentStatus || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={client.progress || 0} className="w-[100px] h-2" />
                        <span className="text-xs text-muted-foreground w-8">{client.progress || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/clients/${client.id}`} className="flex items-center cursor-pointer">
                              <ExternalLink className="mr-2 h-4 w-4" /> View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center cursor-pointer" onClick={(e) => { e.preventDefault(); handleEdit(client); }}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => { e.preventDefault(); handleDelete(client.id, client.name); }}
                            className="text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </FadeList>
    </PageTransition>
  );
}
