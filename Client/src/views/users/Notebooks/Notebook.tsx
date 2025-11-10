import { useEffect, useState } from 'react';
import { FiPlus, FiChevronRight, FiChevronDown, FiFile, FiFolder, FiLoader, FiTrash, FiEdit, FiChevronLeft } from 'react-icons/fi';
import { HiDotsVertical } from 'react-icons/hi';
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../../../components/ui/context-menu"
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { toast } from 'sonner';
import { cn } from "../../../lib/utils";
import Editor from "./Editor";
import { useNavigate, useParams } from "react-router-dom";


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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [editingSection, setEditingSection] = useState<{ id: string, name: string } | null>(null);
  const [deletingSection, setDeletingSection] = useState<string | null>(null);
  const [editingPage, setEditingPage] = useState<{ id: string, name: string } | null>(null);
  const [deletingPage, setDeletingPage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { notebookId: notebookIdParam, pageId: routePageId } = useParams<{ notebookId: string; pageId?: string }>();
  const notebookId = notebookIdParam ?? '';
  // Define types for our combined view items
  type PageItem = Page & { type: 'page'; sectionId?: string };
  type SectionItem = Section & { type: 'section' };
  type CombinedItem = PageItem | SectionItem;

  const handleRenameSection = async (e: React.FormEvent, sectionId: string) => {
    e.preventDefault();
    if (!editingSection?.name.trim()) return;

    try {
      const response = await apiService({
        url: `/users/notebook/${notebookId}/section/${sectionId}`,
        method: "PUT",
        data: {
          title: editingSection.name,
        },
      });

      if (response.data && response.status === 200) {
        toast.success('Section renamed successfully');
        setEditingSection(null);
        fetchNotebook();
      }
    } catch (err) {
      toast.error('Failed to rename section');
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    try {
      const response = await apiService({
        url: `/users/notebook/${notebookId}/section/${sectionId}`,
        method: "DELETE",
      });

      if (response.data && response.status === 200) {
        toast.success('Section deleted successfully');
        setDeletingSection(null);
        fetchNotebook();
      }
    } catch (err) {
      toast.error('Failed to delete section');
    }
  };

  const handleRenamePage = async (e: React.FormEvent, pageId: string) => {
    e.preventDefault();
    if (!editingPage?.name.trim()) return;

    try {
      const response = await apiService({
        url: `/users/notebook/${notebookId}/page/${pageId}`,
        method: "PUT",
        data: {
          title: editingPage.name,
        },
      });

      if (response.data && response.status === 200) {
        toast.success('Page renamed successfully');
        setEditingPage(null);
        fetchNotebook();
      }
    } catch (err) {
      toast.error('Failed to rename page');
    }
  };

  const handleDeletePage = async (pageId: string) => {
    try {
      const response = await apiService({
        url: `/users/notebook/${notebookId}/page/${pageId}`,
        method: "DELETE",
      });

      if (response.data && response.status === 200) {
        toast.success('Page deleted successfully');
        setDeletingPage(null);
        fetchNotebook();
      }
    } catch (err) {
      toast.error('Failed to delete page');
    }
  };

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
            isExpanded: (section.pages || []).some((page) => page._id === routePageId) || false,
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
            ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          };
        });
        setNewSectionName("");
        toast.success('Section created successfully');
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
      const response = await apiService({
        url: `/users/notebook/${notebookId}/page`,
        method: "POST",
        data: {
          title: newPageName,
          notebookID: notebookId,
          sectionID: selectedSection || null,
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
                    pages: [...section.pages, newPage].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  }
                  : section
              )
            };
          } else {
            return {
              ...prev,
              directPages: [...prev.directPages, newPage].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
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
    navigate(`/user/notebooks/${notebookId}/page/${pageId}`);
    setActivePage(pageId);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  useEffect(() => {
    if (routePageId) {
      setActivePage(routePageId);
      setNotebook(prev => {
        if (!prev) return prev;
        const sectionToExpand = prev.sections.find(section =>
          (section.pages || []).some(page => page._id === routePageId)
        );

        if (!sectionToExpand || sectionToExpand.isExpanded) {
          return prev;
        }

        return {
          ...prev,
          sections: prev.sections.map(section =>
            section._id === sectionToExpand._id ? { ...section, isExpanded: true } : section
          )
        };
      });
    } else {
      setActivePage('');
    }
  }, [routePageId]);

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
      <div
        className={cn(
          "relative border-r border-border bg-card shrink-0 flex flex-col transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <button
          onClick={toggleSidebarCollapse}
          className="absolute -right-3 top-16 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-colors"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? (
            <FiChevronRight className="h-4 w-4" />
          ) : (
            <FiChevronLeft className="h-4 w-4" />
          )}
        </button>

        <div className={cn("border-b border-border p-4", isSidebarCollapsed && "px-2 py-3")}
        >
          {isSidebarCollapsed ? (
            <div className="flex items-center justify-center">
              <FiFolder className="h-5 w-5 text-yellow-500" />
            </div>
          ) : (
            <h2 className="text-lg font-semibold truncate">
              {notebook?.title || 'Untitled Notebook'}
            </h2>
          )}
        </div>

        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <div className='p-2'>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start gap-2 transition-all",
                  isSidebarCollapsed && "justify-center gap-0 px-2"
                )}
              >
                <FiPlus className="h-4 w-4" />
                {!isSidebarCollapsed && <span>Add</span>}
              </Button>
            </div>
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

        <div
          className={cn("flex-1 overflow-y-auto p-2", isSidebarCollapsed && "px-1")}
        >
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
              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
              .map((item) => {
                if (item.type === 'section') {
                  const section = item as SectionItem;
                  return (
                    <div key={`section-${section._id}`} className="space-y-1">
                      <ContextMenu>
                        <ContextMenuTrigger>
                          <div
                            className={cn(
                              "flex items-center p-2 rounded-md hover:bg-accent cursor-pointer gap-2",
                              isSidebarCollapsed ? "justify-center" : "justify-between"
                            )}
                            onClick={(e) => toggleSection(e, section._id)}
                          >
                            <div className={cn("flex items-center gap-2", isSidebarCollapsed && "justify-center")}
                            >
                              {!isSidebarCollapsed && (
                                <span className="text-xs text-muted-foreground">
                                  {section.pages?.length || 0}
                                </span>
                              )}
                              {section.isExpanded ? (
                                <FiChevronDown className="h-4 w-4" />
                              ) : (
                                <FiChevronRight className="h-4 w-4" />
                              )}
                              <FiFolder className="h-4 w-4 text-yellow-500" />
                              {!isSidebarCollapsed && (
                                <span className="font-medium">{section.title}</span>
                              )}
                            </div>
                            {/* 3 dot icon to show more options*/}
                            {!isSidebarCollapsed &&
                              <div>
                                <span>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger>
                                      <div className="flex items-center gap-2">
                                        <HiDotsVertical className="h-4 w-4" />
                                      </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem onSelect={(e) => {
                                        e.preventDefault();
                                        setEditingSection({ id: section._id, name: section.title });
                                      }}>
                                        <FiEdit className="mr-2 h-4 w-4" />
                                        Rename
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-red-500"
                                        onSelect={(e) => {
                                          e.preventDefault();
                                          setDeletingSection(section._id);
                                        }}
                                      >
                                        <FiTrash className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </span>
                              </div>
                            }
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onClick={(e) => {
                            e.stopPropagation();
                            setEditingSection({ id: section._id, name: section.title });
                          }}>
                            <FiEdit className="mr-2 h-4 w-4" />
                            Rename
                          </ContextMenuItem>
                          <ContextMenuItem
                            className="text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingSection(section._id);
                            }}
                          >
                            <FiTrash className="mr-2 h-4 w-4" />
                            Delete
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                      {section.isExpanded && section.pages && section.pages.length > 0 && (
                        <div
                          className={cn("ml-8 space-y-1", isSidebarCollapsed && "ml-0")}
                        >
                          {section.pages
                            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                            .map((page) => (
                              <ContextMenu key={page._id}>
                                <ContextMenuTrigger>
                                  <div
                                    className={cn(
                                      "flex items-center gap-2 p-2 pl-6 rounded-md cursor-pointer",
                                      activePage === page._id ? 'bg-accent font-medium' : 'hover:bg-accent/50',
                                      isSidebarCollapsed ? "pl-2 justify-center" : "justify-between"
                                    )}
                                    onClick={(e) => handlePageClick(e, page._id)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <FiFile className="h-4 w-4 text-blue-500" />
                                      {!isSidebarCollapsed && <span className="truncate">{page.title}</span>}
                                    </div>
                                    {!isSidebarCollapsed && (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <button
                                            onPointerDown={(e) => e.stopPropagation()}
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1 rounded-md hover:bg-accent/60"
                                            aria-label={`Page ${page.title} actions`}
                                          >
                                            <HiDotsVertical className="h-4 w-4" />
                                          </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                          <DropdownMenuItem
                                            onSelect={(e) => {
                                              e.preventDefault();
                                              setEditingPage({ id: page._id, name: page.title });
                                            }}
                                          >
                                            <FiEdit className="mr-2 h-4 w-4" />
                                            Rename
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            className="text-red-500"
                                            onSelect={(e) => {
                                              e.preventDefault();
                                              setDeletingPage(page._id);
                                            }}
                                          >
                                            <FiTrash className="mr-2 h-4 w-4" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}
                                  </div>
                                </ContextMenuTrigger>
                                <ContextMenuContent>
                                  <ContextMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingPage({ id: page._id, name: page.title });
                                    }}
                                  >
                                    <FiEdit className="mr-2 h-4 w-4" />
                                    Rename
                                  </ContextMenuItem>
                                  <ContextMenuItem
                                    className="text-red-500"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeletingPage(page._id);
                                    }}
                                  >
                                    <FiTrash className="mr-2 h-4 w-4" />
                                    Delete
                                  </ContextMenuItem>
                                </ContextMenuContent>
                              </ContextMenu>
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
                    <ContextMenu key={`page-${page._id}`}>
                      <ContextMenuTrigger>
                        <div
                          className={cn(
                            "flex items-center gap-2 p-2 ml-2 pl-4 rounded-md cursor-pointer",
                            activePage === page._id ? 'bg-accent font-medium' : 'hover:bg-accent/50',
                            isSidebarCollapsed ? "ml-0 pl-0 justify-center" : "justify-between"
                          )}
                          onClick={(e) => handlePageClick(e, page._id)}
                        >
                          <div className="flex items-center gap-2">
                            <FiFile className="h-4 w-4 text-blue-500" />
                            {!isSidebarCollapsed && <span className="truncate">{page.title}</span>}
                          </div>
                          {!isSidebarCollapsed && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                  }}
                                  className="p-1 rounded-md hover:bg-accent/60"
                                  aria-label={`Page ${page.title} actions`}
                                >
                                  <HiDotsVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    setEditingPage({ id: page._id, name: page.title });
                                  }}
                                >
                                  <FiEdit className="mr-2 h-4 w-4" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-500"
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    setDeletingPage(page._id);
                                  }}
                                >
                                  <FiTrash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPage({ id: page._id, name: page.title });
                          }}
                        >
                          <FiEdit className="mr-2 h-4 w-4" />
                          Rename
                        </ContextMenuItem>
                        <ContextMenuItem
                          className="text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingPage(page._id);
                          }}
                        >
                          <FiTrash className="mr-2 h-4 w-4" />
                          Delete
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                }
              })}
          </div>
        </div>
      </div>

      {/* Dialogs for Section Actions */}
      <Dialog open={!!editingSection} onOpenChange={(open) => !open && setEditingSection(null)}>
        <DialogContent>
          <form onSubmit={(e) => editingSection && handleRenameSection(e, editingSection.id)} >
            <DialogHeader>
              <DialogTitle>Rename Section</DialogTitle>
              <DialogDescription>
                Enter a new name for this section
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="sectionRename">Section Name</Label>
                <Input
                  id="sectionRename"
                  value={editingSection?.name || ''}
                  onChange={(e) => editingSection && setEditingSection({ ...editingSection, name: e.target.value })}
                  autoComplete="off"
                  placeholder="Enter section name"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingSection(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!editingSection?.name.trim()}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingSection} onOpenChange={(open) => !open && setDeletingSection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Section</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this section? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeletingSection(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (deletingSection) {
                  handleDeleteSection(deletingSection);
                }
              }}
            >
              Delete Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogs for Page Actions */}
      <Dialog open={!!editingPage} onOpenChange={(open) => !open && setEditingPage(null)}>
        <DialogContent>
          <form onSubmit={(e) => editingPage && handleRenamePage(e, editingPage.id)}>
            <DialogHeader>
              <DialogTitle>Rename Page</DialogTitle>
              <DialogDescription>
                Enter a new name for this page
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="pageRename">Page Name</Label>
                <Input
                  id="pageRename"
                  value={editingPage?.name || ''}
                  onChange={(e) => editingPage && setEditingPage({ ...editingPage, name: e.target.value })}
                  autoComplete="off"
                  placeholder="Enter page name"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingPage(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!editingPage?.name.trim()}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingPage} onOpenChange={(open) => !open && setDeletingPage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this page? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeletingPage(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (deletingPage) {
                  handleDeletePage(deletingPage);
                }
              }}
            >
              Delete Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {activePage ? (
          <Editor />
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
    </div >
  );
}
export default Notebook;