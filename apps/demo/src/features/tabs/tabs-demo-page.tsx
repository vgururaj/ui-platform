import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@vgururaj/ui';

export function TabsDemoPage() {
  return (
    <Card data-testid="tabs-demo-page">
      <CardHeader>
        <CardTitle>Tabs demo</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="one">
          <TabsList>
            <TabsTrigger value="one">Overview</TabsTrigger>
            <TabsTrigger value="two">Details</TabsTrigger>
            <TabsTrigger value="three">Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="one" className="text-sm text-muted-foreground">
            Overview panel content.
          </TabsContent>
          <TabsContent value="two" className="text-sm text-muted-foreground">
            Details panel content.
          </TabsContent>
          <TabsContent value="three" className="text-sm text-muted-foreground">
            Activity panel content.
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
