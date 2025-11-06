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
import { toast } from 'sonner';

interface Page {
  _id: string;
  notebookID: string;
  sectionID: string | null;
  title: string;
  content: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Section {
  _id: string;
  title: string;
  notebookID: string;
  order: number;
  pages: Page[];
  isExpanded?: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface NotebookData {
  _id: string;
  userID: string;
  title: string;
  directPages: Page[];
  sections: Section[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const Notebook = () => {
  const [notebook, setNotebook] = useState<NotebookData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState<string>("");
  const [newPageName, setNewPageName] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<string>('');
  const [viewMode, setViewMode] = useState<'separated' | 'sequenced'>('separated');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Define types for our combined view items
  type PageItem = Page & { type: 'page'; sectionId?: string };
  type SectionItem = Section & { type: 'section' };
  type CombinedItem = PageItem | SectionItem;

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
        const notebookData = {
          ...response.data.notebook,
          sections: (response.data.notebook.sections || []).map((section: Section) => ({
            ...section,
            isExpanded: false,
            pages: section.pages || []
          }))
        };
        setNotebook(notebookData);
      }
    } catch (err) {
      setError('Failed to load notebook');
      toast.error('Failed to load notebook');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim() || !notebook) return;

    try {
      const response = await apiService({
        url: `/users/notebook/${notebookId}/section`,
        method: "POST",
        data: {
          title: newSectionName,
          notebookID: notebookId,
          order: notebook.sections.length + notebook.directPages.length,
        },
      });

      if (response.data && response.status === 201) {
        setNotebook(prev => {
          if (!prev) return null;
          return {
            ...prev,
            sections: [
              ...prev.sections,
              {
                ...response.data,
                pages: [],
                isExpanded: true
              }
            ].sort((a, b) => a.order - b.order)
          };
        });
        setNewSectionName("");
        toast.success('Section created successfully');

        // Close the dialog and dropdown
        const dialogClose = document.querySelector('[data-close-dialog]');
        if (dialogClose) (dialogClose as HTMLElement).click();
        setIsDropdownOpen(false);
      }
    } catch (err) {
      toast.error('Failed to create section');
    }
  };

  const handleAddPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim() || !notebook) return;

    try {
      let order = 0;
      if (selectedSection) {
        const section = notebook.sections.find(s => s._id === selectedSection);
        order = section ? section.pages.length : 0;
      } else {
        order = notebook.directPages.length + notebook.sections.length;
      }

      const response = await apiService({
        url: `/users/notebook/${notebookId}/page`,
        method: "POST",
        data: {
          title: newPageName,
          notebookID: notebookId,
          sectionID: selectedSection || null,
          order: order,
        },
      });

      if (response.data && response.status === 201) {
        const newPage = response.data;
        setNotebook(prev => {
          if (!prev) return null;

          if (selectedSection) {
            return {
              ...prev,
              sections: prev.sections.map(section =>
                section._id === selectedSection
                  ? {
                    ...section,
                    pages: [...section.pages, newPage].sort((a, b) => a.order - b.order)
                  }
                  : section
              )
            };
          } else {
            // Add to direct pages
            return {
              ...prev,
              directPages: [...prev.directPages, newPage].sort((a, b) => a.order - b.order)
            };
          }
        });

        setNewPageName("");
        toast.success('Page created successfully');

        // Close the dialog and dropdown
        const dialogClose = document.querySelector('[data-close-dialog]');
        if (dialogClose) (dialogClose as HTMLElement).click();
        setIsDropdownOpen(false);
      }
    } catch (err) {
      toast.error('Failed to create page');
    }
  };

  const toggleSection = (e: React.MouseEvent, sectionId: string) => {
    e.stopPropagation();
    setNotebook(prev => {
      if (!prev) return null;
      return {
        ...prev,
        sections: prev.sections.map(section => ({
          ...section,
          isExpanded: section._id === sectionId
            ? !section.isExpanded
            : section.isExpanded
        }))
      };
    });
  };

  const handlePageClick = (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    setActivePage(prevId => prevId === pageId ? '' : pageId);
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
          <h2 className="text-lg font-semibold truncate">
            {notebook?.title || 'Untitled Notebook'}
          </h2>
        </div>

        <div className="p-2 space-y-2 flex flex-col items-center">
          <div className="flex w-full gap-2 mb-2">
            <Button 
              variant={viewMode === 'separated' ? 'default' : 'outline'} 
              size="sm" 
              className="flex-1"
              onClick={() => setViewMode('separated')}
            >
              Separated
            </Button>
            <Button 
              variant={viewMode === 'sequenced' ? 'default' : 'outline'} 
              size="sm" 
              className="flex-1"
              onClick={() => setViewMode('sequenced')}
            >
              Sequenced
            </Button>
          </div>
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
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
                            autoComplete="off"
                            placeholder="Enter section name"
                            autoFocus
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline" data-close-dialog>Cancel</Button>
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
              }}>
                <Dialog>
                  <DialogTrigger
                    className="w-full text-left"
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
                            autoComplete="off"
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
                            <option value="">Direct Notebook</option>
                            {notebook?.sections.map((section) => (
                              <option key={section._id} value={section._id}>
                                {section.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline" data-close-dialog>
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          type="submit"
                          disabled={!newPageName.trim()}
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
          {/* Combined view for sequenced mode */}
          {viewMode === 'sequenced' && (
            <div className="space-y-2">
              {(() => {
                const items: CombinedItem[] = [];
                
                // Add direct pages
                if (notebook?.directPages) {
                  notebook.directPages.forEach(page => {
                    items.push({
                      ...page,
                      type: 'page' as const,
                      sectionId: undefined
                    });
                  });
                }

                // Add sections and their pages
                if (notebook?.sections) {
                  notebook.sections.forEach(section => {
                    // Add the section itself
                    items.push({
                      ...section,
                      type: 'section' as const,
                      pages: section.pages || []
                    });

                    // Add section pages
                    if (section.pages) {
                      section.pages.forEach(page => {
                        items.push({
                          ...page,
                          type: 'page' as const,
                          sectionId: section._id
                        });
                      });
                    }
                  });
                }

                return items;
              })()
              .sort((a, b) => a.order - b.order)
              .map((item) => {
                if (item.type === 'section') {
                  const section = item as SectionItem;
                  return (
                    <div key={`section-${section._id}`} className="space-y-1">
                      <div 
                        className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent/50"
                        onClick={(e) => toggleSection(e, section._id)}
                      >
                        {section.isExpanded ? (
                          <FiChevronDown className="h-4 w-4" />
                        ) : (
                          <FiChevronRight className="h-4 w-4" />
                        )}
                        <FiFolder className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{section.title}</span>
                      </div>
                      {section.isExpanded && section.pages && section.pages.length > 0 && (
                        <div className="ml-8 space-y-1">
                          {item.pages
                            .sort((a, b) => a.order - b.order)
                            .map((page) => (
                              <div
                                key={page._id}
                                className={`flex items-center gap-2 p-2 pl-6 rounded-md cursor-pointer ${activePage === page._id ? 'bg-accent font-medium' : 'hover:bg-accent/50'}`}
                                onClick={(e) => handlePageClick(e, page._id)}
                              >
                                <FiFile className="h-4 w-4 text-blue-500" />
                                <span className="truncate">{page.title}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                } else {
                  const page = item as PageItem;
                  if (page.sectionId) {
                    return null;
                  }
                  return (
                    <div
                      key={`page-${page._id}`}
                      className={`flex items-center gap-2 p-2 ml-2 pl-4 rounded-md cursor-pointer ${activePage === page._id ? 'bg-accent font-medium' : 'hover:bg-accent/50'}`}
                      onClick={(e) => handlePageClick(e, page._id)}
                    >
                      <FiFile className="h-4 w-4 text-blue-500" />
                      <span className="truncate">{page.title}</span>
                    </div>
                  );
                }
              })}
            </div>
          )}

          {viewMode === 'separated' && notebook?.directPages && notebook.directPages.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-medium text-muted-foreground px-2 mb-1">
                PAGES
              </div>
              <div className="space-y-1">
                {notebook.directPages
                  .sort((a, b) => a.order - b.order)
                  .map((page) => (
                    <div
                      key={page._id}
                      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${activePage === page._id ? 'bg-accent font-medium' : 'hover:bg-accent/50'}`}
                      onClick={(e) => handlePageClick(e, page._id)}
                    >
                      <FiFile className="h-4 w-4 text-blue-500" />
                      <span className="truncate">{page.title}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {viewMode === 'separated' && notebook?.sections && notebook.sections.length > 0 && (
            notebook.sections
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <div key={section._id} className="mb-4">
                  <div
                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer"
                    onClick={(e) => toggleSection(e, section._id)}
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
                    {section.pages?.length || 0}
                  </span>
                </div>

                {section.isExpanded && section.pages.length > 0 && (
                  <div className="ml-6 space-y-1">
                    {section.pages
                      .sort((a, b) => a.order - b.order)
                      .map((page) => (
                        <div
                          key={page._id}
                          className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${activePage === page._id ? 'bg-accent font-medium' : 'hover:bg-accent/50'
                            }`}
                          onClick={(e) => handlePageClick(e, page._id)}
                        >
                          <FiFile className="h-4 w-4 text-blue-500" />
                          <span className="truncate">{page.title}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {activePage ? (
          <div>Page content for {activePage} will be displayed here</div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
            <p>Select a page to view or create a new one</p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedSection(notebook?.sections[0]?._id || null);
                const dialogTrigger = document.querySelector('button[aria-haspopup="dialog"]');
                if (dialogTrigger) (dialogTrigger as HTMLElement).click();
              }}
            >
              <FiPlus className="mr-2 h-4 w-4" />
              New Page
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
export default Notebook;