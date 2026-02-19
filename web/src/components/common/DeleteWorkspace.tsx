import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";

const DeleteWorkspace = (props: any) => {
  const { deleteWorkspaceModal, setDeleteWorkspaceModal, workspaceToDelete, setWorkspaceToDelete, handleDeleteWorkspace } = props;

  return (
  <Dialog
    open={deleteWorkspaceModal}
    onOpenChange={(open) => {
      setDeleteWorkspaceModal(open);
      setWorkspaceToDelete(null);
    }}
  >
    <DialogContent className="text-black">
      <DialogHeader>
        <DialogTitle>
          <div className="text-lg font-semibold text-[#18181B]">
            Are you sure you want to delete this workspace?
          </div>
        </DialogTitle>
      </DialogHeader>
      <div className="text-sm font-normal text-[#71717A]">
        This action is permanent and cannot be undone.
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => {
            setDeleteWorkspaceModal(false);
            setWorkspaceToDelete(null);
          }}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={() => handleDeleteWorkspace(workspaceToDelete || '')}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  )
};

export default DeleteWorkspace;