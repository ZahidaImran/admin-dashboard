"use client";

import React, { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import Swal from "sweetalert2";
import ProtectedRoute from "@/app/components/protectedRoutes";

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
  cartItems: { productName: string; image?: string }[];
}

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("All");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

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

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(prev => (prev === orderId ? null : orderId));
  };

  const handleDelete = async (orderId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF5733",
      cancelButtonColor: "#3498DB",
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
      <div className="min-h-screen bg-gray-100 p-6">
        <nav className="bg-purple-700 text-white p-4 rounded-lg shadow-md flex justify-between items-center">
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="bg-white text-gray-800 p-2 rounded shadow"
          >
            {["All", "pending", "processing", "delivered", "cancelled"].map(status => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>
        </nav>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map(order => (
            <div key={order._id} className="bg-white p-4 shadow rounded-lg border-l-4 border-purple-500">
              <div className="cursor-pointer" onClick={() => toggleExpand(order._id)}>
                <h3 className="text-lg font-semibold text-gray-900">{order.fullName}</h3>
                <p className="text-gray-600 text-sm">{new Date(order.orderDate).toLocaleDateString()}</p>
                <p className="text-gray-900 font-bold mt-2">Total: ${order.totalPrice}</p>
                <p className="text-green-700 font-bold">Discounted: ${order.discountedPrice}</p>
                <span className={`px-2 py-1 rounded text-white text-sm mt-2 inline-block ${
                  order.orderStatus === "pending" ? "bg-yellow-600" :
                  order.orderStatus === "processing" ? "bg-blue-600" :
                  order.orderStatus === "delivered" ? "bg-green-600" : "bg-red-600"
                }`}>
                  {order.orderStatus}
                </span>
              </div>

              {expandedOrder === order._id && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-lg font-semibold">Order Items</h4>
                  {order.cartItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 mt-2">
                      {item.image ? (
                        <Image src={urlFor(item.image).url()} alt={item.productName} width={50} height={50} className="rounded-sm" />
                      ) : (
                        <div className="w-[50px] h-[50px] bg-gray-300 flex items-center justify-center text-sm text-gray-700">
                          No Image
                        </div>
                      )}
                      <p className="text-gray-900 font-medium">{item.productName}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex space-x-2">
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-800"
                  onClick={() => handleDelete(order._id)}
                >Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
