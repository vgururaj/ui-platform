import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  AppShell,
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FileDropzone,
  Input,
  Progress,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../index';

describe('UI primitives smoke', () => {
  it('renders layout and content primitives', () => {
    render(
      <AppShell sidebar={<nav>Side</nav>} header={<div>Top</div>}>
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Desc</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">New</Badge>
            <Alert variant="success">
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>All good</AlertDescription>
            </Alert>
            <Input aria-label="Email" placeholder="you@example.com" />
            <Skeleton data-testid="skel" className="h-4 w-20" />
            <Progress value={40} aria-label="Progress" />
            <Avatar>
              <AvatarFallback>GV</AvatarFallback>
            </Avatar>
          </CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      </AppShell>,
    );

    expect(screen.getByText('Side')).toBeInTheDocument();
    expect(screen.getByText('Top')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Desc')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Note')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByTestId('skel')).toBeInTheDocument();
    expect(screen.getByText('GV')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('renders tabs, checkbox, and switch', () => {
    render(
      <div>
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">A</TabsTrigger>
            <TabsTrigger value="b">B</TabsTrigger>
          </TabsList>
          <TabsContent value="a">Panel A</TabsContent>
          <TabsContent value="b">Panel B</TabsContent>
        </Tabs>
        <Checkbox aria-label="Agree" />
        <Switch aria-label="Notify" />
      </div>,
    );

    expect(screen.getByText('Panel A')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'A' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'B' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Agree' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Notify' })).toBeInTheDocument();
  });

  it('renders table rows', () => {
    render(
      <Table>
        <TableCaption>Items</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Alpha</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByText('Items')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });

  it('opens dialog', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog title</DialogTitle>
            <DialogDescription>Dialog body</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open dialog' }));
    expect(await screen.findByText('Dialog title')).toBeInTheDocument();
  });

  it('opens sheet', async () => {
    render(
      <Sheet>
        <SheetTrigger>Open sheet</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet title</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open sheet' }));
    expect(await screen.findByText('Sheet title')).toBeInTheDocument();
  });

  it('renders tooltip content when open', async () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger asChild>
            <button type="button">Tip</button>
          </TooltipTrigger>
          <TooltipContent>Helpful</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(await screen.findByText('Helpful')).toBeInTheDocument();
  });

  it('invokes FileDropzone onFiles via input change', () => {
    const onFiles = vi.fn();
    render(<FileDropzone onFiles={onFiles} label="Upload here" />);
    expect(screen.getByText('Upload here')).toBeInTheDocument();

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'a.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onFiles).toHaveBeenCalledWith([file]);
  });
});
