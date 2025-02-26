"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import DeleteConfirmationModal from "@/components/delete-confirmation";
import { toast } from "sonner";

import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  XCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalTrigger,
} from "@/components/modal";
import EditSheet from "@/components/edit-sheet";
import EditGettingStartedForm from "./getting-started-edit";

const SetGettingStartedMessage = () => {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [messageToEdit, setMessageToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!messageToDelete) return;

    setIsDeleting(true);
    try {
      const response = await axios.delete(
        `${process.env.API_URL}/getting-started/${messageToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      toast.success("Message deleted successfully");
      fetchMessages();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete message");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setMessageToDelete(null);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      fetchMessages();
    }
  }, [currentPage, status, session]);

  const fetchMessages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.API_URL}/getting-started`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          params: {
            page: currentPage,
            limit: 10,
          },
        }
      );
      setMessages(response.data.gettingStartedMessages);
      setTotalPages(response.data.pagination.totalPages);
      setCurrentPage(response.data.pagination.currentPage);
    } catch (err) {
      setError(
        "Failed to fetch getting started messages. Please try again later."
      );
      console.error("Error fetching getting started messages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (status === "loading") {
    return (
      <div className={"h-6 w-6"}>
        <LoadingSpinner color={true} />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <div>You are not signed in.</div>;
  }

  if (isLoading) return <div>Loading getting started messages...</div>;
  if (error) return <div>{error}</div>;

  return (
    <main className={"flex flex-col items-center justify-center"}>
      <section className={"w-[90%]"}>
        <section className={"space-y-1"}>
          <section className={"flex flex-row justify-between"}>
            <div></div>
            <Button
              onClick={() => {
                router.push("/getting-started/create");
              }}
              className={"m-0 py-0 px-2 pr-3"}
              variant={"default"}
            >
              <Plus />
              Add New
            </Button>
          </section>
          <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="uppercase text-xs border text-gray-500 text-left border-gray-200 p-2">
                    #
                  </th>
                  <th className="uppercase text-xs border text-gray-500 text-left border-gray-200 p-2">
                    Message
                  </th>
                  <th className="uppercase text-xs border text-gray-500 text-left border-gray-200 p-2">
                    Status
                  </th>
                  <th className="uppercase text-xs border text-gray-500 text-left border-gray-200 p-2">
                    Created At
                  </th>
                  <th className="uppercase w-64 text-xs border text-gray-500 text-left border-gray-200 p-2">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {messages.length > 0 ? (
                  messages.map((message, idx) => (
                    <tr key={message.id}>
                      <td className="border border-gray-200 p-2">{idx + 1}</td>
                      <td className="border border-gray-200 p-2">
                        {message.message.length > 50
                          ? `${message.message.substring(0, 50)}...`
                          : message.message}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {message.isActive ? "Active" : "Inactive"}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {new Date(message.created_at).toLocaleString()}
                      </td>
                      <td className="border border-gray-200 p-2">
                        <Modal>
                          <ModalTrigger asChild>
                            <Button
                              className={"m-0 py-0 px-2"}
                              variant={"ghost"}
                              onClick={() => setSelectedMessage(message)}
                            >
                              <Eye className={"text-green-500"} size={"20"} />
                              View
                            </Button>
                          </ModalTrigger>
                          <ModalContent>
                            <ModalHeader>
                              <ModalTitle>Getting Started Message</ModalTitle>
                              <ModalDescription>
                                Created at:{" "}
                                {new Date(
                                  selectedMessage?.created_at
                                ).toLocaleString()}
                              </ModalDescription>
                            </ModalHeader>
                            <div className="mt-4">
                              <p>{selectedMessage?.message}</p>
                            </div>
                          </ModalContent>
                        </Modal>
                        <Button
                          className={"m-0 py-0 px-2"}
                          variant={"ghost"}
                          onClick={() => {
                            setMessageToEdit(message);
                            setIsEditSheetOpen(true);
                          }}
                        >
                          <Pencil className={"text-blue-500"} size={"20"} />
                          Edit
                        </Button>
                        <Button
                          className={"m-0 py-0 px-2"}
                          variant={"ghost"}
                          onClick={() => {
                            setMessageToDelete(message);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <XCircle color={"red"} size={"20"} />
                          <p className={"text-red-500"}>Delete</p>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="border border-gray-200 p-2 text-center"
                    >
                      No getting started messages found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="bg-gray-100 py-1 px-1 flex justify-end">
              <Button
                variant={"ghost"}
                className={"m-0 py-0 px-2"}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || totalPages === 0}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant={"ghost"}
                className={"m-0 py-0 px-2"}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </section>
      </section>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setMessageToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Getting Started Message"
        description={
          messageToDelete?.isActive
            ? "You cannot delete an active message."
            : "Are you sure you want to delete this message? This action cannot be undone."
        }
        isLoading={isDeleting}
      />
      {messageToEdit && (
        <EditSheet
          isOpen={isEditSheetOpen}
          onClose={() => {
            setIsEditSheetOpen(false);
            setMessageToEdit(null);
          }}
          title="Edit Getting Started Message"
          subtitle={`Last modified: ${new Date(
            messageToEdit.created_at
          ).toLocaleString()}`}
        >
          <EditGettingStartedForm
            message={messageToEdit}
            onClose={() => setIsEditSheetOpen(false)}
            onSuccess={() => {
              fetchMessages();
              setIsEditSheetOpen(false);
              setMessageToEdit(null);
            }}
            accessToken={session.accessToken}
          />
        </EditSheet>
      )}
    </main>
  );
};

export default SetGettingStartedMessage;
