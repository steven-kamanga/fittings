"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import EditSheet from "@/components/edit-sheet";
import EditCustomerForm from "@/components/edit-customer-form";

const Page = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      fetchUsers();
    }
  }, [currentPage, status, session]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${process.env.API_URL}/auth/users`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        params: {
          page: currentPage,
          limit: 10,
        },
      });

      if (response.data) {
        setUsers(response.data || []);
        setTotalPages(Math.ceil((response.data?.length || 0) / 10));
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to fetch users. Please try again later.");
      setUsers([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (status === "loading") {
    return <div className={"h-6 w-6"}></div>;
  }

  if (status === "unauthenticated" || session?.user.role !== "admin") {
    return <div>Access denied. Admin only.</div>;
  }

  if (isLoading)
    return (
      <div>
        <LoadingSpinner color={true} />
      </div>
    );
  if (error) return <div>{error}</div>;

  return (
    <main className={"flex flex-col items-center justify-center"}>
      <section className={"w-[90%] flex-col flex space-y-2"}>
        <div className={"font-bold text-base uppercase flex space-x-1"}>
          <p>Customer Profiles</p>
        </div>
        <section className={"space-y-1"}>
          {/*<section className={"flex flex-row justify-between"}>*/}
          {/*  <div></div>*/}
          {/*  <Button*/}
          {/*    onClick={() => router.push("/customer-profiles/create")}*/}
          {/*    className={"m-0 py-0 px-2 pr-3"}*/}
          {/*    variant={"default"}*/}
          {/*  >*/}
          {/*    <Plus />*/}
          {/*    Add Customer*/}
          {/*  </Button>*/}
          {/*</section>*/}
          <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="uppercase font-medium text-xs border text-gray-500 text-left border-gray-200 p-2">
                    #
                  </th>
                  <th className="uppercase text-xs border text-gray-500 text-left border-gray-200 p-2">
                    Name
                  </th>
                  <th className="uppercase text-xs border text-gray-500 text-left border-gray-200 p-2">
                    Email
                  </th>
                  <th className="uppercase text-xs border text-gray-500 text-left border-gray-200 p-2">
                    Phone
                  </th>
                  <th className="uppercase text-xs border text-gray-500 text-left border-gray-200 p-2">
                    Address
                  </th>
                  <th className="uppercase text-xs border text-gray-500 text-left border-gray-200 p-2">
                    Club Size
                  </th>
                  <th className="uppercase w-32 text-xs border text-gray-500 text-left border-gray-200 p-2">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user, idx) => (
                    <tr key={user.id}>
                      <td className="border border-gray-200 p-2">{idx + 1}</td>
                      <td className="border border-gray-200 p-2">
                        {user.name}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {user.email}
                      </td>
                      <td className="border border-gray-200 p-2 text-right">
                        {user.phone}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {user.address}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {user.golf_club_size}
                      </td>
                      <td className="border flex space-x-1 border-gray-200 p-2">
                        <Button
                          onClick={() => handleEdit(user)}
                          className="m-0 py-0 px-2"
                          variant="outline"
                        >
                          <Pencil className="mr-1" size={16} />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="border border-gray-200 p-2 text-center"
                    >
                      No customers found.
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
      {selectedUser && (
        <EditSheet
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedUser(null);
          }}
          title="Edit Customer Profile"
          subtitle={`Last updated: ${new Date(selectedUser.updated_at).toLocaleDateString()}`}
        >
          <EditCustomerForm
            user={selectedUser}
            onClose={() => {
              setIsEditOpen(false);
              setSelectedUser(null);
            }}
            onSuccess={() => {
              fetchUsers();
            }}
            accessToken={session.accessToken}
          />
        </EditSheet>
      )}
    </main>
  );
};

export default Page;
