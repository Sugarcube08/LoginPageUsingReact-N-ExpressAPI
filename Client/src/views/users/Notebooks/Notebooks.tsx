import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiService } from '../../../services/ApiService';
import PageCard from '../../../components/PageCard';
import { FiTrash, FiEdit } from 'react-icons/fi';
import { HiDotsVertical } from 'react-icons/hi';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../../../components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/dialog';

interface Notebook {
  _id: string;
  title: string;
  userID: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export const Notebooks = () => {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNotebook, setEditingNotebook] = useState<{ id: string; title: string } | null>(null);
  const [deletingNotebookId, setDeletingNotebookId] = useState<string | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();

  const fetchNotebooks = useCallback(async () => {
    try {
      const response = await apiService({
        url: '/users/notebook',
        method: 'GET',
      });
      setNotebooks(response.data || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch notebooks';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreateNotebook = useCallback(async ( notebookName: string) => {
    try {
      const response = await apiService({
        url: '/users/notebook',
        method: 'POST',
        data: { title: notebookName },
      });

      if (response.data?._id) {
        navigate(`/user/notebooks/${response.data._id}`);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create notebook';
      toast.error(errorMessage);
    }
  }, [navigate]);

  useEffect(() => {
    fetchNotebooks();
  }, [fetchNotebooks]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="text-red-700">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const handleNotebookRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotebook || !editingNotebook.title.trim()) return;

    const current = editingNotebook;

    try {
      const response = await apiService({
        url: `/users/notebook/${current.id}`,
        method: 'PUT',
        data: { title: current.title },
      });

      if (response.data) {
        setNotebooks(notebooks.map(nb =>
          nb._id === current.id
            ? { ...nb, title: current.title }
            : nb
        ));
        await fetchNotebooks();
        toast.success('Notebook renamed successfully');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to rename notebook';
      toast.error(errorMessage);
    } finally {
      setEditingNotebook(null);
      setIsRenameDialogOpen(false);
    }
  };

  const handleNotebookDelete = async () => {
    if (!deletingNotebookId) return;
    try {
      await apiService({
        url: `/users/notebook/${deletingNotebookId}`,
        method: 'DELETE',
      });

      setNotebooks(notebooks.filter(nb => nb._id !== deletingNotebookId));
      setDeletingNotebookId(null);
      setIsDeleteDialogOpen(false);
      toast.success('Notebook deleted successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete notebook';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="mx-auto w-full px-4 py-6 md:px-8 md:py-10">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <PageCard isAdd onClick={handleCreateNotebook} />
        {notebooks.map((notebook) => (
          <ContextMenu key={notebook._id}>
            <ContextMenuTrigger asChild>
              <div className="relative">
                <PageCard
                  title={notebook.title}
                  onClick={() => navigate(`/user/notebooks/${notebook._id}`)}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="absolute right-2 top-2 rounded-md p-1 hover:bg-accent"
                      aria-label={`Notebook ${notebook.title} actions`}
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <HiDotsVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setEditingNotebook({ id: notebook._id, title: notebook.title });
                        setIsRenameDialogOpen(true);
                      }}
                    >
                      <FiEdit className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500"
                      onSelect={(e) => {
                        e.preventDefault();
                        setDeletingNotebookId(notebook._id);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <FiTrash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setEditingNotebook({ id: notebook._id, title: notebook.title });
                  setIsRenameDialogOpen(true);
                }}
              >
                <FiEdit className="mr-2 h-4 w-4" />
                Rename
              </ContextMenuItem>
              <ContextMenuItem
                className="text-red-500"
                onSelect={(e) => {
                  e.preventDefault();
                  setDeletingNotebookId(notebook._id);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <FiTrash className="mr-2 h-4 w-4" />
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>

      <Dialog 
        open={isRenameDialogOpen && !!editingNotebook}
        onOpenChange={(open) => {
          setIsRenameDialogOpen(open);
          if (!open) {
            setEditingNotebook(null);
          }
        }}>
        <DialogContent>
          <form onSubmit={handleNotebookRename}>
            <DialogHeader>
              <DialogTitle>Rename Notebook</DialogTitle>
              <DialogDescription>
                Enter a new name for this notebook
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="notebook-name">Name</Label>
                <Input
                  id="notebook-name"
                  value={editingNotebook?.title || ''}
                  onChange={(e) =>
                    setEditingNotebook(prev =>
                      prev
                        ? { ...prev, title: e.target.value }
                        : { id: '', title: e.target.value }
                    )
                  }
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingNotebook(null);
                  setIsRenameDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={!editingNotebook?.title.trim()}
              >
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={isDeleteDialogOpen && !!deletingNotebookId}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setDeletingNotebookId(null);
          }
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the notebook
              and all its contents.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeletingNotebookId(null);
                setIsDeleteDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleNotebookDelete}
              disabled={!deletingNotebookId}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notebooks;