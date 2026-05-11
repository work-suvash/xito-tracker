import { UserProfile } from "@clerk/react";
import { PageTransition, FadeList, FadeItem } from "@/components/ui/page-transition";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <PageTransition>
    <FadeList className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and workspace preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0">
              <UserProfile 
                routing="hash"
                appearance={{
                  elements: {
                    rootBox: "w-full shadow-sm rounded-xl border border-border bg-card",
                    cardBox: "w-full shadow-none",
                    navbar: "hidden md:flex",
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Preferences</CardTitle>
              <CardDescription>Customize how Xito Tracker looks on your device.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Color Theme</Label>
                  <p className="text-sm text-muted-foreground">Select your preferred color mode.</p>
                </div>
                <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                  <Button 
                    variant={theme === 'light' ? 'default' : 'ghost'} 
                    size="sm" 
                    className="h-8 px-3"
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="h-4 w-4 mr-2" /> Light
                  </Button>
                  <Button 
                    variant={theme === 'dark' ? 'default' : 'ghost'} 
                    size="sm" 
                    className="h-8 px-3"
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="h-4 w-4 mr-2" /> Dark
                  </Button>
                  <Button 
                    variant={theme === 'system' ? 'default' : 'ghost'} 
                    size="sm" 
                    className="h-8 px-3"
                    onClick={() => setTheme('system')}
                  >
                    <Monitor className="h-4 w-4 mr-2" /> System
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-6 border-t border-border">
                <div>
                  <Label className="text-base">Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">Reduce spacing in tables and lists to see more data.</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage access for second shooters and editors.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg border-muted">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sun className="h-6 w-6 text-primary" /> {/* Placeholder icon */}
                </div>
                <h3 className="text-lg font-medium">Team management coming soon</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
                  You will soon be able to invite second shooters, video editors, and assistants to collaborate on projects.
                </p>
                <Button disabled>Invite Member</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </FadeList>
    </PageTransition>
  );
}
