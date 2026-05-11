import { useParams, Link } from "wouter";
import { PageTransition, FadeList, FadeItem } from "@/components/ui/page-transition";
import { useGetClient, useListProjects, useListFiles } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  CreditCard,
  Briefcase,
  FileText,
  Camera,
  Video,
  Edit,
  FolderOpen
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientDetail() {
  const { id } = useParams();
  const clientId = parseInt(id || "0", 10);
  
  const { data: client, isLoading: clientLoading } = useGetClient(clientId, {
    query: { enabled: !!clientId, queryKey: ['/api/clients', clientId] }
  });
  
  const { data: projects, isLoading: projectsLoading } = useListProjects({ clientId }, {
    query: { enabled: !!clientId, queryKey: ['/api/projects', { clientId }] }
  });

  const { data: files, isLoading: filesLoading } = useListFiles({ clientId }, {
    query: { enabled: !!clientId, queryKey: ['/api/files', { clientId }] }
  });

  if (clientLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Card><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Client not found</h2>
        <Link href="/clients"><Button className="mt-4" variant="outline">Back to Clients</Button></Link>
      </div>
    );
  }

  const remainingBalance = (client.totalAmount || 0) - (client.advancePaid || 0);
  const paymentPercentage = client.totalAmount ? ((client.advancePaid || 0) / client.totalAmount) * 100 : 0;

  return (
    <PageTransition>
    <FadeList className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clients">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight flex-1">{client.name}</h1>
        <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>{client.status}</Badge>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" /> Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Contact Info */}
        <Card className="col-span-1 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium truncate">{client.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{client.phone}</p>
              </div>
            </div>
            {client.weddingDate && (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Wedding Date</p>
                  <p className="text-sm font-medium">
                    {new Date(client.weddingDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
            {client.eventLocation && (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">{client.eventLocation}</p>
                </div>
              </div>
            )}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Overall Progress</p>
              <div className="flex items-center gap-3">
                <Progress value={client.progress || 0} className="h-2 flex-1" />
                <span className="text-sm font-bold">{client.progress || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financials & Package */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Package & Financials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Package</p>
                <p className="font-semibold">{client.packageType || 'Custom'}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                <p className="font-bold text-lg">${client.totalAmount?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Paid</p>
                <p className="font-bold text-lg text-emerald-500">${client.advancePaid?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <p className="text-xs text-primary mb-1">Balance Due</p>
                <p className="font-bold text-lg text-primary">${remainingBalance.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Payment Progress</span>
                <span className="font-medium">{Math.round(paymentPercentage)}% Paid</span>
              </div>
              <Progress value={paymentPercentage} className="h-3" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="projects">Projects ({projects?.length || 0})</TabsTrigger>
          <TabsTrigger value="files">Files ({files?.length || 0})</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projectsLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : projects?.length === 0 ? (
              <div className="col-span-full text-center py-10 border border-dashed rounded-lg text-muted-foreground">
                <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No projects linked to this client.</p>
                <Button variant="link" className="mt-2">Create Project</Button>
              </div>
            ) : (
              projects?.map(project => (
                <Card key={project.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{project.name}</CardTitle>
                      <Badge variant="outline">{project.status}</Badge>
                    </div>
                    <CardDescription className="text-xs">{project.type}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    {project.deadline && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Deadline: {new Date(project.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="files" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filesLoading ? (
                  <div className="p-4"><Skeleton className="h-10 w-full" /></div>
                ) : files?.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No files uploaded for this client.</p>
                  </div>
                ) : (
                  files?.map(file => (
                    <div key={file.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-secondary rounded flex items-center justify-center">
                          {file.type === 'video' ? <Video className="h-5 w-5" /> :
                           file.type === 'photo' ? <Camera className="h-5 w-5" /> :
                           <FileText className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'} • {new Date(file.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{file.availability}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Internal Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {client.notes ? (
                <p className="whitespace-pre-wrap text-sm">{client.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No notes added for this client.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </FadeList>
    </PageTransition>
  );
}
