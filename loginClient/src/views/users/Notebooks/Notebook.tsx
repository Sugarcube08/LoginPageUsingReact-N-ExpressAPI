import { useEffect, useState } from 'react';
import { FiPlus, FiChevronRight, FiChevronDown, FiFile, FiFolder, FiLoader } from 'react-icons/fi';
import { apiService } from '../../../services/ApiService';
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { toast } from '../../../hooks/use-toast';

interface Page {
  id: string;
  title: string;
  content: string;
  type: 'page';
  createdAt: string;
  updatedAt: string;
}

interface Section {
  id: string;
  title: string;
  type: 'section';
  pages: Page[];
  isExpanded: boolean;
  createdAt: string;
  updatedAt: string;
}

const Notebook = () => {
  const [notebookName, setNotebookName] = useState<string>("");
  const [sections, setSections] = useState<Section[]>([]);
  const [activePage, setActivePage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState<string>("");
  const [newPageName, setNewPageName] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const notebookId = window.location.pathname.split('/').pop() || '';

  const fetchNotebook = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService({
        url: `/users/notebook/${notebookId}`,
        method: "GET",
      });

      if (response.data && response.status === 200) {
        console.log(response.data);
        setNotebookName(response.data.notebook.title);
        setSections(response.data.notebook.sections || []);
      }
    } catch (err) {
      setError('Failed to load notebook');
      toast({
        title: 'Error',
        description: 'Failed to load notebook',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    try {
      const response = await apiService({
        url: `/notebook/${notebookId}/section`,
        method: "POST",
        data: { 
          title: newSectionName,
          parentID: null,
          order: sections.length,
          type: 'section'
        },
      });

      if (response.success && response.data) {
        setSections(prev => [...prev, { ...response.data, pages: [], isExpanded: false }]);
        setNewSectionName("");
        toast({
          title: 'Success',
          description: 'Section created successfully',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create section',
        variant: 'destructive',
      });
    }
  };

  const handleAddPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim() || !selectedSection) return;

    try {
      const response = await apiService({
        url: `/section/${selectedSection}/page`,
        method: "POST",
        data: { title: newPageName, content: "" },
      });

      if (response.success && response.data) {
        setSections(prev =>
          prev.map(section =>
            section.id === selectedSection
              ? { ...section, pages: [...section.pages, response.data as Page] }
              : section
          )
        );
        setNewPageName("");
        setSelectedSection(null);
        toast({
          title: 'Success',
          description: 'Page created successfully',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create page',
        variant: 'destructive',
      });
    }
  };

  const toggleSection = (sectionId: string) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, isExpanded: !section.isExpanded }
          : section
      )
    );
  };

  useEffect(() => {
    if (notebookId) {
      fetchNotebook();
    }
  }, [notebookId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <FiLoader className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-4">
        <div className="text-destructive mb-4">{error}</div>
        <Button onClick={fetchNotebook} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card overflow-y-auto shrink-0 flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold truncate">{notebookName || 'Untitled Notebook'}</h2>
        </div>

        <div className="p-2 space-y-2 flex flex-col items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-start gap-2">
                <FiPlus className="h-4 w-4" />
                <span>Add</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Dialog>
                  <DialogTrigger className="w-full text-left">
                    <div className="flex items-center gap-2">
                      <FiFolder className="h-4 w-4" />
                      <span>New Section</span>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleAddSection}>
                      <DialogHeader>
                        <DialogTitle>Add New Section</DialogTitle>
                        <DialogDescription>
                          Create a new section to organize your pages
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="sectionName">Section Name</Label>
                          <Input
                            id="sectionName"
                            value={newSectionName}
                            onChange={(e) => setNewSectionName(e.target.value)}
                            placeholder="Enter section name"
                            autoFocus
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={!newSectionName.trim()}>
                          Create Section
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => {
                e.preventDefault();
                if (sections.length === 0) {
                  toast({
                    title: 'No Sections',
                    description: 'Please create a section first',
                    variant: 'destructive',
                  });
                  return;
                }
              }}>
                <Dialog>
                  <DialogTrigger
                    className="w-full text-left"
                    onClick={() => sections.length > 0 && setSelectedSection(sections[0].id)}
                  >
                    <div className="flex items-center gap-2">
                      <FiFile className="h-4 w-4" />
                      <span>New Page</span>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleAddPage}>
                      <DialogHeader>
                        <DialogTitle>Add New Page</DialogTitle>
                        <DialogDescription>
                          Create a new page in a section
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="pageName">Page Name</Label>
                          <Input
                            id="pageName"
                            value={newPageName}
                            onChange={(e) => setNewPageName(e.target.value)}
                            placeholder="Enter page name"
                            autoFocus
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="sectionSelect">Section</Label>
                          <select
                            id="sectionSelect"
                            value={selectedSection || ''}
                            onChange={(e) => setSelectedSection(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select a section</option>
                            {sections.map((section) => (
                              <option key={section.id} value={section.id}>
                                {section.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline">
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          type="submit"
                          disabled={!newPageName.trim() || !selectedSection}
                        >
                          Create Page
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {sections.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              <p>No sections yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sections.map((section) => (
                <div key={section.id} className="space-y-1">
                  <div
                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center gap-2">
                      {section.isExpanded ? (
                        <FiChevronDown className="h-4 w-4" />
                      ) : (
                        <FiChevronRight className="h-4 w-4" />
                      )}
                      <FiFolder className="h-4 w-4 text-yellow-500" />
                      <span className="truncate">{section.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {section.pages.length}
                    </span>
                  </div>

                  {section.isExpanded && section.pages.length > 0 && (
                    <div className="ml-6 space-y-1">
                      {section.pages.map((page) => (
                        <div
                          key={page.id}
                          className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${activePage === page.id ? 'bg-accent' : 'hover:bg-accent/50'
                            }`}
                          onClick={() => setActivePage(page.id)}
                        >
                          <FiFile className="h-4 w-4 text-blue-500" />
                          <span className="truncate">{page.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {activePage ? (
          <div className="prose max-w-none">
            <h1>Page Content</h1>
            <p>This is where your page content will be displayed.</p>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center p-8">
            <div className="max-w-md space-y-4">
              <h2 className="text-2xl font-semibold">Welcome to {notebookName || 'your notebook'}</h2>
              <p>
                Get started by creating a section and adding pages to organize your notes.
                Click the "+" button above to begin.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notebook;