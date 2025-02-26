import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalTrigger,
} from "@/components/modal";
import { Button } from "@/components/ui/button";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading,
}) => {
  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>{description}</ModalDescription>
        </ModalHeader>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default DeleteConfirmationModal;
