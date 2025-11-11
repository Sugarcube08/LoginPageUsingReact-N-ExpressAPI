import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader, DialogFooter, DialogTrigger, DialogClose } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

interface PageCardProps {
  title?: string;
  isAdd?: boolean;
  onClick?: (name: string) => void;
  className?: string;
  children?: React.ReactNode;
}

const PageCard = ({
  title = 'Untitled',
  isAdd = false,
  onClick,
  className = '',
  children,
}: PageCardProps) => {
  const [notebookName, setNotebookName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onClick && notebookName.trim()) {
      onClick(notebookName.trim());
    }else{
      toast.error('Please enter a name for the notebook');
    }
  };

  if (isAdd) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <div
            className={`
              border-2 border-dashed border-muted-foreground/40 dark:border-slate-600/40 rounded-xl p-6 w-full
              min-h-48 flex flex-col items-center justify-center 
              cursor-pointer transition-all duration-200
              hover:border-primary/60 hover:bg-muted/50 dark:hover:bg-slate-800/30
              ${className}
            `}
          >
            <div className="flex flex-col items-center justify-center cursor-pointer group">
              <div className="w-16 h-16 rounded-full bg-muted/50 dark:bg-slate-700/20 flex items-center justify-center mb-3 group-hover:bg-muted/80 dark:group-hover:bg-slate-600/50 transition-colors">
                <FiPlus className="text-3xl text-foreground/70 dark:text-slate-300" />
              </div>
              <span className="text-foreground/80 dark:text-slate-300 font-medium">New Notebook</span>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create New NoteBook</DialogTitle>
              <DialogDescription>
                Add a new NoteBook to your project. You can customize it later.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-3">
                <Label htmlFor="pageName">Notebook Name</Label>
                <Input
                  id="pageName"
                  value={notebookName}
                  onChange={(e) => setNotebookName(e.target.value)}
                  placeholder="Enter notebook name"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="submit">Create NoteBook</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`
        bg-card/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 w-full
        min-h-48 flex flex-col justify-between
        border border-border/50 shadow-lg
        transition-all duration-300
        hover:shadow-xl hover:border-primary/50 
        ${className}
      `}
    >
      <div className="flex-1">
        {children || (
          <h3 className="text-lg font-medium text-foreground line-clamp-2">
            {title}
          </h3>
        )}
      </div>
    </div>
  );
};

export default PageCard;