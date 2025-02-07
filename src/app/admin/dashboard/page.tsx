"use client";

import React, { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import Swal from "sweetalert2";
import ProtectedRoute from "@/app/components/protectedRoutes";
import { FaBoxOpen, FaTrash, FaFilter } from "react-icons/fa";

interface Order {
  _id: string;
  fullName: string;
  email: string;
  phone: number;
  address: string;
  city: string;
  zipCode: number;
  totalPrice: number;
  discountedPrice: number;
  orderDate: string;
  orderStatus: string;
  cartItems: { productName: string; image: string }[];
}

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await client.fetch(
          `*[_type == "order"]{
            _id, fullName, phone, email, address, city, zipCode, totalPrice,
            discountedPrice, orderDate, orderStatus, cartItems[]->{ productName, image }
          }`
        );
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = filter === "All" ? orders : orders.filter(order => order.orderStatus === filter);

  const handleDelete = async (orderId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await client.delete(orderId);
      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      Swal.fire("Deleted!", "Your order has been deleted.", "success");
    } catch (error) {
      console.error("Error deleting order:", error);
      Swal.fire("Error!", "Something went wrong while deleting.", "error");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-blue-700 text-white p-6 hidden md:block">
          <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
          <ul className="space-y-4">
            <li className="cursor-pointer flex items-center gap-2 hover:text-gray-300">
              <FaBoxOpen /> Orders
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Orders</h2>
            <div className="flex items-center gap-2">
              <FaFilter />
              <select value={filter} onChange={e => setFilter(e.target.value)} className="border rounded p-2 bg-white">
                {["All", "pending", "processing", "delivered", "cancelled"].map(status => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Order Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map(order => (
              <div key={order._id} className="bg-white p-4 shadow-md rounded-lg">
                <h3 className="font-semibold text-lg">{order.fullName}</h3>
                <p className="text-sm text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</p>
                <p className="mt-2 font-bold">Total: ${order.totalPrice}</p>
                <p className="mt-1 text-sm">Discounted Price: ${order.discountedPrice}</p>
                <p className="mt-1 text-sm">Status: {order.orderStatus}</p>
                <div className="flex gap-2 mt-4">
                  <button className="text-sm px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition" onClick={() => handleDelete(order._id)}>
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
